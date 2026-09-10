import * as THREE from 'three';
import { LAYER_LABEL } from '../data/layer-labels.js';
import { ZONES_BY_LAYER, nearestZone } from '../data/body-zones.js';

function roundRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function createTextSprite(text) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const fontSize = 46;
  ctx.font = '700 ' + fontSize + 'px Arial, sans-serif';
  const metrics = ctx.measureText(text);
  const padX = 34, padY = 20;
  canvas.width = Math.ceil(metrics.width + padX * 2);
  canvas.height = fontSize + padY * 2;
  ctx.font = '700 ' + fontSize + 'px Arial, sans-serif';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(10,16,20,0.88)';
  roundRectPath(ctx, 1, 1, canvas.width - 2, canvas.height - 2, canvas.height / 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(47,201,176,0.9)';
  ctx.lineWidth = 3;
  roundRectPath(ctx, 2, 2, canvas.width - 4, canvas.height - 4, canvas.height / 2);
  ctx.stroke();
  ctx.fillStyle = '#EAF2F0';
  ctx.fillText(text, canvas.width / 2, canvas.height / 2 + 1);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  const mat = new THREE.SpriteMaterial({ map: texture, depthTest: false, transparent: true });
  const sprite = new THREE.Sprite(mat);
  const worldHeight = 0.30;
  const aspect = canvas.width / canvas.height;
  sprite.scale.set(worldHeight * aspect, worldHeight, 1);
  sprite.renderOrder = 999;
  return sprite;
}

function createMarker() {
  const geo = new THREE.SphereGeometry(0.045, 14, 14);
  const mat = new THREE.MeshBasicMaterial({ color: 0xFFB84D, transparent: true, opacity: 0.9, depthTest: false });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.renderOrder = 998;
  mesh.visible = false;
  return mesh;
}

// El esqueleto trae 14 piezas nombradas de verdad, así que un clic ahí
// resalta y escala la malla concreta que se tocó (comportamiento "por
// hueso"). Músculos, órganos y piel son una sola malla (o unas pocas) sin
// separar por región, así que un clic ahí busca la zona nombrada más cercana
// al punto exacto del clic (ver data/body-zones.js) y solo se muestra un
// marcador puntual ahí — resaltar/escalar la malla completa no tendría
// sentido visual (sería todo el cuerpo agrandándose).
export function createSelection({ bodyGroup, camera, canvasEl, layerManager, getPointerNDC, onInfoChange }) {
  const raycaster = new THREE.Raycaster();
  const pointerV2 = new THREE.Vector2();
  const marker = createMarker();
  bodyGroup.add(marker);

  let selected = null; // { mesh } para huesos, o { zoneLayer:true } para zonas
  let labelSprite = null;

  function hideLabel() {
    if (labelSprite) {
      bodyGroup.remove(labelSprite);
      labelSprite.material.map.dispose();
      labelSprite.material.dispose();
      labelSprite = null;
    }
  }

  function showLabelAt(text, position, verticalOffset) {
    hideLabel();
    labelSprite = createTextSprite(text);
    labelSprite.position.set(position.x, position.y + verticalOffset, position.z);
    bodyGroup.add(labelSprite);
  }

  function resetBoneHighlight(mesh) {
    mesh.userData.targetScale = 1;
    mesh.material.emissive.setHex(0x000000);
  }

  function clearSelection() {
    if (selected && selected.mesh) resetBoneHighlight(selected.mesh);
    marker.visible = false;
    selected = null;
  }

  function selectBone(mesh) {
    clearSelection();
    selected = { mesh };
    mesh.userData.targetScale = 1.18;
    mesh.material.emissive.setHex(0xFFB84D);
    mesh.material.emissiveIntensity = 0.35;
    onInfoChange(mesh.userData, LAYER_LABEL[mesh.userData.layer]);
    const r = mesh.geometry.boundingSphere ? mesh.geometry.boundingSphere.radius : 0.2;
    const maxScale = Math.max(mesh.scale.x, mesh.scale.y, mesh.scale.z);
    showLabelAt(mesh.userData.name, mesh.position, r * maxScale + 0.22);
  }

  function selectZone(layer, point) {
    clearSelection();
    selected = { zoneLayer: layer };
    const meta = nearestZone(ZONES_BY_LAYER[layer], point);
    marker.position.copy(point);
    marker.visible = true;
    onInfoChange(meta, LAYER_LABEL[layer]);
    showLabelAt(meta.name, point, 0.16);
  }

  function deselectPart() {
    clearSelection();
    hideLabel();
    onInfoChange(null);
  }

  function raycastAt(clientX, clientY) {
    const ndc = getPointerNDC(clientX, clientY);
    pointerV2.set(ndc.x, ndc.y);
    raycaster.setFromCamera(pointerV2, camera);
    return raycaster.intersectObjects(layerManager.visibleMeshes());
  }

  function handleTap(clientX, clientY) {
    const hits = raycastAt(clientX, clientY);
    if (hits.length === 0) {
      deselectPart();
      return;
    }
    const hit = hits[0];
    const layer = hit.object.userData.layer;
    if (ZONES_BY_LAYER[layer]) selectZone(layer, hit.point);
    else selectBone(hit.object);
  }

  function hitTest(clientX, clientY) {
    return raycastAt(clientX, clientY).length > 0;
  }

  function deselectIfLayerHidden(layer) {
    if (!selected) return;
    if ((selected.mesh && selected.mesh.userData.layer === layer) || selected.zoneLayer === layer) {
      deselectPart();
    }
  }

  return { handleTap, hitTest, deselectPart, deselectIfLayerHidden };
}
