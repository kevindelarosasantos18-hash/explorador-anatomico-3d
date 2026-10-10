import { loadGlbLayer } from './glbBodyLoader.js';
import { getMuscleMeta, getMuscleRegion } from '../data/muscle-metadata.js';

// Sistema muscular real: 410 músculos individuales del modelo "Myology" de
// Z-Anatomy (CC-BY), separados y clasificados pieza por pieza en Blender —
// ver assets-source/MUSCLES_CREDITS.md. Reemplaza al ecorche/maniquí
// muscular anterior (una sola malla sin nombres por músculo).
export function loadMuscles(bodyGroup, allMeshes, sex = 'male') {
  return loadGlbLayer(`models/${sex}/muscles.glb`, 'musculo', getMuscleMeta, { getRegion: getMuscleRegion }).then((parts) => {
    parts.forEach((mesh) => bodyGroup.add(mesh));
    allMeshes.push(...parts);
    return parts;
  });
}
