import * as THREE from 'three';
import { createScene } from './scene/setup.js';
import { createOrbitInteraction } from './scene/orbitInteraction.js';
import { createLayerManager } from './layers/layerManager.js';
import { loadSkeleton } from './layers/skeleton.js';
import { loadMuscles } from './layers/muscles.js';
import { loadOrgans } from './layers/organs.js';
import { loadSkin } from './layers/skin.js';
import { loadBrain } from './layers/brain.js';
import { loadReproductive } from './layers/reproductive.js';
import { createSelection } from './interaction/select.js';
import { createIsolation } from './interaction/isolation.js';
import { showInfo, setupUI } from './ui/hud.js';
import { regionLabel as boneRegionLabel } from './data/bone-metadata.js';
import { regionLabel as muscleRegionLabel } from './data/muscle-metadata.js';
import { regionLabel as nerveRegionLabel } from './data/nerve-metadata.js';

// Cada capa (hueso/musculo/cerebro) tiene su propio diccionario de regiones
// (huesos y músculos se subdividen distinto: el esqueleto separa columna/
// caja torácica/pelvis, los músculos y nervios las agrupan como "el
// torso") — ver bone-metadata.js, muscle-metadata.js y nerve-metadata.js.
function regionLabel(layer, region) {
  if (layer === 'musculo') return muscleRegionLabel(region);
  if (layer === 'cerebro') return nerveRegionLabel(region);
  return boneRegionLabel(region);
}

const container = document.getElementById('canvas-container');
const { scene, camera, renderer, bodyGroup } = createScene(container);
const canvasEl = renderer.domElement;

const allMeshes = [];

const layerManager = createLayerManager(allMeshes, {
  onDeselectIfHidden: (layer) => {
    isolation.exit();
    selection.deselectIfLayerHidden(layer);
  }
});

const orbit = createOrbitInteraction({
  canvasEl,
  bodyGroup,
  onTap: (x, y) => selection.handleTap(x, y),
  hitTest: (x, y) => selection.hitTest(x, y)
});

const isolation = createIsolation({ camera, allMeshes, layerManager });

// Piezas de la capa/región de `mesh`, para "Expandir región" (todo el brazo,
// toda la pierna...). Huesos y músculos llevan `region` en userData (ver
// bone-metadata.js / muscle-metadata.js); órganos/piel no tienen esta opción.
function meshesInRegion(mesh) {
  const { layer, region } = mesh.userData;
  return allMeshes.filter((m) => m.userData.layer === layer && m.userData.region === region);
}

function handleInfoChange(data, layerLabel, context = {}) {
  const actions = {};
  if (context.mesh) {
    actions.onExpandPiece = () => {
      isolation.enterPiece(context.mesh);
      handleInfoChange(data, layerLabel, context);
    };
    if (context.mesh.userData.region) {
      actions.expandRegionLabel = regionLabel(context.mesh.userData.layer, context.mesh.userData.region);
      actions.onExpandRegion = () => {
        isolation.enterRegion(meshesInRegion(context.mesh));
        handleInfoChange(data, layerLabel, context);
      };
    }
  } else if (context.zoneLayer) {
    actions.onAcercar = () => {
      isolation.enterZonePoint(context.zonePoint);
      handleInfoChange(data, layerLabel, context);
    };
  }
  if (isolation.isActive()) {
    actions.onVolver = () => {
      isolation.exit();
      handleInfoChange(data, layerLabel, context);
    };
  }
  showInfo(data, layerLabel, actions);
}

const selection = createSelection({
  bodyGroup,
  camera,
  canvasEl,
  layerManager,
  getPointerNDC: orbit.getPointerNDC,
  onInfoChange: handleInfoChange
});

