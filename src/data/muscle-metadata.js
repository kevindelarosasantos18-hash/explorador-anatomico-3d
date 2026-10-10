// Deriva nombre visible + descripción corta en español para cada malla del
// sistema muscular real (modelo "Myology" de Z-Anatomy, separado pieza por
// pieza en Blender — ver assets-source/MUSCLES_CREDITS.md).
//
// Cada malla se llama `Musculo_<base>[_<numero>]_<der|izq>` (con la
// excepción de `Musculo_trapecio`, que es una sola pieza para ambos lados).
// `<base>` identifica el músculo (o el grupo, para las piezas pequeñas y
// profundas que no se pudieron identificar una por una con certeza — ver
// GROUP_BASE_NAMES más abajo); `<numero>` distingue varias piezas del mismo
// músculo/grupo (segmentos del recto abdominal, cabezas del tríceps,
// dedos de la mano/pie...).

const SIDE_LABEL = { der: 'derecho', izq: 'izquierdo' };
const SIDE_LABEL_FEM = { der: 'derecha', izq: 'izquierda' };

// name -> [nombre, descripción, esFemenino] — esFemenino controla si el lado
// se dice "derecha/izquierda" (p.ej. "pierna") en vez de "derecho/izquierdo".
const BASE_NAMES = {
  temporal: ['Temporal', 'Músculo plano en la sien; eleva la mandíbula y ayuda a cerrar la boca con fuerza.'],
  masetero: ['Masetero', 'Uno de los músculos más potentes de la masticación; eleva y cierra la mandíbula.'],
  cervical: ['Músculo cervical', 'Uno de los músculos profundos del cuello; estabiliza y mueve la cabeza.'],
  trapecio: ['Trapecio', 'Músculo grande y plano de la espalda alta; eleva, rota y estabiliza los hombros y la escápula.'],
  serrato_anterior: ['Serrato anterior', 'Músculo con forma de sierra en el costado de la caja torácica; empuja la escápula hacia adelante y la mantiene pegada a las costillas.'],
  pectoral_mayor: ['Pectoral mayor', 'Músculo grande y superficial del pecho; aproxima y rota el brazo hacia adentro.'],
  pectoral_menor: ['Pectoral menor', 'Músculo profundo al pectoral mayor; desciende y estabiliza la escápula.'],
  subclavio: ['Subclavio', 'Músculo pequeño bajo la clavícula; la estabiliza durante el movimiento del hombro.'],
  recto_abdominal: ['Recto abdominal', 'El músculo del "six-pack"; flexiona el tronco y comprime el abdomen.'],
  deltoides: ['Deltoides', 'Músculo que cubre el hombro; permite levantar y rotar el brazo en todas direcciones.'],
  triceps_braquial: ['Tríceps braquial', 'Músculo en la parte posterior del brazo; extiende el codo.'],
  biceps_braquial: ['Bíceps braquial', 'Músculo en la parte anterior del brazo; flexiona el codo y supina el antebrazo.'],
  manguito_rotador: ['Músculo del manguito rotador', 'Uno de los músculos profundos del hombro (supraespinoso, infraespinoso, redondo menor o subescapular) que estabiliza la articulación y rota el brazo.'],
  flexor_antebrazo: ['Flexor del antebrazo', 'Uno de los músculos de la cara anterior del antebrazo; flexiona la muñeca y los dedos.'],
  extensor_antebrazo: ['Extensor del antebrazo', 'Uno de los músculos de la cara posterior del antebrazo; extiende la muñeca y los dedos.'],
  tendon_muneca: ['Tendón de la muñeca', 'Tendón que cruza la muñeca conectando un músculo del antebrazo con la mano.'],
  intrinseco_mano: ['Músculo intrínseco de la mano', 'Uno de los músculos pequeños propios de la mano (no del antebrazo); permite los movimientos finos de los dedos.'],
  vasto_medial: ['Vasto medial', 'Cabeza medial del cuádriceps; extiende la rodilla y estabiliza la rótula.'],
  vasto_lateral: ['Vasto lateral', 'Cabeza lateral del cuádriceps, la más grande; extiende la rodilla.'],
  vasto_intermedio: ['Vasto intermedio', 'Cabeza profunda del cuádriceps, bajo el recto femoral; extiende la rodilla.'],
  recto_femoral: ['Recto femoral', 'Único músculo del cuádriceps que también cruza la cadera; extiende la rodilla y flexiona la cadera.'],
  sartorio: ['Sartorio', 'El músculo más largo del cuerpo; cruza el muslo en diagonal y flexiona la cadera y la rodilla.'],
  gracil: ['Grácil', 'Músculo delgado y largo en la cara interna del muslo; aduce el muslo y flexiona la rodilla.'],
  aductor_mayor: ['Aductor mayor', 'El más grande de los aductores del muslo; lo aproxima hacia la línea media.'],
  aductor_largo: ['Aductor largo', 'Músculo del muslo interno; aproxima y flexiona el muslo.'],
  aductor_corto: ['Aductor corto', 'Músculo profundo del muslo interno; aproxima el muslo.'],
  pectineo: ['Pectíneo', 'Músculo pequeño en la parte alta e interna del muslo; flexiona y aproxima la cadera.'],
  iliopsoas: ['Iliopsoas', 'Principal flexor de la cadera; une la columna lumbar y la pelvis con el fémur.'],
  biceps_femoral: ['Bíceps femoral', 'Músculo isquiotibial en la cara posterior del muslo; flexiona la rodilla y extiende la cadera.'],
  semitendinoso: ['Semitendinoso', 'Músculo isquiotibial de la cara posterior del muslo; flexiona la rodilla y extiende la cadera.'],
  semimembranoso: ['Semimembranoso', 'Músculo isquiotibial profundo de la cara posterior del muslo; flexiona la rodilla y extiende la cadera.'],
  popliteo: ['Poplíteo', 'Músculo pequeño detrás de la rodilla; la desbloquea al iniciar la flexión.'],
  gastrocnemio_medial: ['Gastrocnemio, cabeza medial', 'Una de las dos cabezas del gemelo; flexiona la rodilla y el tobillo (ponerse de puntas de pie).'],
  gastrocnemio_lateral: ['Gastrocnemio, cabeza lateral', 'Una de las dos cabezas del gemelo; flexiona la rodilla y el tobillo (ponerse de puntas de pie).'],
  soleo: ['Sóleo', 'Músculo profundo de la pantorrilla, bajo el gastrocnemio; flexiona el tobillo al caminar y estar de pie.'],
  tibial_posterior: ['Tibial posterior', 'Músculo profundo de la pantorrilla; sostiene el arco del pie e invierte el tobillo.'],
  flexor_largo_dedos: ['Flexor largo de los dedos', 'Músculo profundo de la pantorrilla; flexiona los dedos del pie.'],
  tendon_aquiles: ['Tendón de Aquiles', 'El tendón más grueso del cuerpo; une los gemelos y el sóleo con el talón.'],
  intrinseco_pie: ['Músculo intrínseco del pie', 'Uno de los músculos pequeños propios del pie; ayuda a sostener el arco plantar y a mover los dedos.'],
  dorsal_ancho: ['Dorsal ancho', 'Músculo grande y triangular de la espalda; aproxima, extiende y rota el brazo hacia adentro.'],
  erector_columna: ['Erector de la columna', 'Grupo de músculos largos a ambos lados de la columna; la extienden y mantienen la postura erguida.'],
  infraespinoso: ['Infraespinoso', 'Músculo del manguito rotador en la escápula; rota el brazo hacia afuera.'],
  romboides_mayor: ['Romboides mayor', 'Músculo entre la columna y la escápula; la retrae y estabiliza contra la caja torácica.'],
  romboides_menor: ['Romboides menor', 'Músculo pequeño entre la columna y la escápula; la retrae junto con el romboides mayor.'],
  redondo_mayor: ['Redondo mayor', 'Músculo bajo la escápula; ayuda a aproximar y rotar el brazo hacia adentro.'],
  redondo_menor: ['Redondo menor', 'Músculo del manguito rotador bajo el infraespinoso; rota el brazo hacia afuera.'],
  paravertebral: ['Músculo paravertebral', 'Uno de los músculos profundos junto a la columna; la estabiliza y ayuda a mantener la postura.'],
  serrato_posterior: ['Serrato posterior', 'Músculo delgado bajo los músculos superficiales de la espalda; ayuda a mover la caja torácica al respirar.'],
  cervical_profundo: ['Músculo cervical profundo', 'Uno de los músculos pequeños y profundos del cuello; estabiliza y ajusta la posición de la cabeza.'],
  hombro_profundo: ['Músculo profundo del hombro', 'Uno de los músculos pequeños y profundos de la articulación del hombro; la estabiliza durante el movimiento del brazo.'],
  antebrazo_profundo: ['Músculo profundo del antebrazo', 'Uno de los músculos pequeños y profundos del antebrazo; participa en el movimiento fino de la muñeca y los dedos.'],
  abdominal_profundo: ['Músculo abdominal profundo', 'Uno de los músculos profundos de la pared abdominal (oblicuo interno o transverso); comprime el abdomen y estabiliza el tronco.'],
  // --- Musculatura reconstruida en Blender ajustada al hueso (antebrazo,
  // compartimento anterior de la pierna, cara y cuello): el modelo original
  // no la traía o la traía con los extremos cortados planos. ---
  suprahioideo: ['Músculo suprahioideo', 'Uno de los músculos del suelo de la boca, entre la mandíbula y el hueso hioides; abre la mandíbula y eleva la lengua al tragar.'],
  platisma: ['Platisma', 'Lámina muscular fina bajo la piel del cuello; tensa la piel y tira hacia abajo de la comisura de la boca.'],
  galea_aponeurotica: ['Galea aponeurótica', 'Lámina fibrosa que cubre la bóveda del cráneo y une el músculo frontal con el occipital; desliza el cuero cabelludo.', true],
  elevador_labio_superior: ['Elevador del labio superior', 'Va del borde de la órbita al labio superior; lo eleva y ensancha la ventana nasal.'],
  depresor_angulo_boca: ['Depresor del ángulo de la boca', 'Va del borde de la mandíbula a la comisura; la tira hacia abajo.'],
  supraespinoso: ['Supraespinoso', 'Músculo del manguito rotador sobre la espina de la escápula; inicia la separación del brazo del cuerpo.'],
  infraespinoso_dorsal: ['Infraespinoso', 'Músculo del manguito rotador que cubre la cara posterior de la escápula; rota el brazo hacia afuera.'],
  braquial: ['Braquial anterior', 'Músculo profundo bajo el bíceps, entre el húmero y el cúbito; es el flexor más potente del codo.'],
  braquiorradial: ['Braquiorradial', 'Músculo lateral del antebrazo; flexiona el codo, sobre todo con la mano en posición neutra.'],
  flexor_radial_carpo: ['Flexor radial del carpo', 'Músculo anterior del antebrazo; flexiona la muñeca y la desvía hacia el pulgar.'],
  palmar_largo: ['Palmar largo', 'Músculo delgado y superficial del antebrazo; tensa la aponeurosis de la palma. Falta en cerca de una de cada diez personas.'],
  flexor_superficial_dedos: ['Flexor superficial de los dedos', 'Músculo anterior del antebrazo; flexiona la falange media de los cuatro dedos largos.'],
  flexor_cubital_carpo: ['Flexor cubital del carpo', 'Músculo del borde interno del antebrazo; flexiona la muñeca y la desvía hacia el meñique.'],
  extensor_radial_carpo: ['Extensor radial del carpo', 'Músculo posterolateral del antebrazo; extiende la muñeca y la desvía hacia el pulgar.'],
  extensor_dedos: ['Extensor de los dedos', 'Músculo posterior del antebrazo; extiende los cuatro dedos largos y colabora en extender la muñeca.'],
  extensor_cubital_carpo: ['Extensor cubital del carpo', 'Músculo posterior del antebrazo; extiende la muñeca y la desvía hacia el meñique.'],
  tenar: ['Eminencia tenar', 'Grupo de músculos cortos en la base del pulgar; le dan su movilidad y la fuerza de la pinza.', true],
  hipotenar: ['Eminencia hipotenar', 'Grupo de músculos cortos en el borde de la palma, bajo el meñique; separan y flexionan ese dedo.', true],
  interoseo_dorsal: ['Interóseo dorsal', 'Músculo alargado entre dos metacarpianos; separa los dedos y forma el relieve del dorso de la mano.'],
  interoseos: ['Músculos interóseos', 'Músculos cortos entre los metacarpianos; separan y juntan los dedos.'],
  aponeurosis_palmar: ['Aponeurosis palmar', 'Lámina fibrosa que cubre la palma de la mano y protege tendones, nervios y vasos.', true],
  tendon_rotuliano: ['Tendón rotuliano', 'Continuación del cuádriceps que envuelve la rótula y la une a la tibia; transmite la fuerza que estira la rodilla.'],
  abductor_dedo_gordo: ['Abductor del dedo gordo', 'Músculo del borde interno de la planta; separa el dedo gordo y sostiene el arco del pie.'],
  abductor_menique_pie: ['Abductor del meñique del pie', 'Músculo del borde externo de la planta; separa el quinto dedo.'],
  interoseo_dorsal_pie: ['Interóseo dorsal del pie', 'Músculo alargado entre dos metatarsianos; separa los dedos y forma el relieve del dorso del pie.'],
  tibial_anterior: ['Tibial anterior', 'Músculo del frente de la pierna; levanta el pie y sostiene el arco al caminar.'],
  extensor_largo_dedos: ['Extensor largo de los dedos', 'Músculo del frente de la pierna; extiende los dedos del pie y ayuda a levantarlo.'],
  peroneo_largo: ['Peroneo largo', 'Músculo del lado externo de la pierna; gira el pie hacia afuera y sostiene el arco plantar.'],
  peroneo_corto: ['Peroneo corto', 'Músculo corto del lado externo de la pierna, bajo el peroneo largo; gira el pie hacia afuera.'],
  flexor_corto_dedos_pie: ['Flexor corto de los dedos del pie', 'Ocupa el centro de la planta, bajo la aponeurosis plantar; dobla los cuatro dedos menores y sostiene el arco longitudinal.'],
  pedio: ['Pedio (extensor corto de los dedos)', 'Pequeño músculo carnoso del dorso del pie, delante del tobillo; ayuda a extender los dedos.'],
  tendon_extensor_gordo_pie: ['Tendón extensor del dedo gordo', 'Tendón del extensor largo del dedo gordo; recorre el dorso del pie y levanta el primer dedo.'],
  tendon_extensor_indice_pie: ['Tendón extensor del segundo dedo', 'Tendón del extensor largo de los dedos que recorre el dorso del pie hasta el segundo dedo.'],
  tendon_extensor_medio_pie: ['Tendón extensor del tercer dedo', 'Tendón del extensor largo de los dedos que recorre el dorso del pie hasta el tercer dedo.'],
  tendon_extensor_anular_pie: ['Tendón extensor del cuarto dedo', 'Tendón del extensor largo de los dedos que recorre el dorso del pie hasta el cuarto dedo.'],
  tendon_extensor_menique_pie: ['Tendón extensor del quinto dedo', 'Tendón del extensor largo de los dedos que recorre el dorso del pie hasta el dedo meñique.'],
  aponeurosis_plantar: ['Aponeurosis plantar', 'Lámina fibrosa gruesa de la planta del pie; sostiene el arco y amortigua al caminar.', true],
  esternocleidomastoideo: ['Esternocleidomastoideo', 'Músculo largo del cuello, del cráneo al esternón y la clavícula; gira e inclina la cabeza.'],
  epicraneal_frontal: ['Músculo frontal', 'Cubre la frente; levanta las cejas y arruga la frente.'],
  epicraneal_occipital: ['Músculo occipital', 'Cubre la parte posterior del cráneo; tira hacia atrás del cuero cabelludo.'],
  orbicular_parpados: ['Orbicular de los párpados', 'Anillo muscular alrededor del ojo; cierra el párpado y permite parpadear.'],
  orbicular_labios: ['Orbicular de los labios', 'Anillo muscular alrededor de la boca; cierra y frunce los labios.'],
  cigomatico: ['Cigomatico', 'Va del pómulo a la comisura de la boca; la eleva al sonreír.'],
  buccinador: ['Buccinador', 'Músculo de la mejilla; la aprieta contra los dientes al masticar y soplar.'],
  nasal: ['Músculo nasal', 'Cubre el dorso de la nariz; abre y estrecha las fosas nasales.'],
  mentoniano: ['Mentoniano', 'Músculo del mentón; eleva la piel del mentón y proyecta el labio inferior.'],
  fascia_temporal: ['Fascia temporal', 'Lámina fibrosa resistente que cubre el músculo temporal en el lateral del cráneo, entre la línea temporal y el arco cigomático.', true],
  linea_alba: ['Línea alba', 'Banda fibrosa vertical en el centro del abdomen donde se cruzan las aponeurosis de los músculos abdominales; separa los dos rectos.', true],
  longisimo: ['Longísimo', 'Columna muscular larga junto a la columna vertebral, entre el espinoso y el iliocostal; extiende el tronco y el cuello.'],
  iliocostal: ['Iliocostal', 'La columna más externa del erector de la columna; va de la pelvis a las costillas y endereza e inclina el tronco.'],
  pared_abdominal: ['Músculo de la pared abdominal', 'Una de las capas musculares que forman la pared del abdomen (oblicuos y transverso); comprime el abdomen y flexiona o gira el tronco.'],
  intercostal: ['Músculo intercostal', 'Uno de los músculos entre dos costillas vecinas; ayuda a expandir y contraer la caja torácica al respirar.']
};

