"""
Convierte esqueleto-humano.obj (+ .mtl) a public/models/skeleton.glb.

Preserva los 303 objetos del OBJ como mallas/nodos separados (no se fusionan)
para que cada hueso siga siendo seleccionable individualmente por raycasting
en el visor. Exporta en binario (.glb) con compresión Draco.

Uso (Windows, PowerShell o Git Bash), desde la raíz del proyecto:
    & "C:\\Program Files\\Blender Foundation\\Blender 4.5\\blender.exe" --background --python scripts/convert_skeleton.py

Volver a ejecutar cada vez que se edite esqueleto-humano.obj en Blender.
"""

import bpy
import os

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OBJ_PATH = os.path.join(PROJECT_ROOT, "assets-source", "esqueleto-humano.obj")
OUT_PATH = os.path.join(PROJECT_ROOT, "public", "models", "skeleton.glb")


def clear_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for block in list(bpy.data.meshes):
        if block.users == 0:
            bpy.data.meshes.remove(block)


def import_obj(path):
    if hasattr(bpy.ops.wm, "obj_import"):
        bpy.ops.wm.obj_import(filepath=path)
    else:
        bpy.ops.import_scene.obj(filepath=path)


def clean_meshes():
    for obj in bpy.data.objects:
        if obj.type != "MESH":
            continue
        obj.data.calc_normals_split() if hasattr(obj.data, "calc_normals_split") else None
        for poly in obj.data.polygons:
            poly.use_smooth = True


def export_glb(path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.export_scene.gltf(
        filepath=path,
        export_format="GLB",
        use_selection=False,
        export_apply=True,
        export_yup=True,
        export_materials="EXPORT",
        export_draco_mesh_compression_enable=True,
        export_draco_mesh_compression_level=6,
    )


def main():
    if not os.path.isfile(OBJ_PATH):
        raise SystemExit(f"No se encontró el OBJ en: {OBJ_PATH}")

    clear_scene()
    import_obj(OBJ_PATH)
    clean_meshes()
    export_glb(OUT_PATH)

    mesh_count = sum(1 for o in bpy.data.objects if o.type == "MESH")
    size_mb = os.path.getsize(OUT_PATH) / (1024 * 1024)
    print(f"OK: {mesh_count} mallas exportadas -> {OUT_PATH} ({size_mb:.2f} MB)")


main()
