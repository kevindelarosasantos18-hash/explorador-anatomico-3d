import { loadGlbLayerAt, UNITS_PER_METER } from './glbBodyLoader.js';

// Sistema reproductivo femenino real (útero, ovarios, trompas de Falopio),
// modelo de Sketchfab (autor: Adele.Keane, CC-BY) — ver
// assets-source/REPRODUCTIVE_CREDITS.md. Es lo único que de verdad es
// distinto entre el cuerpo masculino y femenino en la zona de "Órganos" (el
// resto — corazón, pulmones, tubo digestivo — se reutiliza igual para
// ambos, ver organs.js). Se descargó a tamaño real (0.18m) y se centra en
// la pelvis, igual que brain.js centra el cerebro en el cráneo.
//
// Capa propia ('reproductivo', no 'organo'): el busto de órganos es sólido
// por dentro de la pelvis hacia abajo (no está "abierto" ahí como sí lo está
// el pecho/abdomen), así que tapa por completo estas piezas si comparten
// capa — mismo problema y misma solución que con el cerebro.
const CENTER = [0, 3.55, 0.08];

const META = {
  Utero_A: ['Útero', 'Órgano hueco y musculoso donde se desarrolla el feto durante el embarazo.'],
  Utero_B: ['Útero', 'Órgano hueco y musculoso donde se desarrolla el feto durante el embarazo.'],
  Utero_C: ['Útero', 'Órgano hueco y musculoso donde se desarrolla el feto durante el embarazo.'],
  Utero_D: ['Útero', 'Órgano hueco y musculoso donde se desarrolla el feto durante el embarazo.'],
  Ovarios: ['Ovarios', 'Producen los óvulos y las hormonas sexuales femeninas (estrógeno y progesterona).'],
  TrompaDerecha: ['Trompa de Falopio derecha', 'Conduce el óvulo desde el ovario hasta el útero; es donde suele ocurrir la fecundación.'],
  TrompaIzquierda: ['Trompa de Falopio izquierda', 'Conduce el óvulo desde el ovario hasta el útero; es donde suele ocurrir la fecundación.'],
  LigamentoUterino_A: ['Ligamento uterino', 'Sostiene y estabiliza el útero y los ovarios dentro de la pelvis.'],
  LigamentoUterino_B: ['Ligamento uterino', 'Sostiene y estabiliza el útero y los ovarios dentro de la pelvis.']
};

function getMeta(meshName) {
  const [name, desc] = META[meshName] || ['Sistema reproductivo', 'Aparato reproductor femenino.'];
  return { name, desc };
}

export function loadReproductive(bodyGroup, allMeshes) {
  return loadGlbLayerAt('models/female/reproductive.glb', 'reproductivo', getMeta, CENTER, UNITS_PER_METER).then((parts) => {
    parts.forEach((mesh) => bodyGroup.add(mesh));
    allMeshes.push(...parts);
    return parts;
  });
}
