# Guion del pitch · 3 minutos · Equipo 1
Operación Agua · Comparador de imágenes satelitales · Sábado 21/11/2026 desde las 10:00

**Duración objetivo:** 2 min 55 s (unas 450 palabras a ritmo ágil). Quedan 5 segundos de margen.
**Quién habla:** dos voces que se alternan. Se propone Selena como Persona 1 y Diego como Persona 2; el equipo lo confirma en el ensayo.
**Cómo está armado:** primero, el problema que plantea el desafío y cómo lo resolvemos. Después, lo que el equipo propone sumar. Cubre lo que pide el documento base: problema vinculado a El Niño, usuario, función principal, evidencia usada y límites.

| Tiempo | Bloque | Quién | Qué se muestra |
|---|---|---|---|
| 0:00–0:40 | 1 · El problema del desafío | Persona 1 y Persona 2 | Póster: escala de Puerto Formosa |
| 0:40–1:20 | 2 · Lo que pide el desafío, resuelto | Persona 1 | La herramienta en la notebook |
| 1:20–2:10 | 3 · Lo que proponemos sumar | Persona 1 y Persona 2 | La herramienta en la notebook |
| 2:10–2:35 | 4 · Cuánto confiar | Persona 2 | Semáforo de confianza en pantalla |
| 2:35–2:55 | 5 · Cierre | Persona 1 y Persona 2 | Póster: QR al repositorio |

*Tener la herramienta abierta antes de empezar, con el backend y el frontend andando. Si algo falla, pasar al video de respaldo.*

---

## 1 · El problema del desafío (0:00–0:40)

**Persona 1**
> Imagínense esto: por El Niño, el río Paraguay no para de subir. En Puerto Formosa pasó de 2,37 metros el 1 de octubre a 5,60 el 31. Al crecer llena bañados y riachos, y la provincia ya los inspecciona con imágenes satelitales. ¿El problema? Compararlas a ojo lleva horas, depende de quién mira y no deja registro. Y cuando llueve, las nubes tapan el suelo.

**Persona 2**
> El desafío pidió comparar imágenes de distintas fechas e identificar cambios en el agua de un sector de Formosa. Así nació **Operación Agua**, para los técnicos de la mesa interinstitucional por El Niño, como Defensa Civil.

## 2 · Lo que pide el desafío, resuelto (0:40–1:20)

**Persona 1**
> Miren qué simple es. Elijo la zona y dos fechas: la crecida de enero de 2021.
>
> *(Elegir 18/01/2021 y 07/02/2021 y presionar Comparar.)*
>
> En segundos, el mapa marca en azul el agua nueva: 223 hectáreas. En naranja, el agua que ya no está. Con el deslizador comparo las dos fechas lado a lado.
>
> *(Mover el deslizador y señalar la tabla.)*
>
> Cada imagen trae su ficha: fecha, fuente, resolución y nubes. Y al lado, la altura del río según el INA esos mismos días, frente a los niveles de alerta.

## 3 · Lo que proponemos sumar (1:20–2:10)

**Persona 2**
> Sobre esa base, el equipo propuso ir más allá. Primero, las nubes.
>
> *(Cambiar a 02/10/2026 → 26/10/2026 y comparar.)*
>
> Esta imagen de octubre tiene un 20 % tapado. La herramienta lo detecta, lo avisa y suma sola el radar Sentinel-1, que ve a través de las nubes: 221 hectáreas de agua nueva.

**Persona 1**
> Segundo, no alarmar por la laguna de siempre. Cruzamos con Global Surface Water, el registro de dónde hubo agua desde 1984: de las 223 hectáreas de 2021, 86 están donde normalmente no hay agua.

**Persona 2**
> Tercero, qué hay cerca: escuelas y centros de salud del IGN a menos de 500 metros del agua fuera de lo normal. En octubre, 4 escuelas y ningún centro de salud. Y no es solo la capital: el mapa muestra toda la provincia y 7 zonas clave, de Clorinda a Ingeniero Juárez.

## 4 · Cuánto confiar (2:10–2:35)

