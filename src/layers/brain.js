import { loadGlbLayerAt, UNITS_PER_METER } from './glbBodyLoader.js';

// Cerebro real (3 piezas: lóbulos + 2 mitades del cerebelo), modelo de
// Sketchfab (autor: erebus3d, CC-BY) — ver assets-source/BRAIN_CREDITS.md.
// Se descargó a su tamaño real (0.17m) en vez de estirarlo a la altura del
// cuerpo, así que se centra directamente dentro del cráneo en vez de usar el
// ajuste de piernas-a-cabeza que usan las demás capas (ver loadGlbLayerAt).
// Mismo punto que usaba la vieja primitiva "Cerebro".
//
// Capa propia ('cerebro', no 'organo'): el busto de órganos incluye una
// cabeza con la piel cerrada que taparía el cerebro por completo en
// cualquier combinación de capas si compartieran layer — con su propio
// interruptor, alcanza con apagar "Órganos" para verlo.
const BRAIN_CENTER = [0, 6.2, -0.02];

const CEREBRUM_META = {
  name: 'Cerebro',
  desc: 'Centro de control del cuerpo; procesa pensamientos, emociones y movimientos.'
};

const CEREBELLUM_META = {
  name: 'Cerebelo',
  desc: 'Coordina el movimiento, el equilibrio y la postura; ajusta los movimientos finos del cuerpo.'
};

function getBrainMeta(meshName) {
  return meshName.includes('Cerebllum') ? CEREBELLUM_META : CEREBRUM_META;
}

export function loadBrain(bodyGroup, allMeshes) {
  return loadGlbLayerAt('models/brain.glb', 'cerebro', getBrainMeta, BRAIN_CENTER, UNITS_PER_METER).then((parts) => {
    parts.forEach((mesh) => bodyGroup.add(mesh));
    allMeshes.push(...parts);
    return parts;
  });
}
