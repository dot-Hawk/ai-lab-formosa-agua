# Skill personal: Agente Diegoat

## Propósito

Esta skill define la identidad, contexto, configuración y responsabilidades del agente **Diegoat** (integrante **Diego**) dentro del monorepo compartido por cuatro integrantes.

## Relación con la skill principal

Esta skill **complementa** la skill general `protocolo-equipo-multiagente` (v0.4.0), ubicada en `SKILL_BASE.md` en la raíz del monorepo. No la sustituye ni la contradice.

Ante cualquier contradicción, prevalece el orden de autoridad definido en la sección 2 de la skill general:

1. Instrucciones explícitas del responsable humano.
2. Decisiones técnicas aprobadas del equipo.
3. Contratos y documentación vigente.
4. Skill general (`SKILL_BASE.md`).
5. Esta skill personal.

## Contenido

| Archivo | Descripción |
|---|---|
| `SKILL.md` | Instrucciones operativas del agente: identidad, Git, coordinación (VCPD), responsabilidades, tareas, entorno, entrega |
| `perfil.yaml` | Datos estructurados del integrante y agente: identidad, rama, responsabilidades, tareas, coordinación, desarrollo |
| `README.md` | Este archivo: propósito, relación con skill general, estructura, uso |
| `MATRIZ_COMPATIBILIDAD.md` | Verificación de cobertura de requisitos de la skill general |

## Información pendiente de decisión humana

Los siguientes datos permanecen como `PENDIENTE` porque requieren definición por parte del equipo:

- **ID del integrante y del agente:** el registro en `PLANTILLAS.md` no asigna IDs aún.
- **Módulos y responsabilidades:** distribución no definida.
- **Rama de integración:** no designada por el equipo.
- **Responsables de revisión e integración:** no asignados.
- **Canal de comunicación:** no definido.
- **Gestor de paquetes y comandos:** no hay stack tecnológico configurado en el monorepo.
- **Estrategia de integración:** no acordada.
- **Tareas de desarrollo:** no asignadas.

## Cómo cargar esta skill

El agente Diegoat debe, al iniciar cada sesión de trabajo:

1. Leer la skill general: `SKILL_BASE.md` (raíz).
2. Leer las plantillas: `PLANTILLAS.md` (raíz).
3. Leer esta skill: `skills/skill_base_agente_diegoat/SKILL.md`.
4. Verificar si el commit de referencia de la skill general cambió (sección 2.2 de SKILL.md).
5. Ejecutar la VCPD antes de cualquier modificación.

## Actualización cuando cambia la skill principal

Cuando `SKILL_BASE.md` en `origin/main` tenga un commit más reciente que el registrado en esta skill:

1. Leer el diff de los cambios.
2. Evaluar impacto sobre `SKILL.md` y `perfil.yaml`.
3. Actualizar el campo `commit de referencia` / `commit_referencia`.
4. Adaptar las secciones afectadas de esta skill.
5. Actualizar la `MATRIZ_COMPATIBILIDAD.md` si hay requisitos nuevos.
6. No modificar `SKILL_BASE.md` directamente.
