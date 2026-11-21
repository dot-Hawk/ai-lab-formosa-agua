# Ficha técnica · AI LAB Misión: Código Formosa
PROTOTIPO · no es una herramienta oficial · Entrega: viernes 20/11/2026, 18 h

**Nombre de la herramienta:** Operación Agua · Comparador de imágenes satelitales
**Equipo · institución · integrantes y rol de cada uno:** Equipo 1 · Instituto Politécnico Formosa · Desafío 7 (Imágenes satelitales)
- Selena Brítez: rol D, entregables (7 preguntas, fichas, póster, pitch, video, README y prueba desde un clon limpio)
- Diego García: roles A, B y C, imágenes y NDWI, backend y limpieza de K1, frontend (`dev-Diego`)

**Reto:** 4 · Mapa (propuesta; confirmar con el CITF)

## Usuario y pregunta
Lo usan los técnicos de la mesa interinstitucional por El Niño que siguen el río Paraguay y los riachos y bañados del sur de la ciudad de Formosa. Responde: *¿dónde apareció o desapareció agua entre dos fechas, cuántas hectáreas son, con qué imágenes se midió y a qué altura estaba el río esos días?*

## Qué funciona hoy
- Elegir dos de las ocho escenas Sentinel-2 reales (21/06/2019, 18/01/2021, 07/02/2021, 24/11/2022, 14/12/2022, 13/11/2024, 02/10/2026 y 26/10/2026) y compararlas. Incluye una crecida (2021, confianza alta) y una bajante (2022), a 20 días cada una.
- Mapa con el agua nueva en azul y el agua que ya no está en naranja, con opacidad regulable, sobre un recorte de 7 × 7,8 km (Formosa, Alberdi y bañados del sur).
- Deslizador antes/después: a cada lado de una línea móvil se ve el agua, el color real o el NDVI (vegetación) de cada fecha.
- Dos índices de agua a elección: NDWI y MNDWI (este último separa mejor el agua de la ciudad: un tercio menos de ruido urbano).
- Toda la provincia: un mapa de contexto con el contorno del IGN y el agua de siempre de Formosa, y 7 zonas clave analizadas a 10 m (Formosa capital, Clorinda, Herradura, El Colorado, Pirané, Las Lomitas e Ingeniero Juárez; Bañado La Estrella quedó pendiente), cada una con dos fechas reales, su agua de siempre y su infraestructura.
- Superficie de cada cambio en hectáreas, con un umbral NDWI que se puede ajustar (por defecto 0).
- Agua nueva contra agua de siempre: cuántas hectáreas de agua nueva caen donde normalmente no hay agua (Global Surface Water, 1984–2021). El mapa puede mostrar solo ese agua inusual y el agua de siempre en gris.
- Tabla antes/después con fecha y hora de captura, satélite, producto, resolución, cobertura de nubes, fuente y categoría de cada escena.
- Semáforo de confianza del resultado (alta, media o baja) con el motivo de cada criterio: nubes y zona sin dato sobre el recorte, días entre fechas y altura del sol. Las reglas están escritas en pantalla.
- Radar automático: si una escena óptica supera el 20 % de nubes sobre la zona, la herramienta compara también con radar Sentinel-1 (que ve a través de las nubes) y lo avisa. Umbral validado contra Sentinel-2 sin nubes (98 % de acuerdo). En octubre de 2026 el radar ve 220,8 ha de agua nueva y el óptico 110,6.
- Infraestructura expuesta: escuelas y centros de salud del IGN a menos de 500 m (configurable) del agua nueva inusual, y km de ruta afectados, con marcadores en el mapa.
- Altura del río en Puerto Formosa en cada fecha (serie K1 limpia), sobre una escala con los umbrales del INA: aguas bajas 1,60 m, alerta 7,80 m y evacuación 8,30 m. Si falta el dato, muestra "Sin dato".
- Altura del río en Puerto Pilcomayo y Puerto Bermejo en las dos fechas (API del INA, dato observado) y lluvia de los 30 días previos (ERA5, marcada como estimada).
- Píxeles con nube o sombra excluidos del cálculo.
- Mensajes de carga, catálogo vacío y error. El caso inválido (misma escena dos veces) devuelve *"Elegí dos escenas distintas para comparar."* y se puede seguir trabajando.
- Leyenda PROTOTIPO y advertencia de que un cambio detectado es un indicio, no una afectación comprobada.
- 82 pruebas del backend y 66 del frontend, todas pasando (20/11/2026).

