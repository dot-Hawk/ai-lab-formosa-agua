"""Limpieza de K1: altura hidrométrica de Puerto Formosa (INA), 2006 al 31/10/2026.

Criterios (LEEME_P1_PARTICIPANTES.txt):
- Unidad canónica: metros. Un decimal único (punto).
- Fechas normalizadas a YYYY-MM-DD HH:MM:SS.
- Varias mediciones en un mismo día NO son duplicados; solo se eliminan filas idénticas.
- No se inventan ni interpolan valores. Lo que no se puede corregir con evidencia
  se excluye (valor imposible) o se marca como pendiente de verificación.

Ningún valor original se pierde: el archivo de observaciones conserva `valor_original`.

Uso:  uv run python scripts/limpiar_k1.py [ruta_al_csv_crudo]
"""

import csv
import json
import sys
from collections import defaultdict
from datetime import datetime, timedelta
from pathlib import Path

DATA = Path(__file__).resolve().parent.parent / "data"
CRUDO = DATA / "crudo" / "P1_DATA_INTEGRITY_dataset_participantes_v1.csv"
SALIDA_OBSERVACIONES = DATA / "k1_observaciones_limpias.csv"
SALIDA_DIARIA = DATA / "niveles_formosa_limpio.csv"
SALIDA_INFORME = DATA / "k1_informe_limpieza.json"

FORMATOS_FECHA = ("%Y-%m-%d %H:%M:%S", "%d/%m/%Y %H:%M:%S", "%Y/%m/%d %H:%M:%S")

# Rango físicamente posible en la escala de Puerto Formosa. La escala mide ~0-10 m,
# el máximo histórico es 9,81 m (2016) y la bajante de 2024 llegó a -0,86 m.
ALTURA_MIN_POSIBLE = -3.0
ALTURA_MAX_POSIBLE = 15.0

# Pico aislado: el valor se aparta más de 1 m de las lecturas vecinas (a ≤ 2 días)
# mientras las vecinas difieren entre sí menos de 0,5 m.
SALTO_PICO_M = 1.0
VECINAS_SIMILARES_M = 0.5
VENTANA_VECINAS = timedelta(days=2)


def normalizar_fecha(texto: str) -> str:
    for formato in FORMATOS_FECHA:
        try:
            return datetime.strptime(texto.strip(), formato).strftime(FORMATOS_FECHA[0])
        except ValueError:
            continue
    raise ValueError(f"Formato de fecha no reconocido: {texto!r}")


def normalizar_valor(texto: str, unidad: str) -> float:
    valor = float(texto.strip().replace(",", "."))
    if unidad == "m":
        return valor
    if unidad == "cm":
        return valor / 100
    raise ValueError(f"Unidad no reconocida: {unidad!r}")


def leer(ruta: Path) -> list[dict]:
    with ruta.open(encoding="utf-8-sig", newline="") as f:  # el archivo trae BOM
        return list(csv.DictReader(f))


def limpiar(filas: list[dict]) -> tuple[list[dict], dict]:
    informe = defaultdict(int)
    informe["registros_originales"] = len(filas)

    # 1. Filas idénticas (todas las columnas iguales)
    vistas, unicas = set(), []
    for f in filas:
        clave = tuple(f.items())
        if clave in vistas:
            informe["duplicados_identicos"] += 1
            continue
        vistas.add(clave)
        unicas.append(f)

    # 2. Normalización de fecha, decimal y unidad
    limpias = []
    for f in unicas:
        correcciones = []
        fecha_hora = normalizar_fecha(f["timestart"])
        if fecha_hora != f["timestart"].strip():
            correcciones.append("fecha_normalizada")
            informe["fechas_normalizadas"] += 1
        if "," in f["valor"]:
            correcciones.append("coma_decimal")
            informe["comas_decimales"] += 1
        if f["unidad_registro"] == "cm":
            correcciones.append("cm_a_m")
            informe["centimetros_convertidos"] += 1
        altura = round(normalizar_valor(f["valor"], f["unidad_registro"]), 3)

        estado = "corregido" if correcciones else "original"
        if not ALTURA_MIN_POSIBLE <= altura <= ALTURA_MAX_POSIBLE:
            estado, altura = "excluido_imposible", None
            informe["imposibles"] += 1

        limpias.append({
            "obs_id": f["obs_id"],
            "fecha_hora": fecha_hora,
            "altura_m": altura,
            "valor_original": f["valor"],
            "unidad_original": f["unidad_registro"],
            "estado": estado,
            "correcciones": "+".join(correcciones),
        })

    limpias.sort(key=lambda f: f["fecha_hora"])

    # 3. Picos aislados de una sola lectura: se marcan, no se corrigen
    validas = [f for f in limpias if f["altura_m"] is not None]
    for i in range(1, len(validas) - 1):
        antes, actual, despues = validas[i - 1], validas[i], validas[i + 1]
        t = datetime.fromisoformat(actual["fecha_hora"])
        cerca = (t - datetime.fromisoformat(antes["fecha_hora"]) <= VENTANA_VECINAS
                 and datetime.fromisoformat(despues["fecha_hora"]) - t <= VENTANA_VECINAS)
        if (cerca
                and abs(actual["altura_m"] - antes["altura_m"]) > SALTO_PICO_M
                and abs(actual["altura_m"] - despues["altura_m"]) > SALTO_PICO_M
                and abs(antes["altura_m"] - despues["altura_m"]) < VECINAS_SIMILARES_M):
            actual["estado"] = "pendiente_verificacion"
            informe["pendientes"] += 1

    informe["registros_finales"] = len(limpias)
    informe["registros_con_altura"] = len(validas)
    return limpias, dict(informe)


