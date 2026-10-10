# Estado de encaje de las capas masculinas: que asoma por fuera de la piel.
#   blender --background cuerpo.blend --python tools/anatomia/medir.py
import os
BASE = os.path.dirname(os.path.abspath(__file__))
exec(open(os.path.join(BASE, 'comun.py')).read())

Tp = fitPiel()
Tm = fitMusculo()
Tb = fitV(MALE, *RANGO['hueso'])
piel = bvh_de('PIEL_Skin', Tp)

L('=== validacion del signo ===')
valida_signo(piel)
L('')

HUE = arr(MALE, Tb, 2)
MUS = arr(MM, Tm, 4)
sh = sdf(piel, HUE)
sm = sdf(piel, MUS)
L('=== HUESO (%d puntos) ===' % len(HUE))
histograma(sh, '')
por_region(sh, HUE, 'hueso')
L('')
L('=== MUSCULO (%d puntos) ===' % len(MUS))
histograma(sm, '')
por_region(sm, MUS, 'musculo')
L('')

L('=== piezas que asoman: >8%% de sus puntos a mas de 2 mm fuera ===')
peor = []
for nm in MALE + MM:
    T = Tb if nm in MALESET else Tm
    P = arr([nm], T, 2)
    if not len(P):
        continue
    s = sdf(piel, P)
    if (s > 2).mean() > 0.08:
        peor.append(((s > 2).mean() * 100, s.max(), nm, float(P[:, 1].mean())))
peor.sort(key=lambda t: -t[1])
L('total: %d piezas' % len(peor))
for f, mx, nm, y in peor[:30]:
    tipo = 'hueso' if nm in MALESET else 'musc '
    L('   %s %-32s %4.0f%% fuera  max %5.1f mm  y=%.0f' % (tipo, nm.replace('Musculo_', ''), f, mx, y))
