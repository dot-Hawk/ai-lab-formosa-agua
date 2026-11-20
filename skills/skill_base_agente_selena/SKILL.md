---
name: skill_base_agente_selena
description: Aplica el protocolo del Equipo 1 al trabajo autorizado de Selena Milagros Britez, incluida la VCPD y la entrega desde su rama personal.
---

# Skill personal de Selena Milagros Britez

## Identidad y autoridad

Consultá [perfil.yaml](perfil.yaml) para la configuración de la integrante. El pedido confirma el nombre completo y la rama. [El registro del equipo](../../docs/ROLES.md) dice «Selena Brítez». Usá «Selena» como alias provisional hasta que el equipo confirme la ficha. Los IDs están pendientes. La sesión de alta usa Codex con PowerShell y Git. El bloque del rol D (2026-11-20) usó Claude Code con PowerShell, Git Bash y Git. El runtime habitual y su capacidad de delegación quedan pendientes de confirmación. Los commits salen con el autor Git `sbrittz`, el mismo del alta.

Leé íntegramente [SKILL_BASE.md](../../SKILL_BASE.md), versión 0.4.0, consultada en `f1ca354def7dbe707a22f1920e48c5037da068d2`. Aplicá su orden de autoridad (§2). Tras el fetch, compará el commit de referencia con el main remoto en las rutas del protocolo y las [plantillas](../../PLANTILLAS.md). Si cambian, revisá las reglas vigentes antes del próximo bloque y actualizá las referencias y la matriz en un bloque autorizado. Mantené la autoridad en el archivo general y referencialo desde esta skill.

## Rama, propiedad y coordinación

Trabajá en `dev-Selena-Milagros-Britez`, creada desde `origin/main` y publicada en `origin/dev-Selena-Milagros-Britez`. El 2026-11-20 se incorporó `origin/dev-Diego` (`3ff4b86`) con un merge sin conflictos, para armar los entregables sobre la versión actual. La integración en `main` sigue pendiente. Preservá cambios existentes, inspeccioná ramas ajenas en lectura y aplicá las reglas de Git y autonomía de §§7 y 20.

Para cada tarea, obtené una ficha con ID, responsable, estado, objetivo, alcance, dependencias, criterios y pruebas según PLANTILLAS.md §2. El alcance confirmado para el alta es esta carpeta. Las futuras asignaciones y permisos están pendientes. Consultá [el contrato](../../docs/CONTRATO_API.md) antes de intervenir en la interfaz entre frontend y backend. Coordiná cualquier cambio a recursos compartidos con el responsable humano mientras falte un aprobador designado y registrá su decisión según §§9–10.

Repetí la VCPD (§5.1) antes de cada bloque independiente, al retomar después de una interrupción relevante, ante nuevos cambios que afecten el alcance y antes de solicitar revisión. Revisá estado, rama, remotos, fetch e historial. Contrastá con las ramas disponibles de los otros tres integrantes. La referencia visible al alta fue `origin/dev-Diego`. Confirmá las referencias de Agostina y Matías cuando estén registradas o publicadas. Consultá el estado compartido y verificá con el responsable el trabajo local si afecta una zona compartida o dependencia directa. El canal oficial está pendiente y el registro de roles alude al grupo del equipo.

Cuando haya delegación activa y aporte una segunda revisión, pedí inspección de solo lectura con ID de tarea o bloque, ramas y rutas. Pedí commits, impactos y decisión sugerida. Evaluá qué incorporar, coordinar, esperar o descartar y registrá la evidencia y las limitaciones según PLANTILLAS.md §7. Si la visibilidad falta, aislá la parte dependiente y avanzá en lo independiente.

## Rol D · Entregables

Selena tomó el rol D de [docs/ROLES.md](../../docs/ROLES.md) el 2026-11-20. Falta que el equipo lo confirme. Las tareas `TASK-D-01` a `TASK-D-08` y su estado están en [perfil.yaml](perfil.yaml), y el informe del bloque en [INFORME_ROL_D.md](INFORME_ROL_D.md).

| Entregable | Archivo | Exigido por |
|---|---|---|
| Las 7 preguntas | `docs/ROLES.md` | Guía del desafío §04 |
| Ficha técnica | `docs/entregables/ficha_tecnica.md` | Documento base, p. 9 |
| Ficha de fuentes | `docs/entregables/ficha_fuentes.md` | Documento base, p. 9 |
| Guion del pitch (3 min) | `docs/entregables/guion_pitch.md` | Documento base, pp. 1 y 10 |
| Guion del video (≤ 120 s, MP4) | `docs/entregables/guion_video.md` | Documento base, p. 9 |
| Texto del póster | `docs/entregables/poster.md` | Documento base, pp. 9 y 10 |
| Prueba desde un clon limpio | `docs/entregables/prueba_clon_limpio.md` | Entrega técnica, p. 2 |
| README final | `README.md` | Entrega técnica, p. 1 |

Reglas para este rol:

- **Toda cifra sale de la herramienta o del kit.** Antes de escribir un número en un entregable, consultalo en la API (`/api/escenas`, `/api/comparar`) o en el archivo de datos, y agregalo a la ficha de fuentes. Si la cifra cambia, actualizá todos los entregables que la usan: 7 preguntas, ficha técnica, ficha de fuentes, pitch, video y póster.
- **Separá lo observado de lo calculado.** Las hectáreas y el NDWI son resultados de la herramienta, no datos observados.
- **Lo que falta se escribe como PENDIENTE**, sin inventar el dato: roles sin confirmar, commit o tag evaluable, reparto del pitch, ubicación del video.
- **No toques código desde el rol D.** Si la prueba desde un clon limpio encuentra un problema en `apps/`, anotalo en `prueba_clon_limpio.md` y proponé el arreglo al rol que corresponde.
- **Un commit por entregable**, en español, con el formato `tipo(alcance): descripción` que usa el equipo.
- **Repetí la prueba desde un clon limpio** sobre el commit o tag evaluable antes de la entrega.

## Entorno y entrega

La [documentación de entrada](../../README.md) y los manifiestos describen dos aplicaciones independientes, una API Python gestionada con uv y un frontend Vite gestionado con npm. El frontend consume la API según el contrato compartido. Consultá perfil.yaml para comandos por directorio y versiones declaradas. Inspeccioná los manifiestos vigentes antes de ejecutar o proponer otros comandos.

Validá según el alcance, revisá el diff y el estado, y confirmá solo rutas de la tarea. Para esta skill, verificá YAML, enlaces, coherencia, procedencia de datos y ausencia de secretos o artefactos locales. Para los cambios de aplicación, tomá las pruebas y la compilación aplicables de los manifiestos y del registro de roles. Repetí la VCPD antes de solicitar revisión. Presentá el informe de SKILL_BASE.md §19 y PLANTILLAS.md §5 con comandos, resultados, commits, pendientes y estado de publicación e integración. Aplicá §§17–18 al solicitar revisión e integrar una vez que el equipo defina responsables, rama y estrategia.
