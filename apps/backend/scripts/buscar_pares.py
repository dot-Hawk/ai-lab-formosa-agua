"""Busca pares de escenas Sentinel-2 limpias con el río en niveles muy distintos.

Criterios (los mismos del semáforo de confianza, app/confianza.py):
- tile 21JUM (el de la zona de estudio), entre el 01/01/2017 y el 31/10/2026;
- menos de 5 % de nubes en la escena completa (después se verifica sobre la zona al descargar);
- hasta 30 días entre las dos fechas;
- ordenados por la diferencia de altura en Puerto Formosa (INA, data/ina_alturas_region.csv).

Requiere haber corrido scripts/descargar_ina.py.

    uv run python scripts/buscar_pares.py
"""

import csv
import json
import urllib.request
from datetime import date
from pathlib import Path

STAC = "https://earth-search.aws.element84.com/v1/search"
BBOX = [-58.18, -26.24, -58.11, -26.17]
DATA_DIR = Path(__file__).resolve().parent.parent / "data"
MAX_NUBES_ESCENA = 5
MAX_DIAS = 30


def escenas_limpias() -> list[dict]:
    cuerpo = {"collections": ["sentinel-2-l2a"], "bbox": BBOX, "limit": 500,
              "datetime": "2017-01-01T00:00:00Z/2026-10-31T23:59:59Z",
              "query": {"eo:cloud_cover": {"lt": MAX_NUBES_ESCENA}, "mgrs:grid_square": {"eq": "UM"}},
              "fields": {"include": ["id", "properties.datetime", "properties.eo:cloud_cover"], "exclude": ["assets", "links", "geometry"]}}
    salida, siguiente = [], cuerpo
    while siguiente:
        req = urllib.request.Request(STAC, data=json.dumps(siguiente).encode(), headers={"Content-Type": "application/json"})
        r = json.load(urllib.request.urlopen(req, timeout=120))
        salida += r["features"]
        enlace = next((l for l in r.get("links", []) if l.get("rel") == "next"), None)
        siguiente = enlace.get("body") if enlace else None
    # una escena por fecha: la de menor nubosidad (hay reprocesamientos con el mismo día)
    por_fecha = {}
    for f in salida:
        fecha = f["properties"]["datetime"][:10]
        if fecha not in por_fecha or f["properties"]["eo:cloud_cover"] < por_fecha[fecha]["nubes"]:
            por_fecha[fecha] = {"id": f["id"], "fecha": fecha, "nubes": f["properties"]["eo:cloud_cover"]}
    return sorted(por_fecha.values(), key=lambda e: e["fecha"])


def alturas_formosa() -> dict[str, float]:
    with (DATA_DIR / "ina_alturas_region.csv").open(encoding="utf-8") as f:
        return {r["fecha"]: float(r["altura_m"]) for r in csv.DictReader(f) if r["site_code"] == "57"}


def pares(escenas: list[dict], alturas: dict[str, float]) -> list[dict]:
    con_altura = [e | {"altura": alturas[e["fecha"]]} for e in escenas if e["fecha"] in alturas]
    salida = []
    for i, a in enumerate(con_altura):
        for b in con_altura[i + 1:]:
            dias = (date.fromisoformat(b["fecha"]) - date.fromisoformat(a["fecha"])).days
            if dias > MAX_DIAS:
                break
            salida.append({"a": a, "b": b, "dias": dias, "delta_m": round(b["altura"] - a["altura"], 2)})
    return sorted(salida, key=lambda p: -abs(p["delta_m"]))


def main() -> None:
    escenas = escenas_limpias()
    print(f"{len(escenas)} fechas con menos de {MAX_NUBES_ESCENA} % de nubes en el tile 21JUM")
    for p in pares(escenas, alturas_formosa())[:15]:
        a, b = p["a"], p["b"]
        print(f"{a['fecha']} ({a['altura']:5.2f} m, {a['nubes']:4.1f} %) -> {b['fecha']} ({b['altura']:5.2f} m, {b['nubes']:4.1f} %)"
              f"  {p['dias']:2d} días  dif {p['delta_m']:+.2f} m   {a['id']} {b['id']}")


if __name__ == "__main__":
    main()
