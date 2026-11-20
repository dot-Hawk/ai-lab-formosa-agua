# Registro de limpieza de K1 · AI LAB Misión: Código Formosa
Herramienta: Comparador de imágenes satelitales · Equipo: Equipo 1, Instituto Politécnico Formosa

**Archivo original:** `P1_DATA_INTEGRITY_dataset_participantes_v1.csv` (kit K1, INA, Puerto Formosa, 2006 al 31/10/2026), copiado sin cambios en `apps/backend/data/crudo/`.
SHA-256: `f494373ece69f6373c6d6580eabc8dcf5342cf7d6535954766643904f3140cb2`

**Cómo se reproduce:** `cd apps/backend && uv run python scripts/limpiar_k1.py`
Las pruebas de cada regla están en `tests/test_limpiar_k1.py` y las de la serie real en `tests/test_serie_k1_real.py`.

| Problema encontrado en K1 | Cómo se detectó | Cantidad de registros afectados | Cómo se resolvió | Decisión que afecta a la serie |
|---|---|---|---|---|
| Filas repetidas | Comparación de todas las columnas, incluido `obs_id` | 12 | Se conservó una copia de cada una y se descartaron las demás | Ninguna: eran filas idénticas |
| Tramo en otra unidad | Columna `unidad_registro` = `cm` (10 al 16/03/2011, valores 584 a 596) | 7 | Se dividió por 100 (5,84 a 5,96 m). El tramo queda continuo con los días vecinos | Se conserva el valor original en `valor_original` |
| Fechas en formatos distintos | Patrón de la columna `timestart` | 40 (20 en `dd/mm/aaaa` en 2019 y 20 en `aaaa/mm/dd` en 2020) | Se pasaron a `AAAA-MM-DD HH:MM:SS`. El formato `dd/mm` no es ambiguo: en los 20 casos el primer número es mayor que 12 | Ninguna |
| Coma decimal | Búsqueda de `,` en `valor` | 3 (14/02, 18/06 y 22/10/2014) | Se reemplazó la coma por punto | Ninguna |
| Valor físicamente imposible | Rango posible de la escala: -3 a 15 m (máximo histórico 9,81 m) | 1 (15/07/2012: 98,1 m, entre dos días de 5,83 m) | Se excluyó. **No se reemplazó**: podría ser 9,81 o 5,81 mal cargado, y no hay evidencia para elegir | El 15/07/2012 queda sin dato en la serie diaria |
| Pico aislado de una lectura | Valor que se aparta más de 1 m de sus dos lecturas vecinas (a 2 días o menos), mientras las vecinas difieren menos de 0,5 m | 1 (14/08/2009: 3,40 m, entre 4,59 y 4,49 m) | Se conservó sin cambios y se marcó `pendiente_verificacion` | Hay que contrastarlo con el INA antes de usarlo en un análisis |
| Días sin datos | Recorrido día por día entre el 01/01/2006 y el 31/10/2026 | 131 días (2008: 4 · 2011: 20 · 2012: 29 · 2013: 14 · 2016: 25 · 2018: 25 · 2024: 14) | **No se interpolaron.** La herramienta muestra "Sin dato" | Los días faltantes no aparecen en la serie diaria |
| Varias mediciones en un mismo día (no es un error) | Conteo de lecturas por fecha | 444 días (por ejemplo, cada 3 horas en enero de 2016) | Se conservaron todas. La serie diaria usa el promedio del día y guarda cuántas lecturas tuvo (`n_mediciones`) | El promedio diario puede quedar algo por debajo del pico del día |
| Valores negativos (no es un error) | Valores menores que 0 | 141 (bajante de 2024, mínimo -0,86 m el 07/11/2024) | Se conservaron: son lecturas reales por debajo del cero de la escala | Ninguna |

Además se verificó que no hay `obs_id` repetidos con contenido distinto ni dos lecturas de la misma hora con valores diferentes.

**Archivos generados (en `apps/backend/data/`):**
- `k1_observaciones_limpias.csv`: las 8.335 lecturas, con `valor_original`, `unidad_original`, `estado` (`original`, `corregido`, `excluido_imposible`, `pendiente_verificacion`) y `correcciones`.
- `niveles_formosa_limpio.csv`: serie diaria (`fecha`, `altura_m`, `n_mediciones`, `estado`) que usa la herramienta.
- `k1_informe_limpieza.json`: conteos y la lista de lecturas excluidas y pendientes.

**Comprobación final:** máximo de la serie limpia = **9,81 m** el 5 y el 6 de enero de 2016, en las lecturas de las 18:00 del día 5 a las 09:00 del día 6 (esperado: 9,81 m, enero de 2016). En la serie diaria, que promedia las lecturas del día, el máximo es 9,80 m el 06/01/2016.
Cantidad de registros finales: **8.335** lecturas (8.347 originales menos 12 repetidas), de las cuales 8.334 tienen altura. La serie diaria tiene 7.478 días.
Control cruzado con el documento base: 01/10/2026 = 2,37 m y 31/10/2026 = 5,60 m, igual que la figura 1.
