# ¿Esta la capa muscular desplazada respecto al esqueleto?
# El centrado por bounding box de `computeStretchFit` no es un punto anatomico,
# asi que dos capas bien construidas pueden quedar descolocadas entre si.
# La medida que lo delata no es cuanto asoma por la piel (un desplazamiento
# lateral empeora un lado y mejora el otro, y casi se cancela), sino cuanto se
# aleja el musculo del hueso en el que deberia insertarse.
#   blender --background cuerpo.blend --python tools/anatomia/desfase_capas.py
import os
BASE = os.path.dirname(os.path.abspath(__file__))
exec(open(os.path.join(BASE, 'comun.py')).read())

Tp = fitPiel()
Tm = fitV(MM, *RANGO['musculo'])
Tb = fitV(MALE, *RANGO['hueso'])
piel = bvh_de('PIEL_Skin', Tp)

bv, bt = [], []
for nm in MALE:
    o = bpy.data.objects[nm]
    M = Tb @ o.matrix_world
    base = len(bv)
    for v in o.data.vertices:
        p = (M @ v.co) * U
        bv.append(Vector((p.x, p.y, p.z)))
    for pl in o.data.polygons:
        vi = [base + i for i in pl.vertices]
        for k in range(1, len(vi) - 1):
            bt.append((vi[0], vi[k], vi[k + 1]))
hueso = BVHTree.FromPolygons(bv, bt, all_triangles=True)

MUS = arr(MM, Tm, 10)
L('musculo: %d puntos de muestra' % len(MUS))
L('')
L('desplazando la capa muscular; dist = distancia mediana al hueso mas cercano')
L('  dx      dist.hueso   asoma fuera   >10mm')
mejor = None
for dx in (-6, -3, 0, 3, 6, 7, 9, 12):
    Q = MUS.copy()
    Q[:, 0] += dx
    d = np.array([(hueso.find_nearest(Vector((float(p[0]), float(p[1]), float(p[2]))), 400.0)[3] or 999.0) for p in Q])
    s = sdf(piel, Q)
    L('  %+4d     %8.2f     %7.2f%%     %5.2f%%' % (dx, np.median(d), (s > 0).mean() * 100, (s > 10).mean() * 100))
    if mejor is None or np.median(d) < mejor[0]:
        mejor = (float(np.median(d)), dx)
L('')
L('mejor dx = %+d mm (dist.hueso %.2f)' % (mejor[1], mejor[0]))
L('en unidades de app para `align`: x = %.5f' % (mejor[1] / U))
L('')
L('lo mismo en Z, ya con el dx bueno aplicado:')
DX = mejor[1]
mz = None
for dz in (-28, -24, -20, -16, -12, -8, -4, 0, 4):
    Q = MUS.copy()
    Q[:, 0] += DX
    Q[:, 2] += dz
    d = np.array([(hueso.find_nearest(Vector((float(p[0]), float(p[1]), float(p[2]))), 400.0)[3] or 999.0) for p in Q])
    s = sdf(piel, Q)
    L('  dz %+4d   %8.2f     %7.2f%%     %5.2f%%' % (dz, np.median(d), (s > 0).mean() * 100, (s > 10).mean() * 100))
    if mz is None or np.median(d) < mz[0]:
        mz = (float(np.median(d)), dz)
L('')
L('mejor: dx %+d  dz %+d   ->  align x=%.5f z=%.5f' % (DX, mz[1], DX / U, mz[1] / U))
