---
name: protocolo-equipo-multiagente
version: 0.3.0
description: Reglas compartidas para coordinar cuatro agentes de desarrollo que trabajan desde equipos distintos sobre un mismo monorepo y ramas separadas.
language: es
---

# Skill general: Protocolo de desarrollo multiagente

## 1. Propósito y alcance

Esta skill establece las reglas comunes de trabajo para los cuatro agentes que participan en el desarrollo de un mismo proyecto alojado en un monorepo.

Cada agente se ejecuta en una computadora diferente y trabaja en la rama asignada a su integrante. Los agentes pueden utilizar modelos, herramientas o entornos distintos. Por eso, las reglas de esta skill deben ser independientes del proveedor del modelo y del entorno de ejecución.

Los objetivos son:

- permitir el desarrollo paralelo sin perder coherencia técnica;
- reducir conflictos de Git y modificaciones incompatibles;
- definir cómo se asignan, ejecutan y cierran las tareas;
- proteger las interfaces, configuraciones y archivos compartidos;
- mantener decisiones y avances en una fuente persistente del repositorio;
- hacer que cada cambio sea verificable, trazable e integrable.

Esta skill define el protocolo común. **No asigna todavía módulos ni tareas a los cuatro integrantes.** Esa distribución se completará en un documento separado cuando el equipo haya definido el alcance de cada persona.

## 2. Reglas de autoridad y precedencia

Ante una contradicción, el agente debe aplicar este orden:

1. Instrucciones explícitas y vigentes del responsable humano del proyecto.
2. Decisiones técnicas aprobadas y registradas por el equipo.
3. Contratos, especificaciones y documentación vigente del proyecto.
4. Esta skill general.
5. Convenciones locales de herramientas o preferencias del agente.

Un agente no puede interpretar el silencio del equipo como aprobación de un cambio que afecte a otros módulos, contratos o integrantes.

El código existente es evidencia del comportamiento actual, pero no reemplaza una especificación explícita cuando existe una contradicción. Si detecta esa contradicción, debe informarla antes de introducir un cambio incompatible.

## 3. Principios obligatorios

Todos los agentes deben cumplir estos principios:

1. **Una fuente de verdad:** las decisiones relevantes deben quedar registradas en el repositorio.
2. **Responsabilidad explícita:** cada tarea tiene un único responsable principal, aunque pueda recibir colaboración.
3. **Aislamiento:** cada integrante trabaja en su propia rama y no modifica el trabajo de otro sin coordinación.
4. **Cambios acotados:** cada tarea modifica únicamente lo necesario para cumplir su objetivo.
5. **Contratos compartidos:** las interfaces entre módulos se acuerdan antes de implementar cambios incompatibles.
6. **Transparencia:** los agentes informan avances, decisiones, bloqueos, riesgos y resultados reales.
7. **Validación:** ningún cambio se declara terminado sin ejecutar las comprobaciones aplicables o explicar por qué no pudieron ejecutarse.
8. **No inventar requisitos:** ante ambigüedades que afecten arquitectura, comportamiento o compatibilidad, se solicita una decisión.
9. **Compatibilidad global:** el código debe funcionar dentro del monorepo, no solamente en el entorno local del agente.
10. **Preservación del trabajo:** ningún agente debe borrar, sobrescribir o descartar cambios ajenos o no guardados.

## 4. Identidad y ámbito de cada agente

Cada agente debe conocer, como mínimo:

- identificador del integrante;
- nombre o identificador de su agente;
- rama de Git asignada;
- tarea activa;
- módulo o área bajo su responsabilidad;
- archivos o recursos que puede modificar;
- dependencias con otros integrantes;
- persona responsable de aprobar cambios compartidos.

Estos datos se definirán en el futuro documento de asignaciones. Hasta entonces, el agente no debe asumir que tiene propiedad exclusiva sobre un módulo o archivo.

### 4.1 Regla de propiedad

- Cada tarea debe tener un solo responsable principal.
- La propiedad de una tarea no equivale a propiedad permanente de todos los archivos del módulo.
- Los archivos compartidos no pertenecen unilateralmente a ningún agente.
- Si una tarea requiere modificar archivos fuera del ámbito asignado, el agente debe pedir coordinación antes de hacerlo.
- La colaboración de otro agente debe acordarse y quedar registrada; no debe generar dos responsables principales para la misma tarea.

