"""Acceso a datos: catálogo de escenas, bandas, umbrales K3 y niveles del río."""

import csv
import json
from functools import lru_cache
from pathlib import Path

import numpy as np

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
ESCENAS_DIR = DATA_DIR / "escenas"
# Serie limpia de K1 (la genera el rol B). Formato: fecha (YYYY-MM-DD), altura_m
NIVELES_CSV = DATA_DIR / "niveles_formosa_limpio.csv"


@lru_cache
def catalogo() -> list[dict]:
    return json.loads((ESCENAS_DIR / "catalogo.json").read_text(encoding="utf-8"))


def buscar_escena(escena_id: str) -> dict | None:
    return next((e for e in catalogo() if e["id"] == escena_id), None)


def cargar_bandas(escena: dict) -> tuple[np.ndarray, np.ndarray]:
    """Devuelve (verde, nir) como reflectancia 0-1.

    Formato actual: .npz con arrays 'verde' y 'nir' en valores digitales L2A (÷10000).
    Si el rol A usa GeoTIFF, cambiar solo esta función (p. ej. con rasterio).
    """
    with np.load(ESCENAS_DIR / escena["archivo"]) as z:
        return z["verde"] / 10_000, z["nir"] / 10_000


@lru_cache
def umbrales_k3() -> dict:
    return json.loads((DATA_DIR / "K3_estaciones_umbrales.json").read_text(encoding="utf-8"))


def nivel_rio(fecha: str) -> float | None:
    """Altura de Puerto Formosa para esa fecha, o None si no hay serie limpia o dato."""
    if not NIVELES_CSV.exists():
        return None
    with NIVELES_CSV.open(encoding="utf-8") as f:
        for fila in csv.DictReader(f):
            if fila["fecha"] == fecha:
                return float(fila["altura_m"])
    return None


# --- Región y lluvia (datos agregados por el rol D, ver docs/PLAN_DATOS_REALES.md) ---------------

INA_ALTURAS_CSV = DATA_DIR / "ina_alturas_region.csv"
INA_ESTACIONES_JSON = DATA_DIR / "ina_estaciones_region.json"
LLUVIA_CSV = DATA_DIR / "lluvia_formosa_era5.csv"


@lru_cache
def _alturas_ina() -> dict[tuple[int, str], float]:
    if not INA_ALTURAS_CSV.exists():
        return {}
    with INA_ALTURAS_CSV.open(encoding="utf-8") as f:
        return {(int(r["site_code"]), r["fecha"]): float(r["altura_m"]) for r in csv.DictReader(f)}


@lru_cache
def estaciones_region() -> list[dict]:
    """Escalas del río Paraguay en la región (INA), sin Puerto Formosa, que ya usa K1."""
    if not INA_ESTACIONES_JSON.exists():
        return []
    datos = json.loads(INA_ESTACIONES_JSON.read_text(encoding="utf-8"))["estaciones"]
    return [e for e in datos if e["sitecode"] != 57]


def altura_ina(site_code: int, fecha: str) -> float | None:
    return _alturas_ina().get((site_code, fecha))


@lru_cache
def _lluvia() -> dict[str, float]:
    if not LLUVIA_CSV.exists():
        return {}
    with LLUVIA_CSV.open(encoding="utf-8") as f:
        return {r["fecha"]: float(r["lluvia_mm"]) for r in csv.DictReader(f)}


def lluvia_entre(desde_excl: str, hasta_incl: str) -> float | None:
    """Lluvia estimada acumulada en (desde, hasta]. None si falta algún día de la serie."""
    from datetime import date, timedelta

    serie, d, fin, total = _lluvia(), date.fromisoformat(desde_excl), date.fromisoformat(hasta_incl), 0.0
    while d < fin:
        d += timedelta(days=1)
        valor = serie.get(d.isoformat())
        if valor is None:
            return None
        total += valor
    return round(total, 1)


def lluvia_previa(fecha: str, dias: int = 30) -> float | None:
    from datetime import date, timedelta

    return lluvia_entre((date.fromisoformat(fecha) - timedelta(days=dias)).isoformat(), fecha)
