"""Descarga la lluvia diaria estimada sobre la zona de estudio (reanálisis ERA5).

Fuente: Open-Meteo, API de datos históricos (https://open-meteo.com/en/docs/historical-weather-api),
que sirve el reanálisis ERA5 de Copernicus / ECMWF. Gratuita y sin cuenta. Licencia CC BY 4.0.

IMPORTANTE: es un dato ESTIMADO por un modelo (celda de ~25 km), no una medición de pluviómetro.
El kit del desafío no incluye lluvia observada. Sirve como contexto, no para afirmar cuánto llovió.

Período: 01/12/2016 (para tener 30 días antes de la primera escena de 2017) al 31/10/2026 (corte).

    uv run python scripts/descargar_lluvia.py
"""

import csv
import json
import urllib.request
from pathlib import Path

API = "https://archive-api.open-meteo.com/v1/archive"
DATA_DIR = Path(__file__).resolve().parent.parent / "data"
SALIDA = DATA_DIR / "lluvia_formosa_era5.csv"
LAT, LON = -26.205, -58.145  # centro de la zona de estudio
INICIO, CORTE = "2016-12-01", "2026-10-31"


def url() -> str:
    return (f"{API}?latitude={LAT}&longitude={LON}&start_date={INICIO}&end_date={CORTE}"
            "&daily=precipitation_sum&timezone=America%2FArgentina%2FBuenos_Aires")


def filas(respuesta: dict) -> list[dict]:
    d = respuesta["daily"]
    return [{"fecha": f, "lluvia_mm": v} for f, v in zip(d["time"], d["precipitation_sum"]) if v is not None and f <= CORTE]


def main() -> None:
    with urllib.request.urlopen(url(), timeout=120) as r:
        datos = filas(json.load(r))
    with SALIDA.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=["fecha", "lluvia_mm"])
        w.writeheader()
        w.writerows(datos)
    print(f"{len(datos)} días ({datos[0]['fecha']} a {datos[-1]['fecha']}) en {SALIDA.name}")


if __name__ == "__main__":
    main()
