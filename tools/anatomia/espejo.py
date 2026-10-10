# Cada pieza con pareja izquierda/derecha deberia ser el espejo de la otra.
# Si no lo es, la pieza esta mal colocada en el asset. Es una magnitud
# independiente de "cuanto asoma": no depende de la piel para nada.
#   blender --background cuerpo.blend --python tools/anatomia/espejo.py
import os
BASE = os.path.dirname(os.path.abspath(__file__))
exec(open(os.path.join(BASE, 'comun.py')).read())

Tm = fitMusculo()
Tb = fitV(MALE, *RANGO['hueso'])


def compara(nombres, T, etiqueta):
    L('=== %s ===' % etiqueta)
    filas = []
    for nm in nombres:
        if not nm.endswith('_der'):
            continue
        izq = nm[:-4] + '_izq'
        if izq not in nombres:
            continue
        D = arr([nm], T, 2)
        I = arr([izq], T, 2)
        if len(D) < 10 or len(I) < 10:
            continue
        # espejo del izquierdo
        Im = I.copy()
        Im[:, 0] *= -1
        cd, ci = D.mean(axis=0), Im.mean(axis=0)
        desvio = float(np.linalg.norm(cd - ci))
        # tamano, para separar "mal colocada" de "pieza distinta"
        td = float(np.linalg.norm(D.max(axis=0) - D.min(axis=0)))
        ti = float(np.linalg.norm(Im.max(axis=0) - Im.min(axis=0)))
        ratio = td / max(ti, 1e-6)
        filas.append((desvio, ratio, nm[:-4], cd, ci, td))
    filas.sort(reverse=True)
    L('pares comparados: %d' % len(filas))
    malos = [f for f in filas if f[0] > 15]
    L('pares cuyo centro se desvia mas de 15 mm del espejo: %d' % len(malos))
    for desvio, ratio, nm, cd, ci, td in filas[:25]:
        aviso = ''
        if ratio < 0.8 or ratio > 1.25:
            aviso = '  <-- tambien difieren de tamano (ratio %.2f)' % ratio
        L('   %-32s desvio %6.1f mm   der(%6.0f %6.0f %6.0f) esp.izq(%6.0f %6.0f %6.0f)  tam %.0f%s'
          % (nm.replace('Musculo_', ''), desvio, cd[0], cd[1], cd[2], ci[0], ci[1], ci[2], td, aviso))
    L('')
    return filas


compara(MM, Tm, 'MUSCULOS')
compara(MALE, Tb, 'HUESOS')
