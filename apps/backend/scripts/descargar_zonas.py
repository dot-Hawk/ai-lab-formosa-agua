"""Descarga escenas, agua de siempre e infraestructura de las zonas clave de la provincia.

Zonas: data/zonas.json (la zona "formosa" es la original, en data/escenas, y no se toca acá).
Cada zona nueva es un recorte de 0,07 x 0,07 grados (unos 7 x 7,8 km) alrededor de su centro,
en la misma grilla de 10 m en Web Mercator que usa la zona original.

Para cada zona se busca la escena Sentinel-2 L2A más limpia en dos períodos:
- fin de la temporada de lluvias 2025: 01/03/2025 al 31/05/2025
- antes del corte del desafío:        01/08/2026 al 31/10/2026
Se prueban las candidatas de menor nubosidad hasta encontrar una con <= 10 % de nubes y
<= 10 % sin dato sobre la zona (una escena puede cubrir la zona solo en parte).

Guarda en data/zonas/<id>/: catalogo.json y las escenas (.npz), gsw.npz (Global Surface Water)
e infraestructura.json (IGN).

    uv sync --group escenas
    uv run python scripts/descargar_zonas.py [id_zona ...]
"""

import json
import os
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
import descargar_escenas as de  # noqa: E402
import descargar_gsw as dg  # noqa: E402
import descargar_infraestructura as di  # noqa: E402

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
ZONAS_DIR = DATA_DIR / "zonas"
MEDIO_LADO = 0.035
PERIODOS = [
    ("2025-03-01T00:00:00Z/2025-05-31T23:59:59Z", "fin de la temporada de lluvias 2025"),
    ("2026-08-01T00:00:00Z/2026-10-31T23:59:59Z", "antes del corte (agosto a octubre de 2026)"),
]
MAX_NUBES = 10
MAX_SIN_DATO = 10
MAX_INTENTOS = 6


def bbox_de(centro: list[float]) -> tuple[float, float, float, float]:
    lon, lat = centro
    return (round(lon - MEDIO_LADO, 4), round(lat - MEDIO_LADO, 4), round(lon + MEDIO_LADO, 4), round(lat + MEDIO_LADO, 4))


def mosaico_gsw(lon: float) -> str:
    """Mosaico de Global Surface Water (10 x 10 grados) que contiene la longitud."""
    return "70W_20S" if lon < -60 else "60W_20S"


def candidatas(client, bbox, periodo):
    busqueda = client.search(collections=[de.COLECCION], bbox=list(bbox), datetime=periodo,
                             query={"eo:cloud_cover": {"lt": 30}}, sortby=[{"field": "properties.eo:cloud_cover", "direction": "asc"}],
                             max_items=40)
    return list(busqueda.items())


def descargar_zona(zona: dict, client) -> dict:
    from rasterio.enums import Resampling

    bbox = bbox_de(zona["centro"])
    carpeta = ZONAS_DIR / zona["id"]
    transform, ancho, alto, bounds = de.grilla_mercator(bbox)
    print(f"\n== {zona['nombre']} · bbox {bbox} · {ancho}x{alto} px", flush=True)

    escenas = []
    for periodo, etiqueta in PERIODOS:
        elegida = None
        for item in candidatas(client, bbox, periodo)[:MAX_INTENTOS]:
            fecha = item.datetime.date().isoformat()
            id_escena = f"s2-{zona['id']}-{fecha}"
            e = de.descargar(item, transform, ancho, alto, bounds, carpeta, id_escena, zona["id"])
            print(f"  {item.id}: nubes {e['nubes_pct']} %, sin dato {e['sin_dato_pct']} %", flush=True)
            if e["nubes_pct"] <= MAX_NUBES and e["sin_dato_pct"] <= MAX_SIN_DATO:
                elegida = e | {"periodo": etiqueta}
                break
            (carpeta / e["archivo"]).unlink(missing_ok=True)
        if elegida:
            escenas.append(elegida)
        else:
            print(f"  ¡Sin escena limpia para {etiqueta}!", flush=True)
    de.guardar_catalogo(carpeta / "catalogo.json", escenas, conservar_otras=False)

    # Agua de siempre (Global Surface Water) en la misma grilla
    mosaico = mosaico_gsw(zona["centro"][0])
    capas = {c: de.leer_banda(f"/vsicurl/{dg.BASE}/{c}/{c}_{mosaico}v1_4_2021.tif", transform, ancho, alto,
                              Resampling.nearest).astype("uint8") for c in dg.CAPAS}
    np.savez_compressed(carpeta / "gsw.npz", **capas)

    # Infraestructura del IGN dentro del recorte
    di_bbox = di.BBOX
    try:
        di.BBOX = bbox
        def leer(capa):
            import urllib.request
            with urllib.request.urlopen(di.url(capa), timeout=180) as r:
                return json.load(r)
        infra = {
            "fuente": "IGN, Capas SIG (servicio WFS público)", "url": di.WFS, "capas": {**di.PUNTOS, **di.LINEAS},
            "consultado": escenas[0]["consultado"] if escenas else None, "categoria": "Referencia (cartografía oficial)",
            "bbox": bbox, "nota": "Solo territorio argentino. Es el estado de la capa a la fecha de consulta.",
            "puntos": [p for tipo, capa in di.PUNTOS.items() for p in di.puntos(tipo, leer(capa))],
            "lineas": [l for tipo, capa in di.LINEAS.items() for l in di.lineas(tipo, leer(capa))],
        }
    finally:
        di.BBOX = di_bbox
    (carpeta / "infraestructura.json").write_text(json.dumps(infra, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"  escenas: {[e['fecha'] for e in escenas]} · agua de siempre ({mosaico}): "
          f"{100 * (capas['occurrence'] >= 50).mean():.1f} % · escuelas {sum(p['tipo'] == 'educacion' for p in infra['puntos'])}"
          f" · salud {sum(p['tipo'] == 'salud' for p in infra['puntos'])} · tramos viales {len(infra['lineas'])}", flush=True)
    return {"id": zona["id"], "bbox": bbox, "bounds": bounds, "escenas": len(escenas)}


def main() -> None:
    os.environ.setdefault("GDAL_DISABLE_READDIR_ON_OPEN", "EMPTY_DIR")
    os.environ.setdefault("CPL_VSIL_CURL_ALLOWED_EXTENSIONS", ".tif")
    from pystac_client import Client

    zonas = json.loads((DATA_DIR / "zonas.json").read_text(encoding="utf-8"))
    pedidas = set(sys.argv[1:])
    client = Client.open(de.STAC_URL)
    for zona in zonas:
        if zona["id"] == "formosa" or (pedidas and zona["id"] not in pedidas):
            continue
        descargar_zona(zona, client)


if __name__ == "__main__":
    main()
