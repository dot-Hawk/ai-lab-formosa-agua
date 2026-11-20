"""Descarga recortes de radar Sentinel-1 (VV) de la zona, para los días nublados.

Fuente: Copernicus Sentinel-1 (ESA), producto RTC (retrodispersión con corrección de relieve,
gamma0, 10 m) de Microsoft Planetary Computer (https://planetarycomputer.microsoft.com,
colección `sentinel-1-rtc`). El catálogo es público; las descargas usan un token temporal
gratuito que da la propia API (no hace falta cuenta).

El radar ve a través de las nubes: el agua calma refleja la señal lejos del satélite y aparece
muy oscura (retrodispersión baja). Se guarda la banda VV en decibeles en la MISMA grilla de 10 m
en Web Mercator que las escenas Sentinel-2.

Requiere el grupo "escenas":
    uv sync --group escenas
    uv run python scripts/descargar_radar.py
"""

import json
import os
import sys
import urllib.request
from datetime import date
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
from descargar_escenas import grilla_mercator, leer_banda  # noqa: E402

STAC = "https://planetarycomputer.microsoft.com/api/stac/v1"
TOKEN = "https://planetarycomputer.microsoft.com/api/sas/v1/token/sentinel-1-rtc"
RADAR_DIR = Path(__file__).resolve().parent.parent / "data" / "radar"
SIN_DATO_DB = -32768  # valor entero reservado para "sin dato"

# Pasadas elegidas: a 1 día de una escena óptica, órbita relativa 141 (misma geometría en cada par).
# - 01/10 y 25/10/2026: para comparar octubre de 2026, cuando la escena óptica del 26/10 tiene nubes.
# - 17/01/2021: validación contra Sentinel-2 del 18/01/2021 (sin nubes).
PASADAS = [
    "S1C_IW_GRDH_1SDV_20261001T092002_20261001T092027_009689_0134B9_rtc",
    "S1C_IW_GRDH_1SDV_20261025T092001_20261025T092026_010039_014091_rtc",
    "S1B_IW_GRDH_1SDV_20210117T092020_20210117T092045_025192_02FFDE_rtc",
]


def a_decibeles(lineal: np.ndarray) -> np.ndarray:
    """gamma0 lineal -> dB. Los valores <= 0 o no finitos quedan como NaN (sin dato)."""
    salida = np.full(lineal.shape, np.nan, dtype="float32")
    valido = np.isfinite(lineal) & (lineal > 0)
    salida[valido] = 10 * np.log10(lineal[valido])
    return salida


def empaquetar_db(db: np.ndarray) -> np.ndarray:
    """dB -> int16 en centésimas (p. ej. -18,25 dB -> -1825); NaN -> SIN_DATO_DB."""
    salida = np.full(db.shape, SIN_DATO_DB, dtype="int16")
    valido = np.isfinite(db)
    salida[valido] = np.clip(np.round(db[valido] * 100), -32000, 32000).astype("int16")
    return salida


def leer_json(url: str, cuerpo: dict | None = None) -> dict:
    datos = None if cuerpo is None else json.dumps(cuerpo).encode()
    req = urllib.request.Request(url, data=datos, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=120) as r:
        return json.load(r)


def main() -> None:
    os.environ.setdefault("GDAL_DISABLE_READDIR_ON_OPEN", "EMPTY_DIR")
    from rasterio.enums import Resampling

    transform, ancho, alto, bounds = grilla_mercator()
    token = leer_json(TOKEN)["token"]
    items = {f["id"]: f for f in leer_json(f"{STAC}/search", {"collections": ["sentinel-1-rtc"], "ids": PASADAS, "limit": 50})["features"]}
    faltan = set(PASADAS) - set(items)
    if faltan:
        raise SystemExit(f"No se encontraron en el catálogo: {sorted(faltan)}")

    RADAR_DIR.mkdir(parents=True, exist_ok=True)
    catalogo = []
    for item_id in PASADAS:
        item = items[item_id]
        p = item["properties"]
        href = "/vsicurl/" + item["assets"]["vv"]["href"] + "?" + token
        print(f"Leyendo {item_id}…", flush=True)
        vv = leer_banda(href, transform, ancho, alto, Resampling.bilinear).astype("float32")
        db = a_decibeles(vv)
        fecha = p["datetime"][:10]
        archivo = f"s1-{fecha}.npz"
        np.savez_compressed(RADAR_DIR / archivo, vv_db=empaquetar_db(db))
        catalogo.append({
            "id": f"s1-{fecha}",
            "fecha": fecha,
            "captura_utc": p["datetime"][:19] + "Z",
            "fuente": f"Copernicus Sentinel-1 (ESA), {item_id}, RTC de Microsoft Planetary Computer",
            "satelite": "Sentinel-1",
            "plataforma": str(p.get("platform", "")).upper(),
            "producto": "RTC (gamma0, corrección de relieve), polarización VV",
            "orbita_relativa": p.get("sat:relative_orbit"),
            "orbita": p.get("sat:orbit_state"),
            "resolucion_m": 10,
            "sin_dato_pct": round(float(100 * np.isnan(db).mean()), 1),
            "categoria": "Observado",
            "url": f"{STAC}/collections/sentinel-1-rtc/items/{item_id}",
            "consultado": date.today().isoformat(),
            "bounds": bounds,
            "archivo": archivo,
        })
        print(f"  VV mediana {np.nanmedian(db):.1f} dB, sin dato {catalogo[-1]['sin_dato_pct']} %")
    catalogo.sort(key=lambda e: e["fecha"])
    (RADAR_DIR / "catalogo.json").write_text(json.dumps(catalogo, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Catálogo de radar con {len(catalogo)} pasadas en {RADAR_DIR}")


if __name__ == "__main__":
    main()
