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
4. Al lado muestra la ficha de cada imagen (satélite, resolución, fecha, nubes) y la altura del río frente a los umbrales del INA.

*[Captura grande del mapa con la comparación 02/10/2026 → 26/10/2026]*

## La evidencia
| Comparación | Río (Puerto Formosa) | Agua nueva | Agua que ya no está |
|---|---|---|---|
| 02/10/2026 → 26/10/2026 | 2,35 m → 5,44 m | 110,64 ha | 43,25 ha |
| 13/11/2024 → 21/06/2019 | −0,62 m → 9,08 m | 1.097,89 ha | 11,47 ha |

Sector de 7 × 7,8 km entre Formosa, Alberdi y los bañados del sur.

*[Escala de Puerto Formosa: aguas bajas 1,60 m · alerta 7,80 m · evacuación 8,30 m]*

## Fuentes
- **Imágenes:** Copernicus Sentinel-2 L2A (ESA), 10 m, tile 21JUM, vía Earth Search (AWS Open Data). Dato observado.
- **Altura del río:** INA, kit K1, Puerto Formosa 2006–2026, **limpiado y documentado por el equipo** (12 filas repetidas, un tramo en centímetros, un valor imposible, 131 días sin dato que no se inventaron). Dato observado.
- **Umbrales:** INA, kit K3. Dato observado.
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
Python (FastAPI, NumPy) · React (Vite, Leaflet) · 77 pruebas automáticas · Asistentes de IA para programar y documentar, con revisión del equipo.

**Repositorio:** https://github.com/dot-Hawk/ai-lab-formosa-agua
*[Código QR al repositorio]*

---

## Lista para cerrar el póster
- [ ] Captura del mapa (comparación 02/10 → 26/10) a resolución alta.
- [ ] Captura de la escala hidrométrica.
- [ ] Código QR al repositorio (con cualquier generador; verificar que abra).
- [ ] Revisar ortografía y que todas las cifras coincidan con [ficha_fuentes.md](ficha_fuentes.md).
- [ ] Imprimir o tener la versión digital lista para el sábado 21/11.
