"""Descarga las alturas diarias observadas del río Paraguay en tres escalas de la región.

Fuente: INA, Sistema de Información y Alerta Hidrológico, API pública
(https://alerta.ina.gob.ar/pub/datos/...). Escalas de Prefectura Naval Argentina. Sin cuenta.

Estaciones (siteCode del INA):
- 57 Puerto Formosa (la de la zona de estudio; coincide con el kit K1)
- 55 Puerto Pilcomayo (aguas arriba, cerca de Clorinda)
- 58 Puerto Bermejo (aguas abajo, Chaco)

Período: 01/01/2017 (primera escena Sentinel-2 L2A de la zona) al 31/10/2026 (corte de datos del
desafío). Nada posterior al corte se guarda.

    uv run python scripts/descargar_ina.py
"""

import csv
import json
import urllib.request
from pathlib import Path

API = "https://alerta.ina.gob.ar/pub/datos"
DATA_DIR = Path(__file__).resolve().parent.parent / "data"
SALIDA_ALTURAS = DATA_DIR / "ina_alturas_region.csv"
SALIDA_ESTACIONES = DATA_DIR / "ina_estaciones_region.json"
VAR_ALTURA = 2
INICIO, CORTE = "2017-01-01", "2026-10-31"
ESTACIONES = {57: "Puerto Formosa", 55: "Puerto Pilcomayo", 58: "Puerto Bermejo"}


def leer_json(url: str) -> dict:
    with urllib.request.urlopen(url, timeout=120) as r:
        return json.load(r)


def url_datos(site: int, inicio: str, fin: str) -> str:
    return f"{API}/datos&timeStart={inicio}&timeEnd={fin}&siteCode={site}&varId={VAR_ALTURA}&format=json"


def filas_diarias(site: int, datos: list[dict]) -> list[dict]:
    """Una fila por día (la API ya entrega un valor diario). Descarta lo posterior al corte y los vacíos."""
    salida = {}
    for d in datos:
        fecha = str(d.get("timestart", ""))[:10]
        if not fecha or fecha > CORTE or d.get("valor") is None:
            continue
        salida[fecha] = {"fecha": fecha, "site_code": site, "estacion": ESTACIONES[site], "altura_m": round(float(d["valor"]), 2)}
    return [salida[f] for f in sorted(salida)]


def metadatos_estaciones(todas: list[dict]) -> list[dict]:
    claves = ("sitecode", "nombre", "rio", "lat", "lon", "propietario", "nivel_de_aguas_bajas", "nivel_de_alerta", "nivel_de_evacuacion")
    salida = []
    for e in todas:
        if e.get("sitecode") in ESTACIONES and e.get("tabla_id") == "alturas_prefe":
            # el INA llama "Bermejo" a la escala de Puerto Bermejo: se usa el nombre completo
            salida.append({k: e.get(k) for k in claves} | {"nombre": ESTACIONES[e["sitecode"]], "nombre_ina": e.get("nombre")})
    return salida


def main() -> None:
    filas = []
    for site, nombre in ESTACIONES.items():
        for anio in range(int(INICIO[:4]), int(CORTE[:4]) + 1):
            ini, fin = f"{anio}-01-01", min(f"{anio}-12-31", CORTE)
            nuevas = filas_diarias(site, leer_json(url_datos(site, ini, fin)).get("data", []))
            filas += nuevas
        print(f"{nombre}: {sum(1 for f in filas if f['site_code'] == site)} días")
    with SALIDA_ALTURAS.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=["fecha", "site_code", "estacion", "altura_m"])
        w.writeheader()
        w.writerows(filas)
    estaciones = metadatos_estaciones(leer_json(f"{API}/estaciones&format=json")["data"])
    SALIDA_ESTACIONES.write_text(json.dumps({"fuente": f"{API}/estaciones&format=json", "estaciones": estaciones},
                                            indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"{len(filas)} filas en {SALIDA_ALTURAS.name}; metadatos en {SALIDA_ESTACIONES.name}")


if __name__ == "__main__":
    main()
