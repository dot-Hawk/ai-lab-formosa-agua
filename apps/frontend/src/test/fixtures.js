// Datos de prueba con la forma exacta del contrato (docs/CONTRATO_API.md).
const BOUNDS = [[-26.2, -58.18], [-26.182, -58.16]];

export const escenas = [
  {
    id: "demo-2026-10-01", fecha: "2026-10-01", fuente: "SIMULADO · demo", satelite: "Sentinel-2",
    producto: "L2A (simulado)", resolucion_m: 10, nubes_pct: 4, categoria: "Simulado", bounds: BOUNDS,
    captura_utc: "2026-10-01T14:09:44Z",
  },
  {
    id: "demo-2026-10-31", fecha: "2026-10-31", fuente: "SIMULADO · demo", satelite: "Sentinel-2",
    producto: "L2A (simulado)", resolucion_m: 10, nubes_pct: 12, categoria: "Simulado", bounds: BOUNDS,
    captura_utc: "2026-10-31T13:59:57Z",
  },
];

export const resultado = {
  escena_a: escenas[0],
  escena_b: escenas[1],
  umbral_agua: 0,
  area_agua_nueva_ha: 80,
  area_agua_perdida_ha: 0,
  overlay_png: "data:image/png;base64,AAAA",
  bounds: BOUNDS,
  nivel_rio: {
    estacion: "FORMOSA (Puerto Formosa)",
    unidad: "m",
    fecha_a: "2026-10-01",
    altura_a: 2.37,
    fecha_b: "2026-10-31",
    altura_b: null,
    umbrales: { aguas_bajas: 1.6, alerta: 7.8, evacuacion: 8.3 },
    fuente: "INA · K1 y K3 · Dato observado",
  },
  confianza: {
    nivel: "media",
    dias_entre_fechas: 30,
    motivos: [
      { nivel: "media", texto: "Nubes sobre la zona: hasta 12 %" },
      { nivel: "alta", texto: "30 días entre las fechas" },
    ],
    criterios: "Reglas definidas por el equipo.",
  },
  avisos: [],
  agua_habitual: {
    umbral_pct: 50,
    area_agua_nueva_inusual_ha: 30.5,
    area_agua_nueva_habitual_ha: 49.5,
    overlay_inusual_png: "data:image/png;base64,BBBB",
    agua_de_siempre_png: "data:image/png;base64,CCCC",
    fuente: "Global Surface Water (JRC)",
    periodo: "1984-2021",
    resolucion_original_m: 30,
    categoria: "Observado (derivado de Landsat)",
    nota: "Los bordes son aproximados.",
  },
  region: {
    estaciones: [
      { nombre: "Puerto Pilcomayo", rio: "Paraguay", altura_a: 1.73, altura_b: 4.93,
        umbrales: { aguas_bajas: 1.4, alerta: 5.35, evacuacion: 6 } },
      { nombre: "Puerto Bermejo", rio: "Paraguay", altura_a: null, altura_b: -0.2,
        umbrales: { aguas_bajas: null, alerta: 6.5, evacuacion: 7 } },
    ],
    fuente: "INA · Dato observado",
  },
  lluvia: {
    dias_previos: 30, previa_a_mm: 227.3, previa_b_mm: 368.8, entre_fechas_mm: 258,
    fuente: "ERA5 vía Open-Meteo", categoria: "Estimado", nota: "Es una estimación de un modelo.",
  },
  advertencia: "Un cambio detectado es un indicio, no una afectación comprobada.",
  leyenda: "PROTOTIPO",
};
