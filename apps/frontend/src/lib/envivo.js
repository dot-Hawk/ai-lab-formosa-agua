// Capas meteorológicas en tiempo real (NASA GIBS y RainViewer) y navegación entre vistas.

export const GIBS = "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best";

export const CAPAS = {
  nubes: {
    id: "GOES-East_ABI_Band13_Clean_Infrared",
    nombre: "Nubes",
    detalle: "Infrarrojo 10,3 µm",
    matriz: "GoogleMapsCompatible_Level6",
    zoomNativo: 6,
    cuadros: 12,
    fuente: "NOAA GOES-East ABI banda 13 · NASA GIBS",
    mezcla: "screen", // el suelo despejado es negro: se vuelve transparente sobre el fondo
    escala: { desde: "Cálido", hasta: "Topes fríos", clase: "escala-ir" },
  },
  color: {
    id: "GOES-East_ABI_GeoColor",
    nombre: "Color real",
    detalle: "GeoColor día y noche",
    matriz: "GoogleMapsCompatible_Level7",
    zoomNativo: 7,
    cuadros: 12,
    fuente: "NOAA GOES-East ABI GeoColor · NASA GIBS",
    escala: null,
  },
  lluvia: {
    id: "IMERG_Precipitation_Rate_30min",
    nombre: "Lluvia",
    detalle: "Estimada por satélite",
    matriz: "GoogleMapsCompatible_Level6",
    zoomNativo: 6,
    cuadros: 12,
    fuente: "NASA GPM IMERG temprano · NASA GIBS",
    escala: { desde: "0,1 mm/h", hasta: "50 mm/h", clase: "escala-lluvia" },
  },
  radar: {
    id: "radar",
    nombre: "Radar",
    detalle: "Reflectividad",
    zoomNativo: 7,
    fuente: "RainViewer",
    escala: { desde: "Llovizna", hasta: "Granizo", clase: "escala-radar" },
  },
};

const PERIODO_MS = { PT10M: 10 * 60e3, PT30M: 30 * 60e3, PT1H: 60 * 60e3, P1D: 24 * 3600e3 };

const iso = (ms) => new Date(ms).toISOString().replace(".000Z", "Z");

/** Lista de instantes disponibles a partir de la respuesta DescribeDomains de GIBS. */
export function expandirDominio(xml) {
  const dominio = /<Domain>([^<]*)<\/Domain>/.exec(xml)?.[1]?.trim();
  if (!dominio) return [];
  const tiempos = [];
  for (const parte of dominio.split(",")) {
    const [inicio, fin, periodo] = parte.trim().split("/");
    if (!fin) {
      tiempos.push(inicio);
      continue;
    }
    const paso = PERIODO_MS[periodo] ?? PERIODO_MS.PT10M;
    for (let t = Date.parse(inicio); t <= Date.parse(fin); t += paso) tiempos.push(iso(t));
  }
  return tiempos;
}

/** URL de DescribeDomains para las últimas `horas` de una capa de GIBS. */
export function urlDominio(capa, ahora = Date.now(), horas = 8) {
  const desde = iso(ahora - horas * 3600e3).slice(0, 13) + ":00:00Z";
  const hasta = iso(ahora + 3600e3).slice(0, 13) + ":00:00Z";
  return `${GIBS}/1.0.0/${capa.id}/default/${capa.matriz}/all/${desde}--${hasta}.xml`;
}

export const urlTeselaGibs = (capa, tiempo) =>
  `${GIBS}/${capa.id}/default/${tiempo}/${capa.matriz}/{z}/{y}/{x}.png`;

export const URL_RADAR = "https://api.rainviewer.com/public/weather-maps.json";

/** Cuadros del radar de RainViewer como { tiempo ISO, url de teselas }. */
export function framesRadar(respuesta) {
  const pasados = respuesta?.radar?.past ?? [];
  return pasados.map((f) => ({
    tiempo: iso(f.time * 1000),
    url: `${respuesta.host}${f.path}/256/{z}/{x}/{y}/4/1_1.png`,
  }));
}

/** "18:50 UTC · 15:50 ART" (Argentina no usa horario de verano: UTC-3 todo el año). */
export function formatearUtc(tiempo) {
  const d = new Date(tiempo);
  const hhmm = (h, m) => `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  return `${hhmm(d.getUTCHours(), d.getUTCMinutes())} UTC · ${hhmm((d.getUTCHours() + 21) % 24, d.getUTCMinutes())} ART`;
}

// --- Vistas ---------------------------------------------------------------------------------

export const VISTAS = [
  { id: "envivo", nombre: "En vivo" },
  { id: "comparar", nombre: "Comparar" },
  { id: "rio", nombre: "Río" },
];

export function vistaDesdeHash(hash) {
  const id = String(hash).replace(/^#\/?/, "");
  return VISTAS.some((v) => v.id === id) ? id : "envivo";
}
