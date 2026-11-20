"""Pruebas del núcleo de detección de cambios (NDWI)."""

import numpy as np
import pytest

from app.cambio import area_hectareas, detectar_cambio, ndwi


def test_ndwi_agua_es_positivo_y_suelo_negativo():
    verde = np.array([[0.10, 0.05]])
    nir = np.array([[0.02, 0.30]])
    resultado = ndwi(verde, nir)
    assert resultado[0, 0] > 0  # agua: refleja más verde que NIR
    assert resultado[0, 1] < 0  # suelo/vegetación


def test_ndwi_sin_reflectancia_no_divide_por_cero():
    resultado = ndwi(np.array([[0.0]]), np.array([[0.0]]))
    assert np.isnan(resultado[0, 0])


def test_ndwi_rechaza_bandas_de_distinto_tamano():
    with pytest.raises(ValueError):
        ndwi(np.zeros((2, 2)), np.zeros((3, 3)))


def test_detectar_cambio_clasifica_agua_nueva_y_agua_perdida():
    antes = np.array([[-0.3, 0.4, 0.4, -0.3]])
    despues = np.array([[0.4, -0.3, 0.4, -0.3]])
    mascara = detectar_cambio(antes, despues, umbral_agua=0.0)
    assert mascara.tolist() == [[1, -1, 0, 0]]  # 1 = agua nueva, -1 = agua perdida


def test_detectar_cambio_ignora_pixeles_sin_dato():
    antes = np.array([[np.nan, -0.3]])
    despues = np.array([[0.4, 0.4]])
    mascara = detectar_cambio(antes, despues, umbral_agua=0.0)
    assert mascara.tolist() == [[0, 1]]


def test_area_hectareas_con_pixel_de_10_m():
    # 100 píxeles de 10 m x 10 m = 10.000 m² = 1 ha
    assert area_hectareas(100, resolucion_m=10) == pytest.approx(1.0)
