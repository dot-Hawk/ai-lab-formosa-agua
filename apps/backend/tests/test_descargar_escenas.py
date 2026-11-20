"""Pruebas de las funciones puras de la descarga de escenas Sentinel-2."""

import numpy as np
import pytest

from scripts.descargar_escenas import (
    empaquetar,
    mascara_validos,
    parametros,
    porcentaje_nubes,
    reflectancia,
)

# Clases SCL de Sentinel-2 L2A
NODATA, SOMBRA_NUBE, VEGETACION, AGUA, NUBE_MEDIA, NUBE_ALTA, CIRRO = 0, 3, 4, 6, 8, 9, 10


def test_reflectancia_aplica_escala_y_offset_del_producto():
    dn = np.array([[0, 1000, 2000]], dtype="uint16")
    r = reflectancia(dn, escala=0.0001, offset=-0.1, nodata=0)
    assert np.isnan(r[0, 0])  # nodata
    assert r[0, 1] == pytest.approx(0.0)
    assert r[0, 2] == pytest.approx(0.1)


def test_reflectancia_sin_offset_para_productos_viejos():
    r = reflectancia(np.array([[500]], dtype="uint16"), escala=0.0001, offset=0.0, nodata=0)
    assert r[0, 0] == pytest.approx(0.05)


def test_mascara_validos_descarta_nubes_sombras_y_sin_dato():
    scl = np.array([[NODATA, SOMBRA_NUBE, VEGETACION, AGUA, NUBE_MEDIA, NUBE_ALTA, CIRRO]])
    assert mascara_validos(scl).tolist() == [[False, False, True, True, False, False, False]]


def test_porcentaje_nubes_cuenta_solo_pixeles_con_dato():
    scl = np.array([[NODATA, NODATA, NUBE_ALTA, AGUA, VEGETACION, SOMBRA_NUBE]])
    # 4 píxeles con dato, 2 nubosos (nube alta + sombra)
    assert porcentaje_nubes(scl) == pytest.approx(50.0)


def test_porcentaje_nubes_de_escena_sin_datos_es_100():
    assert porcentaje_nubes(np.zeros((2, 2))) == pytest.approx(100.0)


def test_empaquetar_pone_cero_en_invalidos_y_nunca_cero_en_validos():
    verde = np.array([[0.05, 0.0, np.nan, 0.08]])
    nir = np.array([[0.30, 0.02, 0.10, -0.01]])  # reflectancia negativa por el offset
    validos = np.array([[True, True, True, False]])
    v, n = empaquetar(verde, nir, validos)
    assert v.dtype == np.uint16 and n.dtype == np.uint16
    assert v.tolist() == [[500, 1, 0, 0]]  # 0.0 válido -> 1 para no confundirlo con "sin dato"
    assert n.tolist() == [[3000, 200, 0, 0]]  # NaN o inválido -> 0 en ambas bandas


class _Asset:
    def __init__(self, bandas):
        self.extra_fields = {"raster:bands": bandas}


def test_parametros_ignora_el_offset_si_el_catalogo_ya_lo_aplico():
    asset = _Asset([{"scale": 0.0001, "offset": -0.1, "nodata": 0}])
    assert parametros(asset, offset_ya_aplicado=True) == (0.0001, 0.0, 0)


def test_parametros_usa_el_offset_si_no_fue_aplicado():
    asset = _Asset([{"scale": 0.0001, "offset": -0.1, "nodata": 0}])
    assert parametros(asset, offset_ya_aplicado=False) == (0.0001, -0.1, 0)


def test_agua_real_del_rio_paraguay_da_ndwi_positivo():
    # DN medidos en el río frente al puerto, escena S2B_21JUM_20261002_0_L2A
    escala, offset, nodata = parametros(_Asset([{"scale": 0.0001, "offset": -0.1, "nodata": 0}]), True)
    verde = reflectancia(np.array([[718]], dtype="uint16"), escala, offset, nodata)
    nir = reflectancia(np.array([[350]], dtype="uint16"), escala, offset, nodata)
    assert ((verde - nir) / (verde + nir))[0, 0] > 0.3
