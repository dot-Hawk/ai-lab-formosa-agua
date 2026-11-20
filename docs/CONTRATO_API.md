# Contrato frontend ↔ backend

Base: `http://localhost:8000` (en desarrollo el frontend lo usa vía proxy de Vite en `/api`).
Formato: JSON. Errores: siempre `{"detalle": "mensaje legible"}` (422 agrega `errores`).

> Cambiar este contrato es un **cambio compartido**: avisar al equipo antes y actualizar este archivo + `apps/backend/tests/test_api.py`.

## `GET /api/salud`
`200` → `{"estado": "ok", "leyenda": "PROTOTIPO · ..."}`

## `GET /api/escenas`
Lista de escenas disponibles. `200` →
```json
[{
  "id": "s2-2026-10-26",
  "fecha": "2026-10-26",
  "fuente": "Copernicus Sentinel-2 (ESA), escena S2A_21JUM_20261026_0_L2A, vía Earth Search (AWS Open Data)",
  "satelite": "Sentinel-2",
  "producto": "L2A, Sentinel-2A, tile 21JUM",
  "resolucion_m": 10,
  "nubes_pct": 20.1,
  "nubes_escena_pct": 9.2,
  "sin_dato_pct": 25.2,
  "categoria": "Observado | Simulado",
  "url": "https://earth-search.aws.element84.com/v1/collections/sentinel-2-l2a/items/S2A_21JUM_20261026_0_L2A",
  "consultado": "2026-11-20",
  "captura_utc": "2026-10-26T13:59:57Z",
  "sol_elevacion_grados": 63.5,
  "incidencia_grados": 10.9,
  "bounds": [[sur, oeste], [norte, este]]
}]
```

| Campo | Significado |
|---|---|
| `nubes_pct` | Porcentaje del recorte cubierto por nubes o sombras (es el que muestra la interfaz) |
| `nubes_escena_pct` | Porcentaje de nubes de la escena Sentinel-2 completa, según su metadato |
| `sin_dato_pct` | Porcentaje del recorte excluido del cálculo (nubes, sombras, saturado o sin dato, según la capa SCL) |
| `url` | Ítem STAC de la escena en Earth Search |
| `consultado` | Fecha en que se descargó la escena |
| `captura_utc` | Instante de la toma, en UTC (la interfaz lo muestra en hora de Argentina, UTC−3) |
| `sol_elevacion_grados` | Altura del sol sobre el horizonte en la toma |
| `incidencia_grados` | Ángulo de visión del satélite respecto de la vertical; `null` si el catálogo no lo informa |

Escenas cargadas hoy: `s2-2019-06-21`, `s2-2021-01-18`, `s2-2021-02-07`, `s2-2022-11-24`, `s2-2022-12-14`, `s2-2024-11-13`, `s2-2026-10-02` y `s2-2026-10-26`.

## `POST /api/comparar`
Entrada:
```json
{"escena_a": "s2-2026-10-02", "escena_b": "s2-2026-10-26", "umbral_agua": 0.0}
```
`umbral_agua` es opcional (NDWI entre -1 y 1, por defecto 0). `umbral_habitual_pct` también (1 a 100, por defecto 50): % del tiempo con agua entre 1984 y 2021 desde el que un píxel cuenta como "agua de siempre".