// --- Capas que dependen del sexo (esqueleto, músculos, piel): se pueden
// descargar de la escena y recargar con el otro conjunto de modelos. Órganos
// y cerebro son iguales para ambos y se cargan una sola vez.
const SEX_LAYERS = ['hueso', 'musculo', 'piel'];
const sexMeshes = { hueso: [], musculo: [], piel: [] };
let currentSex = 'male';

function disposeMesh(mesh) {
  bodyGroup.remove(mesh);
  const idx = allMeshes.indexOf(mesh);
  if (idx !== -1) allMeshes.splice(idx, 1);
  mesh.geometry.dispose();
  if (mesh.material.map) mesh.material.map.dispose();
  mesh.material.dispose();
}

function loadSexLayer(loadFn, layerKey, sex, label) {
  return loadFn(bodyGroup, allMeshes, sex)
    .then((parts) => {
      parts.forEach((m) => { m.visible = layerManager.layerVisible[layerKey]; });
      sexMeshes[layerKey] = parts;
    })
    .catch((err) => {
      console.error(`No se pudo cargar ${label} (${sex}):`, err);
    });
}

// El sistema reproductivo femenino (útero, ovarios, trompas) es lo único
// que de verdad cambia entre sexos en la zona de "Órganos" — el resto
// (corazón, pulmones, tubo digestivo) se comparte igual para ambos (ver
// organs.js) y no pasa por este mecanismo de carga/descarga. Vive en su
// propia capa 'reproductivo' (ver reproductive.js) porque el busto de
// órganos lo taparía si compartieran capa — mismo motivo que el cerebro.
let reproductiveMeshes = [];

function loadSexBody(sex) {
  const loaders = [
    loadSexLayer(loadSkeleton, 'hueso', sex, 'el esqueleto real'),
    loadSexLayer(loadMuscles, 'musculo', sex, 'el sistema muscular real'),
    loadSexLayer(loadSkin, 'piel', sex, 'la piel real')
  ];
  if (sex === 'female') {
    loaders.push(
      loadReproductive(bodyGroup, allMeshes)
        .then((parts) => {
          parts.forEach((m) => { m.visible = layerManager.layerVisible.reproductivo; });
          reproductiveMeshes = parts;
        })
        .catch((err) => console.error('No se pudo cargar el sistema reproductivo real:', err))
    );
  }
  return Promise.all(loaders);
}

function switchSex(sex) {
  if (sex === currentSex) return;
  isolation.exit();
  selection.deselectPart();
  SEX_LAYERS.forEach((key) => {
    sexMeshes[key].forEach(disposeMesh);
    sexMeshes[key] = [];
  });
  reproductiveMeshes.forEach(disposeMesh);
  reproductiveMeshes = [];
  currentSex = sex;
  loadSexBody(sex);
}

setupUI({ layerManager, orbit, deselectPart: selection.deselectPart, switchSex });

function loadLayerModel(loadFn, layerKey, label) {
  loadFn(bodyGroup, allMeshes)
    .then((parts) => {
      parts.forEach((m) => { m.visible = layerManager.layerVisible[layerKey]; });
    })
    .catch((err) => {
      console.error(`No se pudo cargar ${label}:`, err);
    });
}

loadSexBody(currentSex);
loadLayerModel(loadOrgans, 'organo', 'los órganos reales (models/organs.glb)');
loadLayerModel(loadBrain, 'cerebro', 'el cerebro real (models/brain.glb)');

function animate() {
  requestAnimationFrame(animate);

  allMeshes.forEach((m) => {
    const ud = m.userData;
    ud.currentFactor = THREE.MathUtils.lerp(ud.currentFactor, ud.targetScale, 0.16);
    const b = ud.baseScale;
    m.scale.set(b.x * ud.currentFactor, b.y * ud.currentFactor, b.z * ud.currentFactor);
  });

  if (isolation.isActive()) {
    isolation.update();
  } else {
    camera.position.set(0, 3.6, orbit.getCameraDistance());
    camera.lookAt(0, 3.6, 0);
  }

  renderer.render(scene, camera);
}

animate();
