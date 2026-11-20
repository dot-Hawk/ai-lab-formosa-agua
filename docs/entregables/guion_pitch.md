# Guion del pitch · 3 minutos · Equipo 1
Operación Agua · Comparador de imágenes satelitales · Sábado 21/11/2026 desde las 10:00

**Duración objetivo:** 2 min 50 s (unas 410 palabras a ritmo tranquilo). Quedan 10 segundos de margen.
**Quién habla:** se propone dividir en cuatro bloques, uno por integrante. El reparto lo confirma el equipo.
**Qué cubre (según el documento base):** problema vinculado a El Niño, usuario, función principal, evidencia usada y límites.

| Tiempo | Bloque | Quién | Qué se muestra |
|---|---|---|---|
| 0:00–0:30 | 1 · Problema | PENDIENTE | Póster: escala de Puerto Formosa |
| 0:30–0:50 | 2 · Usuario | PENDIENTE | Póster: sección Usuario |
| 0:50–2:10 | 3 · Demostración en vivo | PENDIENTE | La herramienta en la notebook |
| 2:10–2:35 | 4 · Límites | PENDIENTE | Póster: sección Límites |
| 2:35–2:50 | 5 · Cierre | PENDIENTE | Póster: enlace al repositorio |

---

## 1 · Problema (0:00–0:30)

> El 1 de octubre el río Paraguay en Puerto Formosa marcaba 2,37 metros. El 31 de octubre, 5,60. El Servicio Meteorológico Nacional confirmó El Niño, y el último Niño fuerte llevó esta misma escala a 9,81 metros en enero de 2016, por encima del nivel de evacuación.
>
> Cuando el río sube, llena bañados y riachos. La provincia ya revisa esos cursos de agua con imágenes satelitales, pero comparar dos imágenes a ojo lleva tiempo y no deja registro.

## 2 · Usuario (0:30–0:50)

> Nuestra herramienta es para los técnicos de la mesa interinstitucional por El Niño. Les responde una pregunta concreta: entre dos fechas, ¿dónde apareció o desapareció agua, cuánta, y cuánto podemos confiar en ese resultado?

## 3 · Demostración en vivo (0:50–2:10)

*Tener la herramienta abierta antes de empezar, con el backend y el frontend andando. Si algo falla, pasar al video de respaldo.*

> Tomamos una crecida real, sin nubes: imágenes Sentinel-2 del 18 de enero y del 7 de febrero de 2021, sobre Formosa, Alberdi y los bañados del sur.
>
> *(Elegir 18/01/2021 y 07/02/2021 y presionar Comparar.)*
>
> En azul, el agua nueva: 223 hectáreas. Y la herramienta dice cuánto confiar: sin nubes y con 20 días entre fechas, la confianza es **alta**.
>
> *(Señalar la tabla.)*
>
> Cada imagen trae su ficha: fecha, hora, satélite, resolución y nubes. Debajo, el río según el INA: en Puerto Formosa pasó de 2,16 a 5,37 metros, y en Puerto Pilcomayo, de 1,73 a 4,93. También la lluvia estimada del mes previo.
>
> *(Cambiar a 02/10/2026 → 26/10/2026 y comparar.)*
>
> Ahora, octubre de 2026. La segunda imagen tiene un 20 % del sector tapado por nubes. La herramienta no lo esconde: marca la confianza como **baja** y avisa que para días nublados haría falta radar.
>
> *(Elegir la misma fecha en los dos campos.)*
>
> Y si alguien elige la misma fecha dos veces, la herramienta lo avisa y deja seguir trabajando.

## 4 · Límites (2:10–2:35)

> Un cambio detectado es un indicio, no una afectación comprobada: hay que verificarlo en terreno. No ve debajo de las nubes, no detecta cursos de menos de diez metros y el índice puede confundir agua con sombras. La lluvia que muestra es una estimación de un modelo, y lo dice. No pronostica ni decide: la decisión es de la mesa.

## 5 · Cierre (2:35–2:50)

> Cada número que vieron tiene su fuente: imágenes de Copernicus, alturas del INA y la serie del kit, que limpiamos y comparamos contra la API del INA. Coinciden en el 98 % de los días. El código está en el repositorio del póster. Gracias.

---

## Preguntas probables del jurado (respuestas cortas)

- **¿Por qué NDWI y no IA?** Porque es una fórmula conocida (McFeeters, 1996), repetible y explicable. Para una mesa que decide, importa poder decir por qué se marcó cada píxel. La IA la usamos para programar y documentar más rápido, con revisión del equipo.
- **¿Cómo se calcula la confianza?** Con cuatro criterios escritos en pantalla: nubes y zona sin dato sobre el sector, días entre fechas y altura del sol. Se toma el peor. Las reglas son una propuesta del equipo y la mesa las puede ajustar.
- **¿Qué pasa con las nubes?** Los píxeles con nube o sombra se excluyen usando la clasificación de Sentinel-2, y si superan el 20 % la herramienta avisa. El paso siguiente es sumar Sentinel-1 (radar), que ve a través de las nubes.
- **¿De dónde salen las alturas del río?** Del kit K1 del INA, que limpiamos, y de la API pública del INA para Puerto Pilcomayo y Puerto Bermejo. Comparamos K1 contra la API: 3.470 de 3.552 días son idénticos.
- **¿La lluvia es real?** Es una estimación del reanálisis ERA5, no un pluviómetro: el kit no trae lluvia observada. Por eso dice "estimada" en pantalla.
- **¿Desde cuándo se puede comparar?** Hay imágenes Sentinel-2 de la zona desde enero de 2017 hasta el corte del 31/10/2026. Hoy la herramienta tiene ocho fechas cargadas.
- **¿Qué falta para usarla de verdad?** Elegir cualquier zona en el mapa, descargar automáticamente cada pasada nueva, sumar radar para días nublados, restar el agua permanente (Global Surface Water) y validar con relevamientos en terreno.

## Ensayo
- [ ] Cronometrar dos ensayos completos (objetivo: 2:50).
- [ ] Probar la demo en la notebook del evento con el backend y el frontend levantados.
- [ ] Tener el video de respaldo descargado en la notebook (sin depender de internet).
- [ ] Confirmar quién dice cada bloque.
