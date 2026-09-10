// Deriva nombre visible + descripción corta en español para cada malla del
// esqueleto.
//
// El esqueleto actual (public/models/skeleton.glb, modelo de Sketchfab —
// ver assets-source/SKELETON_CREDITS.md) trae solo 14 piezas agrupadas
// (Cranium, Spine, ArmsHands...) en vez de un objeto por hueso individual,
// así que se resuelven por coincidencia exacta en EXACT_NAMES. El resto de
// este archivo (BASE_NAMES + los patrones vertebra_N/costilla_N_lado/etc.)
// es el mapeo del esqueleto anterior (esqueleto-humano.obj, 303 huesos
// individuales); se conserva por si se vuelve a usar ese asset.
const EXACT_NAMES = {
  Cranium: ['Cráneo', 'Caja ósea que protege el cerebro; incluye el techo craneal, la frente, los pómulos y las cuencas oculares.'],
  Mandible: ['Mandíbula', 'Único hueso móvil del cráneo; sostiene los dientes inferiores y permite masticar y hablar.'],
  UpperTeeth: ['Dientes superiores', 'Arcada dental superior, anclada en el maxilar.'],
  LowerTeeth: ['Dientes inferiores', 'Arcada dental inferior, anclada en la mandíbula.'],
  Hyoid: ['Hueso hioides', 'Único hueso del cuerpo que no se articula con ningún otro; sostiene la base de la lengua.'],
  Spine: ['Columna vertebral', 'Cadena de 24 vértebras móviles que sostiene el tronco y protege la médula espinal.'],
  Discs: ['Discos intervertebrales', 'Cojines de cartílago entre cada par de vértebras que absorben impactos y permiten el movimiento de la espalda.'],
  Ribs: ['Costillas', 'Los 12 pares de huesos curvos que forman la caja torácica y protegen el corazón y los pulmones.'],
  Sternum: ['Esternón', 'Hueso plano en el centro del pecho al que se conectan la mayoría de las costillas.'],
  RibCartilage: ['Cartílago costal', 'Tramos cartilaginosos que unen las costillas con el esternón, dando flexibilidad a la caja torácica.'],
  Sacrum: ['Sacro', 'Hueso triangular formado por la fusión de varias vértebras; conecta la columna con la pelvis.'],
  HipCartilage: ['Cartílago de la cadera', 'Cartílago que amortigua y estabiliza las articulaciones de la pelvis.'],
  HipsLegs: ['Cadera y piernas', 'Pelvis y ambas piernas completas: fémur, rótula, tibia, peroné y los huesos del pie.'],
  ArmsHands: ['Brazos y manos', 'Ambos brazos completos: húmero, cúbito, radio y los huesos de la mano.']
};

const SIDE_LABEL = { izq: 'izquierda', der: 'derecha', i: 'izquierda', d: 'derecha' };
const SIDE_SUFFIXES = ['izq', 'der', 'i', 'd'];

const FINGER_NAMES = ['pulgar', 'índice', 'medio', 'anular', 'meñique'];
const FINGER_SEGMENTS = [2, 3, 3, 3, 3];
const TOE_NAMES = ['dedo gordo', '2.º dedo', '3.er dedo', '4.º dedo', '5.º dedo (meñique)'];

