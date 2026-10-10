# Restaurar una pieza rota desde la fuente original (sin desarticular).
# Ver SKILL.md sección 5 para cuándo usar esto en vez de reposicionar.
#
# Estos pasos son una GUÍA de flujo, no una función lista para copiar-pegar tal
# cual — cada asset tiene su propio identificador/UID de descarga y su propia
# convención de nombres. Adaptar los nombres de ejemplo al caso real.

import bpy, mathutils

# 1. Descargar de nuevo el asset original (antes de que nadie lo desarticulara).
#    El identificador (uid) es el mismo que se usó la primera vez para descargar
#    el asset actual — revisar el archivo de créditos del proyecto si no se
#    recuerda. `target_size` es la altura total del modelo en metros, no de la
#    pieza que te interesa.
#
#    (esta llamada es una tool de BlenderMCP, no una función de bpy)
#    download_sketchfab_model(uid="...", target_size=1.7)

# 2. Identificar qué Object_N es la pieza que necesitás, comparando conteo de
#    vértices contra una pieza de referencia ya conocida y confiable (una que
#    viene de la MISMA fuente y nunca fue tocada).
def find_matching_object(candidate_names, reference_vert_count):
    for name in candidate_names:
        obj = bpy.data.objects.get(name)
        if obj and len(obj.data.vertices) == reference_vert_count:
            return name
    return None

# ejemplo:
# ref_verts = len(bpy.data.objects['Mandible'].data.vertices)  # pieza ya confiable
# candidates = [f'Object_{i}' for i in range(5, 20)]
# match = find_matching_object(candidates, ref_verts)


# 3. PASO CRÍTICO — limpiar el padre del import ANTES de tocar vértices o
#    exportar. Si te lo saltás, el exportador glTF ignora la transformación del
#    padre al exportar el objeto solo, y aparece en una posición completamente
#    distinta a la que medís en Python.
def prepare_downloaded_object(name):
    obj = bpy.data.objects[name]
    bpy.ops.object.select_all(action='DESELECT')
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.parent_clear(type='CLEAR_KEEP_TRANSFORM')
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)


# 4. Escalar la pieza nueva para que coincida con la escala real del asset ya
#    en uso. La descarga fresca normaliza el modelo COMPLETO a `target_size`
#    metros de altura total — eso casi nunca coincide con la altura real del
#    asset que ya tenés en la escena.
def rescale_to_match(obj_name, target_size_used, real_height_of_existing_asset, unit_factor=1.0):
    """`unit_factor` convierte unidades si hace falta (ej. 1000 si la descarga
    está en metros y el asset existente está en milímetros). El factor de
    escala final es (altura_real / target_size) * unit_factor, aplicado
    uniformemente desde el origen — funciona directo si ambos assets comparten
    convención de origen (X=0 centrado, pies en Z o Y = 0)."""
    obj = bpy.data.objects[obj_name]
    ratio = (real_height_of_existing_asset / target_size_used) * unit_factor
    mw = obj.matrix_world
    for v in obj.data.vertices:
        w = mw @ v.co
        v.co = mw.inverted() @ (w * ratio)
    obj.data.update()
    return ratio


# 5. Confirmar el encaje con la pieza vecina ya existente usando BVH real
#    (ver huecos.py) ANTES de dar por buena la escala/posición.
#
# from huecos import min_dist  # o pegar la función directo
# print(min_dist(obj_name, 'PiezaVecinaYaExistente'))

# 6. Borrar los fragmentos rotos, renombrar la pieza nueva con el nombre que ya
#    esperaba el código de la app (así los mapeos nombre→descripción/región no
#    necesitan cambios), y purgar datos huérfanos.
def replace_broken_pieces(broken_names, new_object_name, final_name):
    for name in broken_names:
        obj = bpy.data.objects.get(name)
        if obj:
            bpy.data.objects.remove(obj, do_unlink=True)
    for block in list(bpy.data.meshes):
        if block.users == 0:
            bpy.data.meshes.remove(block)
    bpy.data.objects[new_object_name].name = final_name


# Nota sobre texturas: si la pieza nueva trae una textura a mayor resolución
# que el resto del asset (ej. 2048px cuando el resto está en 1024px), y el
# tamaño del archivo exportado importa (límite de precache/CDN del proyecto),
# achicala antes de exportar:
#
# img = bpy.data.images['NombreTextura.jpeg']
# img.scale(1024, 1024)
# img.pack()
