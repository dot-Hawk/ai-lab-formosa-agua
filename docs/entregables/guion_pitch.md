# Guion del pitch · 3 minutos · Equipo 1
Operación Agua · Comparador de imágenes satelitales · Sábado 21/11/2026 desde las 10:00

**Duración objetivo:** 2 min 55 s (unas 440 palabras, sin apuro y con pausas en las frases marcadas). Quedan 5 segundos de margen.
**Quién habla:** dos voces que se alternan. Se propone Selena como Persona 1 y Diego como Persona 2; el equipo lo confirma en el ensayo.
**Qué tiene que cumplir (documento base) y dónde está:**

| # | Lo que pide el pitch | Bloque |
|---|---|---|
| 1 | El problema vinculado al fenómeno El Niño | 1 · El problema (0:00–0:35) |
| 2 | El usuario: quién usaría la herramienta | 2 · El usuario (0:35–0:55) |
| 3 | La función principal del software, funcionando | 3 · La herramienta en vivo (0:55–1:50) |
| 4 | La evidencia: de dónde salen los datos | 4 · La evidencia (1:50–2:15) |
| 5 | Los límites: qué no puede asegurar la solución | 5 · Los límites (2:15–2:35) |
| + | El impacto para la provincia | 6 · Cierre (2:35–2:55) |

*Tener la herramienta abierta antes de empezar, con el backend y el frontend andando. Si algo falla, pasar al video de respaldo.*

---

## 1 · El problema (0:00–0:35) · Persona 1
*Mostrar el póster: escala de Puerto Formosa.*

> En octubre, el río Paraguay frente a Formosa subió más de tres metros en un mes: de 2,37 a 5,60. El Niño ya está confirmado. Y en Formosa sabemos lo que eso significa: en 2016, el último Niño fuerte llevó el río a 9,81 metros, por encima del nivel de evacuación.
>
> *(Pausa.)*
>
> Cuando el río crece, el agua no avisa. Entra a los bañados y a los riachos, se acerca a las casas, a los caminos, a las escuelas. La provincia ya los mira con imágenes satelitales, pero compararlas a ojo lleva horas, depende de quién mira y no deja registro. Y cuando llueve, las nubes tapan todo.

## 2 · El usuario (0:35–0:55) · Persona 2

> Por eso pensamos en quienes tienen que decidir con esa información: los técnicos de la mesa interinstitucional por El Niño, como Defensa Civil. Necesitan responder una pregunta concreta: entre dos fechas, ¿dónde llegó el agua, cuánta es, y cuánto podemos confiar en lo que vemos?

## 3 · La herramienta en vivo (0:55–1:50) · Persona 1 y Persona 2

**Persona 1**
> Se los mostramos. Elijo la zona y dos fechas: la crecida de enero de 2021.
>
> *(Elegir 18/01/2021 y 07/02/2021 y presionar Comparar.)*
>
> En segundos, el mapa marca en azul el agua nueva: 223 hectáreas. Con el deslizador vemos el antes y el después. Al lado, la ficha de cada imagen y la altura del río esos mismos días.

**Persona 2**
> Y no alarma por la laguna de siempre: de esas 223 hectáreas, 86 están donde normalmente no hay agua. Ahora, octubre de este año, con nubes.
>
> *(Cambiar a 02/10/2026 → 26/10/2026 y comparar.)*
>
> La herramienta lo detecta, lo avisa y suma el radar, que ve a través de las nubes. Y marca lo que más nos importa: 4 escuelas a menos de 500 metros del agua nueva.

## 4 · La evidencia (1:50–2:15) · Persona 2
*Señalar la tabla de la herramienta o la sección Fuentes del póster.*

> Nada de esto es una opinión. Las imágenes son de los satélites Sentinel del programa Copernicus. La altura del río es la del Instituto Nacional del Agua: limpiamos la serie oficial y la cruzamos con la del INA: coinciden en el 98 % de los días. El agua de siempre sale de 37 años de registros satelitales, y las escuelas, del Instituto Geográfico Nacional. Cada número dice si es observado o estimado, y un semáforo indica cuánto confiar.

## 5 · Los límites (2:15–2:35) · Persona 1

> Y queremos ser honestos con lo que no puede hacer. Un cambio detectado es un indicio, no una afectación comprobada: siempre hay que verificarlo en terreno. No distingue arroyos de menos de diez metros, no pronostica. Y no decide: la decisión es y tiene que seguir siendo de las personas.

## 6 · Cierre: el impacto para la provincia (2:35–2:55) · Persona 2

> Lo que hoy lleva horas, con esta herramienta lleva minutos. Eso es llegar antes a una escuela, a un camino, a una familia del bañado. Funciona con datos públicos y gratuitos, y su código es abierto: la provincia puede usarla, revisarla y mejorarla desde Clorinda hasta Ingeniero Juárez.
>
> *(Pausa.)*
>
> Porque cuando el río sube, cada hora cuenta. Somos el Equipo 1 del Politécnico Formosa. Gracias.

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
