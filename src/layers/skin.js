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

// La piel y el esqueleto son dos assets distintos, con poses distintas: al
// centrarlos cada uno por su propio bounding box quedan desplazados entre sí.
// La malla masculina ya viene corregida por regiones contra el hueso, y esto
// cancela el recentrado que haría `computeStretchFit` (si no, el ajuste de la
// pierna se perdería). Medido con la distancia con signo de cada hueso a la
// piel; ver assets-source/SKIN_CREDITS.md.
const SKIN_ALIGN = {
  male: { x: 0, z: 0.13387 },
  female: null
};

export function loadSkin(bodyGroup, allMeshes, sex = 'male') {
  return loadGlbLayer(`models/${sex}/skin.glb`, 'piel', () => SKIN_META, { useZones: true, align: SKIN_ALIGN[sex] }).then((parts) => {
    parts.forEach((mesh) => bodyGroup.add(mesh));
    allMeshes.push(...parts);
    return parts;
  });
}