// Piezas cuyo nombre de origen contradice su posicion real. Comprobado
// midiendo la distancia mediana de cada malla a CADA hueso del esqueleto: estas
// veinte estan en el muslo, la cadera o el suelo pelvico, entre 14 y 55 mm del
// femur, el coxal o el coccix, y a mas de medio cuerpo de cualquier costilla
// (las costillas van de y=1150 a 1400; estas piezas, de y=660 a 894).
//
// No se les pone un nombre especifico —a esa altura podrian ser obturador,
// cuadrado femoral, pectineo o aductor, y el modelo de origen no permite
// distinguirlos con certeza— pero un nombre regional cierto es mejor que
// "intercostal", que es sencillamente falso. La clave es `<base>_<numero>`.
const NOMBRE_CORREGIDO = {
  // pegadas al FEMUR (17-56 mm), a 186-427 mm de cualquier costilla
  intercostal_6: 'muslo',
  intercostal_8: 'muslo',
  intercostal_9: 'muslo',
  intercostal_10: 'muslo',
  intercostal_11: 'muslo',
  serrato_posterior_13: 'muslo',
  abdominal_profundo_9: 'muslo',
  // pegadas a la PELVIS (13-41 mm), a 155-270 mm de cualquier costilla
  intercostal_5: 'cadera',
  intercostal_7: 'cadera',
  serrato_posterior_5: 'cadera',
  serrato_posterior_6: 'cadera',
  serrato_posterior_8: 'cadera',
  serrato_posterior_9: 'cadera',
  serrato_posterior_10: 'cadera',
  serrato_posterior_11: 'cadera',
  serrato_posterior_12: 'cadera',
  abdominal_profundo_8: 'cadera',
  abdominal_profundo_10: 'cadera',
  // pegada al COCCIX (14 mm)
  serrato_posterior_7: 'suelo_pelvico',
  // por debajo de la parrilla costal, en el flanco (costilla a 74-80 mm)
  intercostal_4: 'pared_abdominal'
};

