import * as THREE from 'three';

// Aísla una pieza (o un grupo de piezas, para "expandir región") ocultando
// el resto del cuerpo y orbitando la cámara alrededor de su centro para dar
// el efecto de "girar en 360°" sin tocar la rotación del cuerpo (bodyGroup),
// que el usuario sigue pudiendo arrastrar libremente. Para capas por zona
// (músculo/órgano/piel, sin malla propia por parte) "Acercar" usa el mismo
// mecanismo de órbita pero sin ocultar nada, ya que ahí no hay una malla
// separada que aislar.
const SPIN_SPEED = 0.006;
const MIN_RADIUS = 0.05;

export function createIsolation({ camera, allMeshes, layerManager }) {
  let active = null; // { center, radius, angle, restoreVisibility }

  function restoreVisibility() {
    allMeshes.forEach((m) => { m.visible = layerManager.layerVisible[m.userData.layer]; });
  }

  function boundsOf(meshes) {
    const box = new THREE.Box3();
    meshes.forEach((m) => box.expandByObject(m));
    const center = box.getCenter(new THREE.Vector3());
    const sphere = box.getBoundingSphere(new THREE.Sphere());
    return { center, radius: Math.max(sphere.radius, MIN_RADIUS) };
  }

  // Aísla una única malla (hueso individual).
  function enterPiece(mesh) {
    allMeshes.forEach((m) => { m.visible = m === mesh; });
    active = { ...boundsOf([mesh]), angle: 0, hidOthers: true };
  }

  // Aísla un grupo de mallas juntas (una región completa: un brazo, una
  // pierna...), vistas en conjunto.
  function enterRegion(meshes) {
    allMeshes.forEach((m) => { m.visible = meshes.includes(m); });
    active = { ...boundsOf(meshes), angle: 0, hidOthers: true };
  }

  // "Acercar": para capas sin geometría separada por parte, no hay nada que
  // aislar — solo se acerca la cámara al punto exacto tocado.
  function enterZonePoint(point) {
    active = { center: point.clone(), radius: 0.22, angle: 0, hidOthers: false };
  }

  function exit() {
    if (active && active.hidOthers) restoreVisibility();
    active = null;
  }

  function isActive() {
    return !!active;
  }

  function update() {
    if (!active) return;
    active.angle += SPIN_SPEED;
    const dist = active.radius * 3.2;
    camera.position.set(
      active.center.x + dist * Math.sin(active.angle),
      active.center.y + active.radius * 0.4,
      active.center.z + dist * Math.cos(active.angle)
    );
    camera.lookAt(active.center);
  }

  return { enterPiece, enterRegion, enterZonePoint, exit, isActive, update };
}
