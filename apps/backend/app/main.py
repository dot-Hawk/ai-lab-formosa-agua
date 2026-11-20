"""API · Operación Agua · Equipo 1 · Imágenes satelitales.

Contrato documentado en docs/CONTRATO_API.md.
"""

import base64
import datetime
import io
import os

import numpy as np
from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from PIL import Image
from pydantic import BaseModel, Field

from app import confianza, datos
from app.cambio import AGUA_NUEVA, AGUA_PERDIDA, area_hectareas, detectar_cambio, ndwi, separar_agua_nueva

LEYENDA = "PROTOTIPO · AI LAB Misión: Código Formosa · no es una herramienta oficial"
ADVERTENCIA = (
    "Un cambio detectado es un indicio, no una afectación comprobada. "
    "Debe verificarse en terreno o con fuentes oficiales antes de cualquier decisión."
)

app = FastAPI(title="Operación Agua · Imágenes satelitales", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:5173").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(HTTPException)
async def _http_error(_: Request, exc: HTTPException):
    return JSONResponse(status_code=exc.status_code, content={"detalle": exc.detail})


@app.exception_handler(RequestValidationError)
async def _validation_error(_: Request, exc: RequestValidationError):
    return JSONResponse(status_code=422, content={"detalle": "Cuerpo inválido", "errores": exc.errors()})


class PedidoComparar(BaseModel):
    escena_a: str = Field(description="id de la escena 'antes'")
    escena_b: str = Field(description="id de la escena 'después'")
    umbral_agua: float = Field(0.0, ge=-1, le=1, description="NDWI mínimo para considerar agua")
    umbral_habitual_pct: float = Field(
        50, ge=1, le=100, description="% de tiempo con agua (1984-2021) desde el que un píxel es 'agua de siempre'"
    )


@app.get("/api/salud")
def salud():
    return {"estado": "ok", "leyenda": LEYENDA}


@app.get("/api/escenas")
def escenas():
    return [{k: v for k, v in e.items() if k != "archivo"} for e in datos.catalogo()]


def _overlay_png(mascara: np.ndarray) -> str:
    """Azul = agua nueva, naranja = agua perdida, transparente = sin cambio."""
    rgba = np.zeros((*mascara.shape, 4), dtype="uint8")
    rgba[mascara == AGUA_NUEVA] = (30, 110, 255, 200)
    rgba[mascara == AGUA_PERDIDA] = (255, 140, 0, 200)
    buf = io.BytesIO()
    Image.fromarray(rgba, "RGBA").save(buf, format="PNG")
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()


def _png(rgba: np.ndarray) -> str:
    buf = io.BytesIO()
    Image.fromarray(rgba, "RGBA").save(buf, format="PNG")
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()


def _agua_habitual(mascara: np.ndarray, umbral_pct: float, res: float) -> dict | None:
    """Separa el agua nueva en habitual e inusual con Global Surface Water. None si no hay capa."""
    ocurrencia = datos.gsw_ocurrencia()
    if ocurrencia is None or ocurrencia.shape != mascara.shape:
        return None
    inusual, habitual = separar_agua_nueva(mascara, ocurrencia, umbral_pct)
    solo_inusual = np.where(mascara == AGUA_NUEVA, 0, mascara)
    solo_inusual[inusual] = AGUA_NUEVA
    capa_siempre = np.zeros((*mascara.shape, 4), dtype="uint8")
    capa_siempre[ocurrencia >= umbral_pct] = (70, 90, 110, 120)
    meta = datos.gsw_metadatos()
    return {
        "umbral_pct": umbral_pct,
        "area_agua_nueva_inusual_ha": round(area_hectareas(int(inusual.sum()), res), 2),
        "area_agua_nueva_habitual_ha": round(area_hectareas(int(habitual.sum()), res), 2),
        "overlay_inusual_png": _overlay_png(solo_inusual),
        "agua_de_siempre_png": _png(capa_siempre),
        "fuente": meta.get("fuente", "Global Surface Water (JRC)"),
        "periodo": meta.get("periodo", "1984-2021"),
        "resolucion_original_m": meta.get("resolucion_original_m", 30),
        "categoria": "Observado (derivado de Landsat)",
        "nota": "El agua de siempre es un promedio de 1984 a 2021 con 30 m de resolución: los bordes son aproximados.",
    }


def _publica(e: dict) -> dict:
    return {k: v for k, v in e.items() if k != "archivo"}


DIAS_LLUVIA_PREVIA = 30
MAX_DIAS_LLUVIA_ENTRE = 90  # con más días, el acumulado entre fechas deja de explicar el cambio


def _region(a: dict, b: dict) -> dict:
    """Altura observada en otras escalas del río Paraguay (INA) en las dos fechas."""
    return {
        "estaciones": [
            {
                "nombre": e["nombre"],
                "rio": e["rio"].title(),
                "altura_a": datos.altura_ina(e["sitecode"], a["fecha"]),
                "altura_b": datos.altura_ina(e["sitecode"], b["fecha"]),
                "umbrales": {"aguas_bajas": e["nivel_de_aguas_bajas"], "alerta": e["nivel_de_alerta"],
                             "evacuacion": e["nivel_de_evacuacion"]},
            }
            for e in datos.estaciones_region()
        ],
        "fuente": "INA, API pública del Sistema de Alerta (escalas de Prefectura Naval) · Dato observado",
    }


def _lluvia(a: dict, b: dict) -> dict:
    """Lluvia estimada (ERA5) antes de cada fecha y entre ambas."""
    desde, hasta = sorted((a["fecha"], b["fecha"]))
    dias = (datetime.date.fromisoformat(hasta) - datetime.date.fromisoformat(desde)).days
    return {
        "dias_previos": DIAS_LLUVIA_PREVIA,
        "previa_a_mm": datos.lluvia_previa(a["fecha"], DIAS_LLUVIA_PREVIA),
        "previa_b_mm": datos.lluvia_previa(b["fecha"], DIAS_LLUVIA_PREVIA),
        "entre_fechas_mm": datos.lluvia_entre(desde, hasta) if dias <= MAX_DIAS_LLUVIA_ENTRE else None,
        "fuente": "Reanálisis ERA5 (Copernicus/ECMWF) vía Open-Meteo, celda de ~25 km sobre la zona",
        "categoria": "Estimado",
        "nota": "Es una estimación de un modelo, no una medición: puede diferir de los pluviómetros.",
    }


@app.post("/api/comparar")
def comparar(pedido: PedidoComparar):
    if pedido.escena_a == pedido.escena_b:
        raise HTTPException(400, "Elegí dos escenas distintas para comparar.")
    a, b = datos.buscar_escena(pedido.escena_a), datos.buscar_escena(pedido.escena_b)
    faltantes = [i for i, e in ((pedido.escena_a, a), (pedido.escena_b, b)) if e is None]
    if faltantes:
        raise HTTPException(404, f"Escena(s) inexistente(s): {', '.join(faltantes)}")
    if (a["satelite"], a["resolucion_m"]) != (b["satelite"], b["resolucion_m"]):
        raise HTTPException(
            400, "Las escenas son de distinto satélite o resolución; compararlas genera cambios falsos."
        )

    mascara = detectar_cambio(ndwi(*datos.cargar_bandas(a)), ndwi(*datos.cargar_bandas(b)), pedido.umbral_agua)
    res = a["resolucion_m"]
    k3 = datos.umbrales_k3()["estaciones"]["formosa"]

    return {
        "escena_a": _publica(a),
        "escena_b": _publica(b),
        "umbral_agua": pedido.umbral_agua,
        "area_agua_nueva_ha": round(area_hectareas(int((mascara == AGUA_NUEVA).sum()), res), 2),
        "area_agua_perdida_ha": round(area_hectareas(int((mascara == AGUA_PERDIDA).sum()), res), 2),
        "overlay_png": _overlay_png(mascara),
        "bounds": a["bounds"],
        "nivel_rio": {
            "estacion": k3["nombre"],
            "unidad": "m",
            "fecha_a": a["fecha"],
            "altura_a": datos.nivel_rio(a["fecha"]),
            "fecha_b": b["fecha"],
            "altura_b": datos.nivel_rio(b["fecha"]),
            "umbrales": {"aguas_bajas": k3["aguas_bajas"], "alerta": k3["alerta"], "evacuacion": k3["evacuacion"]},
            "fuente": "INA · K1 (serie limpiada por el equipo) y K3 · Dato observado",
        },
        "agua_habitual": _agua_habitual(mascara, pedido.umbral_habitual_pct, res),
        "region": _region(a, b),
        "lluvia": _lluvia(a, b),
        "confianza": confianza.evaluar(a, b),
        "avisos": confianza.avisos(a, b),
        "advertencia": ADVERTENCIA,
        "leyenda": LEYENDA,
    }


# --- Interfaz compilada (imagen Docker) ---------------------------------------
# Si STATIC_DIR apunta al build del frontend, se sirve en "/". Se monta al final para
# que las rutas /api/* definidas arriba tengan prioridad.
_static = os.getenv("STATIC_DIR")
if _static and os.path.isdir(_static):
    app.mount("/", StaticFiles(directory=_static, html=True), name="frontend")
