# Limpieza de una pieza "fusionada": separar por partes sueltas, descartar
# basura por umbral de vértices, reunir los fragmentos reales bajo el nombre
# original. Ver SKILL.md sección 2 para el contexto y las trampas a evitar.

import bpy

def clean_fused_object(name, min_verts=50):
    """Separa `name` en sus islas reales, borra las que tengan menos de
    `min_verts` vértices (basura), y reune el resto en un solo objeto que vuelve
    a llamarse `name`. Si TODO el objeto resulta ser basura, lo elimina entero.
    Devuelve un string con el resumen de qué pasó (para loguear/revisar)."""
    obj = bpy.data.objects.get(name)
    if not obj:
        return f'{name}: MISSING'

    bpy.ops.object.select_all(action='DESELECT')
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.mesh.separate(type='LOOSE')
    bpy.ops.object.mode_set(mode='OBJECT')

    # separate(type='LOOSE') crea objetos nuevos nombrados "name", "name.001",
    # "name.002"... — esto también va a capturar variantes con sufijo de punto
    # que ya existieran ANTES de este separate (ver "Trampa a evitar" en
    # SKILL.md sección 2). Si eso es un problema para tu caso, filtrá `parts`
    # de otra forma (por ejemplo guardando el set de nombres de objeto ANTES de
    # llamar a separate() y comparando después).
    parts = [o for o in bpy.data.objects if o.name == name or o.name.startswith(name + '.')]
    keep = [o for o in parts if len(o.data.vertices) >= min_verts]
    debris = [o for o in parts if len(o.data.vertices) < min_verts]
    debris_count = len(debris)
    for o in debris:
        bpy.data.objects.remove(o, do_unlink=True)

    if not keep:
        return f'{name}: TODO era basura, objeto eliminado entero ({debris_count} fragmentos)'

    bpy.ops.object.select_all(action='DESELECT')
    for o in keep:
        o.select_set(True)
    bpy.context.view_layer.objects.active = keep[0]
    if len(keep) > 1:
        bpy.ops.object.join()
    joined = bpy.context.view_layer.objects.active
    joined.name = name
    return f'{name}: {len(keep)} fragmentos reales conservados, {debris_count} de basura eliminados'


# Ejemplo de uso — limpiar una lista de objetos sospechosos (los que salieron
# de audit_region() en diagnostico.py con basura mezclada):
#
# targets = ['Craneo_temporal_A_der', 'Craneo_temporal_A_izq', 'Craneo_esfenoides']
# for t in targets:
#     print(clean_fused_object(t, min_verts=50))
#
# Después de limpiar, no olvides purgar los datos-malla huérfanos que quedaron
# sin usuarios:
#
# for block in list(bpy.data.meshes):
#     if block.users == 0:
#         bpy.data.meshes.remove(block)
