# Plantillas de coordinación del equipo

Estas plantillas complementan `SKILL.md`. Deben copiarse y completarse en el repositorio cuando el equipo defina sus integrantes, tareas y proceso de integración.

## 1. Registro de integrantes y agentes

| Integrante | ID del agente | Herramienta/runtime | Rama asignada | Módulo/área | Revisor |
|---|---|---|---|---|---|
| Integrante 1 | `AG-01` | Pendiente | Pendiente | Pendiente | Pendiente |
| Integrante 2 | `AG-02` | Pendiente | Pendiente | Pendiente | Pendiente |
| Integrante 3 | `AG-03` | Pendiente | Pendiente | Pendiente | Pendiente |
| Integrante 4 | `AG-04` | Pendiente | Pendiente | Pendiente | Pendiente |

**Convención obligatoria de ramas personales:** `dev-[Nombre Real]` (reemplazar espacios por guiones; no incluir corchetes).

**Rama de integración:** Pendiente de definir.

**Responsable de integración:** Pendiente de definir.

**Canal oficial de coordinación:** Pendiente de definir.

## 2. Ficha de tarea

```yaml
id: TASK-XXX
titulo: "Título breve"
responsable: "Integrante / AG-XX"
estado: PENDIENTE
prioridad: "Pendiente de definir"
objetivo: "Qué resultado se necesita y para qué."
alcance:
  incluye:
    - "..."
  excluye:
    - "..."
archivos_o_modulos_previstos:
  - "..."
dependencias:
  - "TASK-YYY o contrato requerido"
contratos:
  - "Interfaz, endpoint, tipo o esquema relacionado"
criterios_de_aceptacion:
  - "Condición verificable 1"
  - "Condición verificable 2"
pruebas_requeridas:
  - "..."
riesgos_y_preguntas:
  - "..."
```

## 3. Propuesta de modificación de recurso compartido

```markdown
# Propuesta: PROP-XXX

- Autor:
- Agente:
- Fecha:
- Recurso compartido afectado:
- Tareas/agentes afectados:

## Situación actual
¿Qué existe hoy y cuál es el problema?

## Cambio propuesto
¿Qué se quiere modificar exactamente?

## Compatibilidad e impacto
¿Qué consumidores, módulos o comportamientos pueden verse afectados?

## Alternativas consideradas
¿Qué otras opciones se evaluaron?

## Validación prevista
¿Qué pruebas demostrarán que el cambio es seguro?

## Decisión
- Estado: PENDIENTE / APROBADA / RECHAZADA
- Decidido por:
- Fecha:
- Observaciones:
```

## 4. Registro de decisión técnica

```markdown
# Decisión: DEC-XXX — Título

- Estado: PROPUESTA / APROBADA / REEMPLAZADA
- Fecha:
- Responsable de la decisión:
- Agentes o módulos afectados:

## Contexto
¿Qué problema o necesidad requiere una decisión?

## Decisión
¿Qué se resolvió?

## Consecuencias
¿Qué cambia? ¿Qué ventajas, costos o limitaciones introduce?

## Alternativas descartadas
¿Qué otras opciones se evaluaron y por qué no se eligieron?

## Referencias
Tareas, contratos, commits o documentos relacionados.
```

## 5. Informe de entrega o bloqueo

```markdown
# Informe — TASK-XXX

- Responsable:
- Agente:
- Rama:
- Estado: EN_REVISION / BLOQUEADA

## Objetivo

## Trabajo realizado

## Archivos modificados

## Contratos y dependencias afectados

## Validaciones
| Comando | Directorio/alcance | Resultado |
|---|---|---|
| ... | ... | ... |

## Commits

## Pendientes y riesgos

## Bloqueos y ayuda necesaria

## Información para otros agentes

## Estado de integración
No solicitada / En revisión / Integrada
```

## 6. Registro breve de estado del equipo

| ID de tarea | Responsable | Estado | Rama | Bloqueo/dependencia | Última actualización |
|---|---|---|---|---|---|
| TASK-XXX | Pendiente | PENDIENTE | Pendiente | Ninguno registrado | Pendiente |

Actualizar este registro cuando cambie el estado de una tarea, aparezca un bloqueo o se modifique una dependencia.


## 7. Registro de Verificación Cruzada Previa al Desarrollo (VCPD)

Completar este registro antes de cada nuevo bloque de desarrollo o modificación. No hace falta repetirlo por cada línea dentro de un mismo bloque continuo ya revisado, pero sí antes de iniciar una unidad nueva de cambios o cuando aparezca información externa relevante.

```yaml
revision_vcpd:
  id: "VCPD-AAAA-MM-DD-XXX"
  fecha_hora: "AAAA-MM-DD HH:MM TZ"
  tarea: "TASK-XXX"
  bloque_de_cambio: "Descripción breve"
  integrante: "Nombre real"
  agente: "AG-XX"
  rama_propia: "dev-[Nombre Real]"
  commit_propio: "hash"
  rama_integracion_consultada: "PENDIENTE"
  fetch_realizado: true
  ramas_inspeccionadas:
    - rama: "dev-Integrante-2"
      ultimo_commit: "hash / no disponible"
      archivos_relevantes: []
      impacto: "SIN_IMPACTO / RELEVANTE / POSIBLE_CONFLICTO / NO_VERIFICABLE"
      decision: "INCORPORAR / COORDINAR / NO_INCORPORAR / ESPERAR"
      motivo: "..."
  subagentes:
    utilizados: false
    resultados: []
  estado_compartido_consultado: true
  limitaciones_de_visibilidad: []
  decision_general: "CONTINUAR / CONTINUAR_PARCIALMENTE / ESPERAR / BLOQUEAR_PARTE_AFECTADA"
  partes_seguras_para_continuar: []
  partes_que_requieren_coordinacion: []
  responsable_contactado: []
```

Si no se pudo ejecutar `git fetch`, inspeccionar una rama o consultar el estado compartido, indicarlo expresamente. No marcar la revisión como completa si existen limitaciones relevantes sin resolver.
