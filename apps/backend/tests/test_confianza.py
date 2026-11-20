"""Pruebas del semáforo de confianza y de los avisos de nubes (app/confianza.py)."""

import sys
from pathlib import Path

from app import confianza

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "scripts"))
from completar_metadatos import completar  # noqa: E402
from descargar_escenas import metadatos_captura  # noqa: E402


def escena(fecha, nubes=0.0, sin_dato=0.0, sol=60.0):
    return {"fecha": fecha, "nubes_pct": nubes, "sin_dato_pct": sin_dato, "sol_elevacion_grados": sol}


def test_escenas_limpias_y_cercanas_dan_confianza_alta():
    r = confianza.evaluar(escena("2026-10-02"), escena("2026-10-26"))
    assert r["nivel"] == "alta"
    assert r["dias_entre_fechas"] == 24
    assert all(m["nivel"] == "alta" for m in r["motivos"])


def test_el_nivel_final_es_el_peor_criterio():
    r = confianza.evaluar(escena("2026-10-02"), escena("2026-10-26", nubes=12))
    assert r["nivel"] == "media"
    r = confianza.evaluar(escena("2026-10-02"), escena("2026-10-26", nubes=20.1))
    assert r["nivel"] == "baja"


def test_limites_de_los_porcentajes():
    assert confianza._nivel_por_porcentaje(4.9) == "alta"
    assert confianza._nivel_por_porcentaje(5) == "media"
    assert confianza._nivel_por_porcentaje(20) == "media"
    assert confianza._nivel_por_porcentaje(20.1) == "baja"


def test_muchos_dias_entre_fechas_bajan_la_confianza():
    assert confianza.evaluar(escena("2026-08-01"), escena("2026-10-26"))["nivel"] == "media"  # 86 días
    assert confianza.evaluar(escena("2024-11-13"), escena("2019-06-21"))["nivel"] == "baja"
    assert confianza.evaluar(escena("2024-11-13"), escena("2019-06-21"))["dias_entre_fechas"] == 1972


def test_sol_bajo_baja_la_confianza_y_falta_de_dato_no_rompe():
    assert confianza.evaluar(escena("2026-10-02", sol=25), escena("2026-10-26"))["nivel"] == "media"
    sin_sol = {"fecha": "2026-10-02", "nubes_pct": 0.0}
    r = confianza.evaluar(sin_sol, sin_sol | {"fecha": "2026-10-26"})
    assert r["nivel"] == "alta"
    assert len(r["motivos"]) == 3  # sin el criterio del sol


def test_aviso_solo_si_hay_mas_de_20_por_ciento_de_nubes():
    assert confianza.avisos(escena("2026-10-02", nubes=20), escena("2026-10-26")) == []
    avisos = confianza.avisos(escena("2026-10-02"), escena("2026-10-26", nubes=20.1))
    assert len(avisos) == 1
    assert "26/10/2026" in avisos[0] and "20,1 %" in avisos[0] and "Sentinel-1" in avisos[0]


def test_metadatos_de_captura_desde_stac():
    m = metadatos_captura({"datetime": "2026-10-26T13:59:57.179000Z", "view:sun_elevation": 63.4561,
                           "view:incidence_angle": 10.9358})
    assert m == {"captura_utc": "2026-10-26T13:59:57Z", "sol_elevacion_grados": 63.5, "incidencia_grados": 10.9}
    assert metadatos_captura({"datetime": "2019-06-21T14:09:52Z"})["incidencia_grados"] is None


def test_completar_catalogo_sin_red():
    catalogo = [{"id": "x", "url": "u1"}]
    item = {"properties": {"datetime": "2026-10-02T14:09:44.1Z", "view:sun_elevation": 58.61}}
    r = completar(catalogo, lambda url: item)
    assert r[0]["captura_utc"] == "2026-10-02T14:09:44Z" and r[0]["sol_elevacion_grados"] == 58.6
