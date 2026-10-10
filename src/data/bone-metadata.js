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
// Variante masculina: en español el lado concuerda con el género del hueso
// («calcáneo izquierdo», pero «costilla izquierda»).
const SIDE_LABEL_M = { izq: 'izquierdo', der: 'derecho', i: 'izquierdo', d: 'derecho' };
const SIDE_SUFFIXES = ['izq', 'der', 'i', 'd'];

const FINGER_NAMES = ['pulgar', 'índice', 'medio', 'anular', 'meñique'];
const FINGER_SEGMENTS = [2, 3, 3, 3, 3];
const TOE_NAMES = ['dedo gordo', '2.º dedo', '3.er dedo', '4.º dedo', '5.º dedo (meñique)'];

// Nombres de dedo usados en las mallas del esqueleto de Sketchfab (huesos
// separados en Blender vía "Separate by Loose Parts"), distintos de los
// FINGER_NAMES/TOE_NAMES de arriba que vienen del esqueleto procedural viejo.
const HAND_FINGER_LABEL = { pulgar: 'pulgar', indice: 'índice', medio: 'medio', anular: 'anular', menique: 'meñique' };
const FOOT_TOE_LABEL = {
  gordo: 'dedo gordo',
  indice_pie: 'segundo dedo',
  medio_pie: 'tercer dedo',
  anular_pie: 'cuarto dedo',
  menique_pie: 'quinto dedo (meñique)'
};
const SEGMENT_LABEL = { proximal: 'proximal', media: 'media', distal: 'distal' };

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
  coxal: ['Hueso coxal', 'Hueso plano que forma la pelvis; resulta de la fusión del ilion, el isquion y el pubis, y se articula con el fémur.'],
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

const METATARSAL_ORDINAL = { 1: '1.er', 2: '2.º', 3: '3.er', 4: '4.º', 5: '5.º' };

const TARSAL_LABEL = {
  Astragalo: ['Astrágalo', 'Transmite el peso del cuerpo desde la tibia hacia el resto del pie; forma la articulación del tobillo.'],
  Calcaneo: ['Calcáneo', 'El hueso del talón, el más grande del pie; recibe el tendón de Aquiles y apoya el cuerpo en el suelo.'],
  Escafoides: ['Escafoides del pie', 'Hueso en forma de barca situado entre el astrágalo y las cuñas; es la clave del arco interno del pie.'],
  Cuboides: ['Cuboides', 'Hueso lateral del tarso, entre el calcáneo y los metatarsianos cuarto y quinto.'],
  Cuneiforme_medial: ['Primera cuña (cuneiforme medial)', 'La mayor de las tres cuñas; se articula con el primer metatarsiano, el del dedo gordo.', true],
  Cuneiforme_intermedio: ['Segunda cuña (cuneiforme intermedia)', 'La más pequeña de las tres cuñas; encaja el segundo metatarsiano y bloquea el arco transverso.', true],
  Cuneiforme_lateral: ['Tercera cuña (cuneiforme lateral)', 'Cuña externa del tarso; se articula con el tercer metatarsiano y con el cuboides.', true]
};

// Los ocho huesos del carpo, identificados por su articulación real y no por
// el índice con que venían del asset: los de la fila distal por el
// metacarpiano que sostienen, los de la proximal por su posición en el eje
// cúbito-radio (y el pisiforme por ser, con diferencia, el más pequeño).
// Todos son masculinos: "Escafoides derecho", no "derecha".
const CARPAL_LABEL = {
  escafoides: ['Escafoides de la mano', 'El mayor de la fila proximal, en el lado del pulgar. Es el hueso del carpo que más se fractura, casi siempre al caer con la mano extendida.'],
  semilunar: ['Semilunar', 'Con forma de media luna, encaja con el radio en el centro de la muñeca; es el hueso del carpo que más se luxa.'],
  piramidal: ['Piramidal', 'Fila proximal, en el lado del meñique; se articula con el pisiforme y con el disco cartilaginoso de la muñeca.'],
  pisiforme: ['Pisiforme', 'El más pequeño del carpo, del tamaño de un guisante. Va incrustado en el tendón del flexor cubital y se palpa en la base de la palma.'],
  trapecio: ['Trapecio', 'Sostiene el metacarpiano del pulgar en una articulación en silla de montar: la que permite oponer el pulgar al resto de los dedos.'],
  trapezoide: ['Trapezoide', 'El más pequeño de la fila distal; hace de cuña entre el trapecio y el hueso grande, bajo el índice.'],
  grande: ['Hueso grande', 'El mayor de los ocho huesos del carpo, en el centro de la muñeca; es el eje sobre el que gira la mano.'],
  ganchoso: ['Ganchoso', 'En el lado del meñique. Su gancho (apófisis unciforme) forma la pared del canal de Guyon, por donde pasan el nervio y la arteria cubitales.']
};

