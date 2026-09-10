import { loadGlbLayer, TARGET_HEIGHT } from './glbBodyLoader.js';

// Órganos internos reales (Sketchfab, autor: Joe_Bou_Khalil, CC-BY) — ver
// assets-source/ORGANS_CREDITS.md. Es un busto de torso+cabeza "abierto"
// (piel + cavidad con corazón, pulmones, tubo digestivo, riñones, vasos
// sanguíneos) en una sola malla con una textura, sin separar cada órgano —
// igual que muscles.js, todas las piezas comparten una etiqueta genérica.
//
// Al ser solo torso+cabeza (no cuerpo completo), no se puede usar el ajuste
// por defecto de loadGlbLayer (que estira cualquier pieza a la altura
// completa) — se le da un rango explícito: de la cadera (~3.4, coincide con
// la posición de "Cadera" en parts-primitive.js) a la coronilla (TARGET_HEIGHT,
// igual que la "Cabeza" de piel).
const ORGANS_RANGE = { top: TARGET_HEIGHT, bottom: 3.4 };

const ORGANS_META = {
  name: 'Órganos internos',
  desc: 'Corazón, pulmones, tubo digestivo, riñones y los principales vasos sanguíneos del tronco.'
};

export function loadOrgans(bodyGroup, allMeshes) {
  return loadGlbLayer('models/organs.glb', 'organo', () => ORGANS_META, { range: ORGANS_RANGE, useZones: true }).then((parts) => {
    parts.forEach((mesh) => bodyGroup.add(mesh));
    allMeshes.push(...parts);
    return parts;
  });
}
