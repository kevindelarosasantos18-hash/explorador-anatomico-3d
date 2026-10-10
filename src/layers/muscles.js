import { loadGlbLayer } from './glbBodyLoader.js';
import { getMuscleMeta, getMuscleRegion } from '../data/muscle-metadata.js';

// Sistema muscular real: 410 músculos individuales del modelo "Myology" de
// Z-Anatomy (CC-BY), separados y clasificados pieza por pieza en Blender —
// ver assets-source/MUSCLES_CREDITS.md. Reemplaza al ecorche/maniquí
// muscular anterior (una sola malla sin nombres por músculo).
// Corrección del centrado por bounding box, que no es un punto anatómico: la
// capa muscular masculina quedaba 6 mm a un lado y 12 mm por delante del
// esqueleto. Lo delatan tres medidas independientes que coinciden — la línea
// media de los pares izquierda/derecha, la distancia mediana de cada músculo
// al hueso más cercano (mínimo en +6, −12) y cuánto asoma por fuera de la piel
// (del 8,5 % al 2,9 %). Ver tools/anatomia/desfase_capas.py.
const MUSCLE_ALIGN = {
  male: { x: 0.02329, z: -0.04659 },
  female: null
};

export function loadMuscles(bodyGroup, allMeshes, sex = 'male') {
  return loadGlbLayer(`models/${sex}/muscles.glb`, 'musculo', getMuscleMeta, { getRegion: getMuscleRegion, align: MUSCLE_ALIGN[sex] }).then((parts) => {
    parts.forEach((mesh) => bodyGroup.add(mesh));
    allMeshes.push(...parts);
    return parts;
  });
}
