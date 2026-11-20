# Prueba desde un clon limpio · Equipo 1
Responsable: Selena Brítez (rol D) · Fecha: 20/11/2026, UTC−03

La consigna de entrega técnica pide probar el repositorio desde un clonado limpio, siguiendo solo las instrucciones del README. Este registro deja constancia de qué se hizo, qué salió y qué hubo que corregir. Se hicieron dos pruebas el mismo día.

## Entorno
| Componente | Versión |
|---|---|
| Sistema operativo | Windows 11 Home 10.0.26200 |
| uv | 0.13.7 |
| Python usado por el backend | 3.14.10 (instalado por uv) |
| Node.js | 26.13.0 |
| npm | 11.20.0 |

## Prueba 2 (versión con todas las funcionalidades)
Commit probado: `8303050` de `dev-Selena-Milagros-Britez` (incluye el trabajo de Diego hasta `da8371a`). Clonado en una carpeta temporal vacía.

| Paso | Comando | Directorio | Resultado |
|---|---|---|---|
| 1 | `git clone <repo> -b dev-Selena-Milagros-Britez` | carpeta vacía | Correcto |
| 2 | `uv sync` | `apps/backend` | Eligió Python 3.14 gracias a `.python-version`. **Falló** con el error 396 de Windows al vincular archivos de la caché de uv (ver hallazgo 4) |
| 2b | `UV_LINK_MODE=copy uv sync` | `apps/backend` | Correcto |
| 3 | `uv run pytest -q` | `apps/backend` | **82 pruebas pasaron** |
| 4 | `npm ci` | `apps/frontend` | Correcto |
| 5 | `npm test` | `apps/frontend` | Primera corrida: 65 de 66 (una prueba superó los 5 s en frío, ver hallazgo 5). Dos corridas más: **66 de 66** |
| 6 | `npm run build` | `apps/frontend` | Correcto |
| 7 | `GET /api/salud` y `GET /api/escenas` | API en el puerto 8765 | `ok` · 8 escenas Sentinel-2 |
| 8 | Flujo principal: 18/01 → 07/02/2021 | API | 200 · 222,88 ha de agua nueva, 86,1 ha inusual · confianza alta · sin radar · 2 escuelas cerca · capas del deslizador |
| 9 | Flujo con nubes: 02/10 → 26/10/2026 | API | 200 · 110,64 ha (óptico) · confianza baja · **radar: 220,83 ha** · 4 escuelas cerca |
| 10 | Caso inválido: misma escena en A y B | API | 400 · `{"detalle":"Elegí dos escenas distintas para comparar."}` |

La interfaz se recorrió en Edge (automatizado) con el par de 2021 (deslizador, agua de siempre) y el de octubre de 2026 (radar, infraestructura), sin errores en la consola.

## Prueba 1 (versión inicial)
Commit probado: merge `8385507` (incluye `3ff4b86` de Diego).

| Paso | Comando | Resultado |
|---|---|---|
| `uv sync` | `apps/backend` | **Falló:** uv eligió Python 3.15.2, sin binarios de `pyyaml` (hallazgo 1) |
| `uv sync --python 3.14` y `uv run pytest -q` | `apps/backend` | 40 pruebas pasaron |
| `npm ci`, `npm test` y `npm run build` | `apps/frontend` | 37 pruebas pasaron; build correcto |
| Flujo principal y caso inválido | API | 200 (110,64 ha) y 400 |

## Hallazgos

1. **`uv sync` fallaba en Windows si uv elegía Python 3.15**, porque `pyyaml` (dependencia de `uvicorn[standard]`) no tiene binarios para esa versión.
   - *Resuelto:* Diego agregó `apps/backend/.python-version` con `3.14` (commit `a9715e2`). En la prueba 2, uv eligió 3.14 solo.
2. **Los ejemplos de `docs/CONTRATO_API.md` usaban IDs que ya no existían** (`demo-2026-10-01`), y el `curl` devolvía 404.
   - *Resuelto:* ejemplos y campos actualizados (commit `5d073d5`). Es un archivo compartido: hay que avisar al equipo.
3. **El README no mencionaba `npm run build`.** Se agregó.
4. **Error 396 de Windows con uv cuando el repositorio está en OneDrive.** uv vincula archivos de su caché con vínculos duros, y OneDrive no acepta archivos con vínculos incompatibles. No es un error del proyecto.
   - *Resuelto en el README:* si aparece, usar `UV_LINK_MODE=copy` (en PowerShell: `$env:UV_LINK_MODE="copy"`), o clonar fuera de OneDrive.
5. **Una prueba del frontend superó los 5 s en la primera corrida**, porque carga Leaflet y React en frío en una máquina con poca memoria. Pasa sola y en las corridas siguientes.
   - *Resuelto:* `testTimeout` de 15 s en `apps/frontend/vite.config.js`.

## Qué no se probó
- Las descargas (`scripts/descargar_*.py`): bajan datos de internet y los resultados ya están en el repo. Cada script se ejecutó una vez al generar los datos, el 20/11/2026.
- La imagen Docker de Diego (`Dockerfile`): Docker no está instalado en esta computadora.
- Linux y macOS.
