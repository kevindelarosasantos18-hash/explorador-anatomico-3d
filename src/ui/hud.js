// `actions` (opcional) trae los botones de aislamiento a mostrar bajo la
// descripción, ya resueltos por main.js según lo que se tocó:
//  - actions.onExpandPiece: aísla y gira solo la malla tocada (huesos).
//  - actions.expandRegionLabel + actions.onExpandRegion: aísla y gira toda
//    la región anatómica (p.ej. "brazo derecho") a la que pertenece.
//  - actions.onAcercar: para capas sin malla propia por parte (músculo,
//    órgano, piel) — acerca la cámara al punto tocado sin ocultar nada.
//  - actions.onVolver: presente mientras hay una vista aislada activa.
export function showInfo(data, layerLabel, actions = {}) {
  const panel = document.getElementById('info-panel');

  const buttons = [];
  if (actions.onExpandPiece) buttons.push(['info-action-btn', 'expand-piece', 'Expandir esta pieza']);
  if (actions.onExpandRegion) buttons.push(['info-action-btn', 'expand-region', `Expandir región: ${actions.expandRegionLabel}`]);
  if (actions.onAcercar) buttons.push(['info-action-btn', 'acercar', 'Acercar']);
  if (actions.onVolver) buttons.push(['info-action-btn info-action-volver', 'volver', '↺ Volver']);
  const buttonsHtml = buttons.length
    ? '<div class="info-actions">' + buttons.map(([cls, action, label]) => `<button class="${cls}" data-action="${action}">${label}</button>`).join('') + '</div>'
    : '';

  if (!data) {
    panel.innerHTML = actions.onVolver
      ? '<div class="info-placeholder">Toca una pieza para ver su nombre.</div>' + buttonsHtml
      : '<div class="info-placeholder">Toca cualquier parte del cuerpo para ver su nombre.</div>';
  } else {
    panel.innerHTML =
      '<div class="info-tag">' + layerLabel + '</div>' +
      '<div class="info-name">' + data.name + '</div>' +
      '<div class="info-desc">' + data.desc + '</div>' +
      buttonsHtml;
  }

  const wire = (action, fn) => {
    const btn = panel.querySelector(`[data-action="${action}"]`);
    if (btn) btn.addEventListener('click', fn);
  };
  wire('expand-piece', actions.onExpandPiece);
  wire('expand-region', actions.onExpandRegion);
  wire('acercar', actions.onAcercar);
  wire('volver', actions.onVolver);
}

export function setupUI({ layerManager, orbit, deselectPart, switchSex }) {
  // En pantallas angostas el panel de controles, abierto, tapa casi todo el
  // cuerpo (a diferencia de desktop, donde es una barra lateral angosta que
  // convive con el modelo) — arranca colapsado ahí; el botón de engranaje
  // lo abre igual.
  if (window.innerWidth <= 480) {
    document.getElementById('controls-panel').classList.add('collapsed');
  }

  document.querySelectorAll('[data-layer]').forEach((cb) => {
    cb.addEventListener('change', () => {
      layerManager.setLayer(cb.dataset.layer, cb.checked);
      document.getElementById('opacity-row').classList.toggle('visible', layerManager.layerVisible.piel);
      document.querySelectorAll('[data-preset]').forEach((b) => b.classList.remove('active'));
    });
  });

  document.getElementById('skin-opacity').addEventListener('input', (e) => {
    layerManager.setSkinOpacity(+e.target.value);
  });

  document.querySelectorAll('[data-preset]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const s = layerManager.applyPreset(btn.dataset.preset);
      document.querySelectorAll('[data-layer]').forEach((cb) => { cb.checked = s[cb.dataset.layer]; });
      document.getElementById('skin-opacity').value = s.opacity;
      document.getElementById('opacity-row').classList.toggle('visible', s.piel);
      document.querySelectorAll('[data-preset]').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      deselectPart();
    });
  });

  document.querySelectorAll('[data-sex]').forEach((btn) => {
    btn.addEventListener('click', () => {
      switchSex(btn.dataset.sex);
      document.querySelectorAll('[data-sex]').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      deselectPart();
      // El interruptor de sistema reproductivo solo tiene sentido con el
      // cuerpo femenino (es la única pieza que de verdad cambia entre sexos
      // en "Órganos") — se oculta y se apaga con el cuerpo masculino.
      const reproToggle = document.getElementById('reproductive-toggle');
      const isFemale = btn.dataset.sex === 'female';
      reproToggle.hidden = !isFemale;
      if (!isFemale) {
        const cb = reproToggle.querySelector('input');
        cb.checked = false;
        layerManager.setLayer('reproductivo', false);
      }
    });
  });

  document.getElementById('reset-view').addEventListener('click', () => {
    orbit.resetView();
  });

  document.getElementById('toggle-controls').addEventListener('click', () => {
    document.getElementById('controls-panel').classList.toggle('collapsed');
  });

  document.getElementById('toggle-credits').addEventListener('click', () => {
    document.getElementById('credits-panel').classList.toggle('visible');
  });
}
