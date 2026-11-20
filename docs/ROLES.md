# Roles y forma de trabajo · Equipo 1

**Integrantes:** Selena Brítez · Diego García · Agostina González · Matías Agüero
**Rama de integración propuesta:** `main` (confirmar en el equipo). Cada uno trabaja en `dev-Nombre` y hace merge a `main` seguido, en bloques chicos.

| Rol | Responsable | Qué hace | Archivos que toca |
|---|---|---|---|
| A · Imágenes y NDWI | PENDIENTE | Elegir zona, descargar 2–3 escenas Sentinel-2 L2A (B03 y B08, misma zona y producto, pocas nubes) de río bajo y río alto; convertirlas a `.npz` (o adaptar `cargar_bandas` a GeoTIFF); actualizar `catalogo.json` con fecha, tile, nubes y URL | `apps/backend/data/escenas/`, `apps/backend/app/datos.py` (solo `cargar_bandas`), `apps/backend/app/cambio.py` |
| B · Backend y K1 | PENDIENTE | Limpiar K1 → `apps/backend/data/niveles_formosa_limpio.csv` (`fecha,altura_m`, un valor diario documentado); completar `registro_limpieza.md`; mantener la API y sus tests | `apps/backend/app/`, `apps/backend/tests/`, `docs/entregables/registro_limpieza.md` |
| C · Frontend | PENDIENTE | Mapa, comparación (p. ej. deslizador antes/después), panel de metadatos, estados de carga/vacío/error, leyenda PROTOTIPO | `apps/frontend/` |
| D · Entregables | PENDIENTE | Las 7 preguntas, póster, guion del pitch (3 min), video ≤120 s, ficha técnica, ficha de fuentes, README final, prueba desde un clon limpio | `docs/`, `README.md` |

## Las 7 preguntas (completar antes de programar)
1. **Usuario:**
2. **Problema:**
3. **Solución (función principal):** comparar dos fechas de imágenes satelitales de una zona y marcar dónde apareció o desapareció agua.
4. **Datos:** Sentinel-2 L2A (Copernicus), K1 (altura Puerto Formosa, INA), K3 (umbrales INA).
5. **Demostración:**
6. **Límites:** nubes, resolución 10 m, NDWI confunde agua con sombras, un cambio no es una afectación comprobada, sin datos posteriores al 31/10/2026.
7. **Aporte tecnológico:**

## Reglas mínimas
- Antes de empezar un bloque: `git fetch --all && git log --oneline --all -n 20` y avisar en el grupo qué archivos vas a tocar.
- `docs/CONTRATO_API.md` y `apps/backend/tests/test_api.py` son compartidos: cambios solo con aviso.
- Antes de hacer merge: `uv run pytest` en el backend y `npm run build` en el frontend.
- Nada de `push --force` sobre `main`.
