# Matriz de compatibilidad — Skill personal Diegoat vs. Skill general v0.4.0

Commit de referencia de la skill general: `c3d5b943c72ab761879a36b7c44f8601e17495ad`

## Requisitos de la Skill General

| # | Sección skill general | Requisito | Archivo/campo en skill personal | Estado | Evidencia / Ruta | Decisión humana necesaria |
|---|---|---|---|---|---|---|
| 1 | §4.2 Ficha personal — Identidad: ID integrante | Identificador del integrante | `perfil.yaml` → `integrante.id` | PENDIENTE | Valor: `PENDIENTE` | Sí — el equipo debe asignar ID |
| 2 | §4.2 Ficha personal — Identidad: alias | Alias del agente | `perfil.yaml` → `integrante.alias` | CUBIERTO | Valor: `Diegoat` | No |
| 3 | §4.2 Ficha personal — Identidad: nombre real | Nombre real | `perfil.yaml` → `integrante.nombre_real` | CUBIERTO | Valor: `Diego` | No |
| 4 | §4.2 Ficha personal — Identidad: ID agente | Identificador del agente | `perfil.yaml` → `agente.id` | PENDIENTE | Valor: `PENDIENTE` | Sí — el equipo debe asignar ID |
| 5 | §4.2 Ficha personal — Runtime | Herramienta/modelo utilizado | `perfil.yaml` → `agente.runtime` | CUBIERTO | Valor: `Antigravity CLI (Claude Opus 4.6 Thinking)` | No |
| 6 | §4.2 Ficha personal — Subagentes | Disponibilidad real de subagentes | `perfil.yaml` → `agente.soporte_subagentes` + `agente.subagentes_disponibles` | CUBIERTO | `true`, 3 subagentes listados | No |
| 7 | §4.2 Ficha personal — Git: rama personal | Rama personal | `perfil.yaml` → `git.rama_desarrollo` | CUBIERTO | Valor: `dev-Diego` | No |
| 8 | §4.2 Ficha personal — Git: rama base | Rama base | `perfil.yaml` → `git.rama_base` + `git.commit_base` | CUBIERTO | `main` / `c3d5b94` | No |
| 9 | §4.2 Ficha personal — Git: remoto | Remoto configurado | `perfil.yaml` → `git.remoto` + `git.url_remoto` | CUBIERTO | `origin` / URL verificada | No |
| 10 | §4.2 Ficha personal — Git: rama integración | Rama de integración | `perfil.yaml` → `git.rama_integracion` | PENDIENTE | Valor: `PENDIENTE` | Sí — el equipo debe definirla |
| 11 | §4.2 Ficha personal — Responsabilidades: módulos | Módulos asignados | `perfil.yaml` → `responsabilidades.modulos` | PENDIENTE | Lista vacía | Sí — distribución no definida |
| 12 | §4.2 Ficha personal — Responsabilidades: directorios | Directorios autorizados | `perfil.yaml` → `responsabilidades.directorios_autorizados` | PARCIAL | Solo skill propia listada | Sí — el equipo debe completar |
| 13 | §4.2 Ficha personal — Responsabilidades: archivos compartidos | Archivos compartidos | `perfil.yaml` → `responsabilidades.archivos_compartidos` | CUBIERTO | `SKILL_BASE.md`, `PLANTILLAS.md` | No |
| 14 | §4.2 Ficha personal — Responsabilidades: límites | Límites de autonomía | `perfil.yaml` → `responsabilidades.limites` | CUBIERTO | 5 límites explícitos, coherentes con §20 | No |
| 15 | §4.2 Ficha personal — Tareas | Tareas con ID, estado, etc. | `perfil.yaml` → `tareas[]` + `SKILL.md` §5 | PARCIAL | Solo tarea de setup; tareas de desarrollo pendientes | Sí — asignación de tareas |
| 16 | §4.2 Ficha personal — Coordinación: canal | Canal persistente | `perfil.yaml` → `coordinacion.canal_comunicacion` | PENDIENTE | Valor: `PENDIENTE` | Sí — el equipo debe elegir canal |
| 17 | §4.2 Ficha personal — Coordinación: revisión | Responsables de revisión e integración | `perfil.yaml` → `coordinacion.responsable_revision` + `responsable_integracion` | PENDIENTE | Valores: `PENDIENTE` | Sí — el equipo debe designar |
| 18 | §4.2 Ficha personal — Coordinación: VCPD | Protocolo VCPD | `SKILL.md` §6.1 + `perfil.yaml` → `coordinacion.protocolo_revision` | CUBIERTO | Procedimiento completo documentado | No |
| 19 | §4.2 Ficha personal — Desarrollo: gestor | Gestor de paquetes | `perfil.yaml` → `desarrollo.gestor_paquetes` | PENDIENTE | Valor: `PENDIENTE` | Sí — no hay stack configurado |
| 20 | §4.2 Ficha personal — Desarrollo: comandos | Comandos reales | `perfil.yaml` → `desarrollo.comandos.*` | PENDIENTE | Todos: `PENDIENTE` | Sí — no hay scripts en el repo |
| 21 | §4.2 Ficha personal — Integración: estrategia | Estrategia aprobada | `perfil.yaml` → `integracion.estrategia` | PENDIENTE | Valor: `PENDIENTE` | Sí — el equipo debe acordar |
| 22 | §5.1 VCPD | Inspección de ramas antes de cada bloque | `SKILL.md` §6.1 | CUBIERTO | Procedimiento de 10 pasos | No |
| 23 | §5.1.B Subagentes para revisión | Uso de subagentes en modo inspección | `SKILL.md` §6.4 | CUBIERTO | Subagentes documentados con restricciones | No |
| 24 | §7 Git y ramas | Nomenclatura y reglas de ramas | `SKILL.md` §3 + §3.1 | CUBIERTO | Reglas completas | No |
| 25 | §11 Comunicación | Información persistida en repositorio | `SKILL.md` §6.5 | PARCIAL | Canal pendiente; principio documentado | Sí — definir canal |
| 26 | §13 Pruebas y calidad | Validaciones ejecutadas e informadas | `SKILL.md` §8.1 | CUBIERTO | Checklist de validación | No |
| 27 | §14 Seguridad | No exponer secretos ni ejecutar operaciones destructivas | `perfil.yaml` → `responsabilidades.limites` + `SKILL.md` §3.1 | CUBIERTO | Límites explícitos | No |
| 28 | §19 Informe obligatorio | Formato de informe | `SKILL.md` §8.4 | CUBIERTO | Referencia a sección 19 y plantilla 5 | No |
| 29 | §20 Límites de autonomía | Restricciones explícitas | `perfil.yaml` → `responsabilidades.limites` | CUBIERTO | 5 límites coherentes con §20 | No |

## Resumen

| Estado | Cantidad |
|---|---|
| **CUBIERTO** | 18 |
| **PARCIAL** | 3 |
| **PENDIENTE** | 8 |

### Campos PENDIENTE — requieren decisión humana del equipo

1. **ID del integrante** — asignación de identificadores en registro del equipo.
2. **ID del agente** — asignación de identificadores en registro del equipo.
3. **Rama de integración** — el equipo debe designar cuál rama usar.
4. **Módulos asignados** — distribución de responsabilidades.
5. **Canal de comunicación** — elección de mecanismo persistente.
6. **Responsables de revisión e integración** — designación de personas.
7. **Gestor de paquetes y comandos** — definición del stack técnico.
8. **Estrategia de integración** — acuerdo del equipo.

### Campos PARCIAL — datos comprobables incompletos

1. **Directorios autorizados** — solo el directorio de la skill propia; el resto depende de asignaciones futuras.
2. **Tareas** — solo la tarea de setup; tareas de desarrollo pendientes de asignación.
3. **Comunicación** — principio documentado pero canal no definido.

> Ningún campo fue marcado como CUBIERTO con valores inventados o supuestos. Los valores PENDIENTE reflejan decisiones que el equipo humano debe tomar.
