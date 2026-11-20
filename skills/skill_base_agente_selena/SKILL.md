---
name: skill_base_agente_selena
description: Aplica el protocolo del Equipo 1 al trabajo autorizado de Selena Milagros Britez, incluida la VCPD y la entrega desde su rama personal.
---

# Skill personal de Selena Milagros Britez

## Identidad y autoridad

Consultá [perfil.yaml](perfil.yaml) para la configuración de la integrante. El pedido confirma el nombre completo y la rama. [El registro del equipo](../../docs/ROLES.md) dice «Selena Brítez». Usá «Selena» como alias provisional hasta que el equipo confirme la ficha. Los IDs están pendientes. La sesión de alta usa Codex con PowerShell y Git. El runtime habitual y su capacidad de delegación quedan pendientes de confirmación.

Leé íntegramente [SKILL_BASE.md](../../SKILL_BASE.md), versión 0.4.0, consultada en `f1ca354def7dbe707a22f1920e48c5037da068d2`. Aplicá su orden de autoridad (§2). Tras el fetch, compará el commit de referencia con el main remoto en las rutas del protocolo y las [plantillas](../../PLANTILLAS.md). Si cambian, revisá las reglas vigentes antes del próximo bloque y actualizá las referencias y la matriz en un bloque autorizado. Mantené la autoridad en el archivo general y referencialo desde esta skill.

## Rama, propiedad y coordinación

Trabajá en `dev-Selena-Milagros-Britez`, creada desde `origin/main` sin upstream personal. La integración sigue pendiente. Preservá cambios existentes, inspeccioná ramas ajenas en lectura y aplicá las reglas de Git y autonomía de §§7 y 20.

Para cada tarea, obtené una ficha con ID, responsable, estado, objetivo, alcance, dependencias, criterios y pruebas según PLANTILLAS.md §2. El alcance confirmado para el alta es esta carpeta. Las futuras asignaciones y permisos están pendientes. Consultá [el contrato](../../docs/CONTRATO_API.md) antes de intervenir en la interfaz entre frontend y backend. Coordiná cualquier cambio a recursos compartidos con el responsable humano mientras falte un aprobador designado y registrá su decisión según §§9–10.

Repetí la VCPD (§5.1) antes de cada bloque independiente, al retomar después de una interrupción relevante, ante nuevos cambios que afecten el alcance y antes de solicitar revisión. Revisá estado, rama, remotos, fetch e historial. Contrastá con las ramas disponibles de los otros tres integrantes. La referencia visible al alta fue `origin/dev-Diego`. Confirmá las referencias de Agostina y Matías cuando estén registradas o publicadas. Consultá el estado compartido y verificá con el responsable el trabajo local si afecta una zona compartida o dependencia directa. El canal oficial está pendiente y el registro de roles alude al grupo del equipo.

Cuando haya delegación activa y aporte una segunda revisión, pedí inspección de solo lectura con ID de tarea o bloque, ramas y rutas. Pedí commits, impactos y decisión sugerida. Evaluá qué incorporar, coordinar, esperar o descartar y registrá la evidencia y las limitaciones según PLANTILLAS.md §7. Si la visibilidad falta, aislá la parte dependiente y avanzá en lo independiente.

## Entorno y entrega

La [documentación de entrada](../../README.md) y los manifiestos describen dos aplicaciones independientes, una API Python gestionada con uv y un frontend Vite gestionado con npm. El frontend consume la API según el contrato compartido. Consultá perfil.yaml para comandos por directorio y versiones declaradas. Inspeccioná los manifiestos vigentes antes de ejecutar o proponer otros comandos.

Validá según el alcance, revisá el diff y el estado, y confirmá solo rutas de la tarea. Para esta skill, verificá YAML, enlaces, coherencia, procedencia de datos y ausencia de secretos o artefactos locales. Para los cambios de aplicación, tomá las pruebas y la compilación aplicables de los manifiestos y del registro de roles. Repetí la VCPD antes de solicitar revisión. Presentá el informe de SKILL_BASE.md §19 y PLANTILLAS.md §5 con comandos, resultados, commits, pendientes y estado de publicación e integración. Aplicá §§17–18 al solicitar revisión e integrar una vez que el equipo defina responsables, rama y estrategia.
