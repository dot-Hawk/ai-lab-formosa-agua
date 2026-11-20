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
  "id": "demo-2026-10-01",
  "fecha": "2026-10-01",
  "fuente": "Copernicus · Sentinel-2 L2A · tile ...",
  "satelite": "Sentinel-2",
  "producto": "L2A",
  "resolucion_m": 10,
  "nubes_pct": 4.0,
  "categoria": "Observado | Simulado",
  "bounds": [[sur, oeste], [norte, este]]
}]
```

## `POST /api/comparar`
Entrada:
```json
{"escena_a": "demo-2026-10-01", "escena_b": "demo-2026-10-31", "umbral_agua": 0.0}
```
`umbral_agua` es opcional (NDWI entre -1 y 1, por defecto 0).

Salida `200`:
```json
{
  "escena_a": { ...metadatos },
  "escena_b": { ...metadatos },
  "umbral_agua": 0.0,
  "area_agua_nueva_ha": 80.0,
  "area_agua_perdida_ha": 0.0,
  "overlay_png": "data:image/png;base64,...",   // azul = agua nueva, naranja = agua perdida
  "bounds": [[-26.2, -58.18], [-26.182, -58.16]],
  "nivel_rio": {
    "estacion": "FORMOSA (Puerto Formosa)", "unidad": "m",
    "fecha_a": "2026-10-01", "altura_a": null,   // null = sin dato en la serie K1 limpia
    "fecha_b": "2026-10-31", "altura_b": null,
    "umbrales": {"aguas_bajas": 1.6, "alerta": 7.8, "evacuacion": 8.3},
    "fuente": "INA · K1 ... · Dato observado"
  },
  "advertencia": "Un cambio detectado es un indicio, no una afectación comprobada. ...",
  "leyenda": "PROTOTIPO · ..."
}
```

Errores:
| Código | Cuándo |
|---|---|
| 400 | Misma escena en A y B · escenas de distinto satélite o resolución |
| 404 | Algún `id` no existe en el catálogo |
| 422 | Cuerpo inválido (faltan campos, tipos incorrectos, umbral fuera de rango) |

## Ejemplo reproducible
```bash
curl -X POST localhost:8000/api/comparar -H 'Content-Type: application/json' \
  -d '{"escena_a":"demo-2026-10-01","escena_b":"demo-2026-10-31"}'
# Caso inválido:
curl -X POST localhost:8000/api/comparar -H 'Content-Type: application/json' \
  -d '{"escena_a":"demo-2026-10-01","escena_b":"demo-2026-10-01"}'   # → 400
```
Documentación interactiva: http://localhost:8000/docs
