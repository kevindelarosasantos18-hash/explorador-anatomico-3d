import { loadGlbLayer } from './glbBodyLoader.js';

// Piel real (cuerpo completo). Masculino: "Base Mesh Pro - Male" de mundane_x
// (Sketchfab, CC-BY) — ver assets-source/SKIN_CREDITS.md. Femenino: "Free
// Female anatomy" de ComputerCats (Sketchfab, CC-BY). Ambos son "base mesh"
// sin textura; el color y la translucidez (subsurface) se armaron como
// material en Blender antes de exportar. Comparten una única etiqueta al
// seleccionarlas, igual que músculos y órganos.
const SKIN_META = {
  name: 'Piel',
  desc: 'El órgano más grande del cuerpo; protege contra infecciones y lesiones, regula la temperatura y permite el sentido del tacto.'
};

export function loadSkin(bodyGroup, allMeshes, sex = 'male') {
  return loadGlbLayer(`models/${sex}/skin.glb`, 'piel', () => SKIN_META, { useZones: true }).then((parts) => {
    parts.forEach((mesh) => bodyGroup.add(mesh));
    allMeshes.push(...parts);
    return parts;
  });
}
