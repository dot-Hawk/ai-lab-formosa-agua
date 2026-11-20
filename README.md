# Operación Agua · Comparador de imágenes satelitales

> **PROTOTIPO · AI LAB Misión: Código Formosa · no es una herramienta oficial**

Equipo 1 · Instituto Politécnico Formosa · Desafío 7 · Imágenes satelitales.

Compara dos escenas satelitales de una misma zona del territorio formoseño, calcula el índice de agua **NDWI** (bandas verde e infrarrojo cercano de Sentinel-2) y marca dónde apareció o desapareció agua. Muestra fecha, fuente, resolución y cobertura de nubes de cada escena, y el nivel del río Paraguay en Puerto Formosa (INA) para esas fechas.

**Un cambio detectado es un indicio, no una afectación comprobada.**

## Estructura
```
apps/backend/    API (Python · FastAPI · NumPy)
apps/frontend/   Interfaz (Vite · Leaflet)
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
- **Pruebas automáticas:** `cd apps/backend && uv run pytest`
- Ejemplos con `curl`: [docs/CONTRATO_API.md](docs/CONTRATO_API.md)

## Datos de demostración
| Dato | Archivo | Categoría |
|---|---|---|
| Escenas demo | `apps/backend/data/escenas/*.npz`, generadas con `scripts/generar_demo.py` | **SIMULADO** (se reemplazan por Sentinel-2 L2A) |
| Umbrales Puerto Formosa | `apps/backend/data/K3_estaciones_umbrales.json` (kit K3, INA, 29/10/2026) | Dato observado |
| Altura del río | `apps/backend/data/niveles_formosa_limpio.csv` (K1 limpio, **pendiente**) | Dato observado |

Fuentes y tratamientos: `docs/entregables/`.

## Límites
- La cobertura de nubes oculta el suelo en las imágenes ópticas. Sentinel-1 (radar) no está integrado.
- Con 10 m de resolución no se detectan cursos de agua angostos.
- El NDWI puede confundir agua con sombras o suelo muy húmedo.
- No usa datos posteriores al 31/10/2026. No pronostica ni decide.
