"""Elige y documenta el umbral de agua del radar comparándolo con Sentinel-2 en días sin nubes.

Pares (radar y óptico a 1 día, río casi igual según el INA):
- Sentinel-1 17/01/2021 contra Sentinel-2 18/01/2021
- Sentinel-1 01/10/2026 contra Sentinel-2 02/10/2026

Para cada umbral se mide la coincidencia del agua (IoU: intersección sobre unión) y el acuerdo
píxel a píxel. Se guarda el resultado en data/radar/validacion.json, que usa la API.

    uv run python scripts/validar_radar.py
"""

import json
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from app import datos  # noqa: E402
from app.cambio import agua_radar, ndwi  # noqa: E402

PARES = [("s1-2021-01-17", "s2-2021-01-18"), ("s1-2026-10-01", "s2-2026-10-02")]
UMBRALES = [-10, -11, -12, -13, -14, -15, -16, -17, -18, -19, -20]
SALIDA = datos.RADAR_DIR / "validacion.json"


def comparar(agua_s1: np.ndarray, indice_s2: np.ndarray) -> dict:
    valido = ~np.isnan(agua_s1) & ~np.isnan(indice_s2)
    r = agua_s1[valido] == 1
    o = indice_s2[valido] > 0
    union = (r | o).sum()
    return {"iou": round(float((r & o).sum() / union), 3) if union else 0.0,
            "acuerdo": round(float((r == o).mean()), 3),
            "agua_radar_ha": round(float(r.sum()) * 0.01, 1), "agua_optico_ha": round(float(o.sum()) * 0.01, 1)}


def main() -> None:
    tabla = []
    for u in UMBRALES:
        filas = []
        for s1, s2 in PARES:
            db = datos.cargar_radar(datos.buscar_radar(s1))
            indice = ndwi(*datos.cargar_bandas(datos.buscar_escena(s2)))
            filas.append({"radar": s1, "optico": s2, **comparar(agua_radar(db, u), indice)})
        tabla.append({"umbral_db": u, "iou_promedio": round(sum(f["iou"] for f in filas) / len(filas), 3), "pares": filas})
        print(f"{u:4d} dB  IoU promedio {tabla[-1]['iou_promedio']:.3f}  " +
              "  ".join(f"{f['optico']}: IoU {f['iou']:.3f} acuerdo {f['acuerdo']:.3f} ({f['agua_radar_ha']} vs {f['agua_optico_ha']} ha)" for f in filas))
    mejor = max(tabla, key=lambda t: t["iou_promedio"])
    SALIDA.write_text(json.dumps({
        "metodo": "VV en dB, promedio móvil de 5 x 5 píxeles, agua = VV < umbral; se compara con NDWI > 0 de Sentinel-2 a 1 día",
        "umbral_elegido_db": mejor["umbral_db"],
        "iou_promedio": mejor["iou_promedio"],
        "pruebas": tabla,
    }, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Umbral elegido: {mejor['umbral_db']} dB (IoU promedio {mejor['iou_promedio']})")


if __name__ == "__main__":
    main()
