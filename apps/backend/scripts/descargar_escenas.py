"""Descarga recortes Sentinel-2 L2A reales (bandas B03 y B08) de la zona de estudio.

Fuente: Copernicus Sentinel-2 (ESA), catálogo público Earth Search de Element84
sobre AWS Open Data (https://earth-search.aws.element84.com/v1). No requiere cuenta.
Solo se leen los píxeles del recorte (COG por HTTP), no la escena completa.

Todas las escenas se reproyectan a la MISMA grilla en Web Mercator (EPSG:3857),
la proyección de Leaflet, con píxeles de ~10 m sobre el terreno. Así la capa de
cambios calza exacta en el mapa y las escenas se pueden comparar píxel a píxel.

Los píxeles con nube, sombra de nube o sin dato (capa SCL) se guardan como 0 en ambas
bandas: el backend los trata como "sin dato" y no los cuenta como cambio.

Requiere el grupo de dependencias "escenas":
    uv sync --group escenas
    uv run python scripts/descargar_escenas.py                 # todas las escenas de ESCENAS
    uv run python scripts/descargar_escenas.py --agregar ID…   # solo esas, sumadas al catálogo actual
"""

import json
import math
import os
from datetime import date
from pathlib import Path

import numpy as np

STAC_URL = "https://earth-search.aws.element84.com/v1"
COLECCION = "sentinel-2-l2a"
ESCENAS_DIR = Path(__file__).resolve().parent.parent / "data" / "escenas"

# Zona de estudio: costa del río Paraguay en la ciudad de Formosa, el riacho y los
# bañados e islas al sur (lon/lat WGS84: oeste, sur, este, norte)
BBOX = (-58.18, -26.24, -58.11, -26.17)
RESOLUCION_TERRENO_M = 10

# Escenas elegidas: mismo tile (21JUM), pocas nubes, niveles del río muy distintos (K1)
ESCENAS = [
    "S2A_21JUM_20241113_0_L2A",  # bajante extrema: -0,62 m
    "S2B_21JUM_20261002_0_L2A",  # inicio de la crecida 2026: 2,35 m
    "S2A_21JUM_20261026_0_L2A",  # crecida a días del corte: 5,44 m
    "S2B_21JUM_20190621_1_L2A",  # creciente 2019, sobre evacuación: 9,08 m
    # Pares a 20 días, 0 % de nubes en la escena, elegidos con scripts/buscar_pares.py (alturas INA)
    "S2B_21JUM_20210118_1_L2A",  # crecida 2021, antes: 2,16 m
    "S2B_21JUM_20210207_1_L2A",  # crecida 2021, después: 5,37 m
    "S2A_21JUM_20221124_0_L2A",  # bajante 2022, antes: 4,68 m
    "S2A_21JUM_20221214_0_L2A",  # bajante 2022, después: 1,79 m
]

# Clases SCL (Scene Classification) de Sentinel-2 L2A
SCL_SIN_DATO = 0
SCL_SATURADO = 1
SCL_SOMBRA_NUBE = 3
SCL_NUBES = (8, 9, 10)  # nube de probabilidad media, alta y cirros
SCL_INVALIDOS = (SCL_SIN_DATO, SCL_SATURADO, SCL_SOMBRA_NUBE, *SCL_NUBES)


def reflectancia(dn: np.ndarray, escala: float, offset: float, nodata: int) -> np.ndarray:
    """Valor digital -> reflectancia de superficie, con la escala y offset del producto."""
    r = dn.astype("float64") * escala + offset
    r[dn == nodata] = np.nan
    return r


def mascara_validos(scl: np.ndarray) -> np.ndarray:
    return ~np.isin(scl, SCL_INVALIDOS)


def porcentaje_nubes(scl: np.ndarray) -> float:
    """Porcentaje de píxeles con nube o sombra, sobre los píxeles que tienen dato."""
    con_dato = scl != SCL_SIN_DATO
    if not con_dato.any():
        return 100.0
    nubosos = np.isin(scl, (SCL_SOMBRA_NUBE, *SCL_NUBES))
    return float(100 * nubosos.sum() / con_dato.sum())


def metadatos_captura(propiedades: dict) -> dict:
    """Hora de captura y ángulos de la escena, desde las propiedades STAC del ítem.

    - captura_utc: instante de la toma (ISO 8601, UTC, sin fracciones de segundo).
    - sol_elevacion_grados: altura del sol sobre el horizonte; con sol bajo hay sombras largas.
    - incidencia_grados: ángulo de visión del satélite respecto de la vertical.
    """
    def angulo(clave):
        v = propiedades.get(clave)
        return None if v is None else round(float(v), 1)

    return {
        "captura_utc": str(propiedades["datetime"])[:19] + "Z",
        "sol_elevacion_grados": angulo("view:sun_elevation"),
        "incidencia_grados": angulo("view:incidence_angle"),
    }


