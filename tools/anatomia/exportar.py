# Exporta una capa masculina a public/models/male/.
#   blender --background cuerpo.blend --python tools/anatomia/exportar.py -- musculo
#   blender --background cuerpo.blend --python tools/anatomia/exportar.py -- piel
#   blender --background cuerpo.blend --python tools/anatomia/exportar.py -- hueso
import bpy, io, os, sys, contextlib

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
QUE = ARGS[0] if ARGS else 'musculo'
RAIZ = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))


def L(m):
    print('LOG ' + str(m), flush=True)


if QUE == 'musculo':
    objs = [o for o in bpy.data.objects if o.name.startswith('Musculo_')]
    destino = 'public/models/male/muscles.glb'
    renombrar = None
elif QUE == 'piel':
    objs = [bpy.data.objects['PIEL_Skin']]
    destino = 'public/models/male/skin.glb'
    renombrar = 'Skin'          # el nodo del glb publicado se llama asi
elif QUE == 'hueso':
    objs = [o for o in bpy.data.objects if o.type == 'MESH' and not o.name.startswith(
        ('F_', 'FMUS_', 'Musculo_', 'Nervio_', 'Organo_', 'PIEL', 'Skin', '_t'))]
    destino = 'public/models/male/skeleton.glb'
    renombrar = None
else:
    raise SystemExit('capa desconocida: %s' % QUE)

# El exportador usa el nombre del objeto Y el del datablock; si no coinciden
# salen sufijos .001 en los nodos del glb y la metadata deja de encontrarlos.
previos = [(o, o.name, o.data.name) for o in objs]
if renombrar:
    for o in objs:
        o.name = renombrar
        o.data.name = renombrar

bpy.ops.object.select_all(action='DESELECT')
for o in objs:
    o.select_set(True)
bpy.context.view_layer.objects.active = objs[0]
ruta = os.path.join(RAIZ, destino)
with contextlib.redirect_stdout(io.StringIO()):
    bpy.ops.export_scene.gltf(filepath=ruta, export_format='GLB', use_selection=True,
                              export_draco_mesh_compression_enable=True,
                              export_yup=True, export_apply=False)
for o, n, dn in previos:
    o.name, o.data.name = n, dn
L('exportado %s  (%d piezas, %.2f MB)' % (destino, len(objs), os.path.getsize(ruta) / 1048576))
