# Ficha técnica · AI LAB Misión: Código Formosa
PROTOTIPO · no es una herramienta oficial · Entrega: viernes 20/11/2026, 18 h

**Nombre de la herramienta:** Operación Agua · Comparador de imágenes satelitales
**Equipo · institución · integrantes y rol de cada uno:** Equipo 1 · Instituto Politécnico Formosa · Desafío 7 (Imágenes satelitales)
- Selena Brítez: rol D, entregables (7 preguntas, fichas, póster, pitch, video, README y prueba desde un clon limpio)
- Diego García: imágenes y NDWI, backend y limpieza de K1, frontend (según el historial de `dev-Diego`; roles A, B y C sin confirmar formalmente)
- Agostina González: PENDIENTE de confirmar
- Matías Agüero: PENDIENTE de confirmar

**Reto:** 4 · Mapa (propuesta; confirmar con el CITF)

## Usuario y pregunta
Lo usan los técnicos de la mesa interinstitucional por El Niño que siguen el río Paraguay y los riachos y bañados del sur de la ciudad de Formosa. Responde: *¿dónde apareció o desapareció agua entre dos fechas, cuántas hectáreas son, con qué imágenes se midió y a qué altura estaba el río esos días?*

## Qué funciona hoy
- Elegir dos de las cuatro escenas Sentinel-2 reales (21/06/2019, 13/11/2024, 02/10/2026 y 26/10/2026) y compararlas.
- Mapa con el agua nueva en azul y el agua que ya no está en naranja, con opacidad regulable, sobre un recorte de 7 × 7,8 km (Formosa, Alberdi y bañados del sur).
- Superficie de cada cambio en hectáreas, con un umbral NDWI que se puede ajustar (por defecto 0).
- Tabla antes/después con fecha y hora de captura, satélite, producto, resolución, cobertura de nubes, fuente y categoría de cada escena.
- Semáforo de confianza del resultado (alta, media o baja) con el motivo de cada criterio: nubes y zona sin dato sobre el recorte, días entre fechas y altura del sol. Las reglas están escritas en pantalla.
- Aviso cuando una escena supera el 20 % de nubes sobre la zona: lo de abajo no se analiza y haría falta radar (Sentinel-1), que no está integrado.
- Altura del río en Puerto Formosa en cada fecha (serie K1 limpia), sobre una escala con los umbrales del INA: aguas bajas 1,60 m, alerta 7,80 m y evacuación 8,30 m. Si falta el dato, muestra "Sin dato".
- Píxeles con nube o sombra excluidos del cálculo.
- Mensajes de carga, catálogo vacío y error. El caso inválido (misma escena dos veces) devuelve *"Elegí dos escenas distintas para comparar."* y se puede seguir trabajando.
- Leyenda PROTOTIPO y advertencia de que un cambio detectado es un indicio, no una afectación comprobada.
- 50 pruebas del backend y 43 del frontend, todas pasando (20/11/2026).

## Qué falta para que la mesa la use
- **Zonas:** hoy hay un solo recorte. Para elegir cualquier sector de la provincia hay que dibujar el área en el mapa y descargar las escenas al momento (el script ya existe; falta conectarlo a la interfaz). Estimado: 1 a 2 semanas.
- **Fechas:** solo hay cuatro escenas cargadas. Hay que automatizar la descarga de cada pasada nueva de Sentinel-2 (cada 5 días aproximadamente).
- **Nubes:** integrar Sentinel-1 (radar), que ve a través de las nubes, para los días de lluvia. Hoy la herramienta solo avisa cuando hay más de 20 % de nubes. Estimado: 2 a 4 semanas.
- **Agua de siempre:** restar el agua permanente y estacional (Global Surface Water, JRC) para mostrar solo el agua donde normalmente no hay.
- **Infraestructura:** cruzar el agua nueva con rutas, escuelas y centros de salud (capas del IGN).
- **Semáforo:** validar con la mesa las reglas, que hoy son una propuesta del equipo.
- Plan detallado: [PLAN_DATOS_REALES.md](../PLAN_DATOS_REALES.md).
- **Validación:** contrastar los cambios con relevamientos en terreno de Defensa Civil o con el Global Surface Water Explorer para ajustar el umbral NDWI.
- **Río:** conectar la altura del río al servicio del INA en lugar de la serie congelada al 31/10/2026.
- **Puesta en marcha:** publicar la herramienta en un servidor de la provincia, con acceso para los técnicos.

## Cómo está hecha
- **Backend:** Python 3.14, FastAPI, NumPy y Pillow. Calcula NDWI = (verde − NIR) / (verde + NIR) píxel por píxel, marca agua donde NDWI > umbral, compara las dos fechas y genera la capa PNG.
- **Frontend:** React 19, Vite 6 y Leaflet 1.9.4 (react-leaflet), con pruebas en Vitest y Testing Library.
- **Datos:** Sentinel-2 L2A vía Earth Search (STAC, AWS Open Data), descargado con `pystac-client` y `rasterio`. Kits K1 y K3 del INA.
- **Gestores:** uv (Python) y npm (Node), con lockfiles en el repositorio.
- **Herramientas de IA:** asistentes de programación (Antigravity CLI con Claude, Codex y Claude Code) para escribir código, pruebas y documentación. Todo lo que generaron fue revisado y probado por el equipo. La herramienta no usa IA para calcular ni decidir: el NDWI es una fórmula fija.

## Lo que la herramienta no puede decir
- No dice si hubo una afectación: un cambio detectado es un indicio y hay que verificarlo en terreno.
- No ve debajo de las nubes. En la escena del 26/10/2026 el 20,1 % del recorte está tapado, y algunos bordes de nube pueden aparecer como cambio.
- No distingue cursos de agua de menos de 10 m de ancho.
- El NDWI puede confundir agua con sombras o con suelo muy húmedo.
- No tiene lluvia observada ni datos posteriores al 31/10/2026.
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
