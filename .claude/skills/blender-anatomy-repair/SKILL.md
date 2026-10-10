---
name: blender-anatomy-repair
description: >
  Técnicas probadas de automatización de Blender (vía BlenderMCP/execute_blender_code
  y bpy/bmesh/mathutils) para diagnosticar y reparar mallas 3D desarticuladas,
  fusionadas o mal ensambladas — esqueletos, órganos, músculos, o cualquier asset
  con muchas piezas que deben encajar entre sí. Usar SIEMPRE que el usuario reporte
  que partes de un modelo 3D "no encajan", "están separadas", "se ven mal
  ensambladas", "tienen huecos", "se atraviesan" (clipping), o que un asset
  descargado (Sketchfab u otro) tenga geometría sospechosa de estar fusionada o
  con basura tras separar por "loose parts". También usar cuando haya que verificar
  visualmente el resultado de una malla exportada sin depender de capturas de
  viewport de Blender (que pueden no ser confiables). Cubre: diagnóstico de
  fusión/basura, cierre de huecos entre piezas vía distancia real de superficie
  (BVH), relajación iterativa para muchos fragmentos, y cuándo abandonar el
  reposicionamiento y restaurar la geometría desde la fuente original.
compatibility: Requiere BlenderMCP conectado (execute_blender_code) y un servidor
  de desarrollo local para el visor HTML de verificación.
---

# Reparación de mallas anatómicas en Blender

Este skill nace de reparar un esqueleto humano en Blender cuyo cráneo, después de
mucho trabajo de reposicionamiento, seguía viéndose roto — hasta descubrir que la
cara nunca había sido separada en huesos reales: eran fragmentos rasgados sin forma
anatómica. Ningún ajuste de posición podía arreglar eso, porque el problema no era
dónde estaban las piezas sino qué eran. La lección central de este skill es esa:
**antes de invertir tiempo reposicionando geometría, diagnosticar si el problema es
de posición (arreglable) o de forma (no arreglable sin la fuente original)**.

## Cómo pensar el problema

Cuando el usuario dice que un modelo "no encaja", hay tres causas posibles, en
orden de qué tan fácil es arreglarlas:

