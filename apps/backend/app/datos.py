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


ZONAS_JSON = DATA_DIR / "zonas.json"
ZONAS_DIR = DATA_DIR / "zonas"
ZONA_ORIGINAL = "formosa"


@lru_cache
def zonas() -> list[dict]:
    """Zonas clave de la provincia (data/zonas.json). Sin el archivo, solo la zona original."""
    if not ZONAS_JSON.exists():
        return [{"id": ZONA_ORIGINAL, "nombre": "Zona de estudio", "estacion": "k1_formosa"}]
    return json.loads(ZONAS_JSON.read_text(encoding="utf-8"))


def buscar_zona(zona_id: str) -> dict | None:
    return next((z for z in zonas() if z["id"] == zona_id), None)


@lru_cache
def catalogo() -> list[dict]:
    """Escenas de todas las zonas. La zona original está en data/escenas; las demás, en data/zonas/<id>."""
    salida = [e | {"zona": e.get("zona", ZONA_ORIGINAL), "_carpeta": str(ESCENAS_DIR)}
              for e in json.loads((ESCENAS_DIR / "catalogo.json").read_text(encoding="utf-8"))]
    for z in zonas():
        ruta = ZONAS_DIR / z["id"] / "catalogo.json"
        if z["id"] != ZONA_ORIGINAL and ruta.exists():
            salida += [e | {"zona": z["id"], "_carpeta": str(ruta.parent)}
                       for e in json.loads(ruta.read_text(encoding="utf-8"))]
    return salida


def _ruta(escena: dict) -> Path:
    return Path(escena.get("_carpeta", ESCENAS_DIR)) / escena["archivo"]


def buscar_escena(escena_id: str) -> dict | None:
    return next((e for e in catalogo() if e["id"] == escena_id), None)


def cargar_bandas(escena: dict) -> tuple[np.ndarray, np.ndarray]:
    """Devuelve (verde, nir) como reflectancia 0-1.

    Formato actual: .npz con arrays 'verde' y 'nir' en valores digitales L2A (÷10000).
    Si el rol A usa GeoTIFF, cambiar solo esta función (p. ej. con rasterio).
    """
    with np.load(_ruta(escena)) as z:
        return z["verde"] / 10_000, z["nir"] / 10_000


def cargar_banda(escena: dict, nombre: str) -> np.ndarray | None:
    """Una banda como reflectancia 0-1 (NaN = sin dato), o None si la escena no la tiene."""
    with np.load(_ruta(escena)) as z:
        if nombre not in z.files:
            return None
        crudo = z[nombre]
    salida = crudo / 10_000
    salida[crudo == 0] = np.nan
    return salida


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


# --- Agua de siempre: Global Surface Water (JRC), recortada a la grilla de las escenas ------------

GSW_NPZ = DATA_DIR / "gsw_zona.npz"
GSW_JSON = DATA_DIR / "gsw_zona.json"


@lru_cache
def gsw_ocurrencia(zona: str = ZONA_ORIGINAL) -> np.ndarray | None:
    """% de tiempo con agua entre 1984 y 2021 por píxel, o None si no se descargó la capa."""
    ruta = GSW_NPZ if zona == ZONA_ORIGINAL else ZONAS_DIR / zona / "gsw.npz"
    if not ruta.exists():
        return None
    with np.load(ruta) as z:
        return z["occurrence"]


@lru_cache
def infraestructura(zona: str = ZONA_ORIGINAL) -> dict:
    """Puntos y líneas del IGN en la zona, o {} si no se descargaron."""
    ruta = DATA_DIR / "infraestructura_ign.json" if zona == ZONA_ORIGINAL else ZONAS_DIR / zona / "infraestructura.json"
    return json.loads(ruta.read_text(encoding="utf-8")) if ruta.exists() else {}


@lru_cache
def gsw_metadatos() -> dict:
    return json.loads(GSW_JSON.read_text(encoding="utf-8")) if GSW_JSON.exists() else {}


# --- Radar Sentinel-1 (data/radar) ---------------------------------------------------------------

RADAR_DIR = DATA_DIR / "radar"
SIN_DATO_RADAR = -32768


@lru_cache
def radar_catalogo() -> list[dict]:
    ruta = RADAR_DIR / "catalogo.json"
    return json.loads(ruta.read_text(encoding="utf-8")) if ruta.exists() else []


def buscar_radar(radar_id: str) -> dict | None:
    return next((e for e in radar_catalogo() if e["id"] == radar_id), None)


def cargar_radar(pasada: dict) -> np.ndarray:
    """VV en dB (float), NaN donde no hay dato."""
    with np.load(RADAR_DIR / pasada["archivo"]) as z:
        crudo = z["vv_db"]
    salida = crudo.astype("float64") / 100
    salida[crudo == SIN_DATO_RADAR] = np.nan
    return salida


@lru_cache
def radar_validacion() -> dict:
    ruta = RADAR_DIR / "validacion.json"
    return json.loads(ruta.read_text(encoding="utf-8")) if ruta.exists() else {}


# --- Vista provincial (data/provincia) ------------------------------------------------------------

PROVINCIA_DIR = DATA_DIR / "provincia"


@lru_cache
def provincia() -> dict:
    """Contorno de Formosa y capa de agua de siempre provincial, o {} si no se descargaron."""
    ruta = PROVINCIA_DIR / "provincia.json"
    if not ruta.exists():
        return {}
    datos = json.loads(ruta.read_text(encoding="utf-8"))
    png = (PROVINCIA_DIR / datos["agua_siempre"]["archivo"]).read_bytes()
    import base64
    datos["agua_siempre"]["png"] = "data:image/png;base64," + base64.b64encode(png).decode()
    return datos
