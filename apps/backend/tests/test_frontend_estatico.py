"""El backend sirve el frontend compilado cuando STATIC_DIR apunta a una carpeta (imagen Docker)."""

import importlib

import pytest
from fastapi.testclient import TestClient


@pytest.fixture
def cliente_con_frontend(tmp_path, monkeypatch):
    (tmp_path / "index.html").write_text("<!doctype html><title>Comparador</title>", encoding="utf-8")
    (tmp_path / "assets").mkdir()
    (tmp_path / "assets" / "app.js").write_text("console.log('ok')", encoding="utf-8")
    monkeypatch.setenv("STATIC_DIR", str(tmp_path))
    import app.main as modulo

    modulo = importlib.reload(modulo)
    yield TestClient(modulo.app)
    monkeypatch.delenv("STATIC_DIR")
    importlib.reload(modulo)


def test_sirve_la_interfaz_en_la_raiz(cliente_con_frontend):
    r = cliente_con_frontend.get("/")
    assert r.status_code == 200
    assert "Comparador" in r.text


def test_sirve_los_archivos_compilados(cliente_con_frontend):
    assert cliente_con_frontend.get("/assets/app.js").status_code == 200


def test_la_api_sigue_respondiendo_con_el_frontend_montado(cliente_con_frontend):
    assert cliente_con_frontend.get("/api/salud").json()["estado"] == "ok"
    assert cliente_con_frontend.get("/api/escenas").status_code == 200


def test_sin_static_dir_no_hay_interfaz_en_la_raiz():
    from app.main import app

    assert TestClient(app).get("/").status_code == 404
