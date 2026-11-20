---
name: skill_base_agente_diegoat
version: 0.1.0
description: Skill personal del agente Diegoat (integrante Diego). Complementa la skill general protocolo-equipo-multiagente v0.4.0.
language: es
---

# Skill personal: Agente Diegoat

## 1. Identidad

| Campo | Valor |
|---|---|
| **Alias** | Diegoat |
| **Nombre real** | Diego |
| **ID del integrante** | PENDIENTE — no asignado en el registro del equipo |
| **ID del agente** | PENDIENTE — no asignado en el registro del equipo |
| **Runtime** | Antigravity CLI (Claude Opus 4.6 Thinking) |
| **Soporte de subagentes** | Sí — subagentes `research` (solo lectura), `self`, `image-generator` disponibles |

## 2. Relación con la skill principal

- **Ruta de la skill general:** `SKILL_BASE.md` (raíz del monorepo).
- **Versión de referencia:** `0.4.0`.
- **Commit de referencia:** `c3d5b943c72ab761879a36b7c44f8601e17495ad` (branch `main`).
- **Plantillas asociadas:** `PLANTILLAS.md` (raíz del monorepo).

### 2.1 Obligaciones

1. **Leer y cumplir** la skill general antes de cada sesión de trabajo.
2. **Precedencia:** ante contradicción, prevalece el orden definido en la sección 2 de la skill general (instrucciones humanas > decisiones del equipo > contratos > skill general > esta skill personal).
3. **Esta skill complementa** la skill general; no puede sustituirla, contradecirla ni establecer excepciones unilaterales.
4. **No copiar** la skill general dentro de esta skill para evitar una segunda fuente normativa.

### 2.2 Detección de actualizaciones

Antes de cada sesión de trabajo, el agente debe:

1. Ejecutar `git fetch --all --prune`.
2. Comparar el commit de `SKILL_BASE.md` en `origin/main` con el commit de referencia registrado en esta skill.
3. Si hay cambios, leer el diff y evaluar impacto sobre esta skill personal.
4. Actualizar el campo `commit de referencia` y adaptar las secciones afectadas.
5. Nunca modificar `SKILL_BASE.md` ni `PLANTILLAS.md` directamente.

## 3. Git

| Campo | Valor |
|---|---|
| **Rama personal** | `dev-Diego` |
| **Rama base** | `main` (commit `c3d5b94`) |
| **Remoto verificado** | `origin` → `https://github.com/dot-Hawk/ai-lab-formosa-agua.git` |
| **Rama de integración** | PENDIENTE — no definida por el equipo |

### 3.1 Reglas de protección de ramas

- Trabajar exclusivamente en `dev-Diego`.
- No modificar `main` directamente.
- No crear, modificar, eliminar ni utilizar ramas de otros integrantes sin autorización.
- No ejecutar `push --force` ni reescribir historial compartido.
- No borrar ramas ajenas.
- Comprobar `git status` antes de cambiar de rama para no dejar cambios sin guardar.
- No hacer merge hacia `main` ni hacia una rama de integración sin autorización.

## 4. Responsabilidades y límites

> **Estado actual:** no definidas por el equipo.

| Campo | Valor |
|---|---|
| **Módulos asignados** | PENDIENTE — sin asignación |
| **Directorios autorizados** | `skills/skill_base_agente_diegoat/` (propio). Resto: según asignación futura |
| **Archivos compartidos que exigen coordinación** | `SKILL_BASE.md`, `PLANTILLAS.md`, configuraciones raíz, contratos, esquemas |
| **Operaciones que requieren aprobación** | Cambios en archivos compartidos, contratos, arquitectura, dependencias raíz, despliegues |

### 4.1 Tareas y responsabilidades pendientes de definición

El equipo debe completar (sección 21 de la skill general):

- Distribución de módulos y responsabilidades.
- Tareas concretas, criterios de aceptación y dependencias.
- Estrategia de sincronización de ramas.
- Responsable de integración y revisión.

Hasta entonces, el agente no asume propiedad exclusiva sobre ningún módulo o archivo.

## 5. Tareas

No hay tareas asignadas formalmente. La tarea actual de setup se documenta a continuación como referencia:

```yaml
id: TASK-SETUP-DIEGOAT
titulo: "Crear skill personal del agente Diegoat"
responsable: "Diego / Diegoat"
estado: EN_CURSO
prioridad: "Alta (prerequisito para comenzar desarrollo)"
objetivo: "Establecer identidad, configuración y contexto del agente Diegoat en el monorepo"
alcance:
  incluye:
    - "Crear rama dev-Diego"
    - "Crear skills/skill_base_agente_diegoat/ con SKILL.md, perfil.yaml, README.md"
    - "Crear matriz de compatibilidad"
  excluye:
    - "Asignación de módulos o tareas de desarrollo"
    - "Modificación de archivos compartidos"
    - "Integración a main"
dependencias: []
criterios_de_aceptacion:
  - "Rama dev-Diego creada desde main más reciente"
  - "SKILL.md completo y coherente con skill general v0.4.0"
  - "perfil.yaml válido y sin datos inventados"
  - "README.md descriptivo"
  - "Matriz de compatibilidad con cobertura de requisitos"
  - "Sin modificaciones a SKILL_BASE.md ni PLANTILLAS.md"
pruebas_requeridas:
  - "Validación de sintaxis YAML"
  - "Coherencia interna entre archivos"
  - "Verificación de no-modificación de archivos ajenos"
```

