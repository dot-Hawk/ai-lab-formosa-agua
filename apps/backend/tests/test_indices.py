"""Pruebas de MNDWI, NDVI, color real y de las 5 bandas de las escenas."""

import numpy as np
from fastapi.testclient import TestClient

from app import datos
from app.cambio import diferencia_normalizada, mndwi, ndvi
from app.main import app

cliente = TestClient(app)
PAR = {"escena_a": "s2-2021-01-18", "escena_b": "s2-2021-02-07"}


def test_indices_normalizados():
    a, b = np.array([[0.3, 0.0, 0.1]]), np.array([[0.1, 0.0, 0.3]])
    r = diferencia_normalizada(a, b)
    assert np.isclose(r[0, 0], 0.5) and np.isnan(r[0, 1]) and np.isclose(r[0, 2], -0.5)
    assert np.isclose(mndwi(np.array([[0.08]]), np.array([[0.02]]))[0, 0], 0.6)  # agua: verde > SWIR
    assert np.isclose(ndvi(np.array([[0.45]]), np.array([[0.05]]))[0, 0], 0.8)  # vegetación densa


def test_escenas_con_cinco_bandas():
    for e in datos.catalogo():
        assert e["bandas"] == ["verde", "nir", "rojo", "azul", "swir"]
        swir = datos.cargar_banda(e, "swir")
        assert swir.shape == datos.cargar_bandas(e)[0].shape
    assert datos.cargar_banda(datos.catalogo()[0], "no-existe") is None


def test_comparar_con_mndwi():
    r = cliente.post("/api/comparar", json=PAR | {"indice_agua": "mndwi"}).json()
    assert r["indice_agua"] == "mndwi"
    ndwi = cliente.post("/api/comparar", json=PAR).json()
    assert ndwi["indice_agua"] == "ndwi"
    assert r["area_agua_nueva_ha"] != ndwi["area_agua_nueva_ha"]
    assert cliente.post("/api/comparar", json=PAR | {"indice_agua": "ndbi"}).status_code == 422


def test_comparar_incluye_color_real_y_ndvi_por_fecha():
    r = cliente.post("/api/comparar", json=PAR).json()
    assert r["color_a_jpg"].startswith("data:image/jpeg;base64,") and r["color_b_jpg"] != r["color_a_jpg"]
    assert r["ndvi_a_png"].startswith("data:image/png;base64,")
    assert len(r["ndvi_a_png"]) < 400_000  # la paleta mantiene liviana la respuesta
    # con la crecida, parte de la vegetación queda bajo el agua: el NDVI medio baja
    assert r["ndvi_medio"]["b"] < r["ndvi_medio"]["a"]
