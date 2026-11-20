"""Núcleo de detección de cambios en superficie de agua.

NDWI (McFeeters, 1996) = (Verde - NIR) / (Verde + NIR).
En Sentinel-2: Verde = banda B03, NIR = banda B08 (ambas a 10 m).
Un NDWI > umbral se interpreta como agua. Es un INDICIO, no una afectación comprobada.
"""

import numpy as np

AGUA_NUEVA = 1
AGUA_PERDIDA = -1
SIN_CAMBIO = 0


def ndwi(verde: np.ndarray, nir: np.ndarray) -> np.ndarray:
    """Calcula el NDWI píxel a píxel. Devuelve NaN donde Verde + NIR = 0."""
    if verde.shape != nir.shape:
        raise ValueError(f"Las bandas tienen distinto tamaño: {verde.shape} vs {nir.shape}")
    verde = verde.astype("float64")
    nir = nir.astype("float64")
    suma = verde + nir
    with np.errstate(divide="ignore", invalid="ignore"):
        return np.where(suma == 0, np.nan, (verde - nir) / suma)


def detectar_cambio(ndwi_antes: np.ndarray, ndwi_despues: np.ndarray, umbral_agua: float = 0.0) -> np.ndarray:
    """Clasifica cada píxel: 1 agua nueva, -1 agua perdida, 0 sin cambio o sin dato."""
    if ndwi_antes.shape != ndwi_despues.shape:
        raise ValueError("Las escenas no tienen el mismo tamaño; no se pueden comparar.")
    valido = ~np.isnan(ndwi_antes) & ~np.isnan(ndwi_despues)
    agua_antes = np.nan_to_num(ndwi_antes, nan=-1) > umbral_agua
    agua_despues = np.nan_to_num(ndwi_despues, nan=-1) > umbral_agua
    mascara = np.zeros(ndwi_antes.shape, dtype="int8")
    mascara[valido & ~agua_antes & agua_despues] = AGUA_NUEVA
    mascara[valido & agua_antes & ~agua_despues] = AGUA_PERDIDA
    return mascara


def area_hectareas(pixeles: int, resolucion_m: float) -> float:
    """Convierte cantidad de píxeles a hectáreas (1 ha = 10.000 m²)."""
    return pixeles * resolucion_m * resolucion_m / 10_000
