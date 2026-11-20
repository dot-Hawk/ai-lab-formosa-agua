"""Pruebas de la limpieza de K1 (altura hidrométrica de Puerto Formosa)."""

import pytest

from scripts.limpiar_k1 import (
    limpiar,
    normalizar_fecha,
    normalizar_valor,
    serie_diaria,
)


def fila(obs_id, ts, valor, unidad="m"):
    return {"obs_id": obs_id, "timestart": ts, "timeend": ts, "valor": valor,
            "unidad_registro": unidad, "timeupdate": "2022-11-14 08:54:11"}


# --- Normalización ---------------------------------------------------------

@pytest.mark.parametrize("entrada", ["2019-01-13 00:00:00", "13/01/2019 00:00:00", "2019/01/13 00:00:00"])
def test_normalizar_fecha_acepta_los_tres_formatos(entrada):
    assert normalizar_fecha(entrada) == "2019-01-13 00:00:00"


def test_normalizar_fecha_rechaza_formato_desconocido():
    with pytest.raises(ValueError):
        normalizar_fecha("enero 2019")


def test_normalizar_valor_coma_decimal_y_centimetros():
    assert normalizar_valor("7,95", "m") == pytest.approx(7.95)
    assert normalizar_valor("584.00", "cm") == pytest.approx(5.84)
    assert normalizar_valor("-0.86", "m") == pytest.approx(-0.86)  # bajante real


def test_normalizar_valor_rechaza_unidad_desconocida():
    with pytest.raises(ValueError):
        normalizar_valor("3", "pies")


# --- Limpieza ----------------------------------------------------------------

def test_elimina_filas_identicas_y_lo_registra():
    filas = [fila("1", "2010-01-01 04:00:00", "3.0"), fila("1", "2010-01-01 04:00:00", "3.0")]
    limpias, informe = limpiar(filas)
    assert len(limpias) == 1
    assert informe["duplicados_identicos"] == 1


def test_conserva_varias_mediciones_del_mismo_dia():
    filas = [fila("1", "2016-01-06 00:00:00", "9.81"), fila("2", "2016-01-06 03:00:00", "9.81")]
    limpias, _ = limpiar(filas)
    assert len(limpias) == 2


def test_excluye_valor_fisicamente_imposible_sin_reemplazarlo():
    filas = [
        fila("1", "2012-07-14 04:00:00", "5.83"),
        fila("2", "2012-07-15 04:00:00", "98.1"),
        fila("3", "2012-07-16 04:00:00", "5.83"),
    ]
    limpias, informe = limpiar(filas)
    excluida = next(f for f in limpias if f["obs_id"] == "2")
    assert excluida["estado"] == "excluido_imposible"
    assert excluida["altura_m"] is None
    assert excluida["valor_original"] == "98.1"
    assert informe["imposibles"] == 1


def test_marca_pico_de_un_dia_como_pendiente_sin_modificarlo():
    filas = [
        fila("1", "2009-08-13 04:00:00", "4.59"),
        fila("2", "2009-08-14 04:00:00", "3.4"),
        fila("3", "2009-08-15 04:00:00", "4.49"),
    ]
    limpias, informe = limpiar(filas)
    pico = next(f for f in limpias if f["obs_id"] == "2")
    assert pico["estado"] == "pendiente_verificacion"
    assert pico["altura_m"] == pytest.approx(3.4)
    assert informe["pendientes"] == 1


def test_registra_las_correcciones_aplicadas():
    filas = [
        fila("1", "13/01/2019 00:00:00", "3,0"),
        fila("2", "2011-03-10 04:00:00", "584.00", "cm"),
    ]
    limpias, informe = limpiar(filas)
    assert {f["estado"] for f in limpias} == {"corregido"}
    assert informe["fechas_normalizadas"] == 1
    assert informe["comas_decimales"] == 1
    assert informe["centimetros_convertidos"] == 1


# --- Serie diaria -------------------------------------------------------------

def test_serie_diaria_promedia_mediciones_validas_y_no_rellena_huecos():
    limpias, _ = limpiar([
        fila("1", "2016-01-05 21:00:00", "9.79"),
        fila("2", "2016-01-06 00:00:00", "9.80"),
        fila("3", "2016-01-06 12:00:00", "9.82"),
        fila("4", "2016-01-08 00:00:00", "9.70"),  # falta el 7: no se inventa
    ])
    diaria = serie_diaria(limpias)
    assert [d["fecha"] for d in diaria] == ["2016-01-05", "2016-01-06", "2016-01-08"]
    dia6 = diaria[1]
    assert dia6["altura_m"] == pytest.approx(9.81)
    assert dia6["n_mediciones"] == 2


def test_serie_diaria_omite_dias_que_solo_tienen_valores_excluidos():
    limpias, _ = limpiar([
        fila("1", "2012-07-14 04:00:00", "5.83"),
        fila("2", "2012-07-15 04:00:00", "98.1"),
        fila("3", "2012-07-16 04:00:00", "5.83"),
    ])
    assert "2012-07-15" not in [d["fecha"] for d in serie_diaria(limpias)]


def test_serie_diaria_propaga_la_marca_de_pendiente():
    limpias, _ = limpiar([
        fila("1", "2009-08-13 04:00:00", "4.59"),
        fila("2", "2009-08-14 04:00:00", "3.4"),
        fila("3", "2009-08-15 04:00:00", "4.49"),
    ])
    dia = next(d for d in serie_diaria(limpias) if d["fecha"] == "2009-08-14")
    assert dia["estado"] == "pendiente_verificacion"