// name -> { label, desc } — descripciones sin mencionar el lado, se añade aparte.
const BASE_NAMES = {
  boveda_craneal: ['Bóveda craneal', 'Techo del cráneo, formado por varios huesos planos que protegen el cerebro.'],
  frontal: ['Hueso frontal', 'Forma la frente y la parte anterior del techo del cráneo.'],
  occipital: ['Hueso occipital', 'Forma la base y parte posterior del cráneo; por él pasa la médula espinal hacia el cerebro.'],
  maxilar: ['Maxilar', 'Forma la mandíbula superior y sostiene los dientes superiores.'],
  nasal: ['Hueso nasal', 'Forma el puente de la nariz.'],
  orbita: ['Órbita ocular', 'Cavidad ósea que alberga y protege el globo ocular.'],
  arco_cigomatico: ['Arco cigomático', 'Puente óseo que forma el pómulo y ancla músculos de la masticación.'],
  temporal: ['Hueso temporal', 'Aloja el oído medio e interno y forma parte de la articulación de la mandíbula.'],
  mandibula: ['Mandíbula', 'Único hueso móvil del cráneo; sostiene los dientes inferiores y permite masticar y hablar.'],
  dientes: ['Dientes', 'Piezas dentales ancladas en el hueso maxilar o mandibular.'],
  dientes_superiores: ['Dientes superiores', 'Arcada dental superior, anclada en el maxilar.'],
  esternon_manubrio: ['Manubrio esternal', 'Parte superior del esternón; se articula con las clavículas y el primer par de costillas.'],
  esternon_cuerpo: ['Cuerpo del esternón', 'Parte central y más larga del esternón, donde se anclan la mayoría de las costillas.'],
  esternon_xifoides: ['Apófisis xifoides', 'Extremo inferior, cartilaginoso, del esternón.'],
  sacro: ['Sacro', 'Hueso triangular formado por la fusión de 5 vértebras; conecta la columna con la pelvis.'],
  coccix: ['Cóccix', 'Formado por la fusión de varias vértebras; remanente óseo de la cola en otros mamíferos.'],
  ilion: ['Ilion', 'Parte superior y más ancha del hueso coxal; forma la cresta de la cadera.'],
  cresta_iliaca: ['Cresta ilíaca', 'Borde superior del ilion; punto de anclaje de músculos abdominales y de la espalda.'],
  ala_sacroiliaca: ['Ala sacroilíaca', 'Superficie del ilion que se articula con el sacro, formando la articulación sacroilíaca.'],
  acetabulo: ['Acetábulo', 'Cavidad del hueso coxal donde encaja la cabeza del fémur, formando la articulación de la cadera.'],
  isquion: ['Isquion', 'Parte inferior y posterior del hueso coxal; soporta el peso del cuerpo al sentarse.'],
  rama_isquiopubica: ['Rama isquiopúbica', 'Puente óseo que une el isquion con el pubis.'],
  pubis: ['Pubis', 'Parte anterior del hueso coxal; se une con el del lado opuesto en la sínfisis púbica.'],
  sinfisis_pubica: ['Sínfisis púbica', 'Articulación cartilaginosa que une los dos huesos púbicos por delante.'],
  clavicula: ['Clavícula', 'Hueso alargado que conecta el esternón con el hombro.'],
  escapula: ['Escápula', 'Hueso plano y triangular en la espalda alta; ancla varios músculos del hombro.'],
  acromion: ['Acromion', 'Proyección ósea de la escápula que forma la punta del hombro.'],
  coracoides: ['Apófisis coracoides', 'Proyección ósea de la escápula que ancla tendones y ligamentos del hombro.'],
  cabeza_humeral: ['Cabeza del húmero', 'Extremo superior redondeado del húmero; encaja en la escápula formando el hombro.'],
  humero: ['Húmero', 'El hueso más largo del brazo; va del hombro al codo.'],
  epicondilo_medial: ['Epicóndilo medial', 'Prominencia ósea interna del extremo inferior del húmero, anclaje de músculos del antebrazo.'],
  epicondilo_lateral: ['Epicóndilo lateral', 'Prominencia ósea externa del extremo inferior del húmero, anclaje de músculos del antebrazo.'],
  cubito: ['Cúbito', 'Hueso del antebrazo en el lado del meñique; forma la punta del codo.'],
  radio: ['Radio', 'Hueso del antebrazo en el lado del pulgar; gira sobre el cúbito para rotar la mano.'],
  carpo: ['Carpo', 'Conjunto de huesos cortos que forman la muñeca.'],
  cabeza_femoral: ['Cabeza del fémur', 'Extremo superior redondeado del fémur; encaja en el acetábulo formando la cadera.'],
  cuello_femoral: ['Cuello del fémur', 'Segmento estrecho entre la cabeza y el cuerpo del fémur; punto frecuente de fractura.'],
  trocanter_mayor: ['Trocánter mayor', 'Prominencia ósea superior del fémur, anclaje de músculos glúteos.'],
  femur: ['Fémur', 'El hueso más largo y fuerte del cuerpo humano.'],
  femur_distal: ['Extremo distal del fémur', 'Parte inferior del fémur, que se articula con la tibia y la rótula en la rodilla.'],
  condilo_medial: ['Cóndilo medial', 'Prominencia articular interna del extremo inferior del fémur.'],
  condilo_lateral: ['Cóndilo lateral', 'Prominencia articular externa del extremo inferior del fémur.'],
  rotula: ['Rótula', 'Hueso redondeado incrustado en el tendón del cuádriceps; protege la articulación de la rodilla.'],
  menisco: ['Menisco', 'Cartílago en forma de media luna que amortigua la articulación de la rodilla.'],
  tibia: ['Tibia', 'El hueso principal de la pierna; soporta la mayor parte del peso del cuerpo.'],
  maleolo_medial: ['Maléolo medial', 'Prominencia ósea interna del tobillo, extremo inferior de la tibia.'],
  perone: ['Peroné', 'Hueso delgado junto a la tibia; sirve de anclaje muscular y estabiliza el tobillo.'],
  maleolo_lateral: ['Maléolo lateral', 'Prominencia ósea externa del tobillo, extremo inferior del peroné.'],
  astragalo: ['Astrágalo', 'Transmite el peso del cuerpo desde la tibia hacia el resto del pie.'],
  calcaneo: ['Calcáneo', 'El hueso del talón; el más grande y fuerte de los del pie.'],
  tarso_medio: ['Tarso medio', 'Conjunto de huesos cortos que forman la mitad media del pie y sostienen el arco plantar.']
};

