# Contenido del póster · Equipo 1
Operación Agua · Comparador de imágenes satelitales

Texto final para el diseño del póster. El documento base pide: problema, usuario, solución, evidencias, fuentes, límites y un enlace al repositorio.

**Formato sugerido:** A1 vertical (59,4 × 84,1 cm), letra de 28 pt como mínimo para el cuerpo, de modo que se lea a 1,5 m. Diseño: PENDIENTE (Canva, PowerPoint o Inkscape).

---

**Franja superior (chica, en todo el ancho)**
PROTOTIPO · AI LAB Misión: Código Formosa · no es una herramienta oficial

## Título
**¿Dónde llegó el agua?**
Comparador de imágenes satelitales para seguir el río Paraguay y los bañados de Formosa

Equipo 1 · Instituto Politécnico Formosa · Desafío 7: Imágenes satelitales
Selena Brítez · Diego García · Agostina González · Matías Agüero

## El problema
En octubre de 2026 el río Paraguay subió de **2,37 m a 5,60 m** en Puerto Formosa, con El Niño confirmado. En 2016, el último Niño fuerte lo llevó a **9,81 m**.
Cuando el río sube, se llenan bañados y riachos. La provincia ya los revisa con imágenes satelitales, pero comparar a ojo lleva tiempo y no deja registro.

## Para quién
Técnicos de la mesa interinstitucional por El Niño (Defensa Civil, Producción y Ambiente, Obras Públicas).
**Su pregunta:** entre dos fechas, ¿dónde apareció o desapareció agua, cuántas hectáreas son y a qué altura estaba el río?

## Qué hace
1. Elegís dos fechas.
2. La herramienta calcula el índice de agua **NDWI** en cada uno de los 546.000 píxeles de 10 m.
3. El mapa marca el **agua nueva (azul)** y el **agua que ya no está (naranja)**, con su superficie en hectáreas.
4. Al lado muestra la ficha de cada imagen (satélite, resolución, fecha y hora, nubes), la altura del río en Formosa y en Pilcomayo frente a los umbrales del INA, y la lluvia estimada del mes previo.
5. Un **semáforo de confianza** (alta, media o baja) dice cuánto creerle al resultado, y por qué.

*[Captura grande del mapa con la comparación 18/01/2021 → 07/02/2021 y el semáforo en verde]*

## La evidencia
| Comparación | Río (Puerto Formosa) | Agua nueva | Agua que ya no está | Confianza |
|---|---|---|---|---|
| Crecida 18/01 → 07/02/2021 | 2,16 m → 5,37 m | 222,9 ha | 15,1 ha | 🟢 Alta |
| Bajante 24/11 → 14/12/2022 | 4,68 m → 1,79 m | 3,2 ha | 132,2 ha | 🟡 Media |
| Octubre 2026: 02/10 → 26/10 | 2,35 m → 5,44 m | 110,6 ha | 43,3 ha | 🔴 Baja (20 % de nubes) |

Cuando el río sube aparece agua, y cuando baja desaparece. Con nubes, la herramienta baja la confianza y lo avisa.

Sector de 7 × 7,8 km entre Formosa, Alberdi y los bañados del sur.

*[Escala de Puerto Formosa: aguas bajas 1,60 m · alerta 7,80 m · evacuación 8,30 m]*

## Fuentes
- **Imágenes:** Copernicus Sentinel-2 L2A (ESA), 10 m, tile 21JUM, vía Earth Search (AWS Open Data). Dato observado.
- **Altura del río:** INA, kit K1, Puerto Formosa 2006–2026, **limpiado y documentado por el equipo** (12 filas repetidas, un tramo en centímetros, un valor imposible, 131 días sin dato que no se inventaron). Dato observado.
- **Umbrales:** INA, kit K3. Dato observado.
- **Río en la región:** API pública del INA (Puerto Pilcomayo y Puerto Bermejo). Contrastada con K1: 3.470 de 3.552 días idénticos. Dato observado.
- **Lluvia:** reanálisis ERA5 vía Open-Meteo. **Estimado**: un modelo, no un pluviómetro.
- **Áreas en hectáreas:** calculadas por la herramienta (estimación).

## Lo que no puede decir
- ⚠ **Un cambio detectado es un indicio, no una afectación comprobada.** Hay que verificarlo en terreno.
- No ve debajo de las nubes (el 26/10/2026 tiene un 20 % del sector tapado).
- No detecta cursos de agua de menos de 10 m.
- El NDWI puede confundir agua con sombras o suelo muy húmedo.
- Sin datos posteriores al 31/10/2026. No pronostica ni decide: **la decisión es de la mesa.**

## Qué sigue
Elegir cualquier zona en el mapa · descarga automática de cada pasada nueva · radar Sentinel-1 para días nublados · validación con relevamientos en terreno.

## Cómo está hecha
Python (FastAPI, NumPy) · React (Vite, Leaflet) · 103 pruebas automáticas · Asistentes de IA para programar y documentar, con revisión del equipo.

**Repositorio:** https://github.com/dot-Hawk/ai-lab-formosa-agua
*[Código QR al repositorio]*

---

## Lista para cerrar el póster
- [ ] Captura del mapa (comparación 18/01 → 07/02/2021, con el semáforo) a resolución alta.
- [ ] Captura de la escala hidrométrica.
- [ ] Código QR al repositorio (con cualquier generador; verificar que abra).
- [ ] Revisar ortografía y que todas las cifras coincidan con [ficha_fuentes.md](ficha_fuentes.md).
- [ ] Imprimir o tener la versión digital lista para el sábado 21/11.
