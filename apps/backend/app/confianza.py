"""Semáforo de confianza de una comparación y avisos sobre la calidad de las escenas.

Las reglas son una decisión del equipo (docs/PLAN_DATOS_REALES.md), no un dato: se devuelven
junto con el resultado para que la interfaz las muestre. El nivel final es el peor de los criterios.
"""

from datetime import date

NIVELES = ("alta", "media", "baja")
NUBES_PARA_RADAR_PCT = 20  # por encima de esto, una escena óptica no alcanza

CRITERIOS = (
    "Nubes y píxeles sin dato en la zona: alta < 5 %, media 5–20 %, baja > 20 %. "
    "Días entre fechas: alta ≤ 30, media 31–90, baja > 90. "
    "Sol: alta ≥ 30°, media 20–30°, baja < 20°. "
    "Se toma el peor criterio. Reglas definidas por el equipo, no por un organismo oficial."
)


def _nivel_por_porcentaje(valor: float) -> str:
    return "alta" if valor < 5 else "media" if valor <= 20 else "baja"


def _nivel_por_dias(dias: int) -> str:
    return "alta" if dias <= 30 else "media" if dias <= 90 else "baja"


def _nivel_por_sol(grados: float) -> str:
    return "alta" if grados >= 30 else "media" if grados >= 20 else "baja"


def _texto(n: float) -> str:
    """20.1 -> '20,1' · 25.0 -> '25'"""
    return f"{n:.1f}".rstrip("0").rstrip(".").replace(".", ",")


def evaluar(a: dict, b: dict) -> dict:
    """Nivel de confianza (alta, media o baja) de comparar las escenas `a` y `b`, con sus motivos."""
    dias = abs((date.fromisoformat(b["fecha"]) - date.fromisoformat(a["fecha"])).days)
    nubes = max(a["nubes_pct"], b["nubes_pct"])
    sin_dato = max(a.get("sin_dato_pct", 0.0), b.get("sin_dato_pct", 0.0))

    criterios = [
        (_nivel_por_porcentaje(nubes), f"Nubes sobre la zona: hasta {_texto(nubes)} %"),
        (_nivel_por_porcentaje(sin_dato), f"Zona sin dato (nubes, sombras o bordes): hasta {_texto(sin_dato)} %"),
        (_nivel_por_dias(dias), f"{dias} días entre las fechas"),
    ]
    soles = [e["sol_elevacion_grados"] for e in (a, b) if e.get("sol_elevacion_grados") is not None]
    if soles:
        criterios.append((_nivel_por_sol(min(soles)), f"Sol a {_texto(min(soles))}° sobre el horizonte"))

    nivel = max((c[0] for c in criterios), key=NIVELES.index)
    return {
        "nivel": nivel,
        "dias_entre_fechas": dias,
        "motivos": [{"nivel": n, "texto": t} for n, t in criterios],
        "criterios": CRITERIOS,
    }


def necesita_radar(a: dict, b: dict) -> bool:
    return max(a["nubes_pct"], b["nubes_pct"]) > NUBES_PARA_RADAR_PCT


def avisos(a: dict, b: dict, radar_usado: bool = False) -> list[str]:
    """Avisos para mostrar en pantalla, además de la advertencia general."""
    salida = []
    for e in (a, b):
        if e["nubes_pct"] > NUBES_PARA_RADAR_PCT:
            seguimiento = (
                "La herramienta pasó sola al radar (Sentinel-1), que ve a través de las nubes: "
                "el resultado con radar está más abajo."
                if radar_usado else
                "Para días nublados hace falta radar (Sentinel-1), pero no hay una pasada cercana a estas fechas."
            )
            salida.append(
                f"La escena del {e['fecha'][8:10]}/{e['fecha'][5:7]}/{e['fecha'][:4]} tiene "
                f"{_texto(e['nubes_pct'])} % de nubes sobre la zona: lo que está debajo no se analiza "
                f"con la imagen óptica. {seguimiento}"
            )
    return salida