## Qué falta para que la mesa la use
- **Zonas:** hay 7 zonas clave fijas (Bañado La Estrella pendiente: el 20/11 no había escenas limpias de 2025 y el servidor de imágenes falló). Para analizar cualquier punto de la provincia hay que permitir dibujar el área y descargarla al momento (`scripts/descargar_zonas.py` ya lo hace por línea de comandos). Estimado: 1 a 2 semanas.
- **Fechas:** hay ocho escenas ópticas y tres pasadas de radar cargadas. Hay que automatizar la descarga de cada pasada nueva (Sentinel-2 cada 5 días, Sentinel-1 cada 6 a 12).
- **Radar e infraestructura:** validar el umbral del radar con más fechas y sumar más capas del IGN (puentes, defensas, localidades) y datos de Paraguay para Alberdi.
- **Semáforo:** validar con la mesa las reglas, que hoy son una propuesta del equipo.
- Plan detallado: [PLAN_DATOS_REALES.md](../PLAN_DATOS_REALES.md).
- **Validación:** contrastar los cambios con relevamientos en terreno de Defensa Civil o con el Global Surface Water Explorer para ajustar el umbral NDWI.
- **Río:** conectar la altura del río al servicio del INA en lugar de la serie congelada al 31/10/2026.
- **Puesta en marcha:** publicar la herramienta en un servidor de la provincia, con acceso para los técnicos.

## Cómo está hecha
- **Backend:** Python 3.14, FastAPI, NumPy y Pillow. Calcula NDWI = (verde − NIR) / (verde + NIR) píxel por píxel, marca agua donde NDWI > umbral, compara las dos fechas y genera la capa PNG.
- **Frontend:** React 19, Vite 6 y Leaflet 1.9.4 (react-leaflet), con pruebas en Vitest y Testing Library.
- **Datos:** Sentinel-2 L2A vía Earth Search (STAC, AWS Open Data), descargado con `pystac-client` y `rasterio`. Kits K1 y K3 del INA. API pública del INA (alturas de la región). Open-Meteo (lluvia ERA5, estimada). Global Surface Water del JRC (agua de siempre, 1984–2021). Sentinel-1 RTC de Microsoft Planetary Computer (radar). IGN, Capas SIG por WFS (escuelas, salud, rutas y contorno provincial). Bandas de Sentinel-2 usadas: B02, B03, B04, B08 y B11.
- **Gestores:** uv (Python) y npm (Node), con lockfiles en el repositorio.
- **Herramientas de IA:** asistentes de programación (Antigravity CLI con Claude, Codex y Claude Code) para escribir código, pruebas y documentación. Todo lo que generaron fue revisado y probado por el equipo. La herramienta no usa IA para calcular ni decidir: el NDWI es una fórmula fija.

## Lo que la herramienta no puede decir
- No dice si hubo una afectación: un cambio detectado es un indicio y hay que verificarlo en terreno.
- No ve debajo de las nubes. En la escena del 26/10/2026 el 20,1 % del recorte está tapado, y algunos bordes de nube pueden aparecer como cambio.
- No distingue cursos de agua de menos de 10 m de ancho.
- El radar puede confundir agua con superficies muy lisas y no ver agua bajo vegetación o con viento; su umbral se calibró con solo dos pares de fechas.
- Fuera de las 7 zonas clave, la provincia solo tiene la capa de contexto (agua de siempre a unos 270 m): no hay detección de cambios. El radar y la lluvia están solo en la zona de Formosa capital.
- En las zonas del interior no hay una escala hidrométrica del INA cercana: no se muestra la altura de ningún río.
- La infraestructura es la del IGN a la fecha de consulta y cubre solo Argentina: Alberdi (Paraguay) queda sin datos. Estar cerca del agua es una exposición posible, no una afectación.
- El NDWI puede confundir agua con sombras o con suelo muy húmedo.
- No tiene lluvia observada: la que muestra es una estimación de un modelo (ERA5). Tampoco usa datos posteriores al 31/10/2026.
- No pronostica ni recomienda acciones. Las decisiones son de la mesa.

## Cómo se arranca (cinco líneas)
1. Requisitos: Python 3.14 con uv, y Node.js ≥ 20 con npm.
2. `git clone https://github.com/dot-Hawk/ai-lab-formosa-agua.git`
3. Backend: `cd apps/backend && uv sync --python 3.14 && uv run uvicorn app.main:app --port 8000`
4. Frontend (otra terminal): `cd apps/frontend && npm install && npm run dev`
5. Abrir http://localhost:5173, elegir dos fechas y presionar *Comparar*.

## Repositorio

- **Tema:** Imágenes satelitales (Desafío 7).
- **URL:** https://github.com/dot-Hawk/ai-lab-formosa-agua
- **Commit o tag evaluable:** PENDIENTE. Se define cuando el equipo integre las ramas en `main`; se propone el tag `entrega-2026-11-20`.
- **Frontend:** `apps/frontend/` (http://localhost:5173). **Backend:** `apps/backend/` (http://localhost:8000, documentación en `/docs`).
- **Configuración:** `.env.example` (`CORS_ORIGINS`, `VITE_BACKEND_URL`, `VITE_API_BASE`). No hace falta ninguna credencial.
- **Comandos:** ver [README.md](../../README.md). Contrato entre frontend y backend: [CONTRATO_API.md](../CONTRATO_API.md).
