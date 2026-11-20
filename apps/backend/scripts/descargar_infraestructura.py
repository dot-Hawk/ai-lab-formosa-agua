"""Descarga la infraestructura de la zona desde las Capas SIG del IGN (servicio WFS público).

Fuente: Instituto Geográfico Nacional, https://wms.ign.gob.ar/geoserver/ows (sin cuenta).
Capas:
- ign:puntos_de_ciencia_y_educacion_020601  establecimientos educativos (Mapa Educativo Nacional)
- ign:salud_020801                          establecimientos de salud
- ign:vial_nacional, ign:vial_provincial, ign:vial_terciaria   red vial

El IGN cubre solo territorio argentino: la parte paraguaya del recorte (Alberdi) queda sin datos.
Es cartografía de referencia: refleja el estado de la capa el día de la consulta.

    uv run python scripts/descargar_infraestructura.py
"""

import json
import sys
import urllib.parse
import urllib.request
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from descargar_escenas import BBOX  # noqa: E402

WFS = "https://wms.ign.gob.ar/geoserver/ows"
SALIDA = Path(__file__).resolve().parent.parent / "data" / "infraestructura_ign.json"
PUNTOS = {"educacion": "ign:puntos_de_ciencia_y_educacion_020601", "salud": "ign:salud_020801"}
LINEAS = {"ruta_nacional": "ign:vial_nacional", "ruta_provincial": "ign:vial_provincial", "camino": "ign:vial_terciaria"}


def url(capa: str) -> str:
    oeste, sur, este, norte = BBOX
    # El filtro "bbox" estándar no devuelve datos en este servidor; el filtro CQL sí.
    q = {"service": "WFS", "version": "1.0.0", "request": "GetFeature", "typeName": capa,
         "outputFormat": "application/json", "maxFeatures": "5000",
         "CQL_FILTER": f"BBOX(geom,{oeste},{sur},{este},{norte})"}
    return WFS + "?" + urllib.parse.urlencode(q)


def nombre(p: dict) -> str:
    return (p.get("fna") or " ".join(filter(None, [p.get("gna"), p.get("nam")])) or
            (f"Ruta {p['rtn']}" if p.get("rtn") else "Sin nombre"))


def puntos(tipo: str, geojson: dict) -> list[dict]:
    salida = []
    for f in geojson.get("features", []):
        g = f["geometry"]
        coords = g["coordinates"] if g["type"] == "Point" else g["coordinates"][0]
        salida.append({"tipo": tipo, "nombre": nombre(f["properties"]), "lon": round(coords[0], 6), "lat": round(coords[1], 6)})
    return salida


def lineas(tipo: str, geojson: dict) -> list[dict]:
    salida = []
    for f in geojson.get("features", []):
        g = f["geometry"]
        partes = g["coordinates"] if g["type"] == "MultiLineString" else [g["coordinates"]]
        for parte in partes:
            salida.append({"tipo": tipo, "nombre": nombre(f["properties"]),
                           "coords": [[round(x, 6), round(y, 6)] for x, y in parte]})
    return salida


def main() -> None:
    def leer(capa):
        with urllib.request.urlopen(url(capa), timeout=180) as r:
            return json.load(r)

    datos = {
        "fuente": "IGN, Capas SIG (servicio WFS público)",
        "url": WFS,
        "capas": {**PUNTOS, **LINEAS},
        "consultado": date.today().isoformat(),
        "categoria": "Referencia (cartografía oficial)",
        "bbox": BBOX,
        "nota": "Solo territorio argentino. Es el estado de la capa a la fecha de consulta.",
        "puntos": [p for tipo, capa in PUNTOS.items() for p in puntos(tipo, leer(capa))],
        "lineas": [l for tipo, capa in LINEAS.items() for l in lineas(tipo, leer(capa))],
    }
    SALIDA.write_text(json.dumps(datos, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
    for tipo in PUNTOS:
        print(f"{tipo}: {sum(p['tipo'] == tipo for p in datos['puntos'])}")
    for tipo in LINEAS:
        print(f"{tipo}: {sum(l['tipo'] == tipo for l in datos['lineas'])} tramos")
    print(f"Guardado en {SALIDA.name}")


if __name__ == "__main__":
    main()
