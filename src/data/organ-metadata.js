// Deriva nombre visible + descripción corta en español para cada malla del
// modelo real de vísceras "Splanchnology" (Z-Anatomy, CC BY-SA — ver
// assets-source/ORGANS_CREDITS.md), separado pieza por pieza en Blender del
// mismo modo que el sistema muscular (ver muscle-metadata.js).
//
// Cada malla se llama `Organo_<base>[_<numero>][_der|_izq]`. Los órganos
// únicos (corazón, estómago, bazo, páncreas, vejiga...) no llevan lado. El
// hígado quedó dividido en 3 piezas (segmentos) sin una correspondencia
// clara a los lóbulos anatómicos clásicos, así que se numeran genéricamente.
// Algunas piezas pequeñas y profundas (ganglios/glándulas menores, conductos)
// no se pudieron identificar una por una con certeza — ver GROUP_BASE_NAMES.

const SIDE_LABEL = { der: 'derecho', izq: 'izquierdo' };
const SIDE_LABEL_FEM = { der: 'derecha', izq: 'izquierda' };

// Bases cuyo nombre es un sustantivo femenino (concuerdan con "derecha"/
// "izquierda" en vez de "derecho"/"izquierdo") — todas las demás son
// masculinas y usan SIDE_LABEL por defecto.
const FEMININE_BASES = new Set(['corazon_auricula', 'suprarrenal', 'rinon_corteza', 'rinon_medula']);

const BASE_NAMES = {
  corazon: ['Corazón', 'Órgano muscular que bombea la sangre a todo el cuerpo mediante contracciones rítmicas.'],
  corazon_ventriculo: ['Ventrículo', 'Cámara inferior del corazón, de pared muscular gruesa; bombea la sangre hacia los pulmones (derecho) o hacia el resto del cuerpo (izquierdo).'],
  corazon_auricula: ['Aurícula', 'Cámara superior del corazón; recibe la sangre que llega de las venas y la pasa al ventrículo correspondiente.'],
  pulmon: ['Pulmón', 'Órgano principal de la respiración; en él se intercambia oxígeno y dióxido de carbono con la sangre.'],
  lobulo_superior: ['Lóbulo superior del pulmón', 'Porción más alta del pulmón, separada del resto por la cisura oblicua (y la horizontal en el lado derecho).'],
  lobulo_medio: ['Lóbulo medio del pulmón', 'Pequeño lóbulo en forma de cuña que solo existe en el pulmón derecho, entre las cisuras horizontal y oblicua.'],
  lobulo_inferior: ['Lóbulo inferior del pulmón', 'La porción más grande y baja del pulmón; se apoya sobre la cúpula del diafragma.'],
  bronquio: ['Bronquio', 'Conducto que lleva el aire desde la tráquea hasta el pulmón correspondiente.'],
  diafragma: ['Hemidiafragma', 'Músculo en forma de cúpula que separa el tórax del abdomen; su contracción es el motor principal de la respiración.'],
  higado: ['Hígado', 'La glándula más grande del cuerpo; filtra la sangre, produce bilis y participa en el metabolismo de nutrientes y toxinas.'],
  vesicula_biliar: ['Vesícula biliar', 'Pequeño saco bajo el hígado que almacena y concentra la bilis antes de liberarla al intestino.'],
  estomago: ['Estómago', 'Órgano en forma de "J" que mezcla el alimento con ácido y enzimas para iniciar la digestión.'],
  estomago_fondo: ['Fondo gástrico', 'Parte superior y redondeada del estómago, justo bajo el diafragma; acumula el aire tragado.'],
  estomago_cuerpo: ['Cuerpo gástrico', 'Parte central y más grande del estómago, donde se mezcla el alimento con el ácido y las enzimas digestivas.'],
  estomago_antro: ['Antro pilórico', 'Parte final y más estrecha del estómago; muele el alimento y lo empuja hacia el duodeno a través del píloro.'],
  bazo: ['Bazo', 'Órgano del sistema linfático; filtra la sangre, recicla glóbulos rojos viejos y participa en la respuesta inmune.'],
  pancreas: ['Páncreas', 'Glándula que produce enzimas digestivas y hormonas como la insulina, que regula el azúcar en sangre.'],
  pancreas_cabeza: ['Cabeza del páncreas', 'Parte más ancha del páncreas, rodeada por el duodeno.'],
  pancreas_cuerpo: ['Cuerpo del páncreas', 'Parte central del páncreas, entre la cabeza y la cola.'],
  pancreas_cola: ['Cola del páncreas', 'Extremo más delgado del páncreas; se extiende hacia el bazo.'],
  rinon: ['Riñón', 'Órgano que filtra la sangre para eliminar desechos y exceso de agua, formando la orina.'],
  rinon_corteza: ['Corteza renal', 'Capa externa del riñón; contiene los glomérulos, donde comienza el filtrado de la sangre.'],
  rinon_medula: ['Médula renal', 'Región interna del riñón, formada por las pirámides renales; concentra la orina antes de que llegue a la pelvis renal.'],
  suprarrenal: ['Glándula suprarrenal', 'Glándula sobre cada riñón que produce hormonas como la adrenalina y el cortisol.'],
  vejiga: ['Vejiga urinaria', 'Órgano hueco que almacena la orina producida por los riñones hasta su expulsión.'],
  intestino_delgado: ['Intestino delgado', 'El tramo más largo del tubo digestivo; en él se completa la digestión y se absorben la mayoría de los nutrientes.'],
  colon_ascendente: ['Colon ascendente', 'Primer tramo del intestino grueso; absorbe agua y electrolitos del contenido digestivo.'],
  colon_transverso: ['Colon transverso', 'Tramo del intestino grueso que cruza el abdomen de derecha a izquierda.'],
  colon_descendente: ['Colon descendente', 'Tramo del intestino grueso que baja por el lado izquierdo del abdomen.'],
  colon_sigmoide: ['Colon sigmoide', 'Tramo final, curvo, del intestino grueso; conecta el colon descendente con el recto.'],
  colon_flexura_hepatica: ['Flexura hepática del colon', 'Ángulo donde el colon ascendente gira para convertirse en colon transverso, junto al hígado.'],
  colon_flexura_esplenica: ['Flexura esplénica del colon', 'Ángulo donde el colon transverso gira para convertirse en colon descendente, junto al bazo.'],
  conducto_anal: ['Conducto anal', 'Tramo final del tubo digestivo, de unos 3-4 cm, que atraviesa el suelo pélvico y termina en el ano; sus esfínteres controlan la defecación.'],
  conducto_biliar: ['Conducto biliar', 'Conducto pequeño que transporta la bilis entre el hígado, la vesícula biliar y el intestino.'],
  tiroides: ['Tiroides', 'Glándula en la base del cuello que produce hormonas que regulan el metabolismo del cuerpo.'],
  timo: ['Timo', 'Glándula del sistema inmune, en la parte alta del pecho; madura los linfocitos T, más activa durante la infancia.'],
  ganglio_hiliar: ['Ganglio linfático hiliar', 'Ganglio linfático junto a la raíz del pulmón; filtra la linfa que drena del tejido pulmonar.'],
  ganglio_mesenterico: ['Ganglio linfático mesentérico', 'Ganglio linfático en el mesenterio, junto al intestino delgado; filtra la linfa del tubo digestivo.'],
  vaso_mesenterico: ['Vaso linfático mesentérico', 'Vaso que drena la linfa del intestino delgado hacia los ganglios mesentéricos.'],
  ganglio_iliaco: ['Ganglio linfático ilíaco', 'Ganglio linfático junto a los vasos ilíacos, en la pelvis; filtra la linfa de la pierna y la pelvis del mismo lado.'],
  ganglio_pelvico: ['Ganglio linfático pélvico', 'Ganglio linfático profundo de la pelvis; filtra la linfa de los órganos pélvicos.'],
  ganglio_pelvico_profundo: ['Ganglio linfático pélvico profundo', 'Ganglio linfático pequeño en la profundidad de la pelvis.'],
  ureter: ['Uréter', 'Conducto que transporta la orina desde el riñón hasta la vejiga.'],
  uretra: ['Uretra', 'Conducto que transporta la orina desde la vejiga hacia el exterior del cuerpo.'],
  conducto: ['Conducto glandular', 'Uno de los conductos pequeños que transportan secreciones entre una glándula abdominal y el tubo digestivo.'],
  glandula: ['Glándula abdominal', 'Una de las glándulas o estructuras linfáticas pequeñas del abdomen (ganglio, glándula accesoria) asociadas al tubo digestivo.']
};

