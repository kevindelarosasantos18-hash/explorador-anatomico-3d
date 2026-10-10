import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('draco/');

// Altura y punto de apoyo (pies) de la figura de piel/primitivas, para poder
// encajar cada modelo real (que trae su propia escala/origen desde Blender)
// en el mismo sistema de coordenadas del resto del cuerpo. Cada malla queda
// como hijo directo de bodyGroup (igual que las piezas primitivas), así que
// el ajuste de escala/posición se hornea en cada malla en vez de dejarlo en
// un grupo contenedor — showLabel/select.js asumen que mesh.position ya está
// en el espacio de bodyGroup.
export const TARGET_HEIGHT = 6.6;
export const TARGET_FEET_Y = 0.02;

// 1 unidad de nuestro sistema de coordenadas equivale a esto en metros reales
// (TARGET_HEIGHT unidades = 1.7m, la altura de referencia del cuerpo). Sirve
// para piezas descargadas a tamaño real (p.ej. el cerebro a 0.17m) que hay
// que insertar centradas en un punto exacto en vez de estirarlas.
export const UNITS_PER_METER = TARGET_HEIGHT / 1.7;

function loader() {
  const l = new GLTFLoader();
  l.setDRACOLoader(dracoLoader);
  return l;
}

// Prepara cada malla del árbol `root` igual que las piezas primitivas
// (userData de selección/resaltado, material clonado con emissive propio), y
// hornea `scale`/`offset` directamente en su transform local. `useZones`
// queda grabado en userData: lo lee select.js para decidir si un clic en
// esta malla debe resolverse por posición (data/body-zones.js — para mallas
// "en bloque" sin nombre propio por parte) o usar el nombre real que ya
// trae la malla (huesos, cerebro, sistema reproductivo...).
function bakeAndCollect(root, scale, offset, layer, getMeta, useZones, getRegion) {
  const parts = [];
  root.traverse((obj) => {
    if (!obj.isMesh) return;
    const meta = getMeta(obj.name);
    obj.material = obj.material.clone();
    obj.material.emissive = new THREE.Color(0x000000);
    obj.position.multiplyScalar(scale).add(offset);
    obj.scale.multiplyScalar(scale);
    obj.visible = false;
    obj.userData = {
      name: meta.name,
      desc: meta.desc,
      layer,
      useZones: !!useZones,
      region: getRegion ? getRegion(obj.name) : null,
      baseScale: obj.scale.clone(),
      currentFactor: 1,
      targetScale: 1
    };
    parts.push(obj);
  });
  return parts;
}

// Encaja `root` (según su propio bounding box) para que su punto más alto
// caiga en `topY` y el más bajo en `bottomY`, centrado en X/Z. Para un modelo
// de cuerpo completo (esqueleto, músculos) el rango por defecto es
// [TARGET_FEET_Y, TARGET_HEIGHT] (pies a coronilla). Para una pieza parcial
// (p.ej. un busto de tórax+cabeza con los órganos) hay que pasar el rango
// anatómico real que ocupa esa pieza — si no, quedaría estirada para llenar
// el cuerpo completo.
function computeStretchFit(root, topY, bottomY) {
  const box = new THREE.Box3().setFromObject(root);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);
  const scale = (topY - bottomY) / size.y;
  const offset = new THREE.Vector3(-center.x * scale, bottomY - box.min.y * scale, -center.z * scale);
  return { scale, offset };
}

// Carga un .glb de una capa del cuerpo (esqueleto, músculos, órganos...),
// ajustado a la escala común, con cada malla preparada para
// selección/resaltado igual que las piezas primitivas. `getMeta(meshName)`
// devuelve {name, desc} para el panel de información; `layer` es la clave de
// capa ('hueso','musculo','organo',...). `options.range` es opcional:
// {top, bottom} en el sistema de coordenadas del cuerpo, para piezas que no
// son de cuerpo completo (ver computeStretchFit). `options.useZones`
// (default false) marca esta malla para selección por zona — úsalo cuando
// `getMeta` devuelve el mismo nombre para toda la malla (musculo/piel/el
// busto de órganos): sin esto, cualquier clic mostraría ese único nombre
// genérico en vez de "Bíceps"/"Hígado"/etc. Déjalo en false (default) cuando
// la malla ya trae nombre real por pieza (huesos, cerebro, sistema
// reproductivo...).
// `options.inset` (en unidades del cuerpo) encoge la capa por arriba y por
// abajo dentro del cuerpo. Necesario para las capas interiores: sin él, cada
// capa se estira EXACTAMENTE a la misma altura, así que el punto más alto del
// cráneo y el del músculo caen en el mismo sitio y el hueso atraviesa al
// músculo en la coronilla (y lo mismo en los talones).
export function loadGlbLayer(path, layer, getMeta, options = {}) {
  const { range, useZones, getRegion, inset = 0, align } = options;
  return new Promise((resolve, reject) => {
    loader().load(
      path,
      (gltf) => {
        const root = gltf.scene;
        const top = (range ? range.top : TARGET_HEIGHT) - inset;
        const bottom = (range ? range.bottom : TARGET_FEET_Y) + inset;
        const { scale, offset } = computeStretchFit(root, top, bottom);
        // `align` corrige el centrado por bounding box, que es solo una
        // heurística: el centro del bbox de la piel y el del esqueleto no son
        // el mismo punto anatómico, así que sin esto las capas quedan
        // desplazadas entre sí en X/Z aunque cada una esté bien construida.
        if (align) {
          offset.x += (align.x || 0);
          offset.z += (align.z || 0);
        }
        resolve(bakeAndCollect(root, scale, offset, layer, getMeta, useZones, getRegion));
      },
      undefined,
      reject
    );
  });
}

// Carga un .glb pequeño que no debe estirarse a la altura del cuerpo (p.ej.
// el cerebro, descargado a su tamaño real en metros) y lo centra en un punto
// exacto `center` (en el sistema de coordenadas del cuerpo), escalado por
// `scaleFactor` (normalmente UNITS_PER_METER, si el asset se descargó con un
// target_size en metros reales). Mismo `useZones` que loadGlbLayer.
export function loadGlbLayerAt(path, layer, getMeta, center, scaleFactor, useZones) {
  return new Promise((resolve, reject) => {
    loader().load(
      path,
      (gltf) => {
        const root = gltf.scene;
        const box = new THREE.Box3().setFromObject(root);
        const boxCenter = new THREE.Vector3();
        box.getCenter(boxCenter);
        const offset = new THREE.Vector3(
          center[0] - boxCenter.x * scaleFactor,
          center[1] - boxCenter.y * scaleFactor,
          center[2] - boxCenter.z * scaleFactor
        );
        resolve(bakeAndCollect(root, scaleFactor, offset, layer, getMeta, useZones));
      },
      undefined,
      reject
    );
  });
}
