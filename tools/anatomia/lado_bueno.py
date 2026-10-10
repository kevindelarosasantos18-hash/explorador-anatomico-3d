# Para cada par izq/der que rompe la simetria, decide que lado esta bien.
# Criterios, los dos independientes de la simetria misma:
#   - cuanto asoma por fuera de la piel (menos es mejor)
#   - a que distancia esta del hueso mas cercano (un musculo se inserta en
#     hueso; si flota a 30 mm de todo, esta fuera de sitio)
#   blender --background cuerpo.blend --python tools/anatomia/lado_bueno.py
import os
BASE = os.path.dirname(os.path.abspath(__file__))
exec(open(os.path.join(BASE, 'comun.py')).read())

Tp = fitPiel()
Tm = fitMusculo()
Tb = fitV(MALE, *RANGO['hueso'])
piel = bvh_de('PIEL_Skin', Tp)
valida_signo(piel)

# BVH de todo el esqueleto
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
L('BVH hueso: %d triangulos' % len(bt))
L('')


def dist_hueso(P):
    d = []
    for p in P:
        r = hueso.find_nearest(Vector((float(p[0]), float(p[1]), float(p[2]))), 400.0)
        d.append(r[3] if r[0] else 999.0)
    return np.array(d)


filas = []
for nm in MM:
    if not nm.endswith('_der'):
        continue
    izq = nm[:-4] + '_izq'
    if izq not in MM:
        continue
    D = arr([nm], Tm, 3)
    I = arr([izq], Tm, 3)
    if len(D) < 10 or len(I) < 10:
        continue
    Im = I.copy()
    Im[:, 0] *= -1
    desvio = float(np.linalg.norm(D.mean(axis=0) - Im.mean(axis=0)))
    if desvio < 15:
        continue
    sd, si = sdf(piel, D), sdf(piel, I)
    hd, hi = dist_hueso(D), dist_hueso(I)
    filas.append((desvio, nm[:-4].replace('Musculo_', ''),
                  max(sd.max(), 0), max(si.max(), 0),
                  float(np.median(hd)), float(np.median(hi)),
                  len(D), len(I)))

filas.sort(reverse=True)
L('=== pares asimetricos: quien esta mal ===')
L('%-30s %7s | %-17s | %-17s | %s' % ('pieza', 'desvio', 'asoma der/izq', 'dist.hueso d/i', 'veredicto'))
for desvio, nm, ad, ai, hd, hi, nd, ni in filas:
    # el lado malo asoma mas y/o flota mas lejos del hueso
    voto_d = (ad > ai + 8) + (hd > hi + 8)
    voto_i = (ai > ad + 8) + (hi > hd + 8)
    if voto_d > voto_i:
        v = 'DERECHO mal'
    elif voto_i > voto_d:
        v = 'IZQUIERDO mal'
    else:
        v = 'empate, mirar a mano'
    L('%-30s %6.1f | %6.1f / %-8.1f | %6.1f / %-8.1f | %s'
      % (nm, desvio, ad, ai, hd, hi, v))
