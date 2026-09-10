import * as THREE from 'three';

export function createScene(container) {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.set(0, 3.6, 9);
  camera.lookAt(0, 3.6, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x2a3038, 0.95));
  const key = new THREE.DirectionalLight(0xffffff, 0.95);
  key.position.set(5, 10, 7);
  scene.add(key);
  const fillL = new THREE.DirectionalLight(0x8fd9ff, 0.28);
  fillL.position.set(-6, 3, -6);
  scene.add(fillL);

  const bodyGroup = new THREE.Group();
  scene.add(bodyGroup);

  const shadowGeo = new THREE.CircleGeometry(1.05, 32);
  const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.32 });
  const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
  shadowMesh.rotation.x = -Math.PI / 2;
  shadowMesh.position.y = 0.005;
  scene.add(shadowMesh);

  function onResize() {
    const w = container.clientWidth, h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  window.addEventListener('resize', onResize);

  return { scene, camera, renderer, bodyGroup };
}
