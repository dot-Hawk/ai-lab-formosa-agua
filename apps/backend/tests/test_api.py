"""Pruebas del contrato HTTP (ver docs/CONTRATO_API.md)."""

from fastapi.testclient import TestClient

from app.main import app

cliente = TestClient(app)


def test_salud():
    r = cliente.get("/api/salud")
    assert r.status_code == 200
    assert r.json()["estado"] == "ok"


def test_listar_escenas_incluye_metadatos_obligatorios():
    r = cliente.get("/api/escenas")
    assert r.status_code == 200
    escenas = r.json()
    assert len(escenas) >= 2
    for e in escenas:
        for campo in ("id", "fecha", "fuente", "satelite", "resolucion_m", "nubes_pct", "categoria", "bounds"):
            assert campo in e, f"falta {campo}"


def test_comparar_flujo_principal():
    escenas = cliente.get("/api/escenas").json()
    r = cliente.post("/api/comparar", json={"escena_a": escenas[0]["id"], "escena_b": escenas[1]["id"]})
    assert r.status_code == 200
    cuerpo = r.json()
    assert cuerpo["escena_a"]["id"] == escenas[0]["id"]
    assert cuerpo["area_agua_nueva_ha"] >= 0
    assert cuerpo["area_agua_perdida_ha"] >= 0
    assert cuerpo["overlay_png"].startswith("data:image/png;base64,")
    assert "indicio" in cuerpo["advertencia"].lower()
    assert "umbrales" in cuerpo["nivel_rio"]


def test_comparar_misma_escena_es_400():
    escenas = cliente.get("/api/escenas").json()
    r = cliente.post("/api/comparar", json={"escena_a": escenas[0]["id"], "escena_b": escenas[0]["id"]})
    assert r.status_code == 400
    assert "detalle" in r.json()


def test_comparar_escena_inexistente_es_404():
    r = cliente.post("/api/comparar", json={"escena_a": "no-existe", "escena_b": "tampoco"})
    assert r.status_code == 404


def test_comparar_cuerpo_invalido_es_422():
    r = cliente.post("/api/comparar", json={"escena_a": 123})
    assert r.status_code == 422


def test_comparar_incluye_confianza_y_avisos():
    r = cliente.post("/api/comparar", json={"escena_a": "s2-2026-10-02", "escena_b": "s2-2026-10-26"})
    assert r.status_code == 200
    c = r.json()["confianza"]
    assert c["nivel"] in ("alta", "media", "baja")
    assert c["dias_entre_fechas"] == 24
    assert c["motivos"] and c["criterios"]
    # la escena del 26/10/2026 tiene 20,1 % de nubes sobre la zona
    assert c["nivel"] == "baja"
    assert any("Sentinel-1" in a for a in r.json()["avisos"])


def test_escenas_incluyen_hora_de_captura():
    for e in cliente.get("/api/escenas").json():
        assert e["captura_utc"].endswith("Z")
