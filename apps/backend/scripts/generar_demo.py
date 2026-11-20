"""Genera dos escenas SIMULADAS para probar el flujo de punta a punta.

NO son imágenes reales. El rol A las reemplaza por recortes Sentinel-2 L2A
(bandas B03 y B08) descargados de Copernicus Browser y actualiza catalogo.json.

Uso:  uv run python scripts/generar_demo.py
"""

import json
from pathlib import Path

import numpy as np

SALIDA = Path(__file__).resolve().parent.parent / "data" / "escenas"
TAM = 200  # píxeles (200 x 10 m = 2 km)
# Recorte aproximado sobre la costa del río Paraguay frente a la ciudad de Formosa
BOUNDS = [[-26.200, -58.180], [-26.182, -58.160]]  # [[sur, oeste], [norte, este]]


def escena(ancho_rio: int, semilla: int) -> tuple[np.ndarray, np.ndarray]:
    rng = np.random.default_rng(semilla)
    verde = rng.normal(800, 60, (TAM, TAM))   # suelo: verde bajo
    nir = rng.normal(2500, 150, (TAM, TAM))   # suelo/vegetación: NIR alto
    x = np.arange(TAM)
    agua = x[None, :] > TAM - ancho_rio       # el río ocupa el borde este
    verde[:, agua[0]] = rng.normal(1100, 50, (TAM, agua.sum()))
    nir[:, agua[0]] = rng.normal(400, 50, (TAM, agua.sum()))
    return verde.clip(0).astype("uint16"), nir.clip(0).astype("uint16")


def main() -> None:
    SALIDA.mkdir(parents=True, exist_ok=True)
    escenas = [
        ("demo-2026-10-01", "2026-10-01", 50, 1, 4.0),  # río bajo
        ("demo-2026-10-31", "2026-10-31", 90, 2, 12.0),  # río alto
    ]
    catalogo = []
    for id_, fecha, ancho, semilla, nubes in escenas:
        verde, nir = escena(ancho, semilla)
        archivo = f"{id_}.npz"
        np.savez_compressed(SALIDA / archivo, verde=verde, nir=nir)
        catalogo.append({
            "id": id_,
            "fecha": fecha,
            "fuente": "SIMULADO · generado por scripts/generar_demo.py (reemplazar por Sentinel-2 L2A)",
            "satelite": "Sentinel-2",
            "producto": "L2A (simulado)",
            "resolucion_m": 10,
            "nubes_pct": nubes,
            "categoria": "Simulado",
            "bounds": BOUNDS,
            "archivo": archivo,
        })
    (SALIDA / "catalogo.json").write_text(json.dumps(catalogo, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Escenas demo escritas en {SALIDA}")


if __name__ == "__main__":
    main()
