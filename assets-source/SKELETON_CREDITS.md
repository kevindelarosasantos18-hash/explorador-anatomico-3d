# Créditos — public/models/{male,female}/skeleton.glb

Modelos: **"Male Skeleton"** y **"Female Skeleton"**
Autor: **project_kaizen** (Sketchfab), mismo autor para ambos
Licencia: **CC Attribution (CC-BY 4.0)**
Fuente: https://sketchfab.com/3d-models/male-skeleton-11b57ebfcf6c4e3b88d0cbe618ee70a7

Las dos versiones comparten exactamente la misma geometría (mismo conteo de
vértices pieza por pieza) — solo cambia la altura de exportación (1.7m vs
1.6m). Los nombres de malla del femenino llevan un prefijo "F_" (F_Cranium,
F_Spine...) para no chocar con el masculino mientras convivían en la misma
escena de Blender; `bone-metadata.js` lo quita antes de buscar en `EXACT_NAMES`.

La licencia CC-BY exige dar crédito visible al autor en cualquier uso público de la app
(por ejemplo, en una sección "Créditos" o "Acerca de").

Reemplazó al esqueleto procedural anterior (`esqueleto-humano.obj`/`.mtl`, conservado
en esta carpeta como referencia/fallback) por pedido explícito de mejorar el realismo
visual — el modelo anterior tenía huesos correctamente nombrados uno por uno (303 piezas)
pero formas muy simplificadas (cráneo con maxilar/mandíbula como cajas y tubos).

El modelo de Sketchfab trae 14 piezas agrupadas por región (no 303 huesos individuales):
Cranium, Mandible, UpperTeeth, LowerTeeth, Hyoid, Spine, Discs, Ribs, Sternum,
RibCartilage, Sacrum, HipCartilage, HipsLegs, ArmsHands — con texturas propias
(baseColor JPEG por pieza). Los nombres y descripciones en español están en
`src/data/bone-metadata.js` (diccionario `EXACT_NAMES`).
