"""Pruebas de la exposición de infraestructura (IGN) al agua nueva."""

import sys
from pathlib import Path

import numpy as np
from fastapi.testclient import TestClient

from app import datos
from app.infraestructura import a_pixel, consolidar, dilatar, evaluar
from app.main import app

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "scripts"))
from descargar_infraestructura import lineas, nombre, puntos  # noqa: E402

cliente = TestClient(app)
BOUNDS = [[-26.24, -58.18], [-26.17, -58.11]]


def test_a_pixel_respeta_los_bordes_y_el_sentido():
    assert a_pixel(-58.18, -26.17, BOUNDS, (780, 700)) == (0.0, 0.0)
    fila, col = a_pixel(-58.11, -26.24, BOUNDS, (780, 700))
    assert abs(fila - 780) < 1e-6 and abs(col - 700) < 1e-6


def test_dilatar_aproxima_un_circulo():
    m = np.zeros((41, 41), dtype=bool)
    m[20, 20] = True
    d = dilatar(m, 10)
    assert d[20, 30] and d[30, 20] and not d[20, 31]
    assert not d[30, 30]  # la esquina del cuadrado queda afuera: no es un cuadrado


def test_consolidar_saca_pixeles_sueltos_y_deja_manchas():
    m = np.zeros((30, 30), dtype=bool)
    m[2, 2] = True            # píxel suelto
    m[10:20, 10:20] = True    # mancha
    c = consolidar(m)
    assert not c[2, 2] and c[15, 15]


def test_evaluar_cuenta_puntos_y_rutas():
    agua = np.zeros((780, 700), dtype=bool)
    agua[300:400, 300:400] = True
    fila, col = 350, 350
    lat_lon = lambda f, c: (-26.17 - (-26.17 + 26.24) * f / 780, -58.18 + 0.07 * c / 700)  # aprox. lineal
    lat_in, lon_in = lat_lon(fila, col)
    lat_cerca, lon_cerca = lat_lon(fila, 420)
    lat_lejos, lon_lejos = lat_lon(700, 50)
    infra = {
        "puntos": [{"tipo": "salud", "nombre": "A", "lon": lon_in, "lat": lat_in},
                   {"tipo": "educacion", "nombre": "B", "lon": lon_cerca, "lat": lat_cerca},
                   {"tipo": "educacion", "nombre": "C", "lon": lon_lejos, "lat": lat_lejos},
                   {"tipo": "educacion", "nombre": "Fuera", "lon": -60.0, "lat": -30.0}],
        "lineas": [{"tipo": "camino", "nombre": "X", "coords": [[lon_lejos, lat_in], [lon_in, lat_in]]}],
    }
    r = evaluar(agua, BOUNDS, 10, 500, infra)
    assert r["conteo"]["salud"] == {"en_zona": 1, "cerca": 1, "en_agua": 1}
    assert r["conteo"]["educacion"] == {"en_zona": 2, "cerca": 1, "en_agua": 0}
    assert [e["nombre"] for e in r["establecimientos"]] == ["A", "B"]
    assert r["rutas"]["tramos_en_zona"] == 1
    assert 0.4 < r["rutas"]["km_en_agua"] < 0.6  # la ruta termina en el centro de la mancha (50 px)
    assert r["rutas"]["km_cerca"] > r["rutas"]["km_en_agua"]


def test_scripts_convierten_el_geojson_del_ign():
    assert nombre({"fna": "Hospital Central"}) == "Hospital Central"
    assert nombre({"rtn": "11"}) == "Ruta 11"
    p = puntos("salud", {"features": [{"geometry": {"type": "Point", "coordinates": [-58.1, -26.2]}, "properties": {"fna": "H"}}]})
    assert p == [{"tipo": "salud", "nombre": "H", "lon": -58.1, "lat": -26.2}]
    l = lineas("camino", {"features": [{"geometry": {"type": "MultiLineString", "coordinates": [[[0, 0], [1, 1]], [[2, 2], [3, 3]]]},
                                        "properties": {}}]})
    assert len(l) == 2 and l[0]["nombre"] == "Sin nombre"


def test_datos_del_ign_en_la_zona():
    infra = datos.infraestructura()
    assert sum(p["tipo"] == "educacion" for p in infra["puntos"]) == 83
    assert sum(p["tipo"] == "salud" for p in infra["puntos"]) == 6


def test_comparar_incluye_infraestructura():
    r = cliente.post("/api/comparar", json={"escena_a": "s2-2021-01-18", "escena_b": "s2-2021-02-07"}).json()["infraestructura"]
    assert r["radio_m"] == 500 and "normalmente no hay agua" in r["referencia"]
    assert r["conteo"]["educacion"]["en_zona"] == 83
    assert r["conteo"]["educacion"]["cerca"] < 10  # sin ruido urbano
    assert all({"tipo", "nombre", "lat", "lon", "en_agua"} <= set(e) for e in r["establecimientos"])
    grande = cliente.post("/api/comparar", json={"escena_a": "s2-2021-01-18", "escena_b": "s2-2021-02-07",
                                                 "radio_infraestructura_m": 2000}).json()["infraestructura"]
    assert grande["conteo"]["educacion"]["cerca"] >= r["conteo"]["educacion"]["cerca"]
    assert cliente.post("/api/comparar", json={"escena_a": "s2-2021-01-18", "escena_b": "s2-2021-02-07",
                                               "radio_infraestructura_m": 10}).status_code == 422