## 5. Protocolo de inicio de sesión de trabajo

Antes de modificar código, el agente debe:

1. localizar la raíz del monorepo;
2. leer esta skill y la documentación de entrada del proyecto;
3. identificar el gestor de paquetes y la estructura de workspaces, si existen;
4. consultar la rama actual con `git branch --show-current`;
5. revisar el estado con `git status --short --branch`;
6. comprobar si hay cambios locales sin confirmar y preservarlos;
7. actualizar la información remota con `git fetch` cuando corresponda;
8. revisar los últimos cambios relevantes de la rama de integración;
9. leer la ficha de la tarea y sus dependencias;
10. identificar contratos o archivos compartidos relacionados;
11. confirmar que la tarea está asignada y que el agente tiene autorización para ejecutarla.

Si el árbol de trabajo contiene cambios que el agente no reconoce, debe detenerse antes de sobrescribirlos y comunicar la situación. No debe ejecutar `git reset --hard`, `git clean`, `git checkout -- <archivo>` ni operaciones equivalentes para “limpiar” el directorio sin autorización explícita.

Si no existe una tarea asignada o no están claros sus límites, el agente puede analizar el contexto y proponer un plan, pero no debe comenzar cambios de alcance incierto.

### 5.1 Verificación cruzada obligatoria antes de modificar

**Antes de realizar la primera modificación de una tarea, el agente debe revisar las demás ramas disponibles del equipo y determinar si necesita incorporar cambios de otros integrantes.** Esta comprobación es obligatoria incluso cuando la tarea parezca aislada.

El objetivo no es mezclar todas las ramas, sino evitar desarrollar sobre código, contratos o decisiones que otro integrante ya modificó.

#### A. Inspección de ramas

Antes de editar código, pruebas, documentación, configuración o cualquier otro archivo del repositorio, el agente debe:

1. confirmar que está en su rama asignada y que conoce el estado de su árbol de trabajo;
2. revisar los remotos configurados con `git remote -v`;
3. actualizar las referencias remotas disponibles con `git fetch --all --prune`, siempre que tenga conectividad y permisos;
4. listar las ramas locales y remotas con `git branch -a`;
5. inspeccionar los commits recientes de las ramas del equipo con `git log --oneline --graph --decorate --all -n 50`;
6. comparar su rama con la rama de integración y con las ramas remotas relevantes;
7. identificar commits, archivos, paquetes, contratos o configuraciones que puedan afectar su tarea.

Para una comparación puntual, puede utilizar comandos de solo lectura como:

```bash
# Ver commits que difieren entre la rama actual y otra rama remota
git log --left-right --cherry-pick --oneline HEAD...<rama-remota>

# Ver archivos diferentes desde el ancestro común
git diff --name-status HEAD...<rama-remota>

# Limitar la comparación a un paquete, directorio o archivo
git diff --name-status HEAD...<rama-remota> -- <ruta>

# Consultar el historial de un archivo en todas las referencias disponibles
git log --all --oneline -- <ruta>
```

Los nombres entre `< >` son marcadores: el agente debe reemplazarlos por las ramas y rutas reales del repositorio. No debe asumir que la rama de integración se llama `main`.

El agente debe inspeccionar las ramas del equipo, no solamente la rama de integración. Si hay muchas ramas, puede priorizar aquellas vinculadas con dependencias, paquetes, archivos o contratos que intervienen en su tarea, pero debe dejar constancia de cuáles revisó y por qué considera irrelevantes las restantes.

La inspección de otras ramas debe ser de solo lectura. El agente no debe cambiarse a la rama de otro integrante para revisarla ni modificarla.

#### B. Uso de subagentes para revisión cruzada

Si el entorno del agente permite delegar trabajo en subagentes, debe utilizarlos para realizar revisiones independientes cuando esto ayude a evaluar varias ramas o módulos en paralelo.

Puede asignar a uno o más subagentes tareas de análisis como:

