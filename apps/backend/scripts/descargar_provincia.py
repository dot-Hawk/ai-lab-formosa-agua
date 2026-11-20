"""Vista provincial: contorno de Formosa (IGN) y agua de siempre de toda la provincia (Global Surface Water).

Es una capa de CONTEXTO a resolución gruesa (unos 250 m por píxel), no un análisis de cambios:
analizar toda la provincia a 10 m serían unos 720 millones de píxeles por imagen. Los cambios
se calculan en las zonas clave (data/zonas.json) a 10 m.

- Contorno: IGN, capa ign:provincia (WFS público), simplificado para el mapa.
- Agua de siempre: Global Surface Water v1.4 (JRC), capa occurrence, mosaicos 70W_20S y 60W_20S.

    uv sync --group escenas
    uv run python scripts/descargar_provincia.py
"""

import base64
import io
import json
import math
import os
import sys
import urllib.parse
import urllib.request
from datetime import date
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
import descargar_gsw as dg  # noqa: E402

SALIDA = Path(__file__).resolve().parent.parent / "data" / "provincia"
WFS = "https://wms.ign.gob.ar/geoserver/ows"
ANCHO_PX = 1800  # unos 250-300 m por píxel a lo ancho de la provincia
PASO_CONTORNO = 20  # se conserva 1 de cada 20 vértices del contorno


def contorno_formosa() -> list[list[float]]:
    q = {"service": "WFS", "version": "1.0.0", "request": "GetFeature", "typeName": "ign:provincia",
         "outputFormat": "application/json", "CQL_FILTER": "nam='Formosa'"}
    with urllib.request.urlopen(WFS + "?" + urllib.parse.urlencode(q), timeout=180) as r:
        g = json.load(r)["features"][0]["geometry"]
    anillo = (g["coordinates"][0] if g["type"] == "MultiPolygon" else g["coordinates"])[0]
    return simplificar(anillo, PASO_CONTORNO)


def simplificar(anillo: list, paso: int) -> list[list[float]]:
    """Conserva 1 de cada `paso` vértices y cierra el anillo."""
    puntos = anillo[::paso]
    if puntos[-1] != anillo[-1]:
        puntos.append(anillo[-1])
    return [[round(x, 5), round(y, 5)] for x, y in puntos]


def merc_y(lat: float) -> float:
    return math.log(math.tan(math.pi / 4 + math.radians(lat) / 2))


def main() -> None:
    os.environ.setdefault("GDAL_DISABLE_READDIR_ON_OPEN", "EMPTY_DIR")
    from PIL import Image, ImageDraw
    from rasterio.enums import Resampling
    from rasterio.transform import from_bounds
    from rasterio.warp import transform_bounds

    contorno = contorno_formosa()
    xs, ys = [p[0] for p in contorno], [p[1] for p in contorno]
    bbox = (min(xs), min(ys), max(xs), max(ys))
    oeste, sur, este, norte = transform_bounds("EPSG:4326", "EPSG:3857", *bbox)
    alto_px = round(ANCHO_PX * (norte - sur) / (este - oeste))
    transform = from_bounds(oeste, sur, este, norte, ANCHO_PX, alto_px)

    import rasterio
    from rasterio.vrt import WarpedVRT
    ocurrencia = np.zeros((alto_px, ANCHO_PX), dtype="uint8")
    for mosaico in ("70W_20S", "60W_20S"):
        url = f"/vsicurl/{dg.BASE}/occurrence/occurrence_{mosaico}v1_4_2021.tif"
        with rasterio.open(url) as src, WarpedVRT(src, crs="EPSG:3857", transform=transform, width=ANCHO_PX,
                                                    height=alto_px, resampling=Resampling.average) as vrt:
            parte = vrt.read(1)
        ocurrencia = np.maximum(ocurrencia, np.where(parte <= 100, parte, 0).astype("uint8"))
        print(f"{mosaico} leído", flush=True)

    # Máscara de la provincia: polígono en píxeles de la grilla Mercator
    def a_pixel(lon, lat):
        return ((lon - bbox[0]) / (bbox[2] - bbox[0]) * ANCHO_PX,
                (merc_y(bbox[3]) - merc_y(lat)) / (merc_y(bbox[3]) - merc_y(bbox[1])) * alto_px)
    mascara = Image.new("L", (ANCHO_PX, alto_px), 0)
    ImageDraw.Draw(mascara).polygon([a_pixel(x, y) for x, y in contorno], fill=255)
    dentro = np.array(mascara) > 0

    rgba = np.zeros((alto_px, ANCHO_PX, 4), dtype="uint8")
    estacional = dentro & (ocurrencia >= 10) & (ocurrencia < 50)
    siempre = dentro & (ocurrencia >= 50)
    rgba[estacional] = (110, 170, 220, 170)
    rgba[siempre] = (30, 90, 170, 220)
    buf = io.BytesIO()
    Image.fromarray(rgba, "RGBA").save(buf, format="PNG", optimize=True)
    SALIDA.mkdir(parents=True, exist_ok=True)
    (SALIDA / "agua_siempre.png").write_bytes(buf.getvalue())

    km2_pixel = ((bbox[2] - bbox[0]) * 111.32 * math.cos(math.radians(-24.7)) / ANCHO_PX) * \
                ((bbox[3] - bbox[1]) * 110.57 / alto_px)
    (SALIDA / "provincia.json").write_text(json.dumps({
        "nombre": "Provincia de Formosa",
        "bounds": [[bbox[1], bbox[0]], [bbox[3], bbox[2]]],
        "contorno": [[y, x] for x, y in contorno],
        "agua_siempre": {
            "archivo": "agua_siempre.png",
            "fuente": "Global Surface Water v1.4 (JRC, Comisión Europea), capa occurrence, 1984-2021",
            "resolucion_aprox_m": round(math.sqrt(km2_pixel) * 1000),
            "clases": {"siempre": "agua al menos el 50 % del tiempo", "estacional": "agua entre el 10 y el 50 % del tiempo"},
            "km2_siempre": round(float(siempre.sum()) * km2_pixel),
            "km2_estacional": round(float(estacional.sum()) * km2_pixel),
        },
        "contorno_fuente": "IGN, capa ign:provincia (WFS público), simplificada",
        "categoria": "Referencia (contorno) y observado (agua, derivado de Landsat)",
        "consultado": date.today().isoformat(),
    }, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Vista provincial: {ANCHO_PX}x{alto_px} px, contorno de {len(contorno)} vértices, "
          f"agua de siempre {round(float(siempre.sum()) * km2_pixel)} km², estacional {round(float(estacional.sum()) * km2_pixel)} km²")


if __name__ == "__main__":
    main()
