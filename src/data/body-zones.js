// Los modelos reales de músculos, órganos y piel son una sola malla (o unas
// pocas) sin separar por músculo/órgano/región individual — a diferencia del
// esqueleto, que sí trae 14 piezas nombradas. Para poder decir "Bíceps" o
// "Hígado" en vez de solo "Sistema muscular"/"Órganos internos" en cada
// clic, se define un mapa de zonas por posición (en el mismo sistema de
// coordenadas de cuerpo completo que usa glbBodyLoader: pies en ~0, cabeza
// en ~6.6) y se busca la zona más cercana al punto exacto donde cayó el rayo
// del clic. Son las mismas posiciones que usaban las piezas primitivas antes
// de reemplazarlas por los modelos reales.

function zone(name, pos, desc) {
  return { name, pos, desc };
}

export const MUSCLE_ZONES = [
  zone('Pectorales', [0, 5.00, 0.38], 'Músculos del pecho que mueven el brazo y ayudan en la respiración forzada.'),
  zone('Deltoides derecho', [1.00, 4.95, 0.05], 'Músculo del hombro que permite levantar y girar el brazo.'),
  zone('Deltoides izquierdo', [-1.00, 4.95, 0.05], 'Músculo del hombro que permite levantar y girar el brazo.'),
  zone('Bíceps derecho', [1.30, 4.55, 0.12], 'Músculo frontal del brazo encargado de flexionar el codo.'),
  zone('Bíceps izquierdo', [-1.30, 4.55, 0.12], 'Músculo frontal del brazo encargado de flexionar el codo.'),
  zone('Tríceps derecho', [1.30, 4.55, -0.10], 'Músculo posterior del brazo encargado de extender el codo.'),
  zone('Tríceps izquierdo', [-1.30, 4.55, -0.10], 'Músculo posterior del brazo encargado de extender el codo.'),
  zone('Antebrazo derecho', [1.75, 3.95, 0.05], 'Grupo de músculos que mueven la muñeca y los dedos.'),
  zone('Antebrazo izquierdo', [-1.75, 3.95, 0.05], 'Grupo de músculos que mueven la muñeca y los dedos.'),
  zone('Abdominales', [0, 4.05, 0.35], 'Grupo muscular que sostiene la postura y protege los órganos internos.'),
  zone('Oblicuo derecho', [0.30, 4.05, 0.20], 'Músculo lateral del abdomen que permite girar e inclinar el tronco.'),
  zone('Oblicuo izquierdo', [-0.30, 4.05, 0.20], 'Músculo lateral del abdomen que permite girar e inclinar el tronco.'),
  zone('Trapecio', [0, 5.45, -0.15], 'Músculo de la espalda alta y el cuello; estabiliza y mueve los omóplatos.'),
  zone('Dorsal ancho derecho', [0.35, 4.70, -0.25], 'Gran músculo de la espalda que mueve el brazo hacia abajo y atrás.'),
  zone('Dorsal ancho izquierdo', [-0.35, 4.70, -0.25], 'Gran músculo de la espalda que mueve el brazo hacia abajo y atrás.'),
  zone('Glúteos', [0, 3.35, -0.30], 'Los músculos más grandes del cuerpo; estabilizan la cadera y permiten caminar y correr.'),
  zone('Cuádriceps derecho', [0.28, 2.35, 0.15], 'Gran músculo frontal del muslo que extiende la rodilla al caminar o saltar.'),
  zone('Cuádriceps izquierdo', [-0.28, 2.35, 0.15], 'Gran músculo frontal del muslo que extiende la rodilla al caminar o saltar.'),
  zone('Isquiotibiales derechos', [0.28, 2.36, -0.15], 'Músculos posteriores del muslo que flexionan la rodilla y extienden la cadera.'),
  zone('Isquiotibiales izquierdos', [-0.28, 2.36, -0.15], 'Músculos posteriores del muslo que flexionan la rodilla y extienden la cadera.'),
  zone('Pantorrilla derecha', [0.28, 0.885, -0.05], 'Músculo posterior de la pierna que permite pararse de puntillas.'),
  zone('Pantorrilla izquierda', [-0.28, 0.885, -0.05], 'Músculo posterior de la pierna que permite pararse de puntillas.')
];

export const ORGAN_ZONES = [
  zone('Corazón', [-0.10, 4.95, 0.15], 'Bombea la sangre por todo el cuerpo, unas 100.000 veces al día.'),
  zone('Pulmón derecho', [0.32, 4.92, 0.02], 'Permite la respiración, intercambiando oxígeno y dióxido de carbono.'),
  zone('Pulmón izquierdo', [-0.34, 4.90, 0.02], 'Ligeramente más pequeño que el derecho, para dejar espacio al corazón.'),
  zone('Tráquea', [0, 5.55, 0.10], 'Conduce el aire desde la garganta hasta los pulmones.'),
  zone('Esófago', [0, 5.05, -0.08], 'Tubo muscular que transporta el alimento desde la boca hasta el estómago.'),
  zone('Hígado', [0.22, 4.35, 0.15], 'El órgano interno más grande; filtra toxinas y produce la bilis.'),
  zone('Estómago', [-0.22, 4.30, 0.18], 'Mezcla los alimentos con ácidos y enzimas para iniciar la digestión.'),
  zone('Bazo', [-0.42, 4.55, -0.10], 'Filtra la sangre y ayuda al sistema inmunológico a combatir infecciones.'),
  zone('Páncreas', [0.05, 4.15, -0.05], 'Produce insulina y enzimas que regulan el azúcar en sangre y la digestión.'),
  zone('Riñón derecho', [0.32, 4.20, -0.20], 'Filtra la sangre y elimina desechos en forma de orina.'),
  zone('Riñón izquierdo', [-0.32, 4.20, -0.20], 'Filtra la sangre y elimina desechos en forma de orina.'),
  zone('Intestino delgado', [0, 3.85, 0.15], 'Mide unos 6 metros; absorbe la mayoría de los nutrientes de los alimentos.'),
  zone('Intestino grueso', [0, 3.75, 0.10], 'Absorbe agua y forma los desechos sólidos antes de su eliminación.'),
  zone('Vejiga', [0, 3.30, 0.10], 'Almacena la orina producida por los riñones hasta su expulsión.')
];