function titleCase(str) {
  return str
    .split('_')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

const REGION_LABEL = {
  torso: 'el torso'
};

// Todas las piezas de este modelo están en el torso/abdomen; no hay
// "Expandir región" por lado como en huesos/músculos, pero se deja la
// función para mantener la misma forma de API que bone-metadata.js /
// muscle-metadata.js.
export function getOrganRegion() {
  return 'torso';
}

export function regionLabel(region) {
  return REGION_LABEL[region] || null;
}

// name = "Organo_<base>[_<numero>][_der|_izq]".
export function getOrganMeta(rawName) {
  if (!rawName.startsWith('Organo_')) {
    return { name: titleCase(rawName), desc: 'Órgano interno del cuerpo humano.' };
  }
  const rest = rawName.slice('Organo_'.length);

  const m = rest.match(/^(.+?)(?:_(\d+))?_(der|izq)$/);
  if (m) {
    const [, base, num, side] = m;
    if (BASE_NAMES[base]) {
      const [label, desc] = BASE_NAMES[base];
      const sideLabel = (FEMININE_BASES.has(base) ? SIDE_LABEL_FEM : SIDE_LABEL)[side];
      const numTag = num ? ` ${num}` : '';
      return { name: `${label}${numTag} ${sideLabel}`, desc };
    }
    return { name: `${titleCase(base)}${num ? ' ' + num : ''} ${SIDE_LABEL[side]}`, desc: 'Órgano interno del cuerpo humano.' };
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

  return { name: titleCase(rest), desc: 'Órgano interno del cuerpo humano.' };
}
