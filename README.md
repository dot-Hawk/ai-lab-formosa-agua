# Operación Agua · Comparador de imágenes satelitales

> **PROTOTIPO · AI LAB Misión: Código Formosa · no es una herramienta oficial**

Equipo 1 · Instituto Politécnico Formosa · Desafío 7 · Imágenes satelitales.

Compara dos escenas satelitales de una misma zona del territorio formoseño, calcula el índice de agua **NDWI** (bandas verde e infrarrojo cercano de Sentinel-2) y marca dónde apareció o desapareció agua. Muestra fecha, fuente, resolución y cobertura de nubes de cada escena, y el nivel del río Paraguay en Puerto Formosa (INA) para esas fechas.

**Un cambio detectado es un indicio, no una afectación comprobada.**

## Estructura
```
apps/backend/    API (Python · FastAPI · NumPy)
apps/frontend/   Interfaz (React · Vite · Leaflet)
docs/            Contrato de API, roles y fichas de entrega
```

## Requisitos
- Python ≥ 3.11 y [uv](https://docs.astral.sh/uv/) (probado con Python 3.14 y uv 0.12)
- Node.js ≥ 20 y npm (probado con Node 26)

## Ejecutar
En dos terminales:

```bash
# 1 · Backend → http://localhost:8000  (docs: /docs)
cd apps/backend
uv sync
uv run uvicorn app.main:app --reload --port 8000
```

```bash
# 2 · Frontend → http://localhost:5173
cd apps/frontend
npm install
npm run dev
```

Variables de entorno opcionales: ver `.env.example`.

## Probar
- **Flujo principal:** abrir http://localhost:5173, elegir las dos fechas y presionar *Comparar*. Se superponen en el mapa el agua nueva (azul) y el agua que ya no está (naranja).
- **Entrada inválida:** elegir la misma fecha en ambos campos. La interfaz muestra *"Elegí dos escenas distintas para comparar."* y se puede seguir trabajando.
- **Pruebas automáticas:** `cd apps/backend && uv run pytest` y `cd apps/frontend && npm test`
- Ejemplos con `curl`: [docs/CONTRATO_API.md](docs/CONTRATO_API.md)

## Datos incluidos
| Dato | Archivo | Categoría |
|---|---|---|
| Escenas Sentinel-2 L2A (bandas B03 y B08, tile 21JUM) del 21/06/2019, 13/11/2024, 02/10/2026 y 26/10/2026 | `apps/backend/data/escenas/` (recortes de 7 x 7,8 km sobre Formosa, Alberdi y los bañados del sur) | Dato observado |
| Umbrales Puerto Formosa | `apps/backend/data/K3_estaciones_umbrales.json` (kit K3, INA, 29/10/2026) | Dato observado |
| Altura del río | `apps/backend/data/niveles_formosa_limpio.csv` (kit K1 limpiado por el equipo) | Dato observado |

Las escenas vienen de Copernicus Sentinel-2 (ESA) a través de Earth Search (Element84, AWS Open Data), sin cuenta. Para volver a descargarlas:

```bash
cd apps/backend
uv sync --group escenas
uv run python scripts/descargar_escenas.py
```

La limpieza de K1 se repite con `uv run python scripts/limpiar_k1.py`. Fuentes y tratamientos: `docs/entregables/`.

## Límites
- La cobertura de nubes oculta el suelo en las imágenes ópticas. Los píxeles con nube o sombra se excluyen del cálculo (en el recorte del 26/10/2026 son el 20 %), pero algunos bordes de nube que la clasificación de Sentinel-2 no detecta pueden aparecer como cambio. Sentinel-1 (radar) no está integrado.
- Con 10 m de resolución no se detectan cursos de agua angostos.
- El NDWI puede confundir agua con sombras o suelo muy húmedo.
- No usa datos posteriores al 31/10/2026. No pronostica ni decide.
