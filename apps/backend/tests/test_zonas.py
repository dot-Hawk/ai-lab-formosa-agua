"""Pruebas de las zonas clave de la provincia y de la vista provincial."""

from fastapi.testclient import TestClient

from app import datos
from app.main import app

cliente = TestClient(app)


def test_zonas_declaradas_y_zona_original():
    ids = [z["id"] for z in datos.zonas()]
    assert ids[0] == "formosa" and len(ids) == len(set(ids)) >= 8
    assert all(-62.5 < z["centro"][0] < -57.4 and -27 < z["centro"][1] < -22.4 for z in datos.zonas())


def test_api_zonas_solo_lista_las_que_tienen_escenas():
    zonas = cliente.get("/api/zonas").json()
    assert zonas[0]["id"] == "formosa" and zonas[0]["fechas"] == 8
    for z in zonas:
        assert z["fechas"] >= 2 and len(z["bounds"]) == 2


def test_escenas_traen_su_zona_y_no_exponen_rutas_internas():
    for e in cliente.get("/api/escenas").json():
        assert e["zona"] and "_carpeta" not in e and "archivo" not in e


def test_no_compara_escenas_de_zonas_distintas():
    otras = [e for e in datos.catalogo() if e["zona"] != "formosa"]
    if not otras:
        return
    r = cliente.post("/api/comparar", json={"escena_a": "s2-2021-01-18", "escena_b": otras[0]["id"]})
    assert r.status_code == 400 and "zonas distintas" in r.json()["detalle"]


def test_comparar_en_cada_zona():
    for z in cliente.get("/api/zonas").json():
        propias = [e for e in datos.catalogo() if e["zona"] == z["id"]]
        r = cliente.post("/api/comparar", json={"escena_a": propias[0]["id"], "escena_b": propias[-1]["id"]})
        assert r.status_code == 200, z["id"]
        c = r.json()
        assert c["zona"]["id"] == z["id"]
        assert c["area_agua_nueva_ha"] >= 0 and c["agua_habitual"] is not None and c["infraestructura"] is not None
        if z["estacion"] is None:
            assert c["nivel_rio"] is None and c["region"] is None
        if z["id"] != "formosa":
            assert c["lluvia"] is None


def test_clorinda_usa_la_escala_de_puerto_pilcomayo():
    if not any(e["zona"] == "clorinda" for e in datos.catalogo()):
        return
    propias = [e for e in datos.catalogo() if e["zona"] == "clorinda"]
    r = cliente.post("/api/comparar", json={"escena_a": propias[0]["id"], "escena_b": propias[-1]["id"]}).json()
    assert r["nivel_rio"]["estacion"] == "Puerto Pilcomayo"
    assert r["nivel_rio"]["umbrales"]["alerta"] == 5.35


def test_vista_provincial():
    p = cliente.get("/api/provincia").json()
    assert p["nombre"] == "Provincia de Formosa"
    assert len(p["contorno"]) > 500
    assert p["agua_siempre"]["png"].startswith("data:image/png;base64,")
    (s, o), (n, e) = p["bounds"]
    assert -27 < s < n < -22 and -62.5 < o < e < -57.4
