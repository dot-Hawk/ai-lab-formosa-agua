# Informe — TASK-D-01 a TASK-D-08 · Rol D, entregables

Formato de [SKILL_BASE.md](../../SKILL_BASE.md) §19 y [PLANTILLAS.md](../../PLANTILLAS.md) §5.

- **Responsable:** Selena Milagros Britez (autor Git `sbrittz`)
- **Agente:** PENDIENTE de ID · sesión en Claude Code (Claude Opus 5.5)
- **Rama:** `dev-Selena-Milagros-Britez`
- **Fecha:** 2026-11-20, UTC−03
- **Estado:** EN_REVISION (video y póster EN_CURSO)

## Objetivo
Tomar el rol D de [docs/ROLES.md](../../docs/ROLES.md) y dejar listos los entregables que piden la guía del desafío, el documento base y el anexo de entrega técnica: las 7 preguntas, la ficha técnica, la ficha de fuentes, el pitch, el video, el póster, el README final y la prueba desde un clon limpio.

## Trabajo realizado
- **Implementado:**
  - Merge de `origin/dev-Diego` en la rama personal, para trabajar sobre la versión actual.
  - Las 7 preguntas respondidas.
  - Ficha técnica y ficha de fuentes completas.
  - Guiones del pitch y del video, y texto del póster.
  - Registro de la prueba desde un clon limpio.
  - README final.
  - Ejemplos del contrato corregidos.
  - Skill personal actualizada.
- **Probado:** clon limpio con 40 pruebas de backend y 37 de frontend pasando, build del frontend, flujo principal y caso inválido por la API. Todas las cifras de los entregables salen de esas consultas.
- **Integrado:** nada todavía. Los commits están solo en la rama personal, sin publicar en el remoto (ver "Estado de integración").

## Archivos modificados
| Archivo | Cambio |
|---|---|
| `docs/ROLES.md` | 7 preguntas completas; Selena en el rol D; avance de A, B y C anotado |
| `docs/entregables/ficha_tecnica.md` | Completa |
| `docs/entregables/ficha_fuentes.md` | Completa |
| `docs/entregables/guion_pitch.md` | Nuevo |
| `docs/entregables/guion_video.md` | Nuevo |
| `docs/entregables/poster.md` | Nuevo |
| `docs/entregables/prueba_clon_limpio.md` | Nuevo |
| `README.md` | Python 3.14, build, conteo de pruebas, tabla de entregables, uso de IA, un límite nuevo |
| `docs/CONTRATO_API.md` | Ejemplos con IDs reales y campos nuevos documentados (**compartido**) |
| `skills/skill_base_agente_selena/*` | Perfil, SKILL.md, matriz con VCPD-003 y este informe |

## Contratos y dependencias afectados
- `docs/CONTRATO_API.md`: solo cambia la documentación, no la forma de la API. Los tests no se tocaron. Hay que avisar al equipo y que alguien lo revise, según §§9–10.
- Depende del trabajo de Diego (`3ff4b86`). Si cambian las escenas, el umbral por defecto o la serie K1, hay que actualizar las cifras de los entregables.

## Validaciones
| Comando | Directorio/alcance | Resultado |
|---|---|---|
| `git clone ... -b dev-Selena-Milagros-Britez` | carpeta temporal vacía | Correcto |
| `uv sync` | `apps/backend` | **Falla** con Python 3.15 (pyyaml sin binarios) |
| `uv sync --python 3.14` | `apps/backend` | Correcto |
| `uv run pytest -q` | `apps/backend` | 40 pasaron, 1 aviso |
| `npm ci` | `apps/frontend` | Correcto |
| `npm test` | `apps/frontend` | 37 pasaron |
| `npm run build` | `apps/frontend` | Correcto |
| `POST /api/comparar` 02/10 → 26/10/2026 | API local | 200 · 110,64 ha / 43,25 ha |
| `POST /api/comparar` misma escena | API local | 400 · "Elegí dos escenas distintas para comparar." |
| `git diff f1ca354 3ff4b86 -- SKILL_BASE.md PLANTILLAS.md` | protocolo | Sin cambios |

## Commits
| Commit | Mensaje |
|---|---|
| `8385507` | Merge de dev-Diego en dev-Selena-Milagros-Britez |
| `3376fcb` | docs(roles): responder las 7 preguntas y tomar el rol D |
| `82edd65` | docs(entregables): completar la ficha técnica |
| `742b76f` | docs(entregables): completar la ficha de fuentes |
| `71daa09` | docs(entregables): guion del pitch de 3 minutos |
| `406450a` | docs(entregables): guion del video de 120 segundos |
| `328b66d` | docs(entregables): texto del póster |
| `327f370` | docs(entregables): registro de la prueba desde un clon limpio |
| `3503b0b` | docs: README final con Python 3.14 y la lista de entregables |
| `5d073d5` | docs(contrato): ejemplos con las escenas reales y campos nuevos |
| (este commit) | docs(agent): skill de Selena con el rol D, tareas e informe |

## Pendientes y riesgos
- **La entrega es hoy, 20/11/2026 a las 18 h** (según la plantilla de la ficha técnica). El pitch es el sábado 21/11 desde las 10:00.
- **Commit o tag evaluable:** falta integrar en `main` y crear el tag (se propone `entrega-2026-11-20`). Después hay que anotarlo en la ficha técnica y el README.
- **Video:** falta grabarlo, exportarlo y guardar las dos copias.
- **Póster:** falta el diseño, las capturas, el QR y la impresión.
- **Pitch:** falta repartir los bloques y ensayar con cronómetro.
- **Interfaz:** falta una pasada manual con el navegador antes del pitch.
- **Roles:** faltan los de Agostina y Matías, y la confirmación de A, B y C.
- **Riesgo:** si alguien clona y corre `uv sync` sin `--python 3.14` con uv 0.13 en Windows, la instalación falla. El README lo advierte, pero conviene fijar la versión en el backend.

## Bloqueos y ayuda necesaria
- **Rol B / Diego:** agregar `apps/backend/.python-version` con `3.14`, o `requires-python = ">=3.11,<3.15"`.
- **Equipo:** confirmar las 7 preguntas, los roles y el cambio en el contrato; decidir quién integra en `main`.

## Información para otros agentes
- Las cifras de todos los entregables salen de la comparación 02/10/2026 → 26/10/2026 con umbral 0 (110,64 ha / 43,25 ha; río 2,35 → 5,44 m) y de 13/11/2024 → 21/06/2019 (1.097,89 ha / 11,47 ha; río −0,62 → 9,08 m). Si cambia el cálculo, avisen al rol D.
- `docs/entregables/ficha_fuentes.md` es la lista de lo que la herramienta puede mostrar: si agregan una cifra o capa a la interfaz, súmenla ahí.

## Estado de integración
No solicitada. Los commits son locales en `dev-Selena-Milagros-Britez` y todavía no se publicaron en `origin`.