- revisar una rama y resumir sus commits recientes;
- identificar archivos y módulos modificados por otro integrante;
- detectar cambios que afectan dependencias o contratos utilizados por la tarea actual;
- comparar una implementación propuesta con cambios existentes;
- recomendar si conviene incorporar cambios, esperar, coordinar o no hacer nada.

Los subagentes deben trabajar en **modo de inspección y recomendación**, sin modificar ramas, hacer commits, ejecutar merges, rebase ni cherry-picks. La decisión y cualquier operación de integración quedan a cargo del agente responsable y deben respetar las autorizaciones del equipo.

La solicitud al subagente debe incluir el identificador de la tarea, la rama que debe revisar, los módulos o rutas relevantes y el formato de respuesta esperado. El resultado debe citar ramas, commits y archivos concretos; una respuesta genérica como “no hay conflictos” no es suficiente.

Si el runtime no admite subagentes, el agente principal debe realizar la inspección por sí mismo. La falta de subagentes no lo exime de la revisión cruzada.

#### C. Decidir qué hacer con los cambios encontrados

Después de inspeccionar las ramas, el agente debe clasificar los cambios relevantes:

- **Incorporar:** cuando los cambios son necesarios para completar la tarea, están disponibles en una rama remota y su incorporación está permitida por las dependencias y el proceso acordado.
- **Coordinar antes de incorporar:** cuando los cambios afectan contratos compartidos, todavía están en desarrollo, no tienen aprobación o pueden generar incompatibilidades. El agente debe contactar al responsable y esperar una decisión.
- **No incorporar:** cuando los cambios no guardan relación con la tarea o no son necesarios. Debe dejar constancia breve del motivo si la rama fue revisada por una posible dependencia.
- **Bloquear la tarea:** cuando la implementación depende de cambios no publicados, inaccesibles o cuya dirección técnica todavía no fue acordada. Debe informar qué necesita y a quién.

**Está prohibido integrar ramas completas de manera automática o traer todos los cambios disponibles “por las dudas”.** Cada merge, rebase o cherry-pick debe responder a una necesidad identificada y respetar la estrategia de integración y las autorizaciones definidas por el equipo. Si esa estrategia todavía no está definida, el agente debe proponer la operación y solicitar aprobación antes de ejecutarla.

#### D. Límite de visibilidad entre computadoras

`git fetch` solamente permite inspeccionar los commits que fueron publicados en los remotos configurados. No revela cambios locales sin commit, commits que el compañero todavía no subió ni trabajo que permanece exclusivamente en otra computadora.

Por eso, antes de modificar una zona compartida o una dependencia directa de otro integrante, el agente también debe consultar el registro compartido de tareas/estado y, si la situación no está clara, preguntar al responsable si tiene cambios en curso o pendientes de publicar.

Nunca debe interpretar la ausencia de commits remotos como prueba de que nadie está trabajando en esos archivos.

#### E. Cuándo repetir la comprobación

La revisión cruzada debe repetirse:

- antes de modificar por primera vez una tarea nueva;
- antes de tocar un contrato, configuración raíz, paquete compartido o archivo que otro agente haya modificado;
- cuando el agente recibe aviso de nuevos commits o cambios de alcance;
- antes de incorporar cambios de otra rama;
- inmediatamente antes de solicitar la integración de su propia rama.

Si la revisión detecta cambios nuevos que alteran el plan o la compatibilidad, el agente debe pausar la parte afectada, actualizar su análisis y coordinar antes de continuar.

#### F. Registro obligatorio de la revisión

Cada tarea debe dejar un registro breve de esta comprobación, usando la plantilla de revisión cruzada incluida en `plantillas/PLANTILLAS.md`. El registro debe indicar la fecha, la rama propia, la referencia de integración consultada, las ramas inspeccionadas, los commits o archivos relevantes, los subagentes consultados (si hubo) y la decisión tomada sobre incorporar o no cambios.

Si no fue posible actualizar las referencias remotas o consultar el estado de un compañero, debe quedar señalado como una limitación; no se debe registrar la revisión como completa.

## 6. Gestión de tareas

Toda tarea de desarrollo debe estar registrada antes de su implementación. La ficha de tarea debe incluir:

