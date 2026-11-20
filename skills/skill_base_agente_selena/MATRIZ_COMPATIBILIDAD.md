# Matriz de compatibilidad

Referencia de secciones en [SKILL_BASE.md](../../SKILL_BASE.md), versión 0.4.0. La evidencia de cada estado está en los archivos y campos indicados.

| Requisito | Evidencia | Estado | Decisión pendiente |
|---|---|---|---|
| §§2–4 Autoridad e identidad | [SKILL.md](SKILL.md) y [perfil.yaml](perfil.yaml), `integrante`, `agente`, `skill_general` | PARCIAL | Confirmar ficha, alias e IDs |
| §§5, 7 Rama y base | `git` en perfil.yaml | CUBIERTO | |
| §§4, 8–10 Responsabilidades y recursos compartidos | `responsabilidades`, [roles](../../docs/ROLES.md) y [contrato](../../docs/CONTRATO_API.md) | PARCIAL | Asignar módulos, permisos y aprobadores |
| §§6, 12 Tareas, dependencias y aceptación | `tareas` y [ficha de tarea](../../PLANTILLAS.md) §2 | PENDIENTE | Registrar asignaciones con criterios y pruebas |
| §5.1 VCPD recurrente | SKILL.md, `coordinacion` y registro debajo | PARCIAL | Confirmar ramas faltantes y acceso al estado no publicado |
| §5.1.B Delegación | SKILL.md y `agente.soporte_subagentes` | PARCIAL | Confirmar el runtime habitual y su capacidad |
| §11 Comunicación | `coordinacion` y docs/ROLES.md | PARCIAL | Definir canal y registro de trabajo no publicado |
| §8 Stack, comandos y dependencias | `desarrollo`, [README](../../README.md), [backend](../../apps/backend/pyproject.toml) y [frontend](../../apps/frontend/package.json) | PARCIAL | Definir comandos todavía pendientes |
| §§13–14 Validación y seguridad | SKILL.md y PLANTILLAS.md §5 | CUBIERTO | |
| §§15–16, 20 Autonomía, conflictos y bloqueos | SKILL.md, `responsabilidades.limites` y protocolo general | CUBIERTO | |
| §§17–19 Entrega, revisión e integración | SKILL.md, `integracion` y PLANTILLAS.md §5 | PARCIAL | Confirmar responsables, rama y estrategia |

## Registro de VCPD del alta

| ID de revisión | Fecha local | Bloque | Rama propia y commit | Fetch | Decisión |
|---|---|---|---|---|---|
| VCPD-2026-11-20-001 | 2026-11-20, UTC−03 | Inspección y creación de rama personal | `main` durante la inspección, `f1ca354def7dbe707a22f1920e48c5037da068d2` | Correcto tras autorización | Continuar con el nombre de rama confirmado en el pedido |
| VCPD-2026-11-20-002 | 2026-11-20 11:22 UTC−03 | Documentación de la skill personal | `dev-Selena-Milagros-Britez`, mismo commit base | Correcto | Continuar dentro de la carpeta personal |

- **Integrante** Selena Milagros Britez. ID oficial de tarea y agente pendientes. Rama de integración sin definir.
- **Referencias** `origin/main` confirmó la base. `origin/dev-Diego` quedó en `7518cc12f9d9daa701048a26b980ed4d2841cf95` tras actualizarse desde `47b0094`. Las ramas de Agostina y Matías no estaban disponibles y sus nombres exactos no estaban registrados.
- **Evidencia** `00bc663` aporta el precedente de ubicación en `skills/`. Los cambios de frontend React (`bcddf5a`, `c17b250`) y del flujo K1 (`24bd739`, `7d10a0f`, `7518cc1`) no son dependencias de este bloque. El protocolo, las plantillas, los roles y el contrato no presentaron diferencias en la comparación desde el ancestro común. No se incorporaron commits ajenos.
- **Visibilidad** VCPD parcial. Se consultaron los roles y la plantilla de estado. Faltan las ramas de dos integrantes y un registro accesible de cambios no publicados. La documentación personal no modifica áreas compartidas ni depende de trabajo local ajeno. Inspección directa, sin subagentes ni contacto externo.
