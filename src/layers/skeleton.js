import { loadGlbLayer } from './glbBodyLoader.js';
import { getBoneMeta } from '../data/bone-metadata.js';

// Esqueleto real (14 piezas: Cranium, Spine, Ribs, ArmsHands, HipsLegs, etc.),
// modelos anatómicos de Sketchfab (autor: project_kaizen, CC-BY) — ver
// assets-source/SKELETON_CREDITS.md. Hay una versión por sexo
// (public/models/male|female/skeleton.glb); son el mismo asset de origen,
// la femenina exportada a una altura ligeramente menor (1.6m vs 1.7m).
export function loadSkeleton(bodyGroup, allMeshes, sex = 'male') {
  return loadGlbLayer(`models/${sex}/skeleton.glb`, 'hueso', getBoneMeta).then((bones) => {
    bones.forEach((mesh) => bodyGroup.add(mesh));
    allMeshes.push(...bones);
    return bones;
  });
}
