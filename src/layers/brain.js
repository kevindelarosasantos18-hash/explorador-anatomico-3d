import { loadGlbLayer } from './glbBodyLoader.js';
import { getNerveMeta, getNerveRegion } from '../data/nerve-metadata.js';

// Sistema nervioso real: 463 piezas individuales del modelo "Neurology" de
// Z-Anatomy (CC BY-SA) — ver assets-source/NERVIOSO_CREDITS.md. Reemplaza al
// cerebro aislado que había antes (un asset distinto, sin cerebelo separado
// del resto ni nervios periféricos). Cubre cerebro (por lóbulo), cerebelo,
// núcleos profundos, ventrículos y los nervios periféricos principales —
// igual para ambos sexos. A diferencia del cerebro anterior (pieza pequeña
// centrada a mano con loadGlbLayerAt), este asset ya viene a escala de
// cuerpo completo (los nervios llegan hasta los pies), así que usa el mismo
// ajuste de cuerpo completo que huesos/músculos/órganos.
// Rango explicito en vez del ajuste por defecto: el punto mas alto de esta
// capa son los nervios del cuero cabelludo y el mas bajo los plantares, que
// NO coinciden con los extremos del cuerpo. Ajustarla a 0.02-6.6 empujaba el
// cuero cabelludo 14 mm por encima del craneo (el esqueleto va con inset) y
// arrastraba al cerebro fuera de la boveda. Estos valores colocan el escalpe
// 5 mm sobre el craneo y los nervios plantares justo bajo los dedos del pie.
const NERVES_RANGE = { top: 6.5703, bottom: 0.0468 };

export function loadBrain(bodyGroup, allMeshes) {
  return loadGlbLayer('models/nervios.glb', 'cerebro', getNerveMeta, { getRegion: getNerveRegion, range: NERVES_RANGE }).then((parts) => {
    parts.forEach((mesh) => bodyGroup.add(mesh));
    allMeshes.push(...parts);
    return parts;
  });
}
