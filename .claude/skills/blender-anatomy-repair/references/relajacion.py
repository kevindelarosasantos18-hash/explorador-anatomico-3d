# Relajación iterativa para muchos fragmentos pequeños que deben formar una
# superficie continua (ej. la base de un cráneo hecha de decenas de huesitos).
# Ver SKILL.md sección 4. Requiere huecos.py (make_bvh).

import bpy, mathutils, bmesh
from mathutils.bvhtree import BVHTree


def bbox_center(obj):
    verts = [obj.matrix_world @ v.co for v in obj.data.vertices]
    xs = [v.x for v in verts]; ys = [v.y for v in verts]; zs = [v.z for v in verts]
    return mathutils.Vector(((min(xs)+max(xs))/2, (min(ys)+max(ys))/2, (min(zs)+max(zs))/2))


def make_bvh(obj):
    bm = bmesh.new(); bm.from_mesh(obj.data); bm.transform(obj.matrix_world)
    bvh = BVHTree.FromBMesh(bm); bm.free(); return bvh


def nearest_pair(obj_from, bvh_to, sample=150):
    best = (1e9, None, None)
    verts = [obj_from.matrix_world @ v.co for v in obj_from.data.vertices]
    step = max(1, len(verts) // sample)
    for i in range(0, len(verts), step):
        p = verts[i]
        loc, norm, idx, dist = bvh_to.find_nearest(p)
        if loc is not None and dist < best[0]:
            best = (dist, p, loc)
    return best


def relax(movable_names, anchor_names, n_iters=10, damping=0.5, n_candidates=4):
    """Acerca cada objeto de `movable_names` a su vecino real más cercano,
    iterando `n_iters` veces. `anchor_names` son objetos que NO se mueven
    (piezas grandes ya bien posicionadas, ej. la bóveda craneal). En cada
    iteración, cada objeto móvil solo se compara contra sus `n_candidates` más
    cercanos por centro de bounding box (barato) — NO contra todos los demás
    objetos, eso es demasiado caro y puede colgar la conexión con Blender.

    Devuelve el hueco total (suma de distancias al vecino más cercano de cada
    objeto móvil) en la última iteración — sirve para confirmar convergencia
    corriendo esto un par de veces y viendo que el número deja de bajar."""
    all_names = list(movable_names) + list(anchor_names)
    total_gap = 0
    for iteration in range(n_iters):
        centers = {n: bbox_center(bpy.data.objects[n]) for n in all_names}
        total_gap = 0
        moves = {}
        for n in movable_names:
            obj = bpy.data.objects[n]
            c = centers[n]
            others = [m for m in all_names if m != n]
            others.sort(key=lambda m: (centers[m] - c).length)
            candidates = others[:n_candidates]
            best_overall = (1e9, None, None)
            for cand in candidates:
                bvh_cand = make_bvh(bpy.data.objects[cand])
                dist, p1, p2 = nearest_pair(obj, bvh_cand)
                if dist < best_overall[0]:
                    best_overall = (dist, p1, p2)
            dist, p1, p2 = best_overall
            total_gap += dist
            moves[n] = (p2 - p1) * damping if dist > 0.5 else mathutils.Vector((0, 0, 0))
        for n, delta in moves.items():
            obj = bpy.data.objects[n]
            mw = obj.matrix_world; mw_inv = mw.inverted()
            for v in obj.data.vertices:
                w = mw @ v.co
                v.co = mw_inv @ (w + delta)
            obj.data.update()
        print(f'iteración {iteration+1}: hueco total = {total_gap:.2f}')
    return total_gap


# Ejemplo de uso:
#
# movable = ['Fragmento_1', 'Fragmento_2', ...]  # ~30-40 piezas chicas
# anchors = ['Pieza_grande_A', 'Pieza_grande_B']  # piezas ya bien posicionadas, no se mueven
# relax(movable, anchors, n_iters=10, damping=0.5)
#
# Si un fragmento en particular NO converge bien (se va lejos de la masa
# principal), probablemente esté mal identificado/etiquetado — sacalo de
# `movable`, aislalo en el visor de depuración (ver debug-viewer.html) y
# revisá si tiene forma anatómica reconocible antes de forzarlo a encajar en
# cualquier vecino cercano.
