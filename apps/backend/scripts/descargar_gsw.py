"""Descarga el "agua de siempre" de la zona: Global Surface Water (JRC, Comisión Europea).

Fuente: Pekel, J.-F., Cottam, A., Gorelick, N., Belward, A. S. (2016). High-resolution mapping of global
surface water and its long-term changes. Nature 540, 418-422. Datos v1.4 (1984-2021), Landsat, 30 m.
Descarga: https://global-surface-water.appspot.com/download (mosaico 60W_20S). Licencia CC BY 4.0.

Capas:
- occurrence: % de las observaciones de 1984 a 2021 en que el píxel tuvo agua (0 a 100).
- seasonality: cuántos meses del año tiene agua en el último año disponible (0 a 12).

Solo se lee el recorte de la zona (el GeoTIFF está en bloques), y se reproyecta a la MISMA grilla
de 10 m en Web Mercator que las escenas Sentinel-2 (vecino más cercano), para comparar píxel a píxel.

Requiere el grupo "escenas":
    uv sync --group escenas
    uv run python scripts/descargar_gsw.py
"""

import json
import os
import sys
from datetime import date
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
from descargar_escenas import BBOX, grilla_mercator, leer_banda  # noqa: E402

BASE = "https://storage.googleapis.com/global-surface-water/downloads2021"
MOSAICO = "60W_20S"
CAPAS = ("occurrence", "seasonality")
DATA_DIR = Path(__file__).resolve().parent.parent / "data"
SALIDA = DATA_DIR / "gsw_zona.npz"
METADATOS = DATA_DIR / "gsw_zona.json"


def url(capa: str) -> str:
    return f"{BASE}/{capa}/{capa}_{MOSAICO}v1_4_2021.tif"


def main() -> None:
    os.environ.setdefault("GDAL_DISABLE_READDIR_ON_OPEN", "EMPTY_DIR")
    from rasterio.enums import Resampling

    transform, ancho, alto, bounds = grilla_mercator()
    capas = {c: leer_banda("/vsicurl/" + url(c), transform, ancho, alto, Resampling.nearest).astype("uint8") for c in CAPAS}
    np.savez_compressed(SALIDA, **capas)
    occ = capas["occurrence"]
    METADATOS.write_text(json.dumps({
        "fuente": "Global Surface Water v1.4 (JRC, Comisión Europea), Pekel et al. 2016, Nature 540",
        "urls": [url(c) for c in CAPAS],
        "periodo": "1984-2021",
        "resolucion_original_m": 30,
        "resolucion_grilla_m": 10,
        "licencia": "CC BY 4.0",
        "categoria": "Observado (derivado de Landsat)",
        "consultado": date.today().isoformat(),
        "bbox": BBOX,
        "bounds": bounds,
        "forma": list(occ.shape),
    }, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    for umbral in (25, 50, 75):
        print(f"occurrence >= {umbral} %: {100 * (occ >= umbral).mean():.1f} % de la zona")
    print(f"Guardado {SALIDA.name} {occ.shape} y {METADATOS.name}")


if __name__ == "__main__":
    main()
