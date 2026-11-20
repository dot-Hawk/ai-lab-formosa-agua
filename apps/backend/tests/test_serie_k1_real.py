"""Regresión sobre la serie K1 real ya limpiada (salida de scripts/limpiar_k1.py)."""

import json

import pytest

from app import datos
from scripts.limpiar_k1 import SALIDA_INFORME

pytestmark = pytest.mark.skipif(not datos.NIVELES_CSV.exists(), reason="falta correr scripts/limpiar_k1.py")


@pytest.fixture(scope="module")
def informe():
    return json.loads(SALIDA_INFORME.read_text(encoding="utf-8"))


def test_conteos_de_la_limpieza(informe):
    assert informe["registros_originales"] == 8347
    assert informe["duplicados_identicos"] == 12
    assert informe["registros_finales"] == 8335


def test_maximo_por_lectura_es_el_del_nino_2015_16(informe):
    assert informe["maximo_observacion"]["altura_m"] == pytest.approx(9.81)
    assert informe["maximo_observacion"]["fecha_hora"].startswith("2016-01-0")


def test_niveles_de_octubre_2026_coinciden_con_el_documento_base():
    assert datos.nivel_rio("2026-10-01") == pytest.approx(2.37)
    assert datos.nivel_rio("2026-10-31") == pytest.approx(5.60)


def test_el_valor_imposible_queda_como_hueco():
    assert datos.nivel_rio("2012-07-15") is None


def test_el_tramo_en_centimetros_quedo_en_metros():
    assert datos.nivel_rio("2011-03-10") == pytest.approx(5.84)
