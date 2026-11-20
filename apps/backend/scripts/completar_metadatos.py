"""Agrega al catálogo la hora de captura y los ángulos de cada escena, sin volver a bajar las bandas.

Lee la URL STAC de cada escena de `data/escenas/catalogo.json` (Earth Search, sin cuenta),
toma `datetime`, `view:sun_elevation` y `view:incidence_angle`, y los guarda en el catálogo.
Las escenas nuevas ya traen estos campos desde `descargar_escenas.py`.

    uv run python scripts/completar_metadatos.py
"""

import json
import sys
import urllib.request
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from descargar_escenas import ESCENAS_DIR, metadatos_captura  # noqa: E402

CATALOGO = ESCENAS_DIR / "catalogo.json"


def completar(catalogo: list[dict], leer_item) -> list[dict]:
    """Devuelve el catálogo con los metadatos de captura agregados a cada escena."""
    return [{**e, **metadatos_captura(leer_item(e["url"])["properties"])} for e in catalogo]


def leer_item_http(url: str) -> dict:
    with urllib.request.urlopen(url, timeout=30) as r:
        return json.load(r)


def main() -> None:
    catalogo = json.loads(CATALOGO.read_text(encoding="utf-8"))
    nuevo = completar(catalogo, leer_item_http)
    CATALOGO.write_text(json.dumps(nuevo, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    for e in nuevo:
        print(f"{e['id']}: {e['captura_utc']} · sol {e['sol_elevacion_grados']}° · incidencia {e['incidencia_grados']}°")


if __name__ == "__main__":
    main()