- identificador único;
- título y objetivo;
- responsable principal;
- estado;
- descripción del resultado esperado;
- alcance incluido y excluido;
- criterios de aceptación verificables;
- módulos y archivos posiblemente afectados;
- dependencias y tareas relacionadas;
- contratos o interfaces involucrados;
- pruebas requeridas;
- riesgos y preguntas abiertas.

### 6.1 Estados permitidos

Los estados compartidos serán:

- `PENDIENTE`: definida, pero todavía no puede comenzar;
- `LISTA`: tiene información y dependencias suficientes para iniciarse;
- `EN_CURSO`: el responsable está trabajando;
- `BLOQUEADA`: no puede avanzar por una dependencia, decisión o problema;
- `EN_REVISION`: implementación presentada para revisión;
- `INTEGRADA`: cambios aceptados e incorporados a la rama de integración;
- `CANCELADA`: tarea descartada mediante decisión explícita.

Un agente no debe marcar una tarea como `INTEGRADA` por el solo hecho de haber terminado su código o haberlo subido a su rama.

### 6.2 División de tareas

Las tareas deben ser suficientemente pequeñas para poder revisarse y probarse de manera independiente. Una tarea demasiado amplia debe dividirse en subtareas con resultados verificables.

Antes de dividir o reasignar una tarea que ya está en curso, se debe preservar el trabajo existente y acordar quién continúa cada parte.

## 7. Git y estrategia de ramas

### 7.1 Ramas de trabajo

- Cada integrante trabaja en la rama que el equipo le haya asignado.
- Ningún agente debe trabajar directamente sobre `main` ni sobre la rama estable de integración.
- Un agente no debe cambiar a la rama de otro integrante para continuar su trabajo, salvo autorización explícita.
- No se debe hacer `push --force` ni reescribir el historial de una rama compartida.
- No se deben borrar ramas ajenas.
- Antes de cambiar de rama, el agente debe comprobar que no deja cambios sin guardar.

El nombre real de la rama de cada integrante se documentará en el archivo de asignaciones. Como convención propuesta —pendiente de aprobación del equipo— puede utilizarse `dev/<integrante>` o `feature/<integrante>/<tema>`.

### 7.2 Rama de integración

El equipo debe designar una rama de integración. Puede ser `main` si el equipo decide que allí se integrarán los cambios, o una rama separada si prefiere mantener `main` como versión estable.

Hasta que esta decisión se registre:

- ningún agente debe asumir que puede integrar cambios;
- las ramas individuales deben mantenerse separadas;
- las propuestas de integración deben quedar identificadas y revisables.

### 7.3 Antes de confirmar cambios

Antes de cada commit, el agente debe:

1. ejecutar `git status`;
2. revisar `git diff` y, cuando corresponda, `git diff --staged`;
3. verificar que no incluyó archivos ajenos a la tarea;
4. comprobar que no añadió secretos, credenciales, archivos temporales o artefactos locales;
5. ejecutar las validaciones pertinentes;
6. confirmar solamente los archivos necesarios.

No debe utilizar `git add .` de forma automática sin revisar previamente qué archivos cambiarán de estado.

### 7.4 Mensajes de commit

Se propone la convención:

`tipo(ámbito): descripción breve`

Tipos sugeridos: `feat`, `fix`, `refactor`, `test`, `docs`, `build`, `chore`.

Ejemplos:

- `feat(auth): agregar validación de credenciales`
- `fix(api): controlar solicitudes inválidas`
- `test(users): cubrir el registro de usuarios`
- `docs(arquitectura): documentar módulos principales`

Los mensajes deben describir el cambio real y no afirmar que una tarea está completa si todavía quedan criterios pendientes.

### 7.5 Sincronización

Antes de incorporar cambios remotos, el agente debe:

- identificar la rama de origen;
- revisar los commits entrantes;
- comprobar si afectan archivos o contratos que está utilizando;
- preservar su trabajo local;
- resolver los conflictos de forma explícita;
- volver a ejecutar las pruebas afectadas.

La estrategia concreta para actualizar las ramas —merge o rebase— debe acordarse para el equipo. Nunca se debe reescribir el historial de una rama que otros estén usando sin autorización y coordinación.

## 8. Trabajo en el monorepo

Cada agente debe respetar la organización del monorepo y sus límites de paquetes o aplicaciones.

