# Matriz de compatibilidad

Referencia de secciones en [SKILL_BASE.md](../../SKILL_BASE.md), versión 0.4.0. La evidencia de cada estado está en los archivos y campos indicados. Última actualización: 2026-11-20, bloque del rol D.

| Requisito | Evidencia | Estado | Decisión pendiente |
|---|---|---|---|
| §§2–4 Autoridad e identidad | [SKILL.md](SKILL.md) y [perfil.yaml](perfil.yaml), `integrante`, `agente`, `skill_general` | PARCIAL | Confirmar ficha, alias e IDs |
| §§5, 7 Rama y base | `git` en perfil.yaml, incluido el merge de `dev-Diego` | CUBIERTO | |
| §§4, 8–10 Responsabilidades y recursos compartidos | `responsabilidades`, [roles](../../docs/ROLES.md) y [contrato](../../docs/CONTRATO_API.md) | PARCIAL | Confirmar el rol D y revisar el cambio de documentación en el contrato (`5d073d5`) |
| §§6, 12 Tareas, dependencias y aceptación | `tareas` (TASK-D-01 a TASK-D-08) con criterios, pruebas y commits | PARCIAL | Que el equipo confirme las tareas y asigne revisor |
| §5.1 VCPD recurrente | SKILL.md, `coordinacion` y registro debajo | PARCIAL | Confirmar ramas faltantes y acceso al estado no publicado |
| §5.1.B Delegación | SKILL.md y `agente.soporte_subagentes` | PARCIAL | Confirmar el runtime habitual y su capacidad |
| §11 Comunicación | `coordinacion` y docs/ROLES.md | PARCIAL | Definir canal y registro de trabajo no publicado |
| §8 Stack, comandos y dependencias | `desarrollo` con versiones y resultados probados, [README](../../README.md), [backend](../../apps/backend/pyproject.toml) y [frontend](../../apps/frontend/package.json) | PARCIAL | Lint y tipos sin script en los manifiestos; fijar Python 3.14 en el backend (rol B) |
| §§13–14 Validación y seguridad | SKILL.md, PLANTILLAS.md §5 y [prueba_clon_limpio.md](../../docs/entregables/prueba_clon_limpio.md) | CUBIERTO | |
| §§15–16, 20 Autonomía, conflictos y bloqueos | SKILL.md, `responsabilidades.limites` y protocolo general | CUBIERTO | |
| §§17–19 Entrega, revisión e integración | SKILL.md, `integracion`, PLANTILLAS.md §5 e [INFORME_ROL_D.md](INFORME_ROL_D.md) | PARCIAL | Confirmar responsables, rama y estrategia |

## Registro de VCPD

| ID de revisión | Fecha local | Bloque | Rama propia y commit | Fetch | Decisión |
|---|---|---|---|---|---|
| VCPD-2026-11-20-001 | 2026-11-20, UTC−03 | Inspección y creación de rama personal | `main` durante la inspección, `f1ca354def7dbe707a22f1920e48c5037da068d2` | Correcto tras autorización | Continuar con el nombre de rama confirmado en el pedido |
| VCPD-2026-11-20-002 | 2026-11-20 11:22 UTC−03 | Documentación de la skill personal | `dev-Selena-Milagros-Britez`, mismo commit base | Correcto | Continuar dentro de la carpeta personal |
| VCPD-2026-11-20-003 | 2026-11-20, tarde, UTC−03 | Rol D: entregables, README y prueba desde un clon limpio | `dev-Selena-Milagros-Britez`, `ebae4f9` antes del bloque | Correcto (`git fetch --all`) | Incorporar `dev-Diego`; continuar en `docs/`, `README.md` y la carpeta personal; coordinar el cambio en el contrato |

### Detalle de VCPD-2026-11-20-003

```yaml
revision_vcpd:
  id: "VCPD-2026-11-20-003"
  fecha_hora: "2026-11-20, tarde, UTC-03"
  tarea: "TASK-D-01 a TASK-D-08"
  bloque_de_cambio: "Entregables del rol D, README final y prueba desde un clon limpio"
  integrante: "Selena Milagros Britez"
  agente: "PENDIENTE"
  rama_propia: "dev-Selena-Milagros-Britez"
  commit_propio: "ebae4f9"
  rama_integracion_consultada: "origin/main (f1ca354)"
  fetch_realizado: true
  ramas_inspeccionadas:
    - rama: "origin/dev-Diego"
      ultimo_commit: "3ff4b86"
      archivos_relevantes:
        - "README.md"
        - "docs/entregables/registro_limpieza.md"
        - "apps/backend/data/escenas/catalogo.json"
        - "apps/frontend/src/"
      impacto: "RELEVANTE"
      decision: "INCORPORAR"
      motivo: "Los entregables tienen que describir las escenas reales, la serie K1 limpia y el frontend en React"
    - rama: "Agostina González"
      ultimo_commit: "no disponible"
      impacto: "NO_VERIFICABLE"
      decision: "ESPERAR"
      motivo: "No hay rama publicada en origin"
    - rama: "Matías Agüero"
      ultimo_commit: "no disponible"
      impacto: "NO_VERIFICABLE"
      decision: "ESPERAR"
      motivo: "No hay rama publicada en origin"
  subagentes:
    utilizados: false
    resultados: []
  estado_compartido_consultado: true
  limitaciones_de_visibilidad:
    - "Ramas de Agostina y Matías no publicadas"
    - "Sin canal registrado para el trabajo local no publicado"
  decision_general: "CONTINUAR_PARCIALMENTE"
  partes_seguras_para_continuar:
    - "docs/entregables/"
    - "README.md"
    - "skills/skill_base_agente_selena/"
    - "docs/ROLES.md (7 preguntas y fila del rol D)"
  partes_que_requieren_coordinacion:
    - "docs/CONTRATO_API.md (solo ejemplos y campos documentados, commit 5d073d5)"
    - "apps/backend/pyproject.toml o .python-version (propuesto al rol B, no modificado)"
  responsable_contactado: []
```

- **Protocolo.** `SKILL_BASE.md` y `PLANTILLAS.md` no cambiaron entre `f1ca354` y `3ff4b86`, así que la versión 0.4.0 sigue vigente.
- **Merge.** `origin/dev-Diego` entró sin conflictos en el commit `8385507`. Después del merge, 40 pruebas del backend y 37 del frontend pasan en un clon limpio.