## 6. Coordinación

### 6.1 VCPD — Verificación Cruzada Previa al Desarrollo

**Obligatoria antes de cada bloque independiente de cambios.**

Procedimiento (conforme a sección 5.1 de la skill general):

1. Confirmar rama actual y estado del árbol de trabajo.
2. `git fetch --all --prune` (si hay conectividad).
3. `git branch -a` y `git log --oneline --graph --decorate --all -n 50`.
4. Inspeccionar ramas de otros integrantes y sus commits.
5. Comparar con rama de integración (cuando esté definida).
6. Identificar archivos, contratos y dependencias relevantes.
7. Consultar registro compartido de tareas.
8. Delegar a subagentes en modo lectura cuando sea útil.
9. Decidir: INCORPORAR / COORDINAR / NO_INCORPORAR / ESPERAR.
10. Registrar revisión usando plantilla VCPD de `PLANTILLAS.md`.

### 6.2 Ramas a inspeccionar

Actualmente no hay ramas de otros integrantes publicadas. Las ramas a inspeccionar se determinarán cuando el equipo registre sus integrantes en `PLANTILLAS.md`.

### 6.3 Mecanismo para conocer cambios no publicados

- `git fetch` solo muestra commits publicados.
- Consultar registro compartido de tareas (cuando exista).
- Preguntar al responsable si hay cambios en curso antes de modificar zonas compartidas.
- No interpretar ausencia de commits remotos como prueba de que nadie trabaja en esos archivos.

### 6.4 Uso de subagentes

- Subagente `research`: disponible para inspección de ramas, análisis de código, comparaciones de solo lectura.
- Los subagentes trabajan en **modo de inspección y recomendación**; no pueden hacer commits, merges ni modificar ramas.
- Si el runtime no admitiera subagentes, la inspección se realiza manualmente.

### 6.5 Comunicación

| Campo | Valor |
|---|---|
| **Canal persistente** | PENDIENTE — no definido por el equipo |
| **Responsable de revisión** | PENDIENTE |
| **Responsable de integración** | PENDIENTE |

La información relevante para el equipo debe persistir en el repositorio, no solo en la conversación del agente.

## 7. Entorno de desarrollo

### 7.1 Estructura del monorepo

```
AI_LAB_FORMOSA_AGUA/
├── SKILL_BASE.md          # Skill general v0.4.0
├── PLANTILLAS.md          # Plantillas de coordinación
└── skills/
    └── skill_base_agente_diegoat/   # Skill personal (esta)
        ├── SKILL.md
        ├── perfil.yaml
        ├── README.md
        └── MATRIZ_COMPATIBILIDAD.md
```

### 7.2 Tecnología y versiones

| Campo | Valor |
|---|---|
| **Gestor de paquetes** | PENDIENTE — no detectado en el monorepo actual |
| **Workspaces** | PENDIENTE — no configurados |
| **Lenguaje(s)** | PENDIENTE — no hay código fuente aún |

### 7.3 Comandos

| Comando | Valor |
|---|---|
| **Instalación** | PENDIENTE |
| **Desarrollo** | PENDIENTE |
| **Pruebas** | PENDIENTE |
| **Lint** | PENDIENTE |
| **Tipos** | PENDIENTE |
| **Compilación** | PENDIENTE |

> Los comandos se completarán cuando el proyecto defina su stack tecnológico y scripts.

## 8. Entrega e integración

### 8.1 Validaciones requeridas

Antes de solicitar integración:

1. Criterios de aceptación cumplidos.
2. Diff contiene solo cambios relacionados con la tarea.
3. Sin secretos ni archivos locales.
4. Pruebas ejecutadas (o excepciones explicadas).
5. Documentación actualizada.
6. Contratos compartidos compatibles.
7. VCPD final registrada.
8. Conflictos resueltos.

### 8.2 Pasos de entrega

1. Revisar `git status` y `git diff`.
2. `git add` con rutas concretas.
3. Commit descriptivo siguiendo convención `tipo(ámbito): descripción`.
4. Publicar rama solo si remoto y permisos están confirmados.
5. Presentar informe de entrega según plantilla de `PLANTILLAS.md`.

### 8.3 Estrategia de integración

PENDIENTE — no definida por el equipo. Hasta entonces:

- No integrar hacia `main` ni otra rama.
- No asumir que se puede integrar.
- Las propuestas de integración deben quedar identificadas y revisables.

### 8.4 Formato de informe final

Según sección 19 de la skill general y plantilla 5 de `PLANTILLAS.md`.