def serie_diaria(limpias: list[dict]) -> list[dict]:
    """Promedio diario de las lecturas con altura. Los días sin lecturas válidas no aparecen."""
    por_dia = defaultdict(list)
    for f in limpias:
        if f["altura_m"] is not None:
            por_dia[f["fecha_hora"][:10]].append(f)
    diaria = []
    for fecha in sorted(por_dia):
        lecturas = por_dia[fecha]
        pendiente = any(f["estado"] == "pendiente_verificacion" for f in lecturas)
        diaria.append({
            "fecha": fecha,
            "altura_m": round(sum(f["altura_m"] for f in lecturas) / len(lecturas), 2),
            "n_mediciones": len(lecturas),
            "estado": "pendiente_verificacion" if pendiente else "observado",
        })
    return diaria


def dias_faltantes(diaria: list[dict]) -> dict[str, int]:
    fechas = {d["fecha"] for d in diaria}
    actual = datetime.fromisoformat(diaria[0]["fecha"])
    fin = datetime.fromisoformat(diaria[-1]["fecha"])
    por_anio = defaultdict(int)
    while actual <= fin:
        if actual.strftime("%Y-%m-%d") not in fechas:
            por_anio[str(actual.year)] += 1
        actual += timedelta(days=1)
    return dict(por_anio)


def escribir_csv(ruta: Path, filas: list[dict]) -> None:
    with ruta.open("w", encoding="utf-8", newline="") as f:
        escritor = csv.DictWriter(f, fieldnames=list(filas[0]))
        escritor.writeheader()
        escritor.writerows({k: ("" if v is None else v) for k, v in fila.items()} for fila in filas)


def main(argv: list[str]) -> None:
    entrada = Path(argv[1]) if len(argv) > 1 else CRUDO
    limpias, informe = limpiar(leer(entrada))
    diaria = serie_diaria(limpias)
    maximo = max(diaria, key=lambda d: d["altura_m"])
    maximo_obs = max((f for f in limpias if f["altura_m"] is not None), key=lambda f: f["altura_m"])
    informe.update({
        "maximo_observacion": {"fecha_hora": maximo_obs["fecha_hora"], "altura_m": maximo_obs["altura_m"]},
        "dias_en_serie_diaria": len(diaria),
        "dias_sin_dato_por_anio": dias_faltantes(diaria),
        "maximo_diario": {"fecha": maximo["fecha"], "altura_m": maximo["altura_m"]},
        "excluidos": [f for f in limpias if f["estado"] == "excluido_imposible"],
        "pendientes_verificacion": [f for f in limpias if f["estado"] == "pendiente_verificacion"],
    })
    escribir_csv(SALIDA_OBSERVACIONES, limpias)
    escribir_csv(SALIDA_DIARIA, diaria)
    SALIDA_INFORME.write_text(json.dumps(informe, indent=2, ensure_ascii=False), encoding="utf-8")
    print(json.dumps({k: v for k, v in informe.items() if k not in ("excluidos", "pendientes_verificacion")},
                     indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main(sys.argv)
