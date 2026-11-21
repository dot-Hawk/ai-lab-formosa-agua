# Operación Agua · Comparador de imágenes satelitales

> **PROTOTIPO · AI LAB Misión: Código Formosa · no es una herramienta oficial**

Equipo 1 · Instituto Politécnico Formosa · Desafío 7 · Imágenes satelitales.
Integrantes: Selena Brítez · Diego García (roles en [docs/ROLES.md](docs/ROLES.md)).

Compara dos escenas satelitales de una misma zona del territorio formoseño, calcula el índice de agua **NDWI** (bandas verde e infrarrojo cercano de Sentinel-2) y marca dónde apareció o desapareció agua. Muestra fecha, fuente, resolución y cobertura de nubes de cada escena, y el nivel del río Paraguay en Puerto Formosa (INA) para esas fechas.

**Un cambio detectado es un indicio, no una afectación comprobada.**

## Estructura
```
apps/backend/    API (Python · FastAPI · NumPy)
apps/frontend/   Interfaz (React · Vite · Leaflet)
docs/            Contrato de API, roles y entregables (fichas, guiones, póster)
```

## Requisitos
- Python 3.11 a 3.14 y [uv](https://docs.astral.sh/uv/) (probado con Python 3.14 y uv 0.12 y 0.13)
  - El backend fija Python 3.14 con `apps/backend/.python-version` (con 3.15, `pyyaml` todavía no tiene binarios para Windows). Si tu uv no lo respeta, usá `uv sync --python 3.14`.
  - Si el repositorio está en **OneDrive** y `uv sync` falla con el error 396 ("vínculos permanentes incompatibles"), usá `UV_LINK_MODE=copy uv sync` (en PowerShell: `$env:UV_LINK_MODE="copy"; uv sync`) o cloná fuera de OneDrive.
- Node.js ≥ 20 y npm (probado con Node 26)

## Ejecutar
En dos terminales:

```bash
# 1 · Backend → http://localhost:8000  (docs: /docs)
cd apps/backend
uv sync --python 3.14
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
- **Provincia y zonas:** al abrir, el mapa muestra toda Formosa (contorno del IGN y agua de siempre) con las 7 zonas clave (Bañado La Estrella está definido pero pendiente: no se pudieron bajar sus escenas). En el formulario se elige la zona y solo aparecen sus fechas.
- **Índices:** el formulario permite elegir NDWI o MNDWI.
- **Antes / después:** en la leyenda del mapa, *Antes / después* muestra el agua, el color real o el NDVI de cada fecha a los lados de una línea que se mueve con el deslizador.
- **Radar:** con 02/10 → 26/10/2026 (la segunda tiene 20,1 % de nubes), la herramienta pasa sola al radar Sentinel-1, lo avisa y muestra su resultado (220,8 ha de agua nueva). En el mapa, modo *Radar*.
- **Infraestructura:** debajo del resultado, las escuelas y centros de salud del IGN a menos de 500 m del agua nueva inusual, también marcados en el mapa.
- **Agua de siempre:** en el mapa, *Solo agua nueva donde normalmente no hay* oculta el agua que vuelve a su lugar habitual, y *Ver agua de siempre* la muestra en gris. En la crecida de 2021, 86,1 de las 222,9 ha de agua nueva son inusuales.
- **Ficha de confianza:** junto al resultado aparece un semáforo (alta, media o baja) con sus motivos: nubes, zona sin dato, días entre fechas y altura del sol. Con las escenas incluidas: la crecida 18/01 → 07/02/2021 da **alta** (222,9 ha de agua nueva); la bajante 24/11 → 14/12/2022 da **media** (132,2 ha de agua que ya no está); 02/10 → 26/10/2026 da **baja** por el 20,1 % de nubes, y lo avisa.
- **Pruebas automáticas:** `cd apps/backend && uv run pytest` (94 pruebas) y `cd apps/frontend && npm test` (75 pruebas)
- **Compilación del frontend:** `cd apps/frontend && npm run build`
- Registro de la última prueba desde un clon limpio: [docs/entregables/prueba_clon_limpio.md](docs/entregables/prueba_clon_limpio.md)
- Ejemplos con `curl`: [docs/CONTRATO_API.md](docs/CONTRATO_API.md)

## Datos incluidos
| Dato | Archivo | Categoría |
|---|---|---|
| Escenas Sentinel-2 L2A (bandas B02, B03, B04, B08 y B11, tile 21JUM) del 21/06/2019, 18/01/2021, 07/02/2021, 24/11/2022, 14/12/2022, 13/11/2024, 02/10/2026 y 26/10/2026 | `apps/backend/data/escenas/` (recortes de 7 x 7,8 km sobre Formosa, Alberdi y los bañados del sur) | Dato observado |
| Umbrales Puerto Formosa | `apps/backend/data/K3_estaciones_umbrales.json` (kit K3, INA, 29/10/2026) | Dato observado |
| Altura del río | `apps/backend/data/niveles_formosa_limpio.csv` (kit K1 limpiado por el equipo) | Dato observado |
| Alturas en Puerto Pilcomayo y Puerto Bermejo (2017 al 31/10/2026) | `apps/backend/data/ina_alturas_region.csv` y `ina_estaciones_region.json` (API pública del INA) | Dato observado |
| Zonas clave: 2 escenas cada una, agua de siempre e infraestructura | `apps/backend/data/zonas/<zona>/` (definidas en `data/zonas.json`) | Dato observado / referencia |
| Vista provincial: contorno y agua de siempre | `apps/backend/data/provincia/` (IGN y Global Surface Water) | Referencia / dato observado |
| Radar Sentinel-1 (VV): 17/01/2021, 01/10/2026 y 25/10/2026 | `apps/backend/data/radar/` (RTC de Microsoft Planetary Computer, con su validación) | Dato observado |
| Escuelas, salud y rutas de la zona | `apps/backend/data/infraestructura_ign.json` (IGN, Capas SIG) | Referencia |
| Agua de siempre (1984–2021) | `apps/backend/data/gsw_zona.npz` y `gsw_zona.json` (Global Surface Water, JRC) | Dato observado (Landsat, 30 m) |
| Lluvia diaria sobre la zona (12/2016 al 31/10/2026) | `apps/backend/data/lluvia_formosa_era5.csv` (reanálisis ERA5 vía Open-Meteo) | **Estimado** |

Las escenas vienen de Copernicus Sentinel-2 (ESA) a través de Earth Search (Element84, AWS Open Data), sin cuenta. Para volver a descargarlas:

```bash
cd apps/backend
uv sync --group escenas
uv run python scripts/descargar_escenas.py
```

Otros datos reales, todos de APIs públicas sin cuenta y cortados al 31/10/2026:
- `uv run python scripts/descargar_ina.py`: alturas del INA en Puerto Formosa, Puerto Pilcomayo y Puerto Bermejo.
- `uv run python scripts/descargar_lluvia.py`: lluvia estimada (ERA5).
- `uv run python scripts/buscar_pares.py`: busca pares de escenas limpias, a 30 días o menos, con el río en niveles muy distintos.
- `uv run python scripts/completar_metadatos.py`: agrega hora de captura y ángulos al catálogo.
- `uv run python scripts/descargar_gsw.py`: recorte de Global Surface Water (agua de siempre, 1984–2021).
- `uv run python scripts/descargar_radar.py` y `scripts/validar_radar.py`: pasadas de radar Sentinel-1 y calibración del umbral contra Sentinel-2.
- `uv run python scripts/descargar_infraestructura.py`: escuelas, salud y rutas del IGN en la zona.
- `uv run python scripts/descargar_zonas.py [zona ...]`: escenas (5 bandas), agua de siempre e infraestructura de las zonas de `data/zonas.json`.
- `uv run python scripts/descargar_provincia.py`: contorno de Formosa (IGN) y agua de siempre provincial.

La limpieza de K1 se repite con `uv run python scripts/limpiar_k1.py`. Fuentes y tratamientos: `docs/entregables/`.

## Entregables
| Entregable | Archivo |
|---|---|
| Las 7 preguntas | [docs/ROLES.md](docs/ROLES.md) |
| Ficha técnica | [docs/entregables/ficha_tecnica.md](docs/entregables/ficha_tecnica.md) |
| Ficha de fuentes | [docs/entregables/ficha_fuentes.md](docs/entregables/ficha_fuentes.md) |
| Registro de limpieza de K1 | [docs/entregables/registro_limpieza.md](docs/entregables/registro_limpieza.md) |
| Guion del pitch (3 min) | [docs/entregables/guion_pitch.md](docs/entregables/guion_pitch.md) |
| Guion del video (≤ 120 s) | [docs/entregables/guion_video.md](docs/entregables/guion_video.md) |
| Texto del póster | [docs/entregables/poster.md](docs/entregables/poster.md) |
| Prueba desde un clon limpio | [docs/entregables/prueba_clon_limpio.md](docs/entregables/prueba_clon_limpio.md) |
| Contrato frontend ↔ backend | [docs/CONTRATO_API.md](docs/CONTRATO_API.md) |

**Versión evaluable:** PENDIENTE (commit o tag en `main`, a definir por el equipo).

## Límites
- La cobertura de nubes oculta el suelo en las imágenes ópticas. Los píxeles con nube o sombra se excluyen del cálculo (en el recorte del 26/10/2026 son el 20 %), pero algunos bordes de nube que la clasificación de Sentinel-2 no detecta pueden aparecer como cambio. Si una escena supera el 20 % de nubes, la herramienta suma el radar Sentinel-1, pero solo en la zona de Formosa capital.
- Con 10 m de resolución no se detectan cursos de agua angostos.
- El NDWI puede confundir agua con sombras o suelo muy húmedo.
- No usa datos posteriores al 31/10/2026. No pronostica ni decide.
- 7 zonas clave con fechas fijas (8 escenas en Formosa capital y 2 en cada una de las demás). Fuera de ellas solo hay contexto provincial, sin detección de cambios. Para otra zona hay que agregarla a `data/zonas.json` y correr la descarga.

## Uso de IA
El equipo usó asistentes de programación (Antigravity CLI con Claude, Codex y Claude Code) para escribir código, pruebas y documentación, con revisión y pruebas del equipo. La herramienta en sí no usa IA: el NDWI es una fórmula fija y los umbrales vienen del INA.
