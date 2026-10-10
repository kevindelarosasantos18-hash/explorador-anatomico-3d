// Deriva nombre visible + descripción corta en español para cada malla del
// modelo real "Neurology" (Z-Anatomy, CC BY-SA — ver
// assets-source/NERVIOSO_CREDITS.md), separado pieza por pieza en Blender
// del mismo modo que músculos y órganos (ver muscle-metadata.js /
// organ-metadata.js).
//
// Cubre: corteza cerebral (agrupada por lóbulo, no giro por giro — hay 46+
// piezas de detalle de giros individuales, demasiado fino para nombrar una
// por una con certeza), cerebelo, sustancia blanca, núcleos profundos
// (tálamo, núcleo caudado, putamen, etc.), el sistema ventricular, y los
// nervios periféricos. De los nervios periféricos solo se pudieron
// identificar con confianza los troncos más grandes y característicos
// (ciático, femoral, vago, cadena simpática) por tamaño y posición — el
// resto (~370 piezas, ramas menores) se agrupó por región del cuerpo
// (craneal, braquial, toracoabdominal, lumbosacro, muslo/pierna, pie).

const SIDE_LABEL = { der: 'derecho', izq: 'izquierdo' };
const SIDE_LABEL_FEM = { der: 'derecha', izq: 'izquierda' };
const FEMININE_BASES = new Set(['cerebro_parietal', 'sustancia_blanca', 'sustancia_negra', 'cadena_simpatica']);

const LOBE_NAMES = {
  frontal: ['Lóbulo frontal', 'Parte anterior de la corteza cerebral; controla el movimiento voluntario, el lenguaje y funciones ejecutivas como la planificación y el juicio.'],
  parietal: ['Lóbulo parietal', 'Parte superior-posterior de la corteza cerebral; procesa la información sensorial del tacto, la temperatura y la posición del cuerpo.'],
  temporal: ['Lóbulo temporal', 'Parte lateral-inferior de la corteza cerebral; procesa el sonido y el lenguaje, y participa en la memoria.'],
  occipital: ['Lóbulo occipital', 'Parte posterior de la corteza cerebral; procesa la información visual.']
};

const BASE_NAMES = {
  talamo: ['Tálamo', 'Estructura profunda que retransmite casi toda la información sensorial hacia la corteza cerebral.'],
  nucleo_caudado: ['Núcleo caudado', 'Núcleo profundo con forma de "C"; parte de los ganglios basales, participa en el control del movimiento y el aprendizaje.'],
  putamen: ['Putamen', 'Núcleo profundo de los ganglios basales; ayuda a regular el movimiento y el tono muscular.'],
  globo_palido: ['Globo pálido', 'Núcleo profundo de los ganglios basales; ayuda a regular y suavizar el movimiento voluntario.'],
  hipocampo: ['Hipocampo', 'Estructura profunda del lóbulo temporal, clave en la formación de nuevos recuerdos.'],
  amigdala: ['Amígdala cerebral', 'Estructura profunda del lóbulo temporal; procesa emociones, especialmente el miedo.'],
  nucleo_subtalamico: ['Núcleo subtalámico', 'Pequeño núcleo profundo que ajusta y regula la actividad de los ganglios basales.'],
  sustancia_negra: ['Sustancia negra', 'Núcleo profundo que produce dopamina; su degeneración está asociada a la enfermedad de Parkinson.'],
  fornix: ['Fórnix', 'Haz de fibras que conecta el hipocampo con otras estructuras del cerebro, parte del circuito de la memoria.'],
  comisura_anterior: ['Comisura anterior', 'Pequeño haz de fibras que conecta los dos hemisferios cerebrales.'],
  sustancia_blanca: ['Sustancia blanca', 'Fibras nerviosas recubiertas de mielina que conectan distintas regiones del cerebro entre sí.'],
  cerebelo: ['Cerebelo', 'Coordina el movimiento, el equilibrio y la postura; ajusta los movimientos finos del cuerpo.'],
  ventriculo_lateral: ['Ventrículo lateral', 'Cavidad del cerebro que produce y contiene líquido cefalorraquídeo.'],
  tercer_ventriculo: ['Tercer ventrículo', 'Cavidad estrecha entre los dos tálamos; forma parte del sistema por donde circula el líquido cefalorraquídeo.'],
  acueducto_cerebral: ['Acueducto cerebral', 'Conducto delgado que conecta el tercer y el cuarto ventrículo.'],
  cuarto_ventriculo: ['Cuarto ventrículo', 'Cavidad entre el tronco encefálico y el cerebelo; conecta con el canal central de la médula espinal.'],
  ciatico: ['Nervio ciático', 'El nervio más grueso y largo del cuerpo; baja por la parte posterior del muslo y controla gran parte de la pierna.'],
  ciatico_continuacion: ['Nervio ciático (continuación)', 'Continuación del nervio ciático hacia la rodilla, donde se divide en los nervios tibial y peroneo común.'],
  femoral: ['Nervio femoral', 'Nervio principal de la parte anterior del muslo; extiende la rodilla y da sensibilidad a la piel de esa zona.'],
  // OJO: las dos piezas llamadas `vago` en el asset NO son el nervio vago.
  // Medidas en espacio app: van de x=167 a 330 mm y de y=931 a 1371, es decir
  // por el brazo, del hombro hasta pasado el codo. El vago real baja por la
  // linea media junto a la traquea y el esofago, a 10-30 mm del eje. Son, por
  // posicion, nervios del miembro superior, asi que se etiquetan como tales.
  vago: ['Nervio del miembro superior', 'Uno de los nervios largos que recorren el brazo desde el hombro hasta el antebrazo. (La malla venía etiquetada como "vago" en el modelo de origen, pero su recorrido es el del brazo, no el del nervio vago.)'],
  cadena_simpatica: ['Cadena simpática', 'Cordón de ganglios nerviosos junto a la columna; forma parte del sistema nervioso simpático ("lucha o huida").'],
  craneal: ['Nervio craneal', 'Uno de los nervios que salen directamente del encéfalo; controlan los sentidos y músculos de la cabeza y el cuello.'],
  braquial: ['Nervio del miembro superior', 'Uno de los nervios del plexo braquial o de sus ramas, que inervan el hombro, el brazo, el antebrazo y la mano.'],
  toracoabdominal: ['Nervio toracoabdominal', 'Uno de los nervios que recorren el tórax o el abdomen, como los intercostales o ramas autónomas.'],
  lumbosacro: ['Nervio del plexo lumbosacro', 'Uno de los nervios que forman la red que inerva la cadera, la pelvis y la pierna.'],
  muslo_pierna: ['Nervio de la pierna', 'Uno de los nervios que recorren el muslo o la pierna.'],
  pie: ['Nervio del pie', 'Uno de los nervios terminales que dan sensibilidad y movimiento al pie.']
};

