"""Pruebas del agua de siempre (Global Surface Water) y su uso en /api/comparar."""

import numpy as np
from fastapi.testclient import TestClient

from app import datos
from app.cambio import AGUA_NUEVA, AGUA_PERDIDA, separar_agua_nueva
from app.main import app

cliente = TestClient(app)


def test_separar_agua_nueva_por_ocurrencia():
    mascara = np.array([[AGUA_NUEVA, AGUA_NUEVA, AGUA_PERDIDA, 0]])
    ocurrencia = np.array([[80, 10, 90, 90]], dtype="uint8")
    inusual, habitual = separar_agua_nueva(mascara, ocurrencia, 50)
    assert inusual.tolist() == [[False, True, False, False]]
    assert habitual.tolist() == [[True, False, False, False]]


def test_separar_rechaza_tamanos_distintos():
    try:
        separar_agua_nueva(np.zeros((2, 2)), np.zeros((3, 3)), 50)
    except ValueError:
        return
    raise AssertionError("debía fallar")


def test_capa_gsw_en_la_grilla_de_las_escenas():
    occ = datos.gsw_ocurrencia()
    verde, _ = datos.cargar_bandas(datos.buscar_escena("s2-2021-01-18"))
    assert occ.shape == verde.shape
    assert occ.max() <= 100
    assert datos.gsw_metadatos()["periodo"] == "1984-2021"


def test_comparar_separa_agua_habitual_e_inusual():
    r = cliente.post("/api/comparar", json={"escena_a": "s2-2021-01-18", "escena_b": "s2-2021-02-07"}).json()
    h = r["agua_habitual"]
    assert h["umbral_pct"] == 50
    total = h["area_agua_nueva_inusual_ha"] + h["area_agua_nueva_habitual_ha"]
    assert abs(total - r["area_agua_nueva_ha"]) < 0.05
    assert h["area_agua_nueva_inusual_ha"] < r["area_agua_nueva_ha"]
    assert h["overlay_inusual_png"].startswith("data:image/png;base64,")
    assert h["agua_de_siempre_png"].startswith("data:image/png;base64,")


def test_umbral_habitual_configurable_y_validado():
    base = {"escena_a": "s2-2021-01-18", "escena_b": "s2-2021-02-07"}
    bajo = cliente.post("/api/comparar", json=base | {"umbral_habitual_pct": 10}).json()["agua_habitual"]
    alto = cliente.post("/api/comparar", json=base | {"umbral_habitual_pct": 90}).json()["agua_habitual"]
    assert bajo["area_agua_nueva_inusual_ha"] < alto["area_agua_nueva_inusual_ha"]
    assert cliente.post("/api/comparar", json=base | {"umbral_habitual_pct": 0}).status_code == 422