function titleCase(str) {
  return str
    .split('_')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// Huesos de BASE_NAMES cuyo nombre es masculino: hay que decir "Radio derecho",
// no "Radio derecha". El resto de etiquetas que llevan lado son femeninas
// (Clavícula, Escápula, Tibia, Rótula, Falange..., las cuñas del tarso), así
// que basta con enumerar estas.
const MASCULINE_BASES = new Set(['cubito', 'radio', 'humero', 'femur', 'perone', 'coxal']);

function splitSide(name) {
  for (const suf of SIDE_SUFFIXES) {
    if (name.endsWith('_' + suf)) {
      return { base: name.slice(0, -(suf.length + 1)), side: suf };
    }
  }
  return { base: name, side: null };
}

function withSide(label, side, masculine) {
  if (!side) return label;
  return `${label} ${(masculine ? SIDE_LABEL_M : SIDE_LABEL)[side]}`;
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

// Región anatómica de cada hueso, usada por la función "Expandir región"
// (aislar y girar juntas todas las piezas de un brazo/pierna/etc.). Piezas
// que no calzan en ningún patrón (huesos únicos: Cranium, Sacrum...) no
// llevan región — solo se ofrece "Expandir esta pieza" para esas.
const REGION_PATTERNS = [
  [/^vertebra_\d+$/, 'columna'],
  [/^disco_\d+(_\d)?$/, 'columna'],
  [/^costilla_\d+_(izq|der)$/, 'caja_toracica'],
  [/^cartilago_costal_\d+_(izq|der)$/, 'caja_toracica'],
  [/^Sternum$/, 'caja_toracica'],
  [/^(Sacrum|coccix|HipCartilage)$/, 'pelvis'],
  [/^Coxal_(izq|der)$/, 'pelvis'],
  [/^(Cranium|Mandible|Hyoid)$/, 'craneo'],
  [/^diente_\d+_(sup|inf)_(izq|der)$/, 'craneo'],
  [/^Hueso_(frontal|occipital|esfenoides)$/, 'craneo'],
  [/^Hueso_(parietal|temporal|cigomatico|nasal)_(izq|der)$/, 'craneo'],
  [/^Maxilar_(izq|der)$/, 'craneo'],
  [/^Craneo_(boveda|occipital|esfenoides|vomer)$/, 'craneo'],
  [/^Craneo_vomer_(izq|der)$/, 'craneo'],
  [/^Craneo_temporal_[AB]_(izq|der)$/, 'craneo'],
  [/^Hueso_facial_(izq|der)_\d+(\.\d+)?$/, 'craneo'],
  [/^(Clavicula|Escapula|Humero|Cubito|Radio)_izq$/, 'brazo_izquierdo'],
  [/^(Clavicula|Escapula|Humero|Cubito|Radio)_der$/, 'brazo_derecho'],
  [/^Carpo_(izq_\d+|[a-z]+_izq)$/, 'brazo_izquierdo'],
  [/^Carpo_(der_\d+|[a-z]+_der)$/, 'brazo_derecho'],
  [/^(metacarpiano|proximal|media|distal)_(pulgar|indice|medio|anular|menique)_izq$/, 'brazo_izquierdo'],
  [/^(metacarpiano|proximal|media|distal)_(pulgar|indice|medio|anular|menique)_der$/, 'brazo_derecho'],
  [/^(Femur|Rotula|Tibia|Perone)_izq$/, 'pierna_izquierda'],
  [/^(Femur|Rotula|Tibia|Perone)_der$/, 'pierna_derecha'],
  [/^Tarso_izq_\d+$/, 'pierna_izquierda'],
  [/^Tarso_der_\d+$/, 'pierna_derecha'],
  [/^(Astragalo|Calcaneo|Escafoides|Cuboides|Cuneiforme_medial|Cuneiforme_intermedio|Cuneiforme_lateral)_izq$/, 'pierna_izquierda'],
  [/^(Astragalo|Calcaneo|Escafoides|Cuboides|Cuneiforme_medial|Cuneiforme_intermedio|Cuneiforme_lateral)_der$/, 'pierna_derecha'],
  [/^metatarsiano_[1-5]_pie_izq$/, 'pierna_izquierda'],
  [/^metatarsiano_[1-5]_pie_der$/, 'pierna_derecha'],
  [/^(metatarsiano|proximal|media|distal)_(gordo|indice_pie|medio_pie|anular_pie|menique_pie)_izq$/, 'pierna_izquierda'],
  [/^(metatarsiano|proximal|media|distal)_(gordo|indice_pie|medio_pie|anular_pie|menique_pie)_der$/, 'pierna_derecha']
];

const REGION_LABEL = {
  columna: 'la columna',
  caja_toracica: 'la caja torácica',
  pelvis: 'la pelvis',
  craneo: 'el cráneo',
  brazo_izquierdo: 'el brazo izquierdo',
  brazo_derecho: 'el brazo derecho',
  pierna_izquierda: 'la pierna izquierda',
  pierna_derecha: 'la pierna derecha'
};

export function getBoneRegion(rawName) {
  const unprefixed = rawName.startsWith('F_') ? rawName.slice(2) : rawName;
  for (const [pattern, region] of REGION_PATTERNS) {
    if (pattern.test(unprefixed)) return region;
  }
  return null;
}

export function regionLabel(region) {
  return REGION_LABEL[region] || null;
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

  if ((m = unprefixed.match(/^vertebra_(\d+)$/))) {
    const n = +m[1];
    return { name: vertebraLabel(n), desc: 'Una de las 24 vértebras móviles de la columna; se articula con las vecinas y protege la médula espinal.' };
  }
  // disco_N_1/2/3: 3 sub-mallas por disco (mismo disco separado en piezas
  // sueltas al exportar); comparten nombre y descripción.
  if ((m = unprefixed.match(/^disco_(\d+)_\d$/)) || (m = unprefixed.match(/^disco_(\d+)$/))) {
    return { name: `Disco intervertebral ${m[1]}`, desc: 'Cojín de cartílago entre dos vértebras que absorbe impactos y permite el movimiento de la columna.' };
  }
  if ((m = unprefixed.match(/^espinosa_(\d+)$/))) {
    return { name: `Apófisis espinosa ${m[1]}`, desc: 'Proyección ósea posterior de la vértebra; se puede palpar a lo largo de la espalda.' };
  }
  if ((m = unprefixed.match(/^transversa_(\d+)_(i|d)$/))) {
    return { name: `Apófisis transversa ${SIDE_LABEL[m[2]]} ${m[1]}`, desc: 'Proyección ósea lateral de la vértebra; punto de anclaje de músculos y ligamentos.' };
  }
  if ((m = unprefixed.match(/^costilla_(\d+)_(izq|der)$/))) {
    const n = +m[1];
    const { tag, desc } = ribTag(n);
    return { name: `Costilla ${SIDE_LABEL[m[2]]} ${n}`, desc: `Costilla ${tag} (par ${n} de 12): ${desc}` };
  }
  if ((m = unprefixed.match(/^cartilago_costal_(\d+)_(izq|der)$/))) {
    return { name: `Cartílago costal ${SIDE_LABEL_M[m[2]]} ${m[1]}`, desc: 'Tramo cartilaginoso que une la costilla con el esternón, dando flexibilidad a la caja torácica.' };
  }
  // Cráneo desarticulado (huesos individuales, modelo distinto del busto
  // craneal fusionado — ver EXACT_NAMES.Cranium): bóveda, occipital y
  // esfenoides/vómer son piezas únicas; el temporal quedó separado en dos
  // sub-piezas (A/B) por lado al desarticular el modelo original, y el resto
  // de huesos faciales pequeños (cigomático, maxilar, nasal, lagrimal,
  // palatino, cornetes) no se pudieron identificar uno a uno con certeza —
  // se agrupan como "hueso facial" numerado por lado.
  if (unprefixed === 'Craneo_boveda') {
    return { name: 'Bóveda craneal', desc: 'Techo del cráneo (frontal y parietales), formado por huesos planos que protegen el cerebro.' };
  }
  if (unprefixed === 'Craneo_occipital') {
    return { name: 'Hueso occipital', desc: 'Forma la base y parte posterior del cráneo; por él pasa la médula espinal hacia el cerebro.' };
  }
  if (unprefixed === 'Craneo_esfenoides') {
    return { name: 'Hueso esfenoides', desc: 'Hueso central en la base del cráneo, con forma de mariposa; se articula con casi todos los demás huesos craneales.' };
  }
  if (unprefixed === 'Craneo_vomer') {
    return { name: 'Vómer', desc: 'Hueso delgado y plano que forma la parte posterior e inferior del tabique nasal.' };
  }
  // En el esqueleto femenino el vómer quedó dividido en mitad izq/der (ver
  // memoria del proyecto, sesión de reensamblado del cráneo): mismo nombre
  // visible que la pieza única, sin mencionar el lado (es una sola pieza
  // anatómica, la división es solo un detalle de este asset).
  if (unprefixed === 'Craneo_vomer_izq' || unprefixed === 'Craneo_vomer_der') {
    return { name: 'Vómer', desc: 'Hueso delgado y plano que forma la parte posterior e inferior del tabique nasal.' };
  }
  // Cráneo subdividido en huesos anatómicos reales a partir del modelo
  // continuo, con las suturas coronal, sagital y lambdoidea medidas sobre la
  // malla (nomenclatura según el Atlas de Netter, láminas 2, 4 y 7).
  if (unprefixed === 'Hueso_frontal') {
    return { name: 'Hueso frontal', desc: 'Forma la frente y el techo de las cuencas oculares; se une a los parietales por la sutura coronal.' };
  }
  if ((m = unprefixed.match(/^Hueso_parietal_(izq|der)$/))) {
    return { name: `Hueso parietal ${SIDE_LABEL_M[m[1]]}`, desc: 'Hueso plano que forma el lateral y el techo del cráneo; los dos parietales se unen en el centro por la sutura sagital.' };
  }
  if (unprefixed === 'Hueso_occipital') {
    return { name: 'Hueso occipital', desc: 'Forma la base y la parte posterior del cráneo; por su agujero magno pasa la médula espinal, y sus cóndilos se apoyan en la primera vértebra.' };
  }
  if ((m = unprefixed.match(/^Hueso_temporal_(izq|der)$/))) {
    return { name: `Hueso temporal ${SIDE_LABEL_M[m[1]]}`, desc: 'Aloja el oído medio e interno y forma la fosa donde encaja el cóndilo de la mandíbula.' };
  }
  if ((m = unprefixed.match(/^Hueso_cigomatico_(izq|der)$/))) {
    return { name: `Hueso cigomático ${SIDE_LABEL_M[m[1]]}`, desc: 'El pómulo: forma el relieve de la mejilla y el borde externo de la cuenca ocular.' };
  }
  if (unprefixed === 'Hueso_esfenoides') {
    return { name: 'Hueso esfenoides', desc: 'Hueso central en la base del cráneo, con forma de mariposa; se articula con casi todos los demás huesos craneales.' };
  }
  if ((m = unprefixed.match(/^Hueso_nasal_(izq|der)$/))) {
    return { name: `Hueso nasal ${SIDE_LABEL_M[m[1]]}`, desc: 'Pequeño hueso del puente de la nariz; los dos forman el dorso nasal, y el resto de la nariz es cartílago.' };
  }
  if ((m = unprefixed.match(/^Maxilar_(izq|der)$/))) {
    return { name: `Maxilar ${SIDE_LABEL_M[m[1]]}`, desc: 'Sostiene los dientes superiores y forma el suelo de la cuenca ocular, el paladar y el borde de la abertura nasal.' };
  }
  if ((m = unprefixed.match(/^Craneo_temporal_[AB]_(izq|der)$/))) {
    return { name: `Hueso temporal ${SIDE_LABEL_M[m[1]]}`, desc: 'Aloja el oído medio e interno y forma parte de la articulación de la mandíbula.' };
  }
  if ((m = unprefixed.match(/^Hueso_facial_(izq|der)_\d+(\.\d+)?$/))) {
    return { name: `Hueso facial ${SIDE_LABEL_M[m[1]]}`, desc: 'Uno de los huesos pequeños de la cara (cigomático, maxilar, nasal, lagrimal, palatino o cornete) que rodean las cuencas oculares y la cavidad nasal.' };
  }
  if ((m = unprefixed.match(/^Carpo_([a-z]+)_(izq|der)$/)) && CARPAL_LABEL[m[1]]) {
    const [label, desc] = CARPAL_LABEL[m[1]];
    return { name: `${label} ${SIDE_LABEL_M[m[2]]}`, desc };
  }
  // Tarso_lado_N: huesos cortos del tobillo sin identidad individual
  // asignada; se describen como grupo. (Los del carpo ya están arriba.)
  if ((m = unprefixed.match(/^Carpo_(izq|der)_\d+$/))) {
    return { name: `Hueso del carpo ${SIDE_LABEL_M[m[1]]}`, desc: 'Uno de los ocho huesos cortos que forman la muñeca, entre el antebrazo y los metacarpianos.' };
  }
  if ((m = unprefixed.match(/^Tarso_(izq|der)_\d+$/))) {
    return { name: `Hueso del tarso ${SIDE_LABEL_M[m[1]]}`, desc: 'Uno de los siete huesos cortos que forman la parte posterior del pie, entre la pierna y los metatarsianos.' };
  }
  // Los siete tarsianos, ya identificados uno a uno sobre la malla (2026-09-13).
  if ((m = unprefixed.match(/^(Astragalo|Calcaneo|Escafoides|Cuboides|Cuneiforme_medial|Cuneiforme_intermedio|Cuneiforme_lateral)_(izq|der)$/))) {
    return { name: `${TARSAL_LABEL[m[1]][0]} ${(TARSAL_LABEL[m[1]][2] ? SIDE_LABEL : SIDE_LABEL_M)[m[2]]}`, desc: TARSAL_LABEL[m[1]][1] };
  }
  // Metacarpiano/falanges de la mano: metacarpiano_<dedo>_lado,
  // <proximal|media|distal>_<dedo>_lado (el pulgar no tiene "media").
  if ((m = unprefixed.match(/^metacarpiano_(pulgar|indice|medio|anular|menique)_(izq|der)$/))) {
    const finger = HAND_FINGER_LABEL[m[1]];
    return { name: `Metacarpiano del ${finger} ${SIDE_LABEL_M[m[2]]}`, desc: `Hueso largo de la mano que conecta la muñeca con el dedo ${finger}.` };
  }
  if ((m = unprefixed.match(/^(proximal|media|distal)_(pulgar|indice|medio|anular|menique)_(izq|der)$/))) {
    const seg = SEGMENT_LABEL[m[1]], finger = HAND_FINGER_LABEL[m[2]];
    return { name: `Falange ${seg} del ${finger} ${SIDE_LABEL[m[3]]}`, desc: `Falange ${seg} del dedo ${finger}; permite la prensión fina de la mano.` };
  }
  // Metatarsiano/falanges del pie: metatarsiano_<dedo>_lado,
  // <proximal|media|distal>_<dedo>_lado (el dedo gordo no tiene "media").
  if ((m = unprefixed.match(/^metatarsiano_([1-5])_pie_(izq|der)$/))) {
    const toe = TOE_NAMES[Number(m[1]) - 1];
    return { name: `${METATARSAL_ORDINAL[m[1]]} metatarsiano ${SIDE_LABEL_M[m[2]]}`, desc: `Hueso largo del pie que conecta el tarso con el ${toe} y ayuda a distribuir el peso al caminar.` };
  }
  if ((m = unprefixed.match(/^metatarsiano_(gordo|indice_pie|medio_pie|anular_pie|menique_pie)_(izq|der)$/))) {
    const toe = FOOT_TOE_LABEL[m[1]];
    return { name: `Metatarsiano del ${toe} ${SIDE_LABEL_M[m[2]]}`, desc: `Hueso largo del pie que conecta el tarso con el ${toe} y ayuda a distribuir el peso.` };
  }
  if ((m = unprefixed.match(/^(proximal|media|distal)_(gordo|indice_pie|medio_pie|anular_pie|menique_pie)_(izq|der)$/))) {
    const seg = SEGMENT_LABEL[m[1]], toe = FOOT_TOE_LABEL[m[2]];
    return { name: `Falange ${seg} del ${toe} ${SIDE_LABEL[m[3]]}`, desc: `Falange ${seg} del ${toe}; ayuda al equilibrio y al impulso al caminar.` };
  }
  // Dientes individuales: diente_N_sup|inf_lado, numerados desde el centro
  // de la arcada hacia atrás (no se distingue tipo exacto de pieza dental).
  if ((m = unprefixed.match(/^diente_(\d+)_(sup|inf)_(izq|der)$/))) {
    const arcada = m[2] === 'sup' ? 'superior' : 'inferior';
    const hueso = m[2] === 'sup' ? 'el maxilar' : 'la mandíbula';
    return { name: `Diente ${arcada} ${SIDE_LABEL_M[m[3]]} ${m[1]}`, desc: `Pieza dental de la arcada ${arcada}, anclada en ${hueso}.` };
  }
  // Patrones heredados del esqueleto procedural viejo (esqueleto-humano.obj).
  if ((m = unprefixed.match(/^metacarpo_(\d)_0_(izq|der)$/))) {
    const f = +m[1] - 1;
    return { name: `Metacarpiano del ${FINGER_NAMES[f]} ${SIDE_LABEL_M[m[2]]}`, desc: `Hueso largo de la mano que conecta la muñeca con el dedo ${FINGER_NAMES[f]}.` };
  }
  if ((m = unprefixed.match(/^falange_(\d)_(\d)_(izq|der)$/))) {
    const f = +m[1] - 1, seg = +m[2];
    const segName = handSegmentName(f, seg);
    return { name: `Falange ${segName} del ${FINGER_NAMES[f]} ${SIDE_LABEL[m[3]]}`, desc: `Falange ${segName} del dedo ${FINGER_NAMES[f]}; permite la prensión fina de la mano.` };
  }
  if ((m = unprefixed.match(/^metatarso_(\d)_(izq|der)$/))) {
    const t = +m[1] - 1;
    return { name: `Metatarsiano del ${TOE_NAMES[t]} ${SIDE_LABEL_M[m[2]]}`, desc: `Hueso largo del pie que conecta el tarso con los dedos y ayuda a distribuir el peso.` };
  }
  if ((m = unprefixed.match(/^falange_pie_(\d)_(izq|der)$/))) {
    const t = +m[1] - 1;
    return { name: `Falange del ${TOE_NAMES[t]} ${SIDE_LABEL[m[2]]}`, desc: 'Hueso de los dedos del pie; ayuda al equilibrio y al impulso al caminar.' };
  }

  const { base, side } = splitSide(unprefixed);
  const baseKey = base.toLowerCase();
  if (BASE_NAMES[baseKey]) {
    const [label, desc] = BASE_NAMES[baseKey];
    return { name: withSide(label, side, MASCULINE_BASES.has(baseKey)), desc };
  }
  if (BASE_NAMES[unprefixed]) {
    const [label, desc] = BASE_NAMES[unprefixed];
    return { name: label, desc };
  }

  return { name: titleCase(unprefixed), desc: 'Estructura ósea del esqueleto humano.' };
}