def empaquetar(verde: np.ndarray, nir: np.ndarray, validos: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    """Reflectancia -> uint16 (x10000) como espera app/datos.py. 0 = sin dato en ambas bandas."""
    validos = validos & ~np.isnan(verde) & ~np.isnan(nir)
    salida = []
    for banda in (verde, nir):
        v = np.clip(np.nan_to_num(banda, nan=0) * 10_000, 1, 65_535).round().astype("uint16")
        v[~validos] = 0
        salida.append(v)
    return salida[0], salida[1]


# --- Lectura (requiere red y el grupo "escenas") ----------------------------------------

def grilla_mercator():
    """Transform, ancho, alto y bounds lat/lon de la grilla común en EPSG:3857."""
    from rasterio.transform import from_origin
    from rasterio.warp import transform_bounds

    oeste, sur, este, norte = transform_bounds("EPSG:4326", "EPSG:3857", *BBOX)
    lat_centro = math.radians((BBOX[1] + BBOX[3]) / 2)
    res = RESOLUCION_TERRENO_M / math.cos(lat_centro)  # metros Mercator por píxel
    ancho = math.ceil((este - oeste) / res)
    alto = math.ceil((norte - sur) / res)
    transform = from_origin(oeste, norte, res, res)
    w, s, e, n = transform_bounds("EPSG:3857", "EPSG:4326", oeste, norte - alto * res, oeste + ancho * res, norte)
    return transform, ancho, alto, [[s, w], [n, e]]


def leer_banda(href: str, transform, ancho: int, alto: int, remuestreo):
    import rasterio
    from rasterio.vrt import WarpedVRT

    with rasterio.open(href) as src, WarpedVRT(
        src, crs="EPSG:3857", transform=transform, width=ancho, height=alto, resampling=remuestreo
    ) as vrt:
        return vrt.read(1)


def parametros(asset, offset_ya_aplicado: bool) -> tuple[float, float, int]:
    """Escala, offset y nodata de la banda.

    Earth Search declara offset -0,1 en `raster:bands` pero, cuando la propiedad
    `earthsearch:boa_offset_applied` es verdadera, los valores ya vienen corregidos:
    restarlo de nuevo deja el agua con reflectancia negativa.
    """
    banda = (asset.extra_fields.get("raster:bands") or [{}])[0]
    offset = 0.0 if offset_ya_aplicado else banda.get("offset", 0.0)
    return banda.get("scale", 0.0001), offset, banda.get("nodata", 0)


def main() -> None:
    os.environ.setdefault("GDAL_DISABLE_READDIR_ON_OPEN", "EMPTY_DIR")
    os.environ.setdefault("CPL_VSIL_CURL_ALLOWED_EXTENSIONS", ".tif")
    from pystac_client import Client
    from rasterio.enums import Resampling

    import sys
    solo_agregar = "--agregar" in sys.argv
    pedidas = [a for a in sys.argv[1:] if not a.startswith("--")] if solo_agregar else ESCENAS

    transform, ancho, alto, bounds = grilla_mercator()
    items = {i.id: i for i in Client.open(STAC_URL).search(collections=[COLECCION], ids=pedidas).items()}
    faltan = set(pedidas) - set(items)
    if faltan:
        raise SystemExit(f"No se encontraron en el catálogo: {sorted(faltan)}")

    ESCENAS_DIR.mkdir(parents=True, exist_ok=True)
    catalogo = []
    for item_id in pedidas:
        item = items[item_id]
        print(f"Leyendo {item_id} ({ancho}x{alto} px)…", flush=True)
        verde_a, nir_a = item.assets["green"], item.assets["nir"]
        aplicado = bool(item.properties.get("earthsearch:boa_offset_applied", False))
        verde = reflectancia(leer_banda(verde_a.href, transform, ancho, alto, Resampling.bilinear),
                             *parametros(verde_a, aplicado))
        nir = reflectancia(leer_banda(nir_a.href, transform, ancho, alto, Resampling.bilinear),
                           *parametros(nir_a, aplicado))
        scl = leer_banda(item.assets["scl"].href, transform, ancho, alto, Resampling.nearest)

        v, n = empaquetar(verde, nir, mascara_validos(scl))
        fecha = item.datetime.date().isoformat()
        archivo = f"s2-{fecha}.npz"
        np.savez_compressed(ESCENAS_DIR / archivo, verde=v, nir=n)

        p = item.properties
        catalogo.append({
            "id": f"s2-{fecha}",
            "fecha": fecha,
            "fuente": f"Copernicus Sentinel-2 (ESA), escena {item_id}, vía Earth Search (AWS Open Data)",
            "satelite": "Sentinel-2",
            "producto": f"L2A, {p.get('platform', '').title()}, tile {item_id.split('_')[1]}",
            "resolucion_m": RESOLUCION_TERRENO_M,
            "nubes_pct": round(porcentaje_nubes(scl), 1),
            "nubes_escena_pct": round(p.get("eo:cloud_cover", float("nan")), 1),
            "sin_dato_pct": round(float(100 * (v == 0).mean()), 1),
            **metadatos_captura(p),
            "categoria": "Observado",
            "url": f"{STAC_URL}/collections/{COLECCION}/items/{item_id}",
            "consultado": date.today().isoformat(),
            "bounds": bounds,
            "archivo": archivo,
        })
        print(f"  nubes en el recorte {catalogo[-1]['nubes_pct']} %, sin dato {catalogo[-1]['sin_dato_pct']} %")

    ruta = ESCENAS_DIR / "catalogo.json"
    if solo_agregar and ruta.exists():
        nuevas = {e["id"] for e in catalogo}
        catalogo += [e for e in json.loads(ruta.read_text(encoding="utf-8")) if e["id"] not in nuevas]
    catalogo.sort(key=lambda e: e["fecha"])
    ruta.write_text(json.dumps(catalogo, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Catálogo con {len(catalogo)} escenas en {ESCENAS_DIR}")


if __name__ == "__main__":
    main()