- Antes de crear un paquete, comprobar si ya existe uno con una responsabilidad equivalente.
- Respetar los workspaces y el gestor de paquetes configurado.
- No cambiar de gestor de paquetes ni generar un segundo lockfile sin aprobación.
- No modificar configuraciones raíz para resolver un problema local sin evaluar el impacto sobre todo el repositorio.
- Evitar dependencias duplicadas entre paquetes cuando exista una solución compartida aprobada.
- Respetar las dependencias declaradas entre módulos y no crear ciclos nuevos.
- No mover, renombrar ni eliminar directorios utilizados por otros paquetes sin coordinación.
- Ejecutar comandos desde el directorio correcto y documentar si una validación se realizó sobre un paquete o sobre todo el monorepo.

El agente debe inspeccionar los scripts disponibles antes de inventar comandos de compilación, pruebas o linting. No debe asumir nombres de scripts ni herramientas que el proyecto no utilice.

## 9. Archivos y recursos compartidos

Se consideran compartidos, entre otros:

- archivos de configuración raíz;
- manifiestos y archivos de bloqueo de dependencias;
- configuración de compilación, linting y pruebas;
- tipos, interfaces y utilidades comunes;
- contratos de API;
- esquemas y migraciones de base de datos;
- autenticación, autorización y configuración de seguridad;
- pipelines de integración y despliegue;
- documentación arquitectónica global.

Antes de modificar un recurso compartido, el agente debe:

1. explicar por qué el cambio es necesario;
2. identificar los paquetes, tareas y agentes afectados;
3. describir compatibilidad y posibles efectos secundarios;
4. proponer el cambio concreto;
5. solicitar revisión o aprobación a los responsables definidos;
6. registrar la decisión y actualizar la documentación correspondiente.

Si todavía no existe un responsable de aprobación asignado, debe solicitar una decisión al responsable humano del proyecto. No debe aprobarse a sí mismo un cambio que afecte a todo el equipo.

## 10. Contratos e interfaces entre módulos

Antes de desarrollar en paralelo funcionalidades que se comunican entre sí, el equipo debe acordar los contratos relevantes.

Según el proyecto, pueden incluir:

- nombres y responsabilidades de funciones;
- tipos de entrada y salida;
- formatos de request y response;
- códigos y estructuras de error;
- eventos y mensajes;
- esquemas de datos;
- endpoints y métodos HTTP;
- reglas de autenticación y autorización;
- versiones y compatibilidad.

Un agente no debe cambiar unilateralmente un contrato consumido por otro módulo.

Cuando se propone un cambio de contrato, debe documentar:

- contrato actual;
- contrato propuesto;
- motivo del cambio;
- consumidores afectados;
- estrategia de transición;
- pruebas de compatibilidad;
- aprobación recibida.

Si una interfaz todavía no está definida, los agentes deben acordar primero una versión mínima del contrato y dejarla documentada antes de implementar dependencias en paralelo.

## 11. Comunicación y memoria compartida

La conversación privada de un agente no es una fuente de verdad para el resto del equipo. Toda información necesaria para continuar el trabajo debe persistir en el repositorio o en el canal compartido oficialmente elegido.

Deben registrarse, como mínimo:

- decisiones de arquitectura;
- acuerdos sobre contratos;
- cambios que afecten a otros módulos;
- dependencias y bloqueos;
- cambios de alcance;
- riesgos conocidos;
- instrucciones para integración;
- tareas terminadas y pendientes.

Los mensajes entre agentes deben ser concretos e incluir identificadores de tareas, archivos, ramas, commits o contratos cuando corresponda. Evitar expresiones ambiguas como “ya está”, “lo cambié” o “fijate el código” sin indicar qué cambió.

## 12. Protocolo de ejecución de una tarea

Para cada tarea, el agente debe seguir este flujo:

