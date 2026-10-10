# Instrumental de medición de las capas anatómicas.
#
# Se ejecuta DENTRO de Blender sin interfaz:
#   blender --background cuerpo.blend --python tools/anatomia/<script>.py
# y cada script empieza con:
#   exec(open('tools/anatomia/comun.py').read())
#
# Vive en el repo a propósito: la versión anterior estaba en el directorio
# temporal de la sesión y se perdió entera al cambiar de worktree.
import bpy, re
import numpy as np
from mathutils import Vector, Matrix
from mathutils.bvhtree import BVHTree


def L(m):
    print('LOG ' + str(m), flush=True)


# Blender es Z-arriba y el app Y-arriba. Esta matriz hace (x,y,z) -> (x,z,-y).
TJ = Matrix(((1, 0, 0, 0), (0, 0, 1, 0), (0, -1, 0, 0), (0, 0, 0, 1)))
# El cuerpo mide 6.6 unidades de app y 1700 mm de alto.
U = 1700.0 / 6.6

# El app corrige el centrado por bounding box de cada capa con estos offsets
# (SKIN_ALIGN en src/layers/skin.js, MUSCLE_ALIGN en src/layers/muscles.js).
# Medir sin ellos coloca la capa donde el app NO la pinta y toda la medicion
# sale falsa: con la piel fueron 34 mm de error.
ALIGN_PIEL_Z = 0.13387
ALIGN_MUS_X, ALIGN_MUS_Z = 0.02329, -0.04659


def fitV(names, top, bottom):
    """Replica computeStretchFit de src/layers/glbBodyLoader.js.

    Devuelve la matriz que lleva coordenadas locales de Blender al espacio del
    app (en unidades de app; multiplicar por U para milimetros).
    """
    mn = Vector((1e18,) * 3)
    mx = Vector((-1e18,) * 3)
    for nm in names:
        o = bpy.data.objects[nm]
        M = o.matrix_world
        for v in o.data.vertices:
            w = TJ @ (M @ v.co)
            for i in range(3):
                if w[i] < mn[i]:
                    mn[i] = w[i]
                if w[i] > mx[i]:
                    mx[i] = w[i]
    s = (top - bottom) / (mx.y - mn.y)
    off = Vector((-(mn.x + mx.x) * 0.5 * s, bottom - mn.y * s, -(mn.z + mx.z) * 0.5 * s))
    return Matrix.Translation(off) @ Matrix.Scale(s, 4) @ TJ


def fitPiel():
    """Encaje de la piel masculina, con el align que aplica el app."""
    return Matrix.Translation(Vector((0.0, 0.0, ALIGN_PIEL_Z))) @ fitV(['PIEL_Skin'], 6.6, 0.02)


def fitMusculo():
    """Encaje de la musculatura masculina, con su align."""
    return Matrix.Translation(Vector((ALIGN_MUS_X, 0.0, ALIGN_MUS_Z))) @ fitV(MM, 6.6, 0.02)


# Rangos por capa, en unidades de app (ver src/layers/*.js).
RANGO = {
    'hueso':   (6.545, 0.075),   # lleva inset 0.055
    'musculo': (6.6, 0.02),
    'piel':    (6.6, 0.02),
    'organo':  (5.572, 2.8989),
    'nervio':  (6.5703, 0.0468),
}

MALE = [o.name for o in bpy.data.objects
        if o.type == 'MESH' and not o.name.startswith(
            ('F_', 'FMUS_', 'Musculo_', 'Nervio_', 'Organo_', 'PIEL', 'Skin', '_t'))]
MM = [o.name for o in bpy.data.objects if o.name.startswith('Musculo_')]
MALESET = set(MALE)


def arr(names, T, step=1):
    """Nube de puntos de esas piezas, en milimetros del espacio del app."""
    Q = []
    for nm in names:
        o = bpy.data.objects.get(nm)
        if o is None:
            continue
        M = T @ o.matrix_world
        for i in range(0, len(o.data.vertices), step):
            p = M @ o.data.vertices[i].co
            Q.append([p.x * U, p.y * U, p.z * U])
    return np.array(Q) if Q else np.zeros((0, 3))


