# Plan · funcionalidades nuevas con datos reales de Formosa
Equipo 1 · Propuesta de Selena (rol D) del 20/11/2026, para revisar con el equipo.

Regla del documento base (p. 4): los datos del kit quedan **congelados al 31/10/2026**, y una fuente externa vale **si se cita con URL y fecha de consulta**. Toda fuente nueva se agrega a [ficha_fuentes.md](entregables/ficha_fuentes.md).

## Funcionalidades
| # | Funcionalidad | Tipo | Estado |
|---|---|---|---|
| 1 | Comparador antes/después con deslizador, capa NDWI y capa de diferencias | Base | Parcial: hay capa de diferencias y opacidad; faltan el deslizador y la capa NDWI |
| 2 | Elección automática entre óptico y radar si hay más de 20 % de nubes | Base | **Versión mínima hecha:** aviso de nubes > 20 %. Sin radar |
| 3 | Ficha de confianza: sensor, fecha y hora, resolución, % de nubes sobre la zona y semáforo | Base | **Hecha** (commits `d6ebf2a`, `f6c9a1a`, `58a8741`). Las reglas son una propuesta a confirmar |
| 4 | Agua nueva contra agua de siempre (Global Surface Water) | Diferenciación | Pendiente |
| 5 | Exposición de infraestructura (capas del IGN) | Diferenciación | Pendiente |

## Pasos

### 0 · Alcance
- **Zona:** recorte actual Formosa–Alberdi–bañados del sur (oeste −58,18, sur −26,24, este −58,11, norte −26,17). Una zona nueva se define igual, como rectángulo en lon/lat.
- **Sistema de coordenadas para medir:** UTM 21S (EPSG:32721), en metros. El mapa sigue en Web Mercator (EPSG:3857).
- **Fechas:** se eligen con la serie K1 (aguas bajas contra aguas altas), sin pasar del 31/10/2026.

### 1 · Sentinel-2 (funcionalidades 1 y 3)
- **Fuente:** Earth Search, colección `sentinel-2-l2a` (https://earth-search.aws.element84.com/v1). Sin cuenta.
- Bandas B03, B08 y SCL (ya lo hace `apps/backend/scripts/descargar_escenas.py`).
- **Nuevo:** guardar `datetime` (hora de captura), `view:sun_elevation` y `view:incidence_angle` de cada escena.
- Para el deslizador: guardar el NDWI de cada fecha como imagen georreferenciada.

### 2 · Sentinel-1 radar (funcionalidad 2)
- **Fuente sugerida:** Microsoft Planetary Computer, colección `sentinel-1-rtc` (10 m, con corrección de relieve). Alternativa: Copernicus Data Space (pide cuenta gratuita).
- Pasada a ±2 días de la fecha óptica; banda VV con filtro de ruido; agua = VV por debajo de un umbral (≈ −18 dB) o umbral automático (Otsu).
- **Validar** contra una fecha sin nubes antes de mostrarlo.
- Es el paso más costoso: de 2 a 4 días.

### 3 · Ficha de confianza (funcionalidad 3)
- Sin datos nuevos: usa los del paso 1.
- Semáforo con reglas escritas por el equipo (ver abajo) y visibles en pantalla.

### 4 · Global Surface Water (funcionalidad 4)
- **Fuente:** JRC, Comisión Europea (https://global-surface-water.appspot.com, descargas). Mosaico **60W_20S**, capas `occurrence` y, opcional, `seasonality`.
- Recortar a la zona, llevar a la grilla de 10 m y definir "agua de siempre" (por ejemplo, occurrence ≥ 50 %; lo decide el equipo).
- Agua nueva real = agua detectada − agua de siempre.
- Límites que hay que mostrar: 30 m de resolución y datos de 1984 a 2021.

### 5 · Infraestructura (funcionalidad 5)
- **Fuente:** IGN, Capas SIG (https://www.ign.gob.ar): red vial nacional y provincial, localidades, establecimientos educativos y de salud. Verificar los nombres exactos de las capas. Alternativa: OpenStreetMap, citada como fuente no oficial.
- Recortar, pasar a UTM 21S y calcular los km de ruta afectados y los establecimientos a menos de 500 m del agua nueva.
- Revisar a mano en QGIS algunos casos antes de mostrar cifras.

### 6 · Río
K1 y K3 ya están. Si se suma una zona cerca de Clorinda, usar K2 (Puerto Pilcomayo: alerta 5,35 m, evacuación 6,00 m).

### 7 · Validación con un caso conocido
La crecida de junio de 2019 (9,08 m el 21/06/2019) contra la bajante de noviembre de 2024 (−0,62 m). Cada funcionalidad nueva tiene que dar un resultado coherente con ese contraste.

### 8 · Documentación
Por cada fuente nueva: fila en la ficha de fuentes (URL, fecha de consulta, licencia, resolución, categoría, transformación), un script reproducible en `apps/backend/scripts/` y datos recortados chicos en el repo.

## Reglas del semáforo de confianza (propuesta, a confirmar)
Se evalúa cada criterio y el resultado es el **peor** de todos.

| Criterio | Alta | Media | Baja |
|---|---|---|---|
| Nubes sobre la zona (peor de las dos escenas) | < 5 % | 5 a 20 % | > 20 % |
| Píxeles sin dato en la zona (peor de las dos) | < 5 % | 5 a 20 % | > 20 % |
| Días entre las fechas | ≤ 30 | 31 a 90 | > 90 |
| Elevación del sol (menor de las dos) | ≥ 30° | 20° a 30° | < 20° |

Motivo de cada criterio:
- **Nubes y sin dato:** la parte tapada no se analiza y los bordes de nube pueden aparecer como cambio.
- **Días entre fechas:** cuanto más tiempo pasa, más probable es que el cambio se deba a otras causas (vegetación, obras), no solo al agua.
- **Sol bajo:** genera sombras largas que el NDWI puede confundir con agua.

## Prioridad sugerida
| Orden | Funcionalidad | Tiempo aproximado |
|---|---|---|
| 1 | Ficha de confianza (3) y aviso de nubes (2 mínimo) | Horas |
| 2 | Agua de siempre con GSW (4) | Medio día |
| 3 | Deslizador NDWI (1) | Medio día |
| 4 | Infraestructura (5) | 1 a 2 días |
| 5 | Radar Sentinel-1 (2 completo) | 2 a 4 días |

Lo que no llegue a la entrega va al pitch y al póster como plan de continuidad.

## Coordinación
El código de `apps/` lo armó Diego. Antes de tocar un archivo, avisar en el grupo. `docs/CONTRATO_API.md` y `apps/backend/tests/test_api.py` son compartidos.