const CORREGIDO_INFO = {
  muslo: ['Músculo profundo del muslo', 'Una de las piezas profundas de la cara interna del muslo (aductor, obturador, cuadrado femoral o pectíneo); el modelo de origen no permite distinguirlas una por una con certeza.'],
  cadera: ['Músculo profundo de la cadera', 'Una de las piezas profundas de la región de la cadera, junto al hueso coxal y el sacro; rota y estabiliza el fémur.'],
  suelo_pelvico: ['Músculo profundo del suelo pélvico', 'Una de las piezas profundas del suelo de la pelvis, junto al cóccix; sostiene las vísceras pélvicas.'],
  pared_abdominal: ['Músculo profundo de la pared abdominal', 'Pieza profunda del flanco, por debajo de la parrilla costal (oblicuo interno o transverso del abdomen); comprime el abdomen y estabiliza el tronco.']
};

// Devuelve la clave `<base>_<numero>` de una malla, o null.
function claveCorregida(rest) {
  const m = rest.match(/^(.+?)(?:_(\d+))?_(der|izq)$/);
  if (!m) return null;
  const [, base, num] = m;
  const clave = num ? `${base}_${num}` : base;
  return NOMBRE_CORREGIDO[clave] ? clave : null;
}

function titleCase(str) {
  return str
    .split('_')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// Región anatómica de cada músculo, usada por "Expandir región" (igual que
// en bone-metadata.js, ver ese archivo para el patrón general).
const REGION_PATTERNS = [
  [/^(temporal|fascia_temporal|epicraneal_frontal|epicraneal_occipital|masetero|cervical|cervical_profundo|esternocleidomastoideo|orbicular_parpados|cigomatico|buccinador|elevador_labio_superior|depresor_angulo_boca|platisma|suprahioideo)_/, 'craneo'],
  [/^(epicraneal_frontal|epicraneal_occipital|galea_aponeurotica|orbicular_labios|nasal|mentoniano)$/, 'craneo'],
  [/^cervical_\d+$/, 'craneo'],
  // El manguito rotador va con el hombro aunque su vientre este en la espalda;
  // debe evaluarse antes que el patron de torso, que captura 'infraespinoso'.
  [/^(supraespinoso|infraespinoso|infraespinoso_dorsal)_der$/, 'brazo_derecho'],
  [/^(supraespinoso|infraespinoso|infraespinoso_dorsal)_izq$/, 'brazo_izquierdo'],
  [/^(trapecio|linea_alba)$/, 'torso'],
  [/^(trapecio)_(izq|der)$/, 'torso'],
  [/^(serrato_anterior|pectoral_mayor|pectoral_menor|subclavio|recto_abdominal|dorsal_ancho|erector_columna|romboides_mayor|romboides_menor|redondo_mayor|redondo_menor|paravertebral|serrato_posterior|abdominal_profundo|intercostal|linea_alba|longisimo|iliocostal|pared_abdominal)_/, 'torso'],
  [/^(deltoides|triceps_braquial|biceps_braquial|manguito_rotador|flexor_antebrazo|extensor_antebrazo|tendon_muneca|intrinseco_mano|hombro_profundo|antebrazo_profundo|braquiorradial|flexor_radial_carpo|palmar_largo|flexor_superficial_dedos|flexor_cubital_carpo|extensor_radial_carpo|extensor_dedos|extensor_cubital_carpo|aponeurosis_palmar|supraespinoso|infraespinoso|infraespinoso_dorsal|braquial|tenar|hipotenar|interoseos|interoseo_dorsal)_(\d+_)?der$/, 'brazo_derecho'],
  [/^(deltoides|triceps_braquial|biceps_braquial|manguito_rotador|flexor_antebrazo|extensor_antebrazo|tendon_muneca|intrinseco_mano|hombro_profundo|antebrazo_profundo|braquiorradial|flexor_radial_carpo|palmar_largo|flexor_superficial_dedos|flexor_cubital_carpo|extensor_radial_carpo|extensor_dedos|extensor_cubital_carpo|aponeurosis_palmar|supraespinoso|infraespinoso|infraespinoso_dorsal|braquial|tenar|hipotenar|interoseos|interoseo_dorsal)_(\d+_)?izq$/, 'brazo_izquierdo'],
  [/^(vasto_medial|vasto_lateral|vasto_intermedio|recto_femoral|sartorio|gracil|aductor_mayor|aductor_largo|aductor_corto|pectineo|iliopsoas|biceps_femoral|semitendinoso|semimembranoso|popliteo|gastrocnemio_medial|gastrocnemio_lateral|soleo|tibial_posterior|flexor_largo_dedos|tendon_aquiles|intrinseco_pie|tibial_anterior|extensor_largo_dedos|peroneo_largo|peroneo_corto|aponeurosis_plantar|tendon_rotuliano|abductor_dedo_gordo|abductor_menique_pie|interoseo_dorsal_pie|flexor_corto_dedos_pie|pedio|tendon_extensor_gordo_pie|tendon_extensor_indice_pie|tendon_extensor_medio_pie|tendon_extensor_anular_pie|tendon_extensor_menique_pie)_(\d+_)?der$/, 'pierna_derecha'],
  [/^(vasto_medial|vasto_lateral|vasto_intermedio|recto_femoral|sartorio|gracil|aductor_mayor|aductor_largo|aductor_corto|pectineo|iliopsoas|biceps_femoral|semitendinoso|semimembranoso|popliteo|gastrocnemio_medial|gastrocnemio_lateral|soleo|tibial_posterior|flexor_largo_dedos|tendon_aquiles|intrinseco_pie|tibial_anterior|extensor_largo_dedos|peroneo_largo|peroneo_corto|aponeurosis_plantar|tendon_rotuliano|abductor_dedo_gordo|abductor_menique_pie|interoseo_dorsal_pie|flexor_corto_dedos_pie|pedio|tendon_extensor_gordo_pie|tendon_extensor_indice_pie|tendon_extensor_medio_pie|tendon_extensor_anular_pie|tendon_extensor_menique_pie)_(\d+_)?izq$/, 'pierna_izquierda']
];

const REGION_LABEL = {
  craneo: 'la cabeza',
  torso: 'el torso',
  brazo_izquierdo: 'el brazo izquierdo',
  brazo_derecho: 'el brazo derecho',
  pierna_izquierda: 'la pierna izquierda',
  pierna_derecha: 'la pierna derecha'
};

export function getMuscleRegion(rawName) {
  const rest = rawName.startsWith('Musculo_') ? rawName.slice('Musculo_'.length) : rawName;
  const corr = claveCorregida(rest);
  if (corr) {
    const lado = rest.endsWith('_der') ? 'derecha' : 'izquierda';
    const fam = NOMBRE_CORREGIDO[corr];
    return (fam === 'suelo_pelvico' || fam === 'pared_abdominal') ? 'torso' : `pierna_${lado}`;
  }
  for (const [pattern, region] of REGION_PATTERNS) {
    if (pattern.test(rest)) return region;
  }
  return null;
}

export function regionLabel(region) {
  return REGION_LABEL[region] || null;
}

// name = "Musculo_<base>[_<numero>]_<der|izq>" o "Musculo_trapecio".
export function getMuscleMeta(rawName) {
  if (!rawName.startsWith('Musculo_')) {
    return { name: titleCase(rawName), desc: 'Estructura del sistema muscular.' };
  }
  const rest = rawName.slice('Musculo_'.length);

  // cervical_N (1-8): piezas pequeñas del cuello sin lado asignado (no se
  // pudieron distinguir izq/der con certeza al clasificarlas una por una).
  const cervM = rest.match(/^cervical_(\d+)$/);
  if (cervM) {
    return { name: `Músculo cervical ${cervM[1]}`, desc: BASE_NAMES.cervical[1] };
  }

  const m = rest.match(/^(.+?)(?:_(\d+))?_(der|izq)$/);
  if (m) {
    const [, base, num, side] = m;
    const corr = claveCorregida(rest);
    if (corr) {
      const [label, desc] = CORREGIDO_INFO[NOMBRE_CORREGIDO[corr]];
      return { name: `${label} ${SIDE_LABEL[side]}`, desc };
    }
    if (BASE_NAMES[base]) {
      const [label, desc] = BASE_NAMES[base];
      const sideLabel = (BASE_NAMES[base][2] ? SIDE_LABEL_FEM : SIDE_LABEL)[side];
      const numTag = num ? ` ${num}` : '';
      return { name: `${label}${numTag} ${sideLabel}`, desc };
    }
    // Base no reconocida: se muestra igual, con el lado, en vez de perder
    // la pieza silenciosamente.
    return { name: `${titleCase(base)}${num ? ' ' + num : ''} ${SIDE_LABEL[side]}`, desc: 'Músculo del cuerpo humano.' };
  }

  if (BASE_NAMES[rest]) {
    const [label, desc] = BASE_NAMES[rest];
    return { name: label, desc };
  }

  return { name: titleCase(rest), desc: 'Músculo del cuerpo humano.' };
}