def bvh_de(nombre, T):
    """BVH de un objeto, ya en milimetros del espacio del app."""
    ob = bpy.data.objects[nombre]
    A = T @ ob.matrix_world
    vs = [Vector(((A @ v.co) * U)[:]) for v in ob.data.vertices]
    tris = []
    for p in ob.data.polygons:
        vi = list(p.vertices)
        for k in range(1, len(vi) - 1):
            tris.append((vi[0], vi[k], vi[k + 1]))
    return BVHTree.FromPolygons(vs, tris, all_triangles=True)


def sdf(bvh, Q, con_dir=False):
    """Distancia con signo a la malla. Positivo = fuera.

    Es la ÚNICA medida fiable de "que asoma". La silueta por sectores miente:
    parte el brazo entre dos sectores y compara el musculo del antebrazo contra
    el radio del pecho, inventando 194 mm donde hay 30.

    Con con_dir=True devuelve tambien el vector unitario hacia el punto mas
    cercano de la superficie, util para mover geometria sin depender de los
    normales de la pieza (hay piezas con las caras invertidas).
    """
    o = np.empty(len(Q))
    D = np.zeros((len(Q), 3))
    for i, p in enumerate(Q):
        v = Vector((float(p[0]), float(p[1]), float(p[2])))
        r = bvh.find_nearest(v, 900.0)
        if r[0] is None:
            o[i] = -999.0
            continue
        o[i] = r[3] if (v - r[0]).dot(r[1]) > 0 else -r[3]
        if con_dir and r[3] > 1e-6:
            u = (r[0] - v) / r[3]
            D[i] = [u.x, u.y, u.z]
    return (o, D) if con_dir else o


def valida_signo(bvh):
    """Comprueba el signo con puntos conocidos. Llamar antes de creerse nada."""
    ctrl = [('centro abdomen', (0, 1000, 0), -1), ('centro torax', (0, 1300, 0), -1),
            ('delante del pecho', (0, 1300, 400), +1), ('lateral lejos', (700, 1000, 0), +1)]
    ok = True
    for nm, p, esperado in ctrl:
        s = sdf(bvh, np.array([p]))[0]
        bien = (s < 0) if esperado < 0 else (s > 0)
        L('  control %-20s %8.1f mm  %s' % (nm, s, 'ok' if bien else 'MAL'))
        ok = ok and bien
    if not ok:
        raise SystemExit('El signo de la distancia esta invertido: no sigas midiendo.')
    return ok


REGIONES = {
    'brazo/mano': lambda Q: (Q[:, 1] < 1300) & (abs(Q[:, 0]) > 150),
    'tronco':     lambda Q: (abs(Q[:, 0]) < 150) & (Q[:, 1] > 900) & (Q[:, 1] < 1450),
    'pierna':     lambda Q: (Q[:, 1] < 900) & (abs(Q[:, 0]) < 160),
    'cabeza':     lambda Q: Q[:, 1] > 1450,
}


def histograma(s, etiqueta):
    """Reparte el saliente en tramos. Un porcentaje suelto no dice nada: '34%
    fuera' puede ser todo sub-milimetrico. Ojo: basta 1 mm para que se dibuje
    delante de la piel, asi que el objetivo es 'dentro', no '<10 mm'."""
    L('%s  dentro %.1f%%' % (etiqueta, (s <= 0).mean() * 100))
    for a, b in ((0, 2), (2, 5), (5, 10), (10, 20), (20, 40), (40, 1e9)):
        m = (s > a) & (s <= b)
        L('    fuera %3d-%-4s mm: %6d  (%5.2f%%)' % (a, str(b) if b < 1e9 else '+', m.sum(), 100 * m.mean()))
    if (s > 0).any():
        L('    del saliente: p50 %.1f  p90 %.1f  max %.1f mm'
          % (*np.percentile(s[s > 0], [50, 90]), s.max()))


def por_region(s, P, etiqueta):
    for r, fn in REGIONES.items():
        ss = s[fn(P)]
        if not len(ss):
            continue
        L('   %-11s %-8s fuera %5.2f%%  >2mm %5.2f%%  >10mm %5.2f%%  max %5.1f'
          % (r, etiqueta, (ss > 0).mean() * 100, (ss > 2).mean() * 100,
             (ss > 10).mean() * 100, max(ss.max(), 0)))
