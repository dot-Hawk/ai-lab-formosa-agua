# Prueba desde un clon limpio · Equipo 1
Responsable: Selena Brítez (rol D) · Fecha: 20/11/2026, UTC−03

La consigna de entrega técnica pide probar el repositorio desde un clonado limpio, siguiendo solo las instrucciones del README. Este registro deja constancia de qué se hizo, qué salió y qué hubo que corregir.

## Entorno
| Componente | Versión |
|---|---|
| Sistema operativo | Windows 11 Home 10.0.26200 |
| uv | 0.13.7 |
| Python usado por el backend | 3.14.10 (instalado por uv) |
| Node.js | 26.13.0 |
| npm | 11.20.0 |

## Qué se probó
Commit probado: rama `dev-Selena-Milagros-Britez` con `dev-Diego` incorporada (merge `8385507`, que incluye `3ff4b86` de Diego). Se clonó en una carpeta temporal vacía, sin `.venv` ni `node_modules`.

| Paso | Comando | Directorio | Resultado |
|---|---|---|---|
| 1 | `git clone <repo> -b dev-Selena-Milagros-Britez` | carpeta vacía | Correcto |
| 2 | `uv sync` | `apps/backend` | **Falló.** uv eligió Python 3.15.2 y no hay binarios de `pyyaml` 6.0.3 para esa versión. Intentó compilarlo y pidió Microsoft C++ Build Tools (ver hallazgo 1). |
| 2b | `uv sync --python 3.14` | `apps/backend` | Correcto |
| 3 | `uv run pytest -q` | `apps/backend` | **40 pruebas pasaron**, 1 aviso de deprecación de Starlette (no afecta) |
| 4 | `npm ci` | `apps/frontend` | Correcto |
| 5 | `npm test` | `apps/frontend` | **37 pruebas pasaron** en 5 archivos |
| 6 | `npm run build` | `apps/frontend` | Correcto (`dist/`, JS de 353,72 kB, 108,64 kB con gzip) |
| 7 | `uv run uvicorn app.main:app --port 8765` y `GET /api/salud` | `apps/backend` | `{"estado":"ok", ...}` |
| 8 | `GET /api/escenas` | — | 4 escenas Sentinel-2, categoría Observado |
| 9 | Flujo principal: `POST /api/comparar` con `s2-2026-10-02` y `s2-2026-10-26` | — | 200 · agua nueva 110,64 ha · agua perdida 43,25 ha · río 2,35 m → 5,44 m |
| 10 | Caso inválido: misma escena en A y B | — | 400 · `{"detalle":"Elegí dos escenas distintas para comparar."}` |

Para la prueba se usó el puerto 8765, para no chocar con otro servicio local; con el 8000 del README se comporta igual.

Otras comparaciones consultadas para el pitch y la ficha de fuentes:

| Escena A → Escena B | Agua nueva | Agua que ya no está | Río A → B |
|---|---|---|---|
| `s2-2024-11-13` → `s2-2019-06-21` | 1.097,89 ha | 11,47 ha | −0,62 m → 9,08 m |
| `s2-2024-11-13` → `s2-2026-10-26` | 287,31 ha | 40,58 ha | −0,62 m → 5,44 m |

## Hallazgos

1. **`uv sync` falla en Windows si uv elige Python 3.15.** `uvicorn[standard]` depende de `pyyaml`, que todavía no publica binarios para 3.15, y compilarlo requiere Visual C++. Con `uv sync --python 3.14` funciona.
   - *Qué se hizo:* el README pasa a indicar `uv sync --python 3.14`.
   - *Qué se propone (rol B):* agregar un archivo `apps/backend/.python-version` con `3.14`, o limitar `requires-python` a `>=3.11,<3.15` en `pyproject.toml`, para que no dependa de que la persona lea la nota. No se tocó porque es un archivo del backend.
2. **Los ejemplos de `docs/CONTRATO_API.md` usan IDs que ya no existen** (`demo-2026-10-01`, `demo-2026-10-31`). Con las escenas reales, el `curl` del contrato devuelve 404. Además, la respuesta de `/api/escenas` tiene campos nuevos (`nubes_escena_pct`, `sin_dato_pct`, `url`, `consultado`) que el contrato no documenta.
   - *Qué se hizo:* se actualizaron los ejemplos y los campos en el contrato, en un commit aparte para que se pueda revisar o revertir solo. Es un archivo compartido, así que **hay que avisar al equipo**.
3. **El README no menciona `npm run build`** entre las pruebas, pese a que `docs/ROLES.md` lo pide antes de cada merge. Se agregó.

## Qué no se probó
- La interfaz no se recorrió con un navegador real en esta prueba: el flujo se verificó por la API y con las 37 pruebas del frontend (que incluyen el formulario, la validación de la misma fecha y la lectura de resultados). **Antes del pitch hay que hacer una pasada manual por la interfaz.**
- La descarga de escenas (`uv sync --group escenas` y `scripts/descargar_escenas.py`) no se ejecutó, porque baja datos de internet y las escenas ya están en el repo.
- No se probó en Linux ni en macOS.
