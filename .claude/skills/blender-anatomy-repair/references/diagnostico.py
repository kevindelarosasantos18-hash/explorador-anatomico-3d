# Diagnóstico: conteo de islas (fragmentos desconectados) + bounding box/centroide
# por objeto. Correr esto PRIMERO sobre cualquier región sospechosa, antes de
# decidir si el problema es fusión/basura (SKILL.md sección 1), un hueco entre
# piezas (sección 3), o geometría irreparable (sección 5).
#
# Pegar/adaptar dentro de un execute_blender_code contra el Blender conectado
# por BlenderMCP.

import bpy, bmesh

def count_islands(obj, limit=None):
    """Devuelve una lista con el tamaño (en vértices) de cada isla desconectada
    del objeto. Si `limit` está seteado, corta apenas se superan esa cantidad de
    islas (para objetos muy fragmentados, evita recorrer todo)."""
    bm = bmesh.new()
    bm.from_mesh(obj.data)
    bm.verts.ensure_lookup_table()
    visited = set()
    islands = []
    for seed in bm.verts:
        if seed.index in visited:
            continue
        stack = [seed]
        island = []
        while stack:
            v = stack.pop()
            if v.index in visited:
                continue
            visited.add(v.index)
            island.append(v)
            for e in v.link_edges:
                other = e.other_vert(v)
                if other.index not in visited:
                    stack.append(other)
        islands.append(len(island))
        if limit and len(islands) > limit:
            bm.free()
            return islands
    bm.free()
    return islands


def bbox_and_centroid(obj):
    verts = [obj.matrix_world @ v.co for v in obj.data.vertices]
    xs = [v.x for v in verts]; ys = [v.y for v in verts]; zs = [v.z for v in verts]
    centroid_sum = sum(verts, verts[0] * 0)
    centroid = centroid_sum / len(verts)
    return {
        'x': (min(xs), max(xs)), 'y': (min(ys), max(ys)), 'z': (min(zs), max(zs)),
        'centroid': centroid,
    }


def audit_region(object_names, small_threshold=50, island_limit=5):
    """Reporta, para cada objeto en `object_names`, cuántas islas tiene y cuántas
    son basura (menos de `small_threshold` vértices). Objetos con 1 sola isla no
    se imprimen (están sanos). Usar para auditar TODA una región de una pasada,
    no solo el objeto que el usuario señaló — en este proyecto eso reveló que
    39 de 40 "huesos faciales" tenían el mismo bug que solo se había notado en 1."""
    suspicious = []
    for name in object_names:
        obj = bpy.data.objects.get(name)
        if not obj or obj.type != 'MESH':
            continue
        islands = count_islands(obj, limit=island_limit)
        if len(islands) > 1:
            small = sum(1 for s in islands if s < small_threshold)
            suspicious.append((name, len(obj.data.vertices), len(islands), small, sorted(islands, reverse=True)[:6]))
    print(f'{len(suspicious)} objetos con más de 1 isla (de {len(object_names)} revisados):')
    for name, verts, n_islands, small, top_sizes in suspicious:
        print(f'  {name}: {verts} verts totales, {n_islands}+ islas, {small} son basura (<{small_threshold}), top tamaños={top_sizes}')
    return suspicious


# Ejemplo de uso: auditar todos los objetos cuyo nombre empiece con un prefijo
# de región (ajustar al asset real):
#
# region_names = [o.name for o in bpy.data.objects if o.name.startswith('Hueso_facial_')]
# audit_region(region_names)
#
# O auditar TODO el esqueleto/asset de una vez:
#
# all_names = [o.name for o in bpy.data.objects if o.type == 'MESH']
# audit_region(all_names)
