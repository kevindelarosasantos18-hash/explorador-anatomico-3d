export function showInfo(data, layerLabel) {
  const panel = document.getElementById('info-panel');
  if (!data) {
    panel.innerHTML = '<div class="info-placeholder">Toca cualquier parte del cuerpo para ver su nombre.</div>';
    return;
  }
  panel.innerHTML =
    '<div class="info-tag">' + layerLabel + '</div>' +
    '<div class="info-name">' + data.name + '</div>' +
    '<div class="info-desc">' + data.desc + '</div>';
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
