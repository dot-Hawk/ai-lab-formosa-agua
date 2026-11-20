# Ficha de fuentes · AI LAB Misión: Código Formosa
Herramienta: Operación Agua · Comparador de imágenes satelitales · Equipo: Equipo 1, Instituto Politécnico Formosa

Cada cifra, umbral, serie o capa que la herramienta muestra, con su fuente y su categoría. Regla: si no está acá, no se muestra.

## Imágenes satelitales

Todas las escenas comparten satélite (Sentinel-2), producto (L2A), tile (21JUM), resolución (10 m) y recorte (de −58,18 a −58,11 de longitud y de −26,24 a −26,17 de latitud; 700 × 780 píxeles). Se descargaron el 20/11/2026 con `apps/backend/scripts/descargar_escenas.py`.

| Qué muestra la herramienta | Valor o rango | Fuente (archivo del kit o URL) | Categoría | Fecha del dato |
|---|---|---|---|---|
| Escena 21/06/2019 (bandas B03 y B08) | Nubes en el recorte: 0 % · sin dato: 0 % | [S2B_21JUM_20190621_1_L2A](https://earth-search.aws.element84.com/v1/collections/sentinel-2-l2a/items/S2B_21JUM_20190621_1_L2A) · `apps/backend/data/escenas/s2-2019-06-21.npz` | Observado | 21/06/2019 |
| Escena 13/11/2024 (bandas B03 y B08) | Nubes en el recorte: 0 % · sin dato: 0,1 % | [S2A_21JUM_20241113_0_L2A](https://earth-search.aws.element84.com/v1/collections/sentinel-2-l2a/items/S2A_21JUM_20241113_0_L2A) · `s2-2024-11-13.npz` | Observado | 13/11/2024 |
| Escena 18/01/2021 (bandas B03 y B08) | Nubes en el recorte: 0 % · sin dato: 1,2 % | [S2B_21JUM_20210118_1_L2A](https://earth-search.aws.element84.com/v1/collections/sentinel-2-l2a/items/S2B_21JUM_20210118_1_L2A) · `s2-2021-01-18.npz` | Observado | 18/01/2021 |
| Escena 07/02/2021 (bandas B03 y B08) | Nubes en el recorte: 0 % · sin dato: 1,6 % | [S2B_21JUM_20210207_1_L2A](https://earth-search.aws.element84.com/v1/collections/sentinel-2-l2a/items/S2B_21JUM_20210207_1_L2A) · `s2-2021-02-07.npz` | Observado | 07/02/2021 |
| Escena 24/11/2022 (bandas B03 y B08) | Nubes en el recorte: 0,1 % · sin dato: 5,9 % | [S2A_21JUM_20221124_0_L2A](https://earth-search.aws.element84.com/v1/collections/sentinel-2-l2a/items/S2A_21JUM_20221124_0_L2A) · `s2-2022-11-24.npz` | Observado | 24/11/2022 |
| Escena 14/12/2022 (bandas B03 y B08) | Nubes en el recorte: 0,1 % · sin dato: 1,4 % | [S2A_21JUM_20221214_0_L2A](https://earth-search.aws.element84.com/v1/collections/sentinel-2-l2a/items/S2A_21JUM_20221214_0_L2A) · `s2-2022-12-14.npz` | Observado | 14/12/2022 |
| Escena 02/10/2026 (bandas B03 y B08) | Nubes en el recorte: 0 % · sin dato: 0 % | [S2B_21JUM_20261002_0_L2A](https://earth-search.aws.element84.com/v1/collections/sentinel-2-l2a/items/S2B_21JUM_20261002_0_L2A) · `s2-2026-10-02.npz` | Observado | 02/10/2026 |
| Escena 26/10/2026 (bandas B03 y B08) | Nubes en el recorte: 20,1 % (9,2 % en la escena completa) · sin dato: 25,2 % | [S2A_21JUM_20261026_0_L2A](https://earth-search.aws.element84.com/v1/collections/sentinel-2-l2a/items/S2A_21JUM_20261026_0_L2A) · `s2-2026-10-26.npz` | Observado | 26/10/2026 |
| Máscara de nubes y sombras | Píxeles excluidos del cálculo | Banda SCL (clasificación de escena) de cada producto L2A | Observado (clasificación de ESA) | Igual que cada escena |
| Metadatos de cada escena (fecha, satélite, producto, nubes, URL) | Ver filas anteriores | `apps/backend/data/escenas/catalogo.json` | Observado | Consulta del 20/11/2026 |
| Hora de captura (UTC; en pantalla, hora de Argentina) | 21/06/2019 14:09 · 13/11/2024 13:59 · 02/10/2026 14:09 · 26/10/2026 13:59 (UTC) | Propiedad `datetime` del ítem STAC de cada escena (`scripts/completar_metadatos.py`) | Observado (metadato) | Consulta del 20/11/2026 |
| Elevación del sol | 34,5° (21/06/2019) · 66,0° (13/11/2024) · 58,6° (02/10/2026) · 63,5° (26/10/2026) | Propiedad `view:sun_elevation` del ítem STAC | Observado (metadato) | Consulta del 20/11/2026 |

## Resultados calculados por la herramienta

No son datos observados: son estimaciones que la herramienta calcula a partir de las imágenes. En pantalla figuran como resultado del cálculo, junto al umbral usado.

| Qué muestra la herramienta | Valor o rango | Cómo se obtiene | Categoría | Fecha del dato |
|---|---|---|---|---|
| Índice de agua NDWI | −1 a 1 | (B03 − B08) / (B03 + B08), en `apps/backend/app/cambio.py` | Estimado (cálculo) | Igual que cada escena |
| Umbral de agua | 0 por defecto; ajustable de −1 a 1 | Valor habitual para NDWI (McFeeters, 1996). Lo elige el usuario | Referencia metodológica | — |
| Agua nueva / agua que ya no está, 02/10/2026 → 26/10/2026 | 110,64 ha / 43,25 ha | Píxeles que cambian de clase × 0,01 ha (10 m × 10 m) | Estimado (cálculo) | Consulta del 20/11/2026 |
| Agua nueva / agua que ya no está, 13/11/2024 → 21/06/2019 | 1.097,89 ha / 11,47 ha | Ídem | Estimado (cálculo) | Consulta del 20/11/2026 |
| Agua nueva / agua que ya no está, 13/11/2024 → 26/10/2026 | 287,31 ha / 40,58 ha | Ídem | Estimado (cálculo) | Consulta del 20/11/2026 |
| Agua nueva / agua que ya no está, 18/01/2021 → 07/02/2021 (confianza alta) | 222,88 ha / 15,05 ha | Ídem | Estimado (cálculo) | Consulta del 20/11/2026 |
| Agua nueva / agua que ya no está, 24/11/2022 → 14/12/2022 (confianza media) | 3,20 ha / 132,19 ha | Ídem | Estimado (cálculo) | Consulta del 20/11/2026 |
| Semáforo de confianza | Alta / media / baja (02/10 → 26/10/2026: baja, por nubes y zona sin dato) | Reglas propuestas por el equipo en `docs/PLAN_DATOS_REALES.md`, aplicadas en `apps/backend/app/confianza.py` | Criterio del equipo (no es un dato ni un umbral oficial) | 20/11/2026 |
| Aviso de nubes > 20 % | Umbral de 20 % sobre la zona | Criterio del equipo, en `apps/backend/app/confianza.py` | Criterio del equipo | 20/11/2026 |

## Agua de siempre

| Qué muestra la herramienta | Valor o rango | Fuente | Categoría | Fecha del dato |
|---|---|---|---|---|
| Agua de siempre (capa gris del mapa) | Píxeles con agua al menos el 50 % del tiempo (umbral configurable): 19,8 % de la zona | Global Surface Water v1.4, capa `occurrence`, mosaico 60W_20S (JRC, Comisión Europea; Pekel et al. 2016, *Nature* 540). https://storage.googleapis.com/global-surface-water/downloads2021/occurrence/occurrence_60W_20Sv1_4_2021.tif · `gsw_zona.npz` · licencia CC BY 4.0 | Observado (derivado de Landsat, 30 m) | 1984 a 2021; consulta del 20/11/2026 |
| Agua nueva donde normalmente no hay / donde suele haber, 18/01 → 07/02/2021 | 86,1 ha / 136,8 ha | Agua nueva de la herramienta cruzada con la capa anterior | Estimado (cálculo) | Consulta del 20/11/2026 |
| Ídem, 02/10 → 26/10/2026 | 49,8 ha / 60,9 ha | Ídem | Estimado (cálculo) | Consulta del 20/11/2026 |

La capa se reproyectó de 30 m a la grilla de 10 m de las escenas por vecino más cercano: los bordes son aproximados. El umbral del 50 % es una decisión del equipo.

## Radar Sentinel-1

| Qué muestra la herramienta | Valor o rango | Fuente | Categoría | Fecha del dato |
|---|---|---|---|---|
| Pasada de radar 01/10/2026 (VV) | Sentinel-1C, órbita relativa 141, 10 m | [S1C_IW_GRDH_1SDV_20261001T092002_20261001T092027_009689_0134B9_rtc](https://planetarycomputer.microsoft.com/api/stac/v1/collections/sentinel-1-rtc/items/S1C_IW_GRDH_1SDV_20261001T092002_20261001T092027_009689_0134B9_rtc) · `radar/s1-2026-10-01.npz` | Observado | 01/10/2026 |
| Pasada de radar 25/10/2026 (VV) | Sentinel-1C, órbita relativa 141, 10 m | [S1C_IW_GRDH_1SDV_20261025T092001_20261025T092026_010039_014091_rtc](https://planetarycomputer.microsoft.com/api/stac/v1/collections/sentinel-1-rtc/items/S1C_IW_GRDH_1SDV_20261025T092001_20261025T092026_010039_014091_rtc) · `radar/s1-2026-10-25.npz` | Observado | 25/10/2026 |
| Pasada de radar 17/01/2021 (VV, solo validación) | Sentinel-1B, órbita relativa 141, 10 m | [S1B_IW_GRDH_1SDV_20210117T092020_20210117T092045_025192_02FFDE_rtc](https://planetarycomputer.microsoft.com/api/stac/v1/collections/sentinel-1-rtc/items/S1B_IW_GRDH_1SDV_20210117T092020_20210117T092045_025192_02FFDE_rtc) · `radar/s1-2021-01-17.npz` | Observado | 17/01/2021 |
| Umbral de agua del radar | VV < −13 dB tras un promedio de 5 × 5 píxeles | Calibrado con `scripts/validar_radar.py` contra Sentinel-2 sin nubes a 1 día (17-18/01/2021 y 01-02/10/2026): IoU promedio 0,873, 98 % de acuerdo · `radar/validacion.json` | Criterio del equipo, validado | 20/11/2026 |
| Agua nueva / que ya no está según radar, 01/10 → 25/10/2026 | 220,83 ha / 27,74 ha | Cálculo de la herramienta | Estimado (cálculo) | Consulta del 20/11/2026 |

## Infraestructura

| Qué muestra la herramienta | Valor o rango | Fuente | Categoría | Fecha del dato |
|---|---|---|---|---|
| Establecimientos educativos de la zona | 83 | IGN, capa `ign:puntos_de_ciencia_y_educacion_020601` (Mapa Educativo Nacional), WFS https://wms.ign.gob.ar/geoserver/ows · `infraestructura_ign.json` | Referencia (cartografía oficial) | Consulta del 20/11/2026 |
| Establecimientos de salud de la zona | 6 | IGN, capa `ign:salud_020801` | Referencia (cartografía oficial) | Consulta del 20/11/2026 |
| Red vial de la zona | 1 tramo (camino terciario); sin rutas nacionales ni provinciales en el recorte | IGN, capas `ign:vial_nacional`, `ign:vial_provincial`, `ign:vial_terciaria` | Referencia (cartografía oficial) | Consulta del 20/11/2026 |
| Establecimientos a menos de 500 m del agua nueva inusual | 2 escuelas (crecida 2021) · 4 escuelas (octubre 2026) · 0 centros de salud | Cálculo de la herramienta, con el agua consolidada en manchas de más de la mitad de 50 × 50 m | Estimado (cálculo) | Consulta del 20/11/2026 |

El IGN cubre solo territorio argentino: Alberdi (Paraguay) no tiene datos.

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

| Alturas en Puerto Formosa, Puerto Pilcomayo y Puerto Bermejo | Diarias, 01/01/2017 a 31/10/2026 (Puerto Bermejo con huecos, por ejemplo enero y febrero de 2021) | API pública del INA: https://alerta.ina.gob.ar/pub/datos/datos (siteCode 57, 55 y 58; varId 2) · `ina_alturas_region.csv` | Observado | Consulta del 20/11/2026 |
| Umbrales de Puerto Pilcomayo y Puerto Bermejo | Pilcomayo: aguas bajas 1,40 · alerta 5,35 · evacuación 6,00 m. Bermejo: alerta 6,50 · evacuación 7,00 m | API del INA, catálogo de estaciones · `ina_estaciones_region.json` (Pilcomayo coincide con K3) | Observado (umbral oficial INA) | Consulta del 20/11/2026 |
| Control cruzado INA contra K1 (Puerto Formosa) | 3.470 de 3.552 días idénticos; diferencia máxima 0,11 m | Comparación de las dos series | — | 20/11/2026 |

Tratamiento aplicado a K1: ver [registro_limpieza.md](registro_limpieza.md).

## Lluvia

| Qué muestra la herramienta | Valor o rango | Fuente | Categoría | Fecha del dato |
|---|---|---|---|---|
| Lluvia de los 30 días previos a cada fecha, y entre fechas si están a 90 días o menos | Por ejemplo, 227,3 mm antes del 18/01/2021 y 368,8 mm antes del 07/02/2021 | Reanálisis ERA5 (Copernicus/ECMWF) vía Open-Meteo, https://archive-api.open-meteo.com/v1/archive, punto −26,205 / −58,145 (celda de ~25 km) · `lluvia_formosa_era5.csv` · licencia CC BY 4.0 | **Estimado** (modelo, no pluviómetro) | 01/12/2016 a 31/10/2026; consulta del 20/11/2026 |

La lluvia es una estimación y puede diferir de una medición: por ejemplo, para el 03/10/2026 ERA5 estima 32,3 mm y NASA POWER 7,6 mm. El kit no incluye lluvia observada.

## Mapa de fondo

| Qué muestra la herramienta | Valor o rango | Fuente | Categoría | Fecha del dato |
|---|---|---|---|---|
| Mapa base | Calles, localidades y ríos | Teselas de OpenStreetMap (https://tile.openstreetmap.org, © colaboradores de OpenStreetMap), en `apps/frontend/src/components/MapaCambios.jsx` | Base cartográfica de referencia | Consulta en vivo |

## Fuentes externas usadas (URL y fecha de consulta)
- Earth Search, catálogo STAC de Sentinel-2 L2A (Element84, AWS Open Data): https://earth-search.aws.element84.com/v1/collections/sentinel-2-l2a, consultado el 20/11/2026.
- Programa Copernicus, Sentinel-2 (ESA, Unión Europea): https://browser.dataspace.copernicus.eu, citado en la guía del desafío (relevamiento del CITF del 16/11/2026).
- INA, Sistema de Información y Alerta Hidrológico, catálogo de estaciones: https://alerta.ina.gob.ar/pub/datos/estaciones&format=json, consultado el 29/10/2026 (kit K3).
- El Monterizo, 17/9/2026: esquema preventivo provincial por El Niño con inspección satelital de riachos (citado en la guía del desafío).
- Microsoft Planetary Computer, Sentinel-1 RTC: https://planetarycomputer.microsoft.com/api/stac/v1 (colección `sentinel-1-rtc`), consultado el 20/11/2026.
- IGN, Capas SIG por WFS: https://wms.ign.gob.ar/geoserver/ows, consultado el 20/11/2026.
- Global Surface Water (JRC), descargas v1.4: https://global-surface-water.appspot.com/download, consultado el 20/11/2026.
- INA, API pública del Sistema de Alerta Hidrológico: https://alerta.ina.gob.ar/pub/datos/datos y /estaciones, consultada el 20/11/2026.
- Open-Meteo, API de datos históricos (reanálisis ERA5): https://archive-api.open-meteo.com/v1/archive, consultada el 20/11/2026.
- OpenStreetMap, teselas del mapa de fondo: https://tile.openstreetmap.org, consulta en vivo al usar la herramienta.
- McFeeters, S. K. (1996). *The use of the Normalized Difference Water Index (NDWI) in the delineation of open water features*. International Journal of Remote Sensing, 17(7), 1425–1432 (referencia metodológica del NDWI).

La máscara de nubes excluye las clases SCL 0 (sin dato), 1 (saturado), 3 (sombra de nube), 8 y 9 (nube de probabilidad media y alta) y 10 (cirros), según `apps/backend/scripts/descargar_escenas.py`.
