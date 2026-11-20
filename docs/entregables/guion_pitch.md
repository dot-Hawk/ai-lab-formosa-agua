# Guion del pitch · 3 minutos · Equipo 1
Operación Agua · Comparador de imágenes satelitales · Sábado 21/11/2026 desde las 10:00

**Duración objetivo:** 2 min 50 s (unas 400 palabras a ritmo tranquilo). Quedan 10 segundos de margen.
**Quién habla:** se propone dividir en cuatro bloques, uno por integrante. El reparto lo confirma el equipo.
**Qué cubre (según el documento base):** problema vinculado a El Niño, usuario, función principal, evidencia usada y límites.

| Tiempo | Bloque | Quién | Qué se muestra |
|---|---|---|---|
| 0:00–0:35 | 1 · Problema | PENDIENTE | Póster: escala de Puerto Formosa |
| 0:35–1:00 | 2 · Usuario | PENDIENTE | Póster: sección Usuario |
| 1:00–2:05 | 3 · Demostración en vivo | PENDIENTE | La herramienta en la notebook |
| 2:05–2:35 | 4 · Límites | PENDIENTE | Póster: sección Límites |
| 2:35–2:50 | 5 · Cierre | PENDIENTE | Póster: enlace al repositorio |

---

## 1 · Problema (0:00–0:35)

> El 1 de octubre el río Paraguay en Puerto Formosa marcaba 2,37 metros. El 31 de octubre, 5,60. El Servicio Meteorológico Nacional confirmó El Niño, y el último Niño fuerte llevó esta misma escala a 9,81 metros en enero de 2016, por encima del nivel de evacuación.
>
> Cuando el río sube, el agua no avanza solo por el cauce: llena bañados y riachos. La provincia ya revisa esos cursos de agua con imágenes satelitales. Pero comparar dos imágenes a ojo lleva tiempo, depende de quién mira y no deja registro.

## 2 · Usuario (0:35–1:00)

> Nuestra herramienta es para los técnicos de la mesa interinstitucional por El Niño: Defensa Civil, Producción y Ambiente, Obras Públicas. Les responde una pregunta concreta: entre dos fechas, ¿dónde apareció o desapareció agua, cuántas hectáreas son y a qué altura estaba el río esos días?

## 3 · Demostración en vivo (1:00–2:05)

*Tener la herramienta abierta antes de empezar, con el backend y el frontend andando. Si algo falla, pasar al video de respaldo.*

> Elegimos un sector de siete por ocho kilómetros entre Formosa, Alberdi y los bañados del sur. Comparamos dos imágenes Sentinel-2 reales: el 2 de octubre, con el río a 2,35 metros, y el 26 de octubre, con el río a 5,44.
>
> *(Presionar Comparar.)*
>
> En azul, el agua nueva: 110 hectáreas. En naranja, el agua que ya no está: 43. Al lado, la ficha de cada imagen: satélite, resolución de 10 metros, fecha y nubes. La segunda tiene un 20 % del sector tapado por nubes, y la herramienta lo dice. A la derecha, la escala del río con los umbrales oficiales del INA: alerta a 7,80 y evacuación a 8,30.
>
> *(Cambiar a 13/11/2024 → 21/06/2019 y comparar.)*
>
> Si comparamos la bajante de 2024, con el río bajo cero, con la crecida de 2019, a 9,08 metros, aparecen más de 1.000 hectáreas de agua nueva.
>
> *(Elegir la misma fecha en los dos campos.)*
>
> Y si alguien se equivoca y elige la misma fecha dos veces, la herramienta lo avisa y deja seguir trabajando.

## 4 · Límites (2:05–2:35)

> Lo que la herramienta no puede decir es tan importante como lo que dice. Un cambio detectado es un indicio, no una afectación comprobada: hay que verificarlo en terreno. No ve debajo de las nubes, no detecta cursos de agua de menos de diez metros y el índice puede confundir agua con sombras o con suelo muy húmedo. No pronostica ni decide: la decisión es de la mesa.

## 5 · Cierre (2:35–2:50)

> Cada número que vieron tiene su fuente en nuestra ficha: Copernicus, el INA y la serie del kit, que limpiamos y documentamos. El código está en el repositorio del póster. Gracias.

---

## Preguntas probables del jurado (respuestas cortas)

- **¿Por qué NDWI y no IA?** Porque es una fórmula conocida (McFeeters, 1996), repetible y explicable. Para una mesa que decide, importa poder decir por qué se marcó cada píxel. La IA la usamos para programar y documentar más rápido, con revisión del equipo.
- **¿Qué pasa con las nubes?** Los píxeles con nube o sombra se excluyen usando la clasificación de Sentinel-2. El paso siguiente es sumar Sentinel-1 (radar), que ve a través de las nubes.
- **¿Se puede usar en otra zona?** Hoy hay un solo recorte. El script de descarga ya acepta otra zona; falta conectarlo a la interfaz.
- **¿De dónde salen las alturas del río?** Del kit K1 del INA, que limpiamos: 12 filas repetidas, un tramo cargado en centímetros, un valor imposible de 98,1 metros y 131 días sin dato que no inventamos. Todo está en el registro de limpieza.
- **¿Qué falta para usarla de verdad?** Elegir cualquier zona, descargar automáticamente cada pasada nueva, integrar radar y validar con relevamientos en terreno.

## Ensayo
- [ ] Cronometrar dos ensayos completos (objetivo: 2:50).
- [ ] Probar la demo en la notebook del evento con el backend y el frontend levantados.
- [ ] Tener el video de respaldo descargado en la notebook (sin depender de internet).
- [ ] Confirmar quién dice cada bloque.
