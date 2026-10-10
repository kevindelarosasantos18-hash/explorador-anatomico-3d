# Sustituye cada pieza muscular que rompe la simetria por el espejo de su
# pareja buena. El esqueleto es simetrico (desvio maximo 6.7 mm), asi que la
# simetria es una exigencia legitima y, lo que importa, es una medida
# INDEPENDIENTE de cuanto asoma por la piel: no se puede enganar optimizandola.
#
#   blender --background cuerpo.blend --python tools/anatomia/reparar_espejo.py [-- --guardar]
import os, sys
BASE = os.path.dirname(os.path.abspath(__file__))
exec(open(os.path.join(BASE, 'comun.py')).read())

GUARDAR = '--guardar' in sys.argv
MIN_DESVIO = 15.0

Tp = fitPiel()
Tm = fitMusculo()
Tb = fitV(MALE, *RANGO['hueso'])
piel = bvh_de('PIEL_Skin', Tp)
valida_signo(piel)

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


def dist_hueso(P):
    return np.array([(hueso.find_nearest(Vector((float(p[0]), float(p[1]), float(p[2]))), 400.0)[3] or 999.0)
                     for p in P])


def calidad(P):
    """Menor es mejor: cuanto asoma y cuanto flota lejos del hueso."""
    s = sdf(piel, P)
    h = dist_hueso(P)
    return max(s.max(), 0.0), float(np.median(h))


# La linea media anatomica NO tiene por que caer en x=0: `computeStretchFit`
# centra cada capa por su bounding box, y si un lado llega mas lejos que el
# otro el centro del bbox se desplaza. Espejar sobre x=0 meteria ese error en
# cada pieza reparada, asi que hay que medir la linea media de verdad.
def linea_media(nombres, T):
    offs = []
    for nm in nombres:
        if not nm.endswith('_der'):
            continue
        izq = nm[:-4] + '_izq'
        if izq in nombres:
            D = arr([nm], T, 8)
            I = arr([izq], T, 8)
            if len(D) > 5 and len(I) > 5:
                offs.append(D[:, 0].mean() + I[:, 0].mean())
    return float(np.median(offs)) / 2 if offs else 0.0, len(offs)


MID_MUS, n1 = linea_media(MM, Tm)
MID_HUE, n2 = linea_media(MALE, Tb)
L('linea media: musculo x=%+.2f mm (%d pares)   hueso x=%+.2f mm (%d pares)' % (MID_MUS, n1, MID_HUE, n2))
L('desfase entre capas: %.2f mm' % abs(MID_MUS - MID_HUE))
if abs(MID_MUS) > 25:
    raise SystemExit('Linea media muscular absurda: revisar antes de espejar.')

MU0 = arr(MM, Tm, 1)
BBOX0 = (MU0.min(axis=0), MU0.max(axis=0))
L('bbox capa antes: x %.1f..%.1f y %.1f..%.1f z %.1f..%.1f'
  % (BBOX0[0][0], BBOX0[1][0], BBOX0[0][1], BBOX0[1][1], BBOX0[0][2], BBOX0[1][2]))
L('')


def espeja(bueno, malo):
    """Pone en `malo` el espejo de `bueno`. Devuelve False si no mejora."""
    A = bpy.data.objects[bueno]
    B = bpy.data.objects[malo]
    antes = calidad(arr([malo], Tm, 3))

    MA = Tm @ A.matrix_world                      # local A -> app
    MBi = (Tm @ B.matrix_world).inverted()        # app -> local B
    co = []
    for v in A.data.vertices:
        p = MA @ v.co
        p.x = 2 * (MID_MUS / U) - p.x              # espejo sobre la linea media real
        co.append(MBi @ p)
    caras = [list(pl.vertices)[::-1] for pl in A.data.polygons]  # invertir giro

    viejo = B.data
    nueva = bpy.data.meshes.new(viejo.name)
    nueva.from_pydata([tuple(c) for c in co], [], caras)
    nueva.update()
    for m in viejo.materials:
        nueva.materials.append(m)
    nombre_data = viejo.name
    B.data = nueva
    nueva.name = nombre_data                       # el exportador usa data.name

    despues = calidad(arr([malo], Tm, 3))
    mejora = (despues[0] <= antes[0] + 1.0) and (despues[1] <= antes[1] + 1.0)
    L('   %-30s asoma %5.1f -> %-5.1f   dist.hueso %5.1f -> %-5.1f   %s'
      % (malo.replace('Musculo_', ''), antes[0], despues[0], antes[1], despues[1],
         'ok' if mejora else 'NO MEJORA, revierto'))
    return mejora, nueva, viejo


L('=== reparando por espejo ===')
hechos, rechazados = [], []
for nm in sorted(MM):
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
    Im[:, 0] = 2 * MID_MUS - Im[:, 0]
    desvio = float(np.linalg.norm(D.mean(axis=0) - Im.mean(axis=0)))
    if desvio < MIN_DESVIO:
        continue
    ad, hd = calidad(D)
    ai, hi = calidad(I)
    voto_d = (ad > ai + 8) + (hd > hi + 8)
    voto_i = (ai > ad + 8) + (hi > hd + 8)
    if voto_d > voto_i:
        bueno, malo = izq, nm
    elif voto_i > voto_d:
        bueno, malo = nm, izq
    else:
        L('   %-30s desvio %5.1f  EMPATE: no toco, hace falta mirarlo' % (nm[:-4].replace('Musculo_', ''), desvio))
        rechazados.append((nm[:-4], 'empate'))
        continue
    ok, nueva, viejo = espeja(bueno, malo)
    if ok:
        hechos.append(malo)
        if viejo.users == 0:
            bpy.data.meshes.remove(viejo)
    else:
        n = nueva.name
        bpy.data.objects[malo].data = viejo
        bpy.data.meshes.remove(nueva)
        viejo.name = n
        rechazados.append((malo, 'no mejora'))

L('')
L('reparadas %d piezas, rechazadas %d' % (len(hechos), len(rechazados)))
MU1 = arr(MM, Tm, 1)
L('bbox capa despues: x %.1f..%.1f y %.1f..%.1f z %.1f..%.1f'
  % (MU1[:, 0].min(), MU1[:, 0].max(), MU1[:, 1].min(), MU1[:, 1].max(), MU1[:, 2].min(), MU1[:, 2].max()))
dy = abs((MU1[:, 1].max() - MU1[:, 1].min()) - (BBOX0[1][1] - BBOX0[0][1]))
L('cambio de altura de la capa: %.2f mm  %s' % (dy, 'ok' if dy < 1.0 else 'OJO: el app reescalaria la capa entera'))

L('')
s = sdf(piel, arr(MM, Tm, 4))
histograma(s, 'MUSCULO tras la reparacion:')

if GUARDAR and hechos:
    bpy.ops.wm.save_mainfile()
    L('GUARDADO')