1. **Comprender:** leer la ficha, el contexto y los criterios de aceptación.
2. **Inspeccionar:** localizar el código existente, dependencias y pruebas relacionadas.
3. **Verificar otras ramas:** ejecutar el control cruzado de la sección 5.1 y registrar qué cambios de otros integrantes podrían afectar la tarea.
4. **Consultar subagentes:** cuando el runtime lo permita y resulte útil, solicitar análisis independientes en modo de solo lectura.
5. **Decidir y coordinar:** determinar qué cambios deben incorporarse, cuáles requieren aprobación y cuáles no son relevantes; pedir autorización para operaciones de integración no previstas.
6. **Planificar:** enumerar los pasos y archivos que probablemente cambiará.
7. **Implementar:** realizar cambios pequeños y enfocados.
8. **Validar:** ejecutar las pruebas, análisis y compilaciones pertinentes.
9. **Documentar:** registrar decisiones y actualizar documentación afectada.
10. **Revisar:** inspeccionar el diff completo y repetir la comprobación cruzada si se modificaron recursos compartidos o aparecieron nuevos commits.
11. **Entregar:** realizar commit y presentar el informe de finalización, incluyendo el registro de ramas revisadas.
12. **Esperar integración:** no declarar la tarea integrada hasta que los cambios sean aceptados en la rama acordada.

Si durante la implementación aparecen requisitos nuevos o cambia el alcance, el agente debe detener la parte afectada, explicar el impacto y solicitar actualización de la tarea.

## 13. Pruebas y calidad

El nivel de validación depende del cambio y de las herramientas reales del proyecto. Cuando corresponda, se deben ejecutar:

- pruebas unitarias;
- pruebas de integración;
- pruebas de extremo a extremo;
- comprobación de tipos;
- linting y formato;
- compilación del paquete afectado;
- compilación del monorepo;
- pruebas de contrato o compatibilidad;
- análisis de seguridad aplicable.

El agente debe informar exactamente:

- qué comando ejecutó;
- desde qué directorio;
- qué alcance cubrió;
- si terminó correctamente;
- qué errores o advertencias aparecieron.

No debe afirmar que una prueba pasó si no la ejecutó. Si no pudo ejecutarla, debe indicarlo y explicar el motivo. Si una prueba falla por un problema preexistente o ajeno a su cambio, debe aportar evidencia y separar ese fallo de los resultados de su implementación.

## 14. Seguridad y operaciones sensibles

Los agentes deben:

- no exponer secretos, tokens, claves privadas ni credenciales;
- no añadir secretos al repositorio ni a los reportes;
- utilizar archivos de entorno locales que estén excluidos del control de versiones;
- no desactivar controles de seguridad para hacer pasar una prueba;
- no ejecutar migraciones destructivas, borrados de datos o cambios irreversibles sin autorización explícita;
- no instalar dependencias o herramientas globales si no es necesario y autorizado;
- no ejecutar comandos destructivos sobre Git o el sistema de archivos como mecanismo de resolución automática.

Si se detecta una credencial expuesta, el agente debe detener su difusión, informar el incidente y seguir el procedimiento de revocación definido por el equipo. No debe copiar el secreto en el informe.

## 15. Resolución de conflictos

Cuando dos agentes necesiten modificar el mismo archivo o exista una incompatibilidad:

1. detener las modificaciones simultáneas sobre la parte conflictiva;
2. identificar tareas, ramas, commits y responsables involucrados;
3. comparar los objetivos y cambios propuestos;
4. acordar un único responsable temporal para resolver la modificación compartida;
5. definir cómo se incorporarán los cambios del otro agente;
6. documentar el acuerdo;
7. ejecutar las pruebas afectadas después de resolverlo.

El agente no debe resolver un conflicto eliminando código ajeno, eligiendo automáticamente una versión o aceptando todos los cambios sin comprenderlos.

Si no hay acuerdo técnico, se eleva la decisión al responsable humano o a la persona designada para arquitectura e integración.

## 16. Bloqueos y recuperación

Un agente debe marcar la tarea como `BLOQUEADA` cuando no pueda avanzar sin una decisión, dependencia, acceso o cambio externo.

El reporte de bloqueo debe incluir:

- tarea y responsable;
- descripción del bloqueo;
- evidencia o error concreto;
- qué se intentó;
- qué necesita del equipo;
- impacto sobre otras tareas;
- alternativa posible, si existe.

Ante un error, el agente debe preservar el estado actual antes de intentar recuperarlo. No debe descartar cambios ni reescribir historial para ocultar un problema.

## 17. Revisión e integración

Antes de solicitar integración, el responsable debe comprobar que:

