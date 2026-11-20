"""Ruta /api/rio: series de altura de las escalas del río Paraguay en la región."""

import pytest
from fastapi.testclient import TestClient

from app import datos
from app.main import app

cliente = TestClient(app)
pytestmark = pytest.mark.skipif(not datos.NIVELES_CSV.exists(), reason="falta la serie K1 limpia")


def test_devuelve_puerto_formosa_con_la_serie_k1_y_sus_umbrales():
    r = cliente.get("/api/rio")
    assert r.status_code == 200
    formosa = next(e for e in r.json()["estaciones"] if e["nombre"] == "Puerto Formosa")
    assert formosa["umbrales"] == {"aguas_bajas": 1.6, "alerta": 7.8, "evacuacion": 8.3}
    assert formosa["lat"] == pytest.approx(-26.183, abs=0.01)
    serie = dict(formosa["serie"])
    assert serie["2026-10-31"] == pytest.approx(5.6)
    assert "2012-07-15" not in serie  # el valor imposible de K1 sigue como hueco


def test_incluye_las_otras_escalas_de_la_region():
    nombres = {e["nombre"] for e in cliente.get("/api/rio").json()["estaciones"]}
    if datos.estaciones_region():
        assert {"Puerto Pilcomayo", "Puerto Bermejo"} <= nombres


def test_filtra_desde_una_fecha_y_ordena_cronologicamente():
    estaciones = cliente.get("/api/rio", params={"desde": "2026-10-01"}).json()["estaciones"]
    for e in estaciones:
        fechas = [f for f, _ in e["serie"]]
        assert fechas == sorted(fechas)
        assert all(f >= "2026-10-01" for f in fechas)
        assert all(f <= "2026-10-31" for f in fechas)  # fecha de corte del kit


def test_fecha_invalida_es_422():
    r = cliente.get("/api/rio", params={"desde": "ayer"})
    assert r.status_code == 422
