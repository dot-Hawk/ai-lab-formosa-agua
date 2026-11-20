"""Exposición de infraestructura: qué establecimientos y rutas quedan en el agua nueva o cerca.

Cruza la capa de agua (grilla de 10 m en Web Mercator) con puntos y líneas del IGN
(data/infraestructura_ign.json). Es un INDICIO de exposición, no una afectación comprobada.
"""

import math

import numpy as np


def _merc_y(lat: float) -> float:
    return math.log(math.tan(math.pi / 4 + math.radians(lat) / 2))


def a_pixel(lon: float, lat: float, bounds: list, forma: tuple[int, int]) -> tuple[float, float]:
    """(fila, columna) del punto en la grilla de la escena. La grilla es lineal en Web Mercator."""
    (sur, oeste), (norte, este) = bounds
    alto, ancho = forma
    col = (lon - oeste) / (este - oeste) * ancho
    fila = (_merc_y(norte) - _merc_y(lat)) / (_merc_y(norte) - _merc_y(sur)) * alto
    return fila, col


def dilatar(mascara: np.ndarray, radio_px: int) -> np.ndarray:
    """Agranda la máscara `radio_px` píxeles. Alterna vecindad 3x3 y en cruz: aproxima un círculo (octágono)."""
    salida = mascara.copy()
    for i in range(radio_px):
        p = np.pad(salida, 1)
        nueva = p[1:-1, 1:-1] | p[:-2, 1:-1] | p[2:, 1:-1] | p[1:-1, :-2] | p[1:-1, 2:]
        if i % 2 == 0:
            nueva |= p[:-2, :-2] | p[:-2, 2:] | p[2:, :-2] | p[2:, 2:]
        salida = nueva
    return salida


def consolidar(agua: np.ndarray, lado: int = 5, fraccion: float = 0.5) -> np.ndarray:
    """Deja solo el agua que forma manchas: más de `fraccion` de la ventana de `lado` x `lado` con agua.

    Sin esto, píxeles sueltos de la ciudad (piletas, sombras, techos mojados) marcan como
    "cerca del agua" a casi todos los establecimientos.
    """
    from app.cambio import filtro_media

    return (filtro_media(agua.astype("float64"), lado) >= fraccion) & agua


def _valor(mascara: np.ndarray, fila: float, col: float) -> bool | None:
    f, c = int(fila), int(col)
    if 0 <= f < mascara.shape[0] and 0 <= c < mascara.shape[1]:
        return bool(mascara[f, c])
    return None  # fuera del recorte


def evaluar(agua: np.ndarray, bounds: list, resolucion_m: float, radio_m: float, infra: dict) -> dict:
    """Establecimientos y km de ruta en el agua y a menos de `radio_m` metros de ella."""
    radio_px = max(1, round(radio_m / resolucion_m))
    cerca = dilatar(agua, radio_px)

    establecimientos, conteo = [], {}
    for p in infra.get("puntos", []):
        fila, col = a_pixel(p["lon"], p["lat"], bounds, agua.shape)
        en_agua, esta_cerca = _valor(agua, fila, col), _valor(cerca, fila, col)
        if en_agua is None:
            continue
        c = conteo.setdefault(p["tipo"], {"en_zona": 0, "cerca": 0, "en_agua": 0})
        c["en_zona"] += 1
        c["cerca"] += int(esta_cerca)
        c["en_agua"] += int(en_agua)
        if esta_cerca:
            establecimientos.append({"tipo": p["tipo"], "nombre": p["nombre"], "lat": p["lat"], "lon": p["lon"], "en_agua": en_agua})

    paso_px = 0.5
    km_en_agua = km_cerca = 0.0
    tramos = 0
    for linea in infra.get("lineas", []):
        dentro = False
        for (x0, y0), (x1, y1) in zip(linea["coords"], linea["coords"][1:]):
            f0, c0 = a_pixel(x0, y0, bounds, agua.shape)
            f1, c1 = a_pixel(x1, y1, bounds, agua.shape)
            n = max(1, int(math.hypot(f1 - f0, c1 - c0) / paso_px))
            for k in range(n):
                t = (k + 0.5) / n
                en_agua = _valor(agua, f0 + (f1 - f0) * t, c0 + (c1 - c0) * t)
                if en_agua is None:
                    continue
                dentro = True
                largo_km = math.hypot(f1 - f0, c1 - c0) / n * resolucion_m / 1000
                km_en_agua += largo_km * en_agua
                km_cerca += largo_km * _valor(cerca, f0 + (f1 - f0) * t, c0 + (c1 - c0) * t)
        tramos += dentro

    orden = {"salud": 0, "educacion": 1}
    establecimientos.sort(key=lambda e: (not e["en_agua"], orden.get(e["tipo"], 9), e["nombre"]))
    return {
        "radio_m": radio_m,
        "conteo": conteo,
        "establecimientos": establecimientos,
        "rutas": {"tramos_en_zona": tramos, "km_en_agua": round(km_en_agua, 2), "km_cerca": round(km_cerca, 2)},
    }