function titleCase(str) {
  return str.split('_').filter(Boolean).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

const REGION_LABEL = { craneo: 'la cabeza', torso: 'el torso', brazo_izquierdo: 'el brazo izquierdo', brazo_derecho: 'el brazo derecho', pierna_izquierda: 'la pierna izquierda', pierna_derecha: 'la pierna derecha' };

const REGION_PATTERNS = [
  [/^cerebro_/, 'craneo'],
  [/^(talamo|nucleo_caudado|putamen|globo_palido|hipocampo|amigdala|nucleo_subtalamico|sustancia_negra|fornix|comisura_anterior|sustancia_blanca|cerebelo|ventriculo_lateral|tercer_ventriculo|acueducto_cerebral|cuarto_ventriculo|craneal)/, 'craneo'],
  // `vago` va con el brazo: ver la nota en BASE_NAMES.
  [/^vago_(\d+_)?der$/, 'brazo_derecho'],
  [/^vago_(\d+_)?izq$/, 'brazo_izquierdo'],
  [/^(cadena_simpatica|toracoabdominal)_(\d+_)?der$/, 'torso'],
  [/^(cadena_simpatica|toracoabdominal)_(\d+_)?izq$/, 'torso'],
  [/^braquial_(\d+_)?der$/, 'brazo_derecho'],
  [/^braquial_(\d+_)?izq$/, 'brazo_izquierdo'],
  [/^(ciatico|ciatico_continuacion|femoral|lumbosacro|muslo_pierna|pie)_(\d+_)?der$/, 'pierna_derecha'],
  [/^(ciatico|ciatico_continuacion|femoral|lumbosacro|muslo_pierna|pie)_(\d+_)?izq$/, 'pierna_izquierda']
];

// Blender aniade un sufijo `.001` cuando dos datablocks comparten nombre, y
// alguna malla del asset llego al .glb con el sufijo pegado. Sin quitarlo, los
// patrones no casan y la pieza se queda sin region (no funcionaria "Expandir
// region" sobre ella).
function sinSufijo(rest) {
  return rest.replace(/\.\d{3}$/, '');
}

export function getNerveRegion(rawName) {
  const rest = sinSufijo(rawName.startsWith('Nervio_') ? rawName.slice('Nervio_'.length) : rawName);
  for (const [pattern, region] of REGION_PATTERNS) {
    if (pattern.test(rest)) return region;
  }
  return null;
}

export function regionLabel(region) {
  return REGION_LABEL[region] || null;
}

// name = "Nervio_cerebro_<lobulo>_<numero>_<der|izq>" | "Nervio_<base>[_<numero>][_der|_izq]"
export function getNerveMeta(rawName) {
  if (!rawName.startsWith('Nervio_')) {
    return { name: titleCase(rawName), desc: 'Estructura del sistema nervioso.' };
  }
  const rest = sinSufijo(rawName.slice('Nervio_'.length));

  const lobeM = rest.match(/^cerebro_(frontal|parietal|temporal|occipital)_(\d+)_(der|izq)$/);
  if (lobeM) {
    const [, lobe, num, side] = lobeM;
    const [label, desc] = LOBE_NAMES[lobe];
    return { name: `${label}, giro ${num} ${SIDE_LABEL[side]}`, desc };
  }

  const m = rest.match(/^(.+?)(?:_(\d+))?_(der|izq)$/);
  if (m) {
    const [, base, num, side] = m;
    if (BASE_NAMES[base]) {
      const [label, desc] = BASE_NAMES[base];
      const sideLabel = (FEMININE_BASES.has(base) ? SIDE_LABEL_FEM : SIDE_LABEL)[side];
      const numTag = num ? ` ${num}` : '';
      return { name: `${label}${numTag} ${sideLabel}`, desc };
    }
    return { name: `${titleCase(base)}${num ? ' ' + num : ''} ${SIDE_LABEL[side]}`, desc: 'Estructura del sistema nervioso.' };
  }

  const m2 = rest.match(/^(.+?)_(\d+)$/);
  if (m2) {
    const [, base, num] = m2;
    if (BASE_NAMES[base]) {
      const [label, desc] = BASE_NAMES[base];
      return { name: `${label} ${num}`, desc };
    }
  }

  if (BASE_NAMES[rest]) {
    const [label, desc] = BASE_NAMES[rest];
    return { name: label, desc };
  }

  return { name: titleCase(rest), desc: 'Estructura del sistema nervioso.' };
}