Salida `200`:
```json
{
  "escena_a": { ...metadatos },
  "escena_b": { ...metadatos },
  "umbral_agua": 0.0,
  "area_agua_nueva_ha": 110.64,
  "area_agua_perdida_ha": 43.25,
  "overlay_png": "data:image/png;base64,...",   // azul = agua nueva, naranja = agua perdida
  "bounds": [[-26.24, -58.18], [-26.17, -58.11]],
  "nivel_rio": {
    "estacion": "FORMOSA (Puerto Formosa)", "unidad": "m",
    "fecha_a": "2026-10-02", "altura_a": 2.35,   // null = sin dato en la serie K1 limpia
    "fecha_b": "2026-10-26", "altura_b": 5.44,
    "umbrales": {"aguas_bajas": 1.6, "alerta": 7.8, "evacuacion": 8.3},
    "fuente": "INA · K1 (serie limpiada por el equipo) y K3 · Dato observado"
  },
  "agua_habitual": {                       // null si no está la capa de Global Surface Water
    "umbral_pct": 50,
    "area_agua_nueva_inusual_ha": 86.1,     // agua nueva donde normalmente no hay agua
    "area_agua_nueva_habitual_ha": 136.8,   // agua nueva donde el agua suele estar
    "overlay_inusual_png": "data:image/png;base64,...",   // como overlay_png, sin el agua nueva habitual
    "agua_de_siempre_png": "data:image/png;base64,...",   // gris = agua de siempre
    "fuente": "Global Surface Water v1.4 (JRC, Comisión Europea), Pekel et al. 2016, Nature 540",
    "periodo": "1984-2021", "resolucion_original_m": 30,
    "categoria": "Observado (derivado de Landsat)", "nota": "..."
  },
  "region": {
    "estaciones": [
      {"nombre": "Puerto Pilcomayo", "rio": "Paraguay", "altura_a": 1.13, "altura_b": 3.64,   // null = sin dato en el INA
       "umbrales": {"aguas_bajas": 1.4, "alerta": 5.35, "evacuacion": 6}},
      {"nombre": "Puerto Bermejo", "rio": "Paraguay", "altura_a": 2.75, "altura_b": 5.94,
       "umbrales": {"aguas_bajas": null, "alerta": 6.5, "evacuacion": 7}}
    ],
    "fuente": "INA, API pública del Sistema de Alerta (escalas de Prefectura Naval) · Dato observado"
  },
  "lluvia": {
    "dias_previos": 30, "previa_a_mm": 157.7, "previa_b_mm": 185.1,
    "entre_fechas_mm": 173.0,               // null si las fechas están a más de 90 días
    "fuente": "Reanálisis ERA5 (Copernicus/ECMWF) vía Open-Meteo, ...", "categoria": "Estimado", "nota": "..."
  },
  "confianza": {
    "nivel": "baja",                      // alta | media | baja: el peor de los criterios
    "dias_entre_fechas": 24,
    "motivos": [
      {"nivel": "baja", "texto": "Nubes sobre la zona: hasta 20,1 %"},
      {"nivel": "baja", "texto": "Zona sin dato (nubes, sombras o bordes): hasta 25,2 %"},
      {"nivel": "alta", "texto": "24 días entre las fechas"},
      {"nivel": "alta", "texto": "Sol a 58,6° sobre el horizonte"}
    ],
    "criterios": "Nubes y píxeles sin dato en la zona: alta < 5 % ..."
  },
  "avisos": ["La escena del 26/10/2026 tiene 20,1 % de nubes sobre la zona: ... Sentinel-1 ..."],
  "advertencia": "Un cambio detectado es un indicio, no una afectación comprobada. ...",
  "leyenda": "PROTOTIPO · ..."
}
```

`confianza` sigue las reglas propuestas en [PLAN_DATOS_REALES.md](PLAN_DATOS_REALES.md) (`apps/backend/app/confianza.py`). `avisos` es una lista, vacía si no hay nada que advertir; hoy avisa cuando una escena supera el 20 % de nubes sobre la zona.

Errores:
| Código | Cuándo |
|---|---|
| 400 | Misma escena en A y B · escenas de distinto satélite o resolución |
| 404 | Algún `id` no existe en el catálogo |
| 422 | Cuerpo inválido (faltan campos, tipos incorrectos, umbral fuera de rango) |

## Ejemplo reproducible
```bash
curl -X POST localhost:8000/api/comparar -H 'Content-Type: application/json' \
  -d '{"escena_a":"s2-2026-10-02","escena_b":"s2-2026-10-26"}'
# → 200 · area_agua_nueva_ha 110.64 · area_agua_perdida_ha 43.25
# Caso inválido:
curl -X POST localhost:8000/api/comparar -H 'Content-Type: application/json' \
  -d '{"escena_a":"s2-2026-10-02","escena_b":"s2-2026-10-02"}'   # → 400 "Elegí dos escenas distintas para comparar."
```
Documentación interactiva: http://localhost:8000/docs
