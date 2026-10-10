# Compara lado derecho contra izquierdo. Una asimetria grande casi siempre
# significa que un ajuste anterior se aplico solo a un lado, no que el cuerpo
# sea asi.
#   blender --background cuerpo.blend --python tools/anatomia/simetria.py
import os
BASE = os.path.dirname(os.path.abspath(__file__))
exec(open(os.path.join(BASE, 'comun.py')).read())

Tp = fitPiel()
Tm = fitMusculo()
Tb = fitV(MALE, *RANGO['hueso'])
piel = bvh_de('PIEL_Skin', Tp)
valida_signo(piel)
L('')

HUE = arr(MALE, Tb, 2)
MUS = arr(MM, Tm, 4)
L('=== saliente por lado ===')
for nom, P in (('HUESO', HUE), ('MUSCULO', MUS)):
    for lado, m in (('derecho', P[:, 0] > 40), ('izquierdo', P[:, 0] < -40)):
        s = sdf(piel, P[m])
        L('  %-8s %-10s fuera %5.2f%%  >2mm %5.2f%%  >10mm %5.2f%%  max %5.1f'
          % (nom, lado, (s > 0).mean() * 100, (s > 2).mean() * 100, (s > 10).mean() * 100, max(s.max(), 0)))

L('')
L('=== pares izq/der del mismo musculo: max del saliente ===')
pares = []
for nm in MM:
    if not nm.endswith('_der'):
        continue
    izq = nm[:-4] + '_izq'
    if izq not in MM:
        continue
    sd = sdf(piel, arr([nm], Tm, 3))
    si = sdf(piel, arr([izq], Tm, 3))
    if not len(sd) or not len(si):
        continue
    d, i = max(sd.max(), 0), max(si.max(), 0)
    if abs(d - i) > 12:
        pares.append((abs(d - i), d, i, nm.replace('Musculo_', '')[:-4]))
pares.sort(reverse=True)
L('pares que difieren mas de 12 mm entre lados: %d' % len(pares))
for dif, d, i, nm in pares[:20]:
    L('   %-32s der %5.1f  izq %5.1f   dif %5.1f' % (nm, d, i, dif))

L('')
L('=== la piel: es simetrica? ===')
ob = bpy.data.objects['PIEL_Skin']
A = Tp @ ob.matrix_world
P = np.array([[(A @ v.co).x * U, (A @ v.co).y * U, (A @ v.co).z * U] for v in ob.data.vertices])
L('  bbox x %.1f .. %.1f   (centro %.1f)' % (P[:, 0].min(), P[:, 0].max(), (P[:, 0].min() + P[:, 0].max()) / 2))
for y0 in range(100, 1700, 150):
    m = (P[:, 1] >= y0) & (P[:, 1] < y0 + 150)
    if m.sum() < 50:
        continue
    d = P[m & (P[:, 0] > 0)]
    i = P[m & (P[:, 0] < 0)]
    if not len(d) or not len(i):
        continue
    L('  y=%4d  x max der %6.1f   x max izq %6.1f   dif %5.1f mm'
      % (y0, d[:, 0].max(), -i[:, 0].min(), d[:, 0].max() + i[:, 0].min()))
