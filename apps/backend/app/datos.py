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
