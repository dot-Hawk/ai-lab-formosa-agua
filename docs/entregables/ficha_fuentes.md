# Ficha de fuentes · AI LAB Misión: Código Formosa
Herramienta: Operación Agua · Comparador de imágenes satelitales · Equipo: Equipo 1, Instituto Politécnico Formosa

Cada cifra, umbral, serie o capa que la herramienta muestra, con su fuente y su categoría. Regla: si no está acá, no se muestra.

## Imágenes satelitales

Todas las escenas comparten satélite (Sentinel-2), producto (L2A), tile (21JUM), resolución (10 m) y recorte (de −58,18 a −58,11 de longitud y de −26,24 a −26,17 de latitud; 700 × 780 píxeles). Se descargaron el 20/11/2026 con `apps/backend/scripts/descargar_escenas.py`.

| Qué muestra la herramienta | Valor o rango | Fuente (archivo del kit o URL) | Categoría | Fecha del dato |
|---|---|---|---|---|
| Escena 21/06/2019 (bandas B03 y B08) | Nubes en el recorte: 0 % · sin dato: 0 % | [S2B_21JUM_20190621_1_L2A](https://earth-search.aws.element84.com/v1/collections/sentinel-2-l2a/items/S2B_21JUM_20190621_1_L2A) · `apps/backend/data/escenas/s2-2019-06-21.npz` | Observado | 21/06/2019 |
| Escena 13/11/2024 (bandas B03 y B08) | Nubes en el recorte: 0 % · sin dato: 0,1 % | [S2A_21JUM_20241113_0_L2A](https://earth-search.aws.element84.com/v1/collections/sentinel-2-l2a/items/S2A_21JUM_20241113_0_L2A) · `s2-2024-11-13.npz` | Observado | 13/11/2024 |
| Escena 02/10/2026 (bandas B03 y B08) | Nubes en el recorte: 0 % · sin dato: 0 % | [S2B_21JUM_20261002_0_L2A](https://earth-search.aws.element84.com/v1/collections/sentinel-2-l2a/items/S2B_21JUM_20261002_0_L2A) · `s2-2026-10-02.npz` | Observado | 02/10/2026 |
| Escena 26/10/2026 (bandas B03 y B08) | Nubes en el recorte: 20,1 % (9,2 % en la escena completa) · sin dato: 25,2 % | [S2A_21JUM_20261026_0_L2A](https://earth-search.aws.element84.com/v1/collections/sentinel-2-l2a/items/S2A_21JUM_20261026_0_L2A) · `s2-2026-10-26.npz` | Observado | 26/10/2026 |
| Máscara de nubes y sombras | Píxeles excluidos del cálculo | Banda SCL (clasificación de escena) de cada producto L2A | Observado (clasificación de ESA) | Igual que cada escena |
| Metadatos de cada escena (fecha, satélite, producto, nubes, URL) | Ver filas anteriores | `apps/backend/data/escenas/catalogo.json` | Observado | Consulta del 20/11/2026 |

## Resultados calculados por la herramienta

No son datos observados: son estimaciones que la herramienta calcula a partir de las imágenes. En pantalla figuran como resultado del cálculo, junto al umbral usado.

| Qué muestra la herramienta | Valor o rango | Cómo se obtiene | Categoría | Fecha del dato |
|---|---|---|---|---|
| Índice de agua NDWI | −1 a 1 | (B03 − B08) / (B03 + B08), en `apps/backend/app/cambio.py` | Estimado (cálculo) | Igual que cada escena |
| Umbral de agua | 0 por defecto; ajustable de −1 a 1 | Valor habitual para NDWI (McFeeters, 1996). Lo elige el usuario | Referencia metodológica | — |
| Agua nueva / agua que ya no está, 02/10/2026 → 26/10/2026 | 110,64 ha / 43,25 ha | Píxeles que cambian de clase × 0,01 ha (10 m × 10 m) | Estimado (cálculo) | Consulta del 20/11/2026 |
| Agua nueva / agua que ya no está, 13/11/2024 → 21/06/2019 | 1.097,89 ha / 11,47 ha | Ídem | Estimado (cálculo) | Consulta del 20/11/2026 |
| Agua nueva / agua que ya no está, 13/11/2024 → 26/10/2026 | 287,31 ha / 40,58 ha | Ídem | Estimado (cálculo) | Consulta del 20/11/2026 |

## Río Paraguay en Puerto Formosa

| Qué muestra la herramienta | Valor o rango | Fuente (archivo del kit o URL) | Categoría | Fecha del dato |
|---|---|---|---|---|
| Nivel de aguas bajas · Puerto Formosa | 1,60 m | K3 · `apps/backend/data/K3_estaciones_umbrales.json` | Observado (umbral oficial INA) | Consultado el 29/10/2026 |
| Nivel de alerta · Puerto Formosa | 7,80 m | K3 · ídem | Observado (umbral oficial INA) | Consultado el 29/10/2026 |
| Nivel de evacuación · Puerto Formosa | 8,30 m | K3 · ídem | Observado (umbral oficial INA) | Consultado el 29/10/2026 |
| Altura del río el 21/06/2019 | 9,08 m (1 lectura) | K1 limpio · `apps/backend/data/niveles_formosa_limpio.csv` | Observado | 21/06/2019 |
| Altura del río el 13/11/2024 | −0,62 m (1 lectura, bajante) | K1 limpio · ídem | Observado | 13/11/2024 |
| Altura del río el 02/10/2026 | 2,35 m (1 lectura) | K1 limpio · ídem | Observado | 02/10/2026 |
| Altura del río el 26/10/2026 | 5,44 m (1 lectura) | K1 limpio · ídem | Observado | 26/10/2026 |
| Serie diaria de altura | 01/01/2006 al 31/10/2026 · 7.478 días · máximo 9,80 m (06/01/2016) | K1 (`P1_DATA_INTEGRITY_dataset_participantes_v1.csv`) limpiado con `scripts/limpiar_k1.py` | Observado (con limpieza documentada) | Corte 31/10/2026 |
| "Sin dato" en días faltantes | 131 días sin lectura, no interpolados | [registro_limpieza.md](registro_limpieza.md) | — | — |

Tratamiento aplicado a K1: ver [registro_limpieza.md](registro_limpieza.md).

## Mapa de fondo

| Qué muestra la herramienta | Valor o rango | Fuente | Categoría | Fecha del dato |
|---|---|---|---|---|
| Mapa base | Calles, localidades y ríos | Teselas de OpenStreetMap (https://tile.openstreetmap.org, © colaboradores de OpenStreetMap), en `apps/frontend/src/components/MapaCambios.jsx` | Base cartográfica de referencia | Consulta en vivo |

## Fuentes externas usadas (URL y fecha de consulta)
- Earth Search, catálogo STAC de Sentinel-2 L2A (Element84, AWS Open Data): https://earth-search.aws.element84.com/v1/collections/sentinel-2-l2a, consultado el 20/11/2026.
- Programa Copernicus, Sentinel-2 (ESA, Unión Europea): https://browser.dataspace.copernicus.eu, citado en la guía del desafío (relevamiento del CITF del 16/11/2026).
- INA, Sistema de Información y Alerta Hidrológico, catálogo de estaciones: https://alerta.ina.gob.ar/pub/datos/estaciones&format=json, consultado el 29/10/2026 (kit K3).
- El Monterizo, 17/9/2026: esquema preventivo provincial por El Niño con inspección satelital de riachos (citado en la guía del desafío).
- OpenStreetMap, teselas del mapa de fondo: https://tile.openstreetmap.org, consulta en vivo al usar la herramienta.
- McFeeters, S. K. (1996). *The use of the Normalized Difference Water Index (NDWI) in the delineation of open water features*. International Journal of Remote Sensing, 17(7), 1425–1432 (referencia metodológica del NDWI).

La máscara de nubes excluye las clases SCL 0 (sin dato), 1 (saturado), 3 (sombra de nube), 8 y 9 (nube de probabilidad media y alta) y 10 (cirros), según `apps/backend/scripts/descargar_escenas.py`.
