# Detección y cierre de huecos entre piezas usando distancia real de superficie
# (BVH), no bounding boxes. Ver SKILL.md sección 3.

import bpy, bmesh, mathutils
from mathutils.bvhtree import BVHTree

def make_bvh(obj):
    """Construye un BVHTree de `obj` ya en coordenadas de mundo (aplica
    matrix_world), listo para consultas de punto-más-cercano."""
    bm = bmesh.new()
    bm.from_mesh(obj.data)
    bm.transform(obj.matrix_world)
    bvh = BVHTree.FromBMesh(bm)
    bm.free()
    return bvh


def min_dist(name1, name2, sample=200):
    """Distancia real mínima (en las unidades del asset — mm si el asset está
    en mm, metros si está en metros) entre las superficies de dos objetos.
    `sample` limita cuántos vértices de `name1` se muestrean contra el BVH de
    `name2` — subir el número da más precisión a costa de velocidad."""
    o1 = bpy.data.objects.get(name1)
    o2 = bpy.data.objects.get(name2)
    if not o1 or not o2:
        return None
    bvh2 = make_bvh(o2)
    verts = [o1.matrix_world @ v.co for v in o1.data.vertices]
    step = max(1, len(verts) // sample)
    best = 1e9
    for i in range(0, len(verts), step):
        loc, norm, idx, dist = bvh2.find_nearest(verts[i])
        if dist is not None and dist < best:
            best = dist
    return best


def gap_vector(name_from, name_to, sample=300):
    """Como min_dist, pero además devuelve el punto en `name_from` y el punto
    en `name_to` que están más cerca entre sí. La resta (punto_to - punto_from)
    es el vector exacto que hay que sumarle a TODA la cadena de piezas
    dependientes de `name_from` para que su superficie toque `name_to`."""
    o1 = bpy.data.objects[name_from]
    o2 = bpy.data.objects[name_to]
    bvh2 = make_bvh(o2)
    verts = [o1.matrix_world @ v.co for v in o1.data.vertices]
    step = max(1, len(verts) // sample)
    best = (1e9, None, None)
    for i in range(0, len(verts), step):
        loc, norm, idx, dist = bvh2.find_nearest(verts[i])
        if dist is not None and dist < best[0]:
            best = (dist, verts[i], loc)
    return best  # (distancia, punto_en_name_from, punto_en_name_to)


def translate_chain(object_names, delta):
    """Traslada TODOS los objetos en `object_names` por el vector `delta`
    (mismo delta para todos, en coordenadas de mundo). Usar con la cadena
    COMPLETA de piezas dependientes de la pieza que tocás el hueco — si cerrás
    la muñeca, pasá el hueso del carpo + metacarpianos + falanges, no solo el
    carpo, o vas a abrir un hueco nuevo un poco más adelante en la cadena."""
    moved, missing = 0, []
    for name in object_names:
        obj = bpy.data.objects.get(name)
        if not obj:
            missing.append(name)
            continue
        mw = obj.matrix_world
        mw_inv = mw.inverted()
        for v in obj.data.vertices:
            world = mw @ v.co
            v.co = mw_inv @ (world + delta)
        obj.data.update()
        moved += 1
    return moved, missing


# --- Ejemplo de uso: auditar varias articulaciones de una pasada -----------
#
# joints = [
#     ('Tarso_der_0', 'Tibia_der'),   # tobillo derecho
#     ('Carpo_der_0', 'Cubito_der'),  # muñeca derecha
#     ('Femur_der', 'Coxal_der'),     # cadera derecha
# ]
# for a, b in joints:
#     d = min_dist(a, b)
#     flag = '  <-- REVISAR' if d is not None and d > 10 else ''  # ajustar umbral a la escala del asset
#     print(f'{a} <-> {b}: {d:.2f}{flag}' if d is not None else f'{a} <-> {b}: falta un objeto')
#
# --- Ejemplo de uso: cerrar un hueco encontrado -----------------------------
#
# dist, p_from, p_to = gap_vector('Tarso_der_0', 'Tibia_der')
# delta = p_to - p_from
# foot_chain = ['Tarso_der_0', 'Tarso_der_1', ...]  # TODA la cadena del pie
# translate_chain(foot_chain, delta)
#
# Volver a correr min_dist() después para confirmar que quedó en ~0.