1. **Hueco entre piezas que deberían tocarse** (una articulación, una costura) —
   se arregla trasladando una pieza hacia la otra. Ver [Detectar y cerrar huecos](#3-detectar-y-cerrar-huecos-entre-piezas).
2. **Una pieza "fusionada"**: lo que parece un objeto es en realidad decenas de
   fragmentos sueltos (algunos basura, algunos reales) nunca separados de verdad
   al exportar el asset original. Se ve como "confeti" o una nube de trozos que no
   forman una superficie continua. Se arregla separando, filtrando basura y
   reuniendo. Ver [Diagnosticar fusión](#1-diagnosticar-fusion-y-basura) y
   [Limpiar fusión](#2-limpiar-una-pieza-fusionada).
3. **Geometría sin forma anatómica reconocible** — un fragmento que, aislado, no
   se parece a ningún hueso/órgano real (bordes rasgados, forma arbitraria). Esto
   pasa cuando el asset original nunca tuvo esa pieza separada correctamente — fue
   partido con un corte automático que no respeta la anatomía real. **Ningún
   algoritmo de reposicionamiento arregla esto**, porque no hay nada correcto que
   reposicionar. La única solución real es recuperar esa pieza de la fuente
   original sin desarticular. Ver [Restaurar desde la fuente original](#4-restaurar-desde-la-fuente-original-cuando-la-forma-esta-rota).

Diagnosticá con los scripts de la sección 1 antes de decidir cuál de los tres
casos tenés — el síntoma visual ("se ve mal") es el mismo para los tres, pero el
arreglo es completamente distinto.

## 1. Diagnosticar fusión y basura

Antes de tocar nada, revisá CADA objeto sospechoso (o, mejor, todos los objetos
de la región problemática) contando cuántas "islas" (fragmentos desconectados por
aristas) contiene. Un objeto real y limpio tiene 1 isla (o unas pocas, si el
asset legítimamente separa una pieza en sub-partes simétricas). Un objeto con
decenas o cientos de islas, muchas de ellas diminutas (<50 vértices), casi
siempre es una pieza que el asset original nunca separó de verdad.

Ver `references/diagnostico.py` para el script completo de conteo de islas +
reporte de bounding box/centroide por objeto. Ejecutalo sobre TODOS los objetos
de la región sospechosa antes de asumir cuál es el problema — en este proyecto,
auditar así el esqueleto completo (no solo la parte que el usuario señaló) reveló
que 39 de 40 "huesos faciales" tenían este bug, cuando el usuario solo había
notado el síntoma en la mandíbula.

**Qué buscar en el resultado:**
- 1 isla, 0 basura → objeto sano, no tocar.
- Pocas islas (2-5), todas grandes, 0 basura → probablemente una división legítima
  del asset (ej. dos mitades simétricas que se tocan en la línea media). Confirmar
  con el chequeo de huecos (sección 3) antes de asumir que está mal.
- Muchas islas, con basura (<50 vértices) mezclada con fragmentos grandes → fusión
  real. Ir a la sección 2.
- Todas las islas son basura (ningún fragmento grande) → el objeto entero es
  basura, se puede eliminar sin perder nada real.

## 2. Limpiar una pieza fusionada

Patrón: separar por partes sueltas, filtrar por umbral de vértices, reunir los
fragmentos reales bajo el nombre original (así no hay que tocar código que
referencia ese nombre en la app).

Ver `references/limpieza.py` para la función completa (`clean_fused_object`).
Uso típico:

```python
for name in ['Pieza_A', 'Pieza_B', 'Pieza_C']:
    print(clean_fused_object(name, min_verts=50))
```

**El umbral de 50 vértices es un punto de partida, no una regla fija** — ajustalo
mirando la distribución real de tamaños de isla que reportó el diagnóstico. Si hay
un salto claro entre "fragmentos chicos" y "fragmentos grandes" en los números,
poné el umbral en ese salto.

**Trampa a evitar**: si el objeto fusionado ya tenía variantes con sufijo de punto
(`Pieza_A`, `Pieza_A.001`, `Pieza_A.002`...) de una separación previa, el patrón
`name + '.'` para encontrar "los fragmentos que acabo de separar" también va a
capturar esas variantes preexistentes y fusionarlas todas juntas. Esto no es
necesariamente malo (en este proyecto no perdió información porque esas variantes
compartían la misma descripción genérica en la app), pero confirmá que fusionar
esos nombres no rompe algo que dependía de que fueran objetos distintos.

## 3. Detectar y cerrar huecos entre piezas

**No uses bounding boxes para medir si dos piezas se tocan** — dan falsos
positivos y negativos todo el tiempo (dos cajas se pueden superponer sin que las
superficies reales se toquen, o parecer separadas cuando en realidad casi tocan).
Usá `mathutils.bvhtree.BVHTree` para la distancia real punto-a-superficie más
cercana entre dos objetos. Ver `references/huecos.py` para las funciones
`make_bvh`, `min_dist` (solo medir) y `gap_vector` (medir + devolver el vector
exacto para cerrar el hueco).

Flujo típico:

1. Medí todas las articulaciones/costuras relevantes de una pasada (no solo la
   que el usuario mencionó — en este proyecto, medir *todas* las articulaciones
   grandes del esqueleto de una vez reveló 3 huecos que nadie había reportado
   todavía).
2. Para cada hueco por encima de un umbral razonable (ajustá según la escala del
   asset — unos 10-15mm en un cuerpo humano a escala real suele ser el punto
   donde algo se nota visualmente), calculá el vector con `gap_vector`.
3. Trasladá TODA la cadena de piezas dependientes de la pieza móvil por ese
   vector — no solo la pieza que tocaste. Si movés la mano para cerrar la
   muñeca, movés mano+dedos completos, no solo el hueso del carpo más cercano al
   antebrazo, o vas a abrir un hueco nuevo entre el carpo y los metacarpianos.

**Efecto secundario a vigilar**: si en algún momento *escalaste* una pieza hacia
su propio centroide (por ejemplo, para que no sobresalga de una capa de piel/
músculo), el centroide casi nunca coincide exactamente con el punto de contacto
real con la pieza vecina — escalar así puede alejar la superficie articular y
crear un hueco nuevo donde antes no había ninguno. Si hiciste un ajuste de escala
en alguna pieza, volvé a correr el chequeo de huecos en TODAS sus articulaciones
después, no asumas que sigue bien.

## 4. Relajación iterativa (muchos fragmentos pequeños)

Cuando el problema no es una sola articulación sino muchos fragmentos chicos que
deberían formar una superficie continua (ej. la base de un cráneo hecha de
decenas de huesitos), cerrar hueco por hueco a mano no escala. Usá una relajación
iterativa: cada fragmento se acerca un poco a su vecino real más cercano, se
repite varias veces.

Ver `references/relajacion.py` para el algoritmo completo. Puntos clave:

- Para no comparar cada fragmento contra TODOS los demás (carísimo), primero
  filtrá candidatos baratos por distancia de centro de bounding box (los ~4 más
  cercanos alcanzan en la práctica) y solo ahí calculá la distancia BVH real.
- Un damping de ~0.5 (mover la mitad del hueco detectado por iteración) con
  ~10 iteraciones converge bien sin oscilar.
- **No amplíes el pool de candidatos a "todos los objetos"** pensando que da más
  precisión — en este proyecto eso multiplicó tanto el costo (fragmentos × todos
  los candidatos × muestras de vértices, por iteración) que la conexión con
  Blender se cortó por timeout. Si un fragmento converge a un vecino raro con 4
  candidatos, es más barato revisarlo a mano después que ampliar la búsqueda para
  todos.
- Un fragmento que converge lejos de la masa principal (mala geometría de
  vecinos candidatos) suele ser señal de que ese fragmento en particular está mal
  identificado/etiquetado, no solo mal posicionado — vale la pena aislarlo y
  mirarlo (sección 5) antes de forzarlo a encajar en cualquier lado.

## 5. Restaurar desde la fuente original (cuando la forma está rota)

Si aislás un fragmento sospechoso (filtrando el visor de depuración a solo ese
nombre, sección 6) y no se parece a nada anatómicamente reconocible — un pedazo
rasgado sin silueta de hueso/órgano real — dejá de intentar reposicionarlo.
Ninguna traslación, escala o relajación puede arreglar una forma que está mal de
origen.

En su lugar, si el asset viene de una fuente descargable (Sketchfab u otra), volvé
a descargar el modelo ORIGINAL, antes de que nadie lo desarticulara, y extraé de
ahí la pieza limpia:

1. Descargá de nuevo con el mismo identificador del asset (ej.
   `download_sketchfab_model` con el mismo UID que se usó la primera vez —
   revisá el archivo de créditos del proyecto, suele tener la fuente documentada).
2. La descarga trae objetos con nombres genéricos (`Object_6`, `Object_7`...). Identificalos por conteo de vértices/bounding box comparando contra piezas ya
   conocidas (ej. si una pieza de referencia ya usada en el proyecto tiene
   exactamente 2023 vértices, buscá cuál de los `Object_N` nuevos tiene ese mismo
   conteo — es la misma geometría fuente).
3. **Paso crítico que se olvida fácil**: los objetos recién descargados vienen
   con un padre (un nodo raíz del import). Antes de tocar sus vértices o
   exportarlos junto a otros objetos, corré:
   ```python
   bpy.ops.object.parent_clear(type='CLEAR_KEEP_TRANSFORM')
   bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
   ```
   Si te salteás esto, el exportador glTF ignora la transformación del padre al
   exportar el hijo solo, y la pieza aparece en una posición completamente
   distinta a la esperada aunque midas bien en Python (world matrix correcto
   dentro de Blender, pero mal en el archivo exportado).
4. **Escala**: la descarga fresca normaliza el tamaño total del modelo descargado
   a un `target_size` que vos elegís — casi nunca coincide exactamente con la
   altura real del asset ya en uso en tu escena. Calculá el factor de corrección
   como `altura_real_del_asset_en_uso / target_size_de_la_descarga` y aplicalo
   como escala uniforme desde el origen — si ambos assets comparten convención de
   origen (ej. X=0 centrado, pies en Z/Y=0), esto alinea todo sin necesitar
   traslación manual. Confirmalo verificando con BVH (sección 3) que la pieza
   nueva encaja con sus vecinas ya existentes.
5. Reemplazá el objeto roto por el nuevo, reusando el nombre que ya esperaba el
   código de la app (así no hace falta tocar mapeos de nombre→descripción).

## 6. Verificación visual: visor HTML standalone

`get_viewport_screenshot` de BlenderMCP puede no ser confiable (renders en blanco
sin causa clara). El patrón que sí funciona: un visor HTML standalone con
three.js que carga el `.glb` ya exportado, con click-to-identify (raycaster que
reporta nombre de objeto + punto de impacto en coordenadas mundiales) y un
parámetro `?filter=Nombre1,Nombre2` para aislar visualmente un subconjunto de
piezas por substring de nombre.

El archivo completo está en `references/debug-viewer.html` — copialo a la raíz
del proyecto (al lado de donde corre el servidor de desarrollo), y abrilo con
`http://localhost:<puerto>/debug-viewer.html?model=<ruta-relativa-al-glb>&filter=...`.
Es un archivo de trabajo, no un artefacto del proyecto — borralo cuando termines
de diagnosticar, no lo dejes commiteado.

**Antes de exportar sobre el archivo de producción**: exportá primero a un
archivo separado (ej. `_debug_nombre.glb` al lado de los assets reales),
verificalo con el visor Y con una medición BVH, y recién ahí copialo sobre el
archivo real — con una copia de respaldo del original si el archivo ya estaba en
uso por la app. Revertir un archivo de producción pisado a medias es mucho más
molesto que confirmar antes de pisarlo.

## Advertencias generales

- **No purgues/borres por nombre de colección de Blender sin revisar qué contiene
  primero.** `'Collection'` es el nombre por defecto de la colección raíz en
  Blender — no asumas que un nombre así identifica basura huérfana. Si necesitás
  limpiar objetos sueltos de sesiones/importaciones anteriores, identificalos por
  patrón de NOMBRE de objeto (ej. `re.match(r'^Object_\d+$', o.name)` para
  nombres genéricos de un import sin procesar), nunca por colección completa.
- **Vigilá el tamaño del archivo exportado.** Si el asset tiene un límite de
  tamaño práctico (revisá la configuración de build/precache del proyecto),
  una textura recién descargada puede venir a una resolución mucho mayor (ej.
  2048px) que el resto de texturas del asset (ej. 1024px) — si el archivo
  exportado se pasa del límite, achicá la imagen nueva a la misma resolución que
  las demás (`img.scale(w, h)` + `img.pack()`) antes de re-exportar.
- **Un ajuste puntual puede tener efectos secundarios en otro lado.** Después de
  cualquier arreglo, volvé a correr los chequeos de la sección 1 y 3 sobre el
  objeto que tocaste Y sobre sus piezas vecinas, no solo sobre el problema
  original — varios de los huecos reales en este proyecto fueron causados sin
  querer por un arreglo anterior, no por el asset original.
