"""Pruebas de las alturas del INA en la región y de la lluvia estimada (ERA5)."""

import sys
from pathlib import Path

from fastapi.testclient import TestClient

from app import datos
from app.main import app

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "scripts"))
import descargar_ina  # noqa: E402
import descargar_lluvia  # noqa: E402

cliente = TestClient(app)


def test_alturas_ina_de_puerto_formosa_coinciden_con_k1():
    for fecha, esperado in (("2019-06-21", 9.08), ("2026-10-02", 2.35), ("2026-10-26", 5.44)):
        assert datos.altura_ina(57, fecha) == esperado
        assert datos.nivel_rio(fecha) == esperado


def test_la_serie_ina_no_pasa_del_corte():
    assert max(f for _, f in datos._alturas_ina()) <= "2026-10-31"


def test_estaciones_de_la_region_con_umbrales():
    nombres = {e["nombre"] for e in datos.estaciones_region()}
    assert nombres == {"Puerto Pilcomayo", "Puerto Bermejo"}
    pilcomayo = next(e for e in datos.estaciones_region() if e["nombre"] == "Puerto Pilcomayo")
    assert (pilcomayo["nivel_de_alerta"], pilcomayo["nivel_de_evacuacion"]) == (5.35, 6)  # igual que K3


def test_lluvia_acumulada():
    assert datos.lluvia_entre("2026-10-02", "2026-10-02") == 0
    assert datos.lluvia_previa("2026-10-02", 30) >= 0
    assert datos.lluvia_previa("1990-01-01", 30) is None  # fuera de la serie: sin dato, no cero
    assert max(datos._lluvia()) <= "2026-10-31"


def test_filtros_de_los_scripts():
    filas = descargar_ina.filas_diarias(57, [
        {"timestart": "2026-10-31T00:00:00", "valor": 5.6},
        {"timestart": "2026-11-01T00:00:00", "valor": 5.7},   # posterior al corte
        {"timestart": "2026-10-30T00:00:00", "valor": None},  # vacío
    ])
    assert [f["fecha"] for f in filas] == ["2026-10-31"]
    lluvia = descargar_lluvia.filas({"daily": {"time": ["2026-10-31", "2026-11-01"], "precipitation_sum": [1.0, 2.0]}})
    assert lluvia == [{"fecha": "2026-10-31", "lluvia_mm": 1.0}]


def test_comparar_incluye_region_y_lluvia():
    r = cliente.post("/api/comparar", json={"escena_a": "s2-2021-01-18", "escena_b": "s2-2021-02-07"}).json()
    assert r["confianza"]["nivel"] == "alta"
    estaciones = {e["nombre"]: e for e in r["region"]["estaciones"]}
    assert (estaciones["Puerto Pilcomayo"]["altura_a"], estaciones["Puerto Pilcomayo"]["altura_b"]) == (1.73, 4.93)
    # Puerto Bermejo no tiene lecturas en el INA para esas fechas: queda sin dato, no se inventa
    assert estaciones["Puerto Bermejo"]["altura_a"] is None
    assert r["lluvia"]["categoria"] == "Estimado"
    assert r["lluvia"]["previa_b_mm"] > r["lluvia"]["previa_a_mm"]
    assert r["lluvia"]["entre_fechas_mm"] is not None


def test_sin_lluvia_entre_fechas_muy_lejanas():
    r = cliente.post("/api/comparar", json={"escena_a": "s2-2019-06-21", "escena_b": "s2-2024-11-13"}).json()
    assert r["lluvia"]["entre_fechas_mm"] is None