- la tarea tiene criterios de aceptación cumplidos;
- el diff contiene solamente cambios relacionados;
- no hay secretos ni archivos locales;
- las pruebas acordadas fueron ejecutadas o sus excepciones están explicadas;
- la documentación está actualizada;
- los contratos compartidos siguen siendo compatibles;
- la rama está identificada y sincronizada según la estrategia acordada;
- se realizó y registró una nueva revisión cruzada de las ramas relevantes;
- se evaluaron las dependencias y commits recientes de los otros integrantes;
- los conflictos están resueltos.

La integración debe realizarse mediante el mecanismo de revisión que adopte el equipo, por ejemplo Pull Request o Merge Request. La persona que aprueba debe revisar el cambio y no limitarse a aceptar el resumen del agente.

Después de integrar, deben comprobarse las validaciones de la rama de integración. Si aparece una regresión, se debe registrar, identificar el cambio responsable y acordar la corrección o reversión.

## 18. Definición de terminado

Una tarea puede considerarse **implementada** cuando:

- cumple los criterios de aceptación;
- el código y las pruebas correspondientes están desarrollados;
- las validaciones aplicables fueron ejecutadas y reportadas;
- la documentación necesaria está actualizada;
- el diff fue revisado;
- los cambios están confirmados en la rama asignada.

Una tarea puede considerarse **integrada** solamente cuando, además:

- el cambio fue revisado y aprobado;
- fue incorporado a la rama de integración acordada;
- las comprobaciones posteriores a la integración no muestran regresiones atribuibles al cambio.

## 19. Informe obligatorio de entrega

Al finalizar una tarea o detenerla por un bloqueo, el agente debe presentar un informe con este formato:

### Informe de tarea

- **ID y título:**
- **Responsable:**
- **Agente:**
- **Rama:**
- **Estado:**
- **Objetivo:**
- **Implementación realizada:**
- **Archivos modificados:**
- **Contratos o dependencias afectados:**
- **Pruebas ejecutadas:**
- **Resultados reales:**
- **Commit(s):**
- **Riesgos o pendientes:**
- **Bloqueos:**
- **Información necesaria para otros agentes:**
- **Estado de integración:** no solicitada / en revisión / integrada.

El informe debe distinguir claramente entre lo implementado, lo probado y lo integrado.

## 20. Límites de autonomía

Sin autorización explícita, un agente no puede:

- cambiar la arquitectura general;
- reasignar tareas o modificar responsabilidades de otros integrantes;
- modificar contratos compartidos de forma incompatible;
- alterar la rama de integración;
- cambiar tecnologías principales o gestores de paquetes;
- eliminar paquetes, módulos o migraciones;
- realizar despliegues o ejecutar operaciones destructivas sobre datos;
- asumir que un cambio de otro agente está aprobado;
- marcar como integrada una tarea que no fue incorporada y verificada.

El agente sí puede inspeccionar, proponer, documentar y preparar cambios dentro de su tarea autorizada.

## 21. Datos pendientes de completar por el equipo

Esta versión es un protocolo general. Antes de considerar la configuración del equipo completa, se deben definir y registrar:

1. integrantes y nombres de sus agentes;
2. rama asignada a cada integrante;
3. rama de integración;
4. responsable de integración y revisión;
5. distribución de módulos y responsabilidades;
6. tareas concretas, criterios de aceptación y dependencias;
7. archivos y recursos compartidos;
8. estrategia de sincronización de ramas;
9. canal o mecanismo persistente de comunicación;
10. comandos oficiales de instalación, desarrollo, pruebas, linting y compilación;
11. política de revisión y aprobación;
12. procedimiento de releases y despliegues, si aplica;
13. mecanismo compartido para avisar sobre trabajo local aún no publicado;
14. disponibilidad y límites de subagentes en cada runtime.

Hasta completar esos datos, los agentes deben tratar las asignaciones y permisos específicos como **no definidos** y solicitar coordinación antes de asumirlos.

## 22. Regla final

Los cuatro agentes pueden desarrollar en paralelo, pero no deben tomar decisiones incompatibles en paralelo.

**Trabajar por separado no significa trabajar sin coordinación. Cada cambio debe tener responsable, contexto, validación y un camino claro de integración.**
