// "cerebro" queda fuera de los tres presets a propósito: el busto de
// "organo" trae una cabeza con la piel cerrada que lo taparía igual, así que
// mostrarlo por defecto ahí solo generaría clipping sin verse. Se explora
// aparte, apagando "Órganos" y prendiendo "Cerebro" a mano.
export const PRESETS = {
  externa: { piel: true, musculo: false, hueso: false, organo: false, cerebro: false, opacity: 100 },
  rayosx: { piel: true, musculo: false, hueso: true, organo: true, cerebro: false, opacity: 16 },
  interna: { piel: false, musculo: true, hueso: true, organo: true, cerebro: false, opacity: 100 }
};

export function createLayerManager(allMeshes, { onDeselectIfHidden }) {
  const layerVisible = { piel: true, musculo: false, hueso: false, organo: false, cerebro: false };

  function setLayer(layer, visible) {
    layerVisible[layer] = visible;
    allMeshes.forEach((m) => { if (m.userData.layer === layer) m.visible = visible; });
    if (!visible) onDeselectIfHidden(layer);
  }

  function setSkinOpacity(pct) {
    const val = pct / 100;
    allMeshes.forEach((m) => {
      if (m.userData.layer === 'piel') {
        m.material.opacity = val;
        m.material.transparent = val < 0.999;
      }
    });
  }

  function visibleMeshes() {
    return allMeshes.filter((m) => layerVisible[m.userData.layer]);
  }

  function applyPreset(name) {
    const s = PRESETS[name];
    Object.keys(layerVisible).forEach((l) => setLayer(l, s[l]));
    setSkinOpacity(s.opacity);
    return s;
  }

  return { layerVisible, setLayer, setSkinOpacity, visibleMeshes, applyPreset };
}
