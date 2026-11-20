"""Pruebas del radar Sentinel-1: detección de agua, validación y uso automático en /api/comparar."""

import sys
from pathlib import Path

import numpy as np
from fastapi.testclient import TestClient

from app import confianza, datos
from app.cambio import AGUA_NUEVA, AGUA_PERDIDA, agua_radar, detectar_cambio_radar, filtro_media
from app.main import app

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "scripts"))
from descargar_radar import SIN_DATO_DB, a_decibeles, empaquetar_db  # noqa: E402

cliente = TestClient(app)


def test_filtro_media_promedia_e_ignora_nan():
    db = np.full((7, 7), -10.0)
    db[3, 3] = -30.0
    db[0, 0] = np.nan
    f = filtro_media(db, 3)
    assert np.isclose(f[3, 3], (-10 * 8 - 30) / 9)
    assert np.isnan(f[0, 0])
    assert np.isclose(f[0, 1], -10.0)  # el vecino NaN no arrastra el promedio


def test_agua_radar_y_cambio():
    seco = np.full((9, 9), -6.0)
    mojado = seco.copy()
    mojado[:, :5] = -20.0
    assert np.nansum(agua_radar(mojado, -13)) > 0 and np.nansum(agua_radar(seco, -13)) == 0
    m = detectar_cambio_radar(seco, mojado, -13)
    assert (m == AGUA_NUEVA).sum() > 0 and (m == AGUA_PERDIDA).sum() == 0
    assert (detectar_cambio_radar(mojado, seco, -13) == AGUA_PERDIDA).sum() > 0


def test_conversion_a_db_y_empaquetado():
    db = a_decibeles(np.array([[0.1, 0.0, np.nan]]))
    assert np.isclose(db[0, 0], -10) and np.isnan(db[0, 1]) and np.isnan(db[0, 2])
    e = empaquetar_db(db)
    assert e[0, 0] == -1000 and e[0, 1] == SIN_DATO_DB


def test_validacion_documentada_y_buena():
    v = datos.radar_validacion()
    assert v["umbral_elegido_db"] == -13
    assert v["iou_promedio"] >= 0.8


def test_pasadas_de_radar_en_la_grilla_de_las_escenas():
    verde, _ = datos.cargar_bandas(datos.buscar_escena("s2-2026-10-26"))
    for p in datos.radar_catalogo():
        assert datos.cargar_radar(p).shape == verde.shape
        assert p["fecha"] <= "2026-10-31"


def test_con_nubes_pasa_solo_al_radar_y_lo_avisa():
    r = cliente.post("/api/comparar", json={"escena_a": "s2-2026-10-02", "escena_b": "s2-2026-10-26"}).json()
    radar = r["radar"]
    assert radar["usado"] is True
    assert (radar["pasada_a"]["fecha"], radar["pasada_b"]["fecha"]) == ("2026-10-01", "2026-10-25")
    assert radar["pasada_a"]["orbita_relativa"] == radar["pasada_b"]["orbita_relativa"]
    assert radar["area_agua_nueva_ha"] >= 0 and radar["overlay_png"].startswith("data:image/png;base64,")
    assert "archivo" not in radar["pasada_a"]
    assert any("pasó sola al radar" in a for a in r["avisos"])


def test_sin_nubes_no_usa_radar():
    r = cliente.post("/api/comparar", json={"escena_a": "s2-2021-01-18", "escena_b": "s2-2021-02-07"}).json()
    assert r["radar"] is None


def test_con_nubes_y_sin_pasada_cercana_lo_dice():
    a = {"fecha": "2019-06-21", "nubes_pct": 0.0}
    b = {"fecha": "2024-11-13", "nubes_pct": 30.0}
    assert confianza.necesita_radar(a, b)
    from app.main import _radar
    r = _radar(a, b)
    assert r["usado"] is False and "No hay pasadas" in r["motivo"]
    assert "no hay una pasada cercana" in confianza.avisos(a, b, radar_usado=False)[0]
