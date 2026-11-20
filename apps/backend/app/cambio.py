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


def separar_agua_nueva(mascara: np.ndarray, ocurrencia: np.ndarray, umbral_pct: float) -> tuple[np.ndarray, np.ndarray]:
    """Divide el agua nueva según el "agua de siempre" (Global Surface Water).

    `ocurrencia` es el % de tiempo con agua entre 1984 y 2021 (0 a 100). Devuelve dos máscaras:
    (agua nueva donde normalmente no hay agua, agua nueva donde suele haber agua).
    """
    if mascara.shape != ocurrencia.shape:
        raise ValueError("La capa de agua de siempre no tiene el tamaño de las escenas.")
    nueva = mascara == AGUA_NUEVA
    habitual = ocurrencia >= umbral_pct
    return nueva & ~habitual, nueva & habitual


# --- Radar Sentinel-1 ------------------------------------------------------------------------------
# El agua calma refleja la señal de radar lejos del satélite: en VV aparece muy oscura (dB bajos).


def filtro_media(db: np.ndarray, lado: int = 5) -> np.ndarray:
    """Promedio móvil de `lado` x `lado` píxeles que ignora los NaN. Atenúa el moteado ("speckle")."""
    r = lado // 2
    valido = np.isfinite(db)
    v = np.pad(np.where(valido, db, 0.0), r)
    n = np.pad(valido.astype("float64"), r)
    sv = np.cumsum(np.cumsum(v, 0), 1)
    sn = np.cumsum(np.cumsum(n, 0), 1)
    sv = np.pad(sv, ((1, 0), (1, 0)))
    sn = np.pad(sn, ((1, 0), (1, 0)))
    h, w = db.shape
    suma = sv[lado:lado + h, lado:lado + w] - sv[:h, lado:lado + w] - sv[lado:lado + h, :w] + sv[:h, :w]
    cuenta = sn[lado:lado + h, lado:lado + w] - sn[:h, lado:lado + w] - sn[lado:lado + h, :w] + sn[:h, :w]
    with np.errstate(invalid="ignore", divide="ignore"):
        salida = suma / cuenta
    salida[~valido] = np.nan
    return salida


def agua_radar(db: np.ndarray, umbral_db: float) -> np.ndarray:
    """Agua según radar: VV filtrada por debajo del umbral (dB). NaN donde no hay dato."""
    filtrada = filtro_media(db)
    salida = (filtrada < umbral_db).astype("float64")
    salida[np.isnan(filtrada)] = np.nan
    return salida


def detectar_cambio_radar(db_antes: np.ndarray, db_despues: np.ndarray, umbral_db: float) -> np.ndarray:
    """Igual que detectar_cambio pero con radar: 1 agua nueva, -1 agua perdida, 0 sin cambio o sin dato."""
    a, b = agua_radar(db_antes, umbral_db), agua_radar(db_despues, umbral_db)
    valido = ~np.isnan(a) & ~np.isnan(b)
    mascara = np.zeros(a.shape, dtype="int8")
    mascara[valido & (a == 0) & (b == 1)] = AGUA_NUEVA
    mascara[valido & (a == 1) & (b == 0)] = AGUA_PERDIDA
    return mascara
