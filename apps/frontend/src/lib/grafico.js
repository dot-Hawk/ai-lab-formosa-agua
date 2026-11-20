// Cálculos del gráfico de alturas del río (sin DOM).

const UN_DIA = 86_400_000;

/** Trazo SVG de una serie diaria; se corta donde faltan días (no se inventan valores). */
export function caminoSerie(serie, escalaX, escalaY) {
  let camino = "";
  let anterior = null;
  for (const [fecha, altura] of serie) {
    const t = Date.parse(fecha);
    const continua = anterior !== null && t - anterior <= UN_DIA;
    camino += `${continua ? "L" : "M"}${Math.round(escalaX(fecha) * 10) / 10},${Math.round(escalaY(altura) * 10) / 10}`;
    anterior = t;
  }
  return camino;
}

/** Rango vertical que incluye la serie, el cero de la escala y los umbrales. */
export function dominioAlturas(serie, umbrales) {
  const valores = [0, ...serie.map(([, h]) => h), ...Object.values(umbrales).filter((v) => v != null)];
  const min = Math.min(...valores);
  const max = Math.max(...valores);
  const margen = Math.max(0.5, (max - min) * 0.06);
  return [Math.floor((min - (min < 0 ? margen : 0)) * 2) / 2, Math.ceil((max + margen) * 2) / 2];
}

export function ultimaLectura(serie) {
  if (!serie.length) return null;
  const [fecha, altura] = serie[serie.length - 1];
  return { fecha, altura };
}

/** Relleno bajo la serie: cada tramo continuo se cierra contra la base `fondo`. */
export function caminoArea(serie, escalaX, escalaY, fondo) {
  const r = (v) => Math.round(v * 10) / 10;
  let camino = "";
  let tramo = [];
  const cerrar = () => {
    if (!tramo.length) return;
    const [x0] = tramo[0];
    const [xn] = tramo[tramo.length - 1];
    camino += `M${x0},${fondo}${tramo.map(([x, y]) => `L${x},${y}`).join("")}L${xn},${fondo}Z`;
    tramo = [];
  };
  let anterior = null;
  for (const [fecha, altura] of serie) {
    const t = Date.parse(fecha);
    if (anterior !== null && t - anterior > UN_DIA) cerrar();
    tramo.push([r(escalaX(fecha)), r(escalaY(altura))]);
    anterior = t;
  }
  cerrar();
  return camino;
}