function titleCase(str) {
  return str
    .split('_')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function splitSide(name) {
  for (const suf of SIDE_SUFFIXES) {
    if (name.endsWith('_' + suf)) {
      return { base: name.slice(0, -(suf.length + 1)), side: SIDE_LABEL[suf] };
    }
  }
  return { base: name, side: null };
}

function withSide(label, side) {
  return side ? `${label} ${side}` : label;
}

function vertebraLabel(n) {
  if (n <= 7) return `Vértebra cervical ${n}`;
  if (n <= 19) return `Vértebra torácica ${n - 7}`;
  return `Vértebra lumbar ${n - 19}`;
}

function ribTag(n) {
  if (n <= 7) return { tag: 'verdadera', desc: 'se une directamente al esternón mediante su propio cartílago costal.' };
  if (n <= 10) return { tag: 'falsa', desc: 'se une al esternón de forma indirecta, a través del cartílago de la costilla superior.' };
  return { tag: 'flotante', desc: 'no llega hasta el esternón; solo se articula con la columna vertebral.' };
}

function handSegmentName(finger, seg) {
  const total = FINGER_SEGMENTS[finger];
  if (total === 2) return seg === 1 ? 'proximal' : 'distal';
  return seg === 1 ? 'proximal' : seg === 2 ? 'media' : 'distal';
}

export function getBoneMeta(rawName) {
  // El esqueleto femenino se exportó con un prefijo "F_" en cada malla
  // (F_Cranium, F_Spine...) para no chocar con los nombres del masculino
  // mientras ambos convivían en la misma escena de Blender.
  const unprefixed = rawName.startsWith('F_') ? rawName.slice(2) : rawName;

  if (EXACT_NAMES[unprefixed]) {
    const [name, desc] = EXACT_NAMES[unprefixed];
    return { name, desc };
  }

  let m;

  if ((m = rawName.match(/^vertebra_(\d+)$/))) {
    const n = +m[1];
    return { name: vertebraLabel(n), desc: 'Una de las 24 vértebras móviles de la columna; se articula con las vecinas y protege la médula espinal.' };
  }
  if ((m = rawName.match(/^disco_(\d+)$/))) {
    return { name: `Disco intervertebral ${m[1]}`, desc: 'Cojín de cartílago entre dos vértebras que absorbe impactos y permite el movimiento de la columna.' };
  }
  if ((m = rawName.match(/^espinosa_(\d+)$/))) {
    return { name: `Apófisis espinosa ${m[1]}`, desc: 'Proyección ósea posterior de la vértebra; se puede palpar a lo largo de la espalda.' };
  }
  if ((m = rawName.match(/^transversa_(\d+)_(i|d)$/))) {
    return { name: `Apófisis transversa ${SIDE_LABEL[m[2]]} ${m[1]}`, desc: 'Proyección ósea lateral de la vértebra; punto de anclaje de músculos y ligamentos.' };
  }
  if ((m = rawName.match(/^costilla_(\d+)_(izq|der)$/))) {
    const n = +m[1];
    const { tag, desc } = ribTag(n);
    return { name: `Costilla ${SIDE_LABEL[m[2]]} ${n}`, desc: `Costilla ${tag} (par ${n} de 12): ${desc}` };
  }
  if ((m = rawName.match(/^cartilago_costal_(\d+)_(izq|der)$/))) {
    return { name: `Cartílago costal ${SIDE_LABEL[m[2]]} ${m[1]}`, desc: 'Tramo cartilaginoso que une la costilla con el esternón, dando flexibilidad a la caja torácica.' };
  }
  if ((m = rawName.match(/^metacarpo_(\d)_0_(izq|der)$/))) {
    const f = +m[1] - 1;
    return { name: `Metacarpiano del ${FINGER_NAMES[f]} ${SIDE_LABEL[m[2]]}`, desc: `Hueso largo de la mano que conecta la muñeca con el dedo ${FINGER_NAMES[f]}.` };
  }
  if ((m = rawName.match(/^falange_(\d)_(\d)_(izq|der)$/))) {
    const f = +m[1] - 1, seg = +m[2];
    const segName = handSegmentName(f, seg);
    return { name: `Falange ${segName} del ${FINGER_NAMES[f]} ${SIDE_LABEL[m[3]]}`, desc: `Falange ${segName} del dedo ${FINGER_NAMES[f]}; permite la prensión fina de la mano.` };
  }
  if ((m = rawName.match(/^metatarso_(\d)_(izq|der)$/))) {
    const t = +m[1] - 1;
    return { name: `Metatarsiano del ${TOE_NAMES[t]} ${SIDE_LABEL[m[2]]}`, desc: `Hueso largo del pie que conecta el tarso con los dedos y ayuda a distribuir el peso.` };
  }
  if ((m = rawName.match(/^falange_pie_(\d)_(izq|der)$/))) {
    const t = +m[1] - 1;
    return { name: `Falange del ${TOE_NAMES[t]} ${SIDE_LABEL[m[2]]}`, desc: 'Hueso de los dedos del pie; ayuda al equilibrio y al impulso al caminar.' };
  }

  const { base, side } = splitSide(rawName);
  if (BASE_NAMES[base]) {
    const [label, desc] = BASE_NAMES[base];
    return { name: withSide(label, side), desc };
  }
  if (BASE_NAMES[rawName]) {
    const [label, desc] = BASE_NAMES[rawName];
    return { name: label, desc };
  }

  return { name: titleCase(rawName), desc: 'Estructura ósea del esqueleto humano.' };
}
