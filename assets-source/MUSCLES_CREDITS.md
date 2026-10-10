# Créditos — public/models/{male,female}/muscles.glb

## Masculino (actual)
Modelo: **"Myology"**
Autor: **Z-Anatomy** (Sketchfab)
Licencia: **CC Attribution-ShareAlike (CC BY-SA 4.0)**
Fuente: https://sketchfab.com/z-anatomy

Modelo real de anatomía (no un sculpt artístico) con 138 mallas separadas por
material, procesadas en Blender: se corrigieron piezas que en el archivo
original nunca quedaron separadas del todo (import → 341 músculos reales) y
se clasificó cada uno individualmente (nombre y descripción en español, ver
`src/data/muscle-metadata.js`). Al ser CC BY-SA, cualquier redistribución de
los archivos `.glb` derivados debe mantener la misma licencia, además del
crédito visible al autor.

## Masculino (anterior, reemplazado)
Modelo: **"Male Full Body Ecorche"**
Autor: **diegoluga** (Sketchfab)
Licencia: **CC Attribution (CC-BY 4.0)**
Fuente: https://sketchfab.com/3d-models/male-full-body-ecorche-ab11ebff89224f03bd75efede1164cf6

## Femenino
Modelo: **"Female Body Muscular System - Anatomy Study"**
Autor: **ruslangadzhiev** (Sketchfab)
Licencia: **CC Attribution (CC-BY 4.0)**
Fuente: https://sketchfab.com/3d-models/female-body-muscular-system-anatomy-study-9a596b6c24b344bfbe6bb5246290df0e

Este modelo no traía textura de color (solo escultura sin material) — se le armó
un material rojo muscular con subsurface scattering leve en Blender antes de
exportar, por lo que no tiene el mismo detalle de tendones/fascia pintados a
mano que la versión masculina.

La licencia CC-BY exige dar crédito visible al autor en cualquier uso público de la app
(junto con el crédito del esqueleto, ver `SKELETON_CREDITS.md`).

Este modelo trae 16 piezas (sculpt de ZBrush, sin nombres por grupo muscular individual),
14 de ellas con texturas propias (baseColor + normal). Como no vienen separadas ni
etiquetadas por músculo, todas comparten la misma etiqueta genérica "Sistema muscular"
al seleccionarlas (ver `src/layers/muscles.js`) — a diferencia del esqueleto, que sí
tiene 14 regiones nombradas individualmente.

Texturas reescaladas de 1024px a 512px antes de exportar para bajar el peso del .glb
(de ~9.9MB a ~2.8MB) sin pérdida notable a la distancia de visualización normal del visor.
