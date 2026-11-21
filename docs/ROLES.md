# Roles y forma de trabajo · Equipo 1

**Integrantes:** Selena Brítez · Diego García · Agostina González · Matías Agüero
**Rama de integración propuesta:** `main` (confirmar en el equipo). Cada uno trabaja en `dev-Nombre` y hace merge a `main` seguido, en bloques chicos.

| Rol | Responsable | Qué hace | Archivos que toca |
|---|---|---|---|
| A · Imágenes y NDWI | PENDIENTE (el avance está en `dev-Diego`: `8611457`, `3ceabdd`) | Elegir zona, descargar 2–3 escenas Sentinel-2 L2A (B03 y B08, misma zona y producto, pocas nubes) de río bajo y río alto; convertirlas a `.npz` (o adaptar `cargar_bandas` a GeoTIFF); actualizar `catalogo.json` con fecha, tile, nubes y URL | `apps/backend/data/escenas/`, `apps/backend/app/datos.py` (solo `cargar_bandas`), `apps/backend/app/cambio.py` |
| B · Backend y K1 | PENDIENTE (el avance está en `dev-Diego`: `24bd739`, `7d10a0f`, `7518cc1`) | Limpiar K1 → `apps/backend/data/niveles_formosa_limpio.csv` (`fecha,altura_m`, un valor diario documentado); completar `registro_limpieza.md`; mantener la API y sus tests | `apps/backend/app/`, `apps/backend/tests/`, `docs/entregables/registro_limpieza.md` |
| C · Frontend | PENDIENTE (el avance está en `dev-Diego`: `c17b250` a `33db98f`) | Mapa, comparación (p. ej. deslizador antes/después), panel de metadatos, estados de carga/vacío/error, leyenda PROTOTIPO | `apps/frontend/` |
| D · Entregables | Selena Brítez (`dev-Selena-Milagros-Britez`) | Las 7 preguntas, póster, guion del pitch (3 min), video ≤120 s, ficha técnica, ficha de fuentes, README final, prueba desde un clon limpio | `docs/`, `README.md` |

> Los roles A, B y C quedan en PENDIENTE hasta que el equipo los confirme. Entre paréntesis figura dónde está el trabajo hecho hasta hoy, según el historial de Git.

## Las 7 preguntas

Propuesta de Selena (rol D) del 20/11/2026, armada a partir de la guía del desafío, el documento base y lo que el prototipo hace hoy. **El equipo tiene que confirmarla.**

1. **Usuario:** técnicos de la mesa interinstitucional por El Niño (Defensa Civil, Ministerio de Producción y Ambiente, Obras Públicas, entre otros) que siguen el estado del río Paraguay y de los riachos y bañados del sur de la ciudad de Formosa. El esquema preventivo provincial ya prevé inspeccionar cursos de agua con imágenes satelitales (El Monterizo, 17/9/2026).
2. **Problema:** comparar a ojo dos imágenes satelitales lleva tiempo, depende de quién mira y no deja registro. Además, el técnico tiene que buscar aparte la fecha, la cobertura de nubes y la resolución de cada imagen, y la altura del río en esos días. Sin todo eso junto no se puede saber si un cambio es real ni con qué nivel del río ocurrió.
3. **Solución (función principal):** comparar dos fechas de imágenes satelitales de una zona y marcar dónde apareció o desapareció agua. La herramienta calcula las hectáreas de cada caso y, en la misma pantalla, muestra los datos de cada imagen y la altura del río en Puerto Formosa frente a los umbrales del INA.
4. **Datos:** Sentinel-2 L2A (Copernicus, ESA), con las bandas B03 (verde), B08 (infrarrojo cercano) y la clasificación de escena para excluir nubes, descargado de Earth Search (AWS Open Data). Kit K1 (altura de Puerto Formosa, INA, limpiada por el equipo) y kit K3 (umbrales del INA). Detalle completo en [ficha_fuentes.md](entregables/ficha_fuentes.md).
5. **Demostración:** en vivo se comparan el 02/10/2026 (río a 2,35 m) y el 26/10/2026 (río a 5,44 m) sobre un recorte de 7 × 7,8 km entre Formosa, Alberdi y los bañados del sur. El mapa marca 110,63 ha de agua nueva y 43,25 ha de agua que ya no está, y avisa que la segunda imagen tiene un 20,1 % de nubes. Para contrastar se comparan el 13/11/2024 (−0,62 m, bajante) y el 21/06/2019 (9,08 m, crecida): 1.097,89 ha de agua nueva. Al final se muestra el caso inválido (misma fecha en los dos campos).
6. **Límites:** nubes, resolución 10 m, NDWI confunde agua con sombras, un cambio no es una afectación comprobada, sin datos posteriores al 31/10/2026. Tampoco pronostica, no tiene lluvia observada y no decide: la decisión queda en manos de la mesa.
7. **Aporte tecnológico:** el procesamiento de imágenes reemplaza la comparación a ojo. Para cada uno de los 546.000 píxeles del recorte se calcula un índice de agua (NDWI) con la misma regla y el mismo umbral, y en segundos se obtiene un mapa y una superficie en hectáreas que cualquiera puede repetir. Las escenas se descargan de un catálogo público (STAC) sin cuenta, así que sumar nuevas fechas es correr un script. Las herramientas de IA se usaron como asistentes de programación y documentación. Las fórmulas, los umbrales y los datos son verificables y no los decide un modelo de IA.

## Reglas mínimas
- Antes de empezar un bloque: `git fetch --all && git log --oneline --all -n 20` y avisar en el grupo qué archivos vas a tocar.
- `docs/CONTRATO_API.md` y `apps/backend/tests/test_api.py` son compartidos: cambios solo con aviso.
- Antes de hacer merge: `uv run pytest` en el backend y `npm run build` en el frontend.
- Nada de `push --force` sobre `main`.
