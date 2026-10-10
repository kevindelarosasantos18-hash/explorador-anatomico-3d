import { loadGlbLayer } from './glbBodyLoader.js';
import { getOrganMeta } from '../data/organ-metadata.js';

// Vísceras reales: 50 órganos individuales del modelo "Splanchnology" de
// Z-Anatomy (CC BY-SA) — ver assets-source/ORGANS_CREDITS.md. Reemplaza al
// busto de torso+cabeza anterior (una sola malla sin nombres por órgano).
// Igual para ambos sexos (los órganos no reproductivos no cambian entre
// hombre y mujer) — el sistema reproductivo femenino vive aparte, en
// reproductive.js.
//
// El export solo contiene las mallas de los órganos (no el cuerpo completo),
// así que se usa un rango explícito en vez del ajuste por defecto de
// loadGlbLayer: la posición real que ocupan dentro de la altura total del
// cuerpo (calculada a partir de su propia caja delimitadora en Blender antes
// de exportar, en metros: ~0.74 a ~1.44 de 1.7m de altura).
const ORGANS_RANGE = { top: 5.572, bottom: 2.8989 };

export function loadOrgans(bodyGroup, allMeshes) {
  return loadGlbLayer('models/organs.glb', 'organo', getOrganMeta, { range: ORGANS_RANGE }).then((parts) => {
    parts.forEach((mesh) => bodyGroup.add(mesh));
    allMeshes.push(...parts);
    return parts;
  });
}