**Persona 2**
> En una emergencia hay que saber cuánto confiar. Cada resultado trae un semáforo, alta, media o baja, con el motivo escrito: nubes, días entre fechas y altura del sol. La crecida de 2021 da alta; octubre, con nubes, da baja. Y cada dato dice si es observado o estimado, como la lluvia de un modelo.

## 5 · Cierre (2:35–2:55)

**Persona 1**
> Siempre con una regla, que está en pantalla: **un cambio detectado es un indicio, no una afectación comprobada.** Hay que verificarlo en terreno. La herramienta no pronostica ni decide: le da a la mesa información más rápida y con fuente.

**Persona 2**
> Cada número tiene su fuente: Copernicus, INA e IGN. El código y las pruebas están en GitHub, en el QR del póster. Con Operación Agua, la mesa deja de comparar a ojo y empieza a medir. ¡Muchas gracias!

---

## Preguntas probables del jurado (respuestas cortas)

- **¿Por qué NDWI y no IA?** Porque es una fórmula conocida (McFeeters, 1996), repetible y explicable. Para una mesa que decide, importa poder decir por qué se marcó cada píxel. La IA la usamos para programar y documentar más rápido, con revisión del equipo.
- **¿Cómo se calcula la confianza?** Con cuatro criterios escritos en pantalla: nubes y zona sin dato sobre el sector, días entre fechas y altura del sol. Se toma el peor. Las reglas son una propuesta del equipo y la mesa las puede ajustar.
- **¿Qué pasa con las nubes?** Los píxeles con nube o sombra se excluyen usando la clasificación de Sentinel-2. Si superan el 20 %, la herramienta pasa sola al radar Sentinel-1, que ve a través de las nubes. Calibramos el radar contra el óptico en días despejados: coinciden en el 98 % de los píxeles.
- **¿De dónde salen las alturas del río?** Del kit K1 del INA, que limpiamos, y de la API pública del INA para Puerto Pilcomayo y Puerto Bermejo. Comparamos K1 contra la API: 3.470 de 3.552 días son idénticos.
- **¿La lluvia es real?** Es una estimación del reanálisis ERA5, no un pluviómetro: el kit no trae lluvia observada. Por eso dice "estimada" en pantalla.
- **¿Desde cuándo se puede comparar?** Hay imágenes Sentinel-2 de la zona desde enero de 2017 hasta el corte del 31/10/2026. Hoy la herramienta tiene ocho fechas en Formosa capital y dos en cada una de las otras siete zonas.
- **¿Sirve para toda la provincia?** El mapa muestra toda Formosa con el agua de siempre como contexto, y analiza a 10 metros 7 zonas clave, de Clorinda a Ingeniero Juárez. Analizar toda la provincia a esa resolución son unos 720 millones de píxeles por imagen: el siguiente paso es elegir cualquier zona a pedido.
- **¿Por qué hay dos índices de agua?** El NDWI es el clásico. El MNDWI usa el infrarrojo de onda corta y confunde menos el agua con techos y calles: en Formosa capital reduce un tercio el ruido urbano.
- **¿Qué falta para usarla de verdad?** Elegir cualquier zona en el mapa, descargar automáticamente cada pasada nueva, validar el radar con más fechas, sumar datos de Paraguay y validar con relevamientos en terreno.
- **¿Qué escuelas quedan cerca del agua?** Cruzamos el agua nueva inusual con las capas del IGN: en octubre de 2026, 4 escuelas quedan a menos de 500 metros y ningún centro de salud. Es una exposición posible, no una afectación.
- **¿Cómo saben que no es el río de siempre?** Con Global Surface Water, el registro de dónde hubo agua entre 1984 y 2021: en la crecida de 2021, 86 de las 223 hectáreas nuevas están donde normalmente no hay agua.

## Ensayo
- [ ] Cronometrar dos ensayos completos (objetivo: 2:55).
- [ ] Probar la demo en la notebook del evento con el backend y el frontend levantados.
- [ ] Tener el video de respaldo descargado en la notebook (sin depender de internet).
- [ ] Confirmar quién es Persona 1 y Persona 2.
