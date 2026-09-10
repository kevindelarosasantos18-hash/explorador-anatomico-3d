import { loadGlbLayer } from './glbBodyLoader.js';

// Sistema muscular real. Masculino: "Male Full Body Ecorche" de diegoluga
// (Sketchfab, CC-BY), con textura propia — ver assets-source/MUSCLES_CREDITS.md.
// Femenino: "Female Body Muscular System - Anatomy Study" de ruslangadzhiev
// (Sketchfab, CC-BY) — ese asset no traía textura de color, así que se le
// armó un material rojo muscular en Blender antes de exportar. Ninguno de
// los dos separa músculos individuales, así que todas las piezas comparten
// la misma etiqueta al seleccionarlas.
const MUSCLE_META = {
  name: 'Sistema muscular',
  desc: 'Red de más de 600 músculos que permite el movimiento del cuerpo, mantiene la postura y genera calor corporal.'
};

export function loadMuscles(bodyGroup, allMeshes, sex = 'male') {
  return loadGlbLayer(`models/${sex}/muscles.glb`, 'musculo', () => MUSCLE_META).then((parts) => {
    parts.forEach((mesh) => bodyGroup.add(mesh));
    allMeshes.push(...parts);
    return parts;
  });
}