export const SKIN_ZONES = [
  zone('Cabeza', [0, 6.18, 0], 'Alberga el cerebro y los principales órganos de los sentidos: vista, oído, olfato y gusto.'),
  zone('Ojo derecho', [0.15, 6.22, 0.36], 'Órgano de la visión: capta la luz y la convierte en señales nerviosas.'),
  zone('Ojo izquierdo', [-0.15, 6.22, 0.36], 'Órgano de la visión: capta la luz y la convierte en señales nerviosas.'),
  zone('Nariz', [0, 6.08, 0.40], 'Permite respirar y percibir olores; filtra y humedece el aire inhalado.'),
  zone('Boca', [0, 5.94, 0.39], 'Entrada del sistema digestivo; interviene en la masticación, el habla y la respiración.'),
  zone('Oreja derecha', [0.42, 6.18, 0], 'Capta el sonido y ayuda a mantener el equilibrio del cuerpo.'),
  zone('Oreja izquierda', [-0.42, 6.18, 0], 'Capta el sonido y ayuda a mantener el equilibrio del cuerpo.'),
  zone('Cuello', [0, 5.60, 0], 'Conecta la cabeza con el tronco y protege la tráquea, el esófago y vasos sanguíneos clave.'),
  zone('Torso', [0, 4.90, 0], 'Región central del cuerpo que protege el corazón y los pulmones.'),
  zone('Abdomen', [0, 4.05, 0], 'Contiene los órganos de la digestión, como el estómago, el hígado y los intestinos.'),
  zone('Hombro derecho', [0.72, 5.40, 0], 'Articulación que une el brazo con el tronco; es la más móvil del cuerpo.'),
  zone('Hombro izquierdo', [-0.72, 5.40, 0], 'Articulación que une el brazo con el tronco; es la más móvil del cuerpo.'),
  zone('Brazo derecho', [1.30, 4.55, 0.05], 'Va del hombro al codo; contiene el húmero y el músculo bíceps.'),
  zone('Brazo izquierdo', [-1.30, 4.55, 0.05], 'Va del hombro al codo; contiene el húmero y el músculo bíceps.'),
  zone('Antebrazo derecho', [1.75, 3.95, 0.05], 'Va del codo a la muñeca y permite girar la mano.'),
  zone('Antebrazo izquierdo', [-1.75, 3.95, 0.05], 'Va del codo a la muñeca y permite girar la mano.'),
  zone('Mano derecha', [2.10, 3.35, 0.08], 'Formada por 27 huesos; permite agarrar y manipular objetos con precisión.'),
  zone('Mano izquierda', [-2.10, 3.35, 0.08], 'Formada por 27 huesos; permite agarrar y manipular objetos con precisión.'),
  zone('Cadera', [0, 3.45, 0], 'Une el tronco con las piernas y sostiene el peso del cuerpo al caminar.'),
  zone('Muslo derecho', [0.28, 2.36, 0], 'Va de la cadera a la rodilla; contiene el hueso más largo del cuerpo, el fémur.'),
  zone('Muslo izquierdo', [-0.28, 2.36, 0], 'Va de la cadera a la rodilla; contiene el hueso más largo del cuerpo, el fémur.'),
  zone('Pierna derecha', [0.28, 0.885, 0], 'Va de la rodilla al tobillo; contiene la tibia y el peroné.'),
  zone('Pierna izquierda', [-0.28, 0.885, 0], 'Va de la rodilla al tobillo; contiene la tibia y el peroné.'),
  zone('Pie derecho', [0.28, 0.11, 0.18], 'Formado por 26 huesos; distribuye el peso del cuerpo y permite el equilibrio.'),
  zone('Pie izquierdo', [-0.28, 0.11, 0.18], 'Formado por 26 huesos; distribuye el peso del cuerpo y permite el equilibrio.')
];

export const ZONES_BY_LAYER = { musculo: MUSCLE_ZONES, organo: ORGAN_ZONES, piel: SKIN_ZONES };

export function nearestZone(zones, point) {
  let best = zones[0];
  let bestDist = Infinity;
  for (const z of zones) {
    const dx = point.x - z.pos[0];
    const dy = point.y - z.pos[1];
    const dz = point.z - z.pos[2];
    const d = dx * dx + dy * dy + dz * dz;
    if (d < bestDist) {
      bestDist = d;
      best = z;
    }
  }
  return best;
}
