import { useMemo, useState } from "react";
import { caminoArea, caminoSerie, dominioAlturas } from "../lib/grafico.js";
import { formatearFecha, formatearMetros } from "../lib/vista.js";

const ANCHO = 960;
const ALTO = 380;
const M = { arriba: 16, derecha: 120, abajo: 30, izquierda: 44 };
const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

/** Serie diaria de altura con las franjas de alerta y evacuación del INA. */
export default function GraficoNivel({ estacion, serie, umbrales }) {
  const [foco, setFoco] = useState(null);

  const geo = useMemo(() => {
    if (!serie.length) return null;
    const t0 = Date.parse(serie[0][0]);
    const t1 = Date.parse(serie[serie.length - 1][0]);
    const [hMin, hMax] = dominioAlturas(serie, umbrales);
    const ancho = ANCHO - M.izquierda - M.derecha;
    const alto = ALTO - M.arriba - M.abajo;
    const x = (fecha) => M.izquierda + ((Date.parse(fecha) - t0) / Math.max(1, t1 - t0)) * ancho;
    const y = (h) => M.arriba + (1 - (h - hMin) / (hMax - hMin)) * alto;

    const metros = [];
    for (let h = Math.ceil(hMin); h <= hMax; h += hMax - hMin > 8 ? 2 : 1) metros.push(h);
    const meses = [];
    const d = new Date(t0);
    d.setUTCDate(1);
    d.setUTCMonth(d.getUTCMonth() + 1);
    const salto = (t1 - t0) / 86_400_000 > 800 ? 6 : (t1 - t0) / 86_400_000 > 400 ? 3 : 1;
    for (; d.getTime() <= t1; d.setUTCMonth(d.getUTCMonth() + salto)) meses.push(d.toISOString().slice(0, 10));

    return { x, y, hMin, hMax, metros, meses, camino: caminoSerie(serie, x, y) };
  }, [serie, umbrales]);

  if (!geo) return <p className="vacio">Sin datos para el período elegido.</p>;
  const { x, y, metros, meses, camino } = geo;
  const fondo = y(geo.hMin);
  const area = caminoArea(serie, x, y, fondo);

  function mover(evento) {
    const caja = evento.currentTarget.getBoundingClientRect();
    const px = ((evento.clientX - caja.left) / caja.width) * ANCHO;
    let mejor = serie[0];
    for (const p of serie) if (Math.abs(x(p[0]) - px) < Math.abs(x(mejor[0]) - px)) mejor = p;
    setFoco(mejor);
  }

  const umbralesVisibles = [
    ["evacuacion", "Evacuación"],
    ["alerta", "Alerta"],
    ["aguas_bajas", "Aguas bajas"],
  ].filter(([k]) => umbrales[k] != null);

  return (
    <figure className="grafico-nivel">
      <svg viewBox={`0 0 ${ANCHO} ${ALTO}`} role="img"
        aria-label={`Altura del río en ${estacion}, ${formatearFecha(serie[0][0])} a ${formatearFecha(serie[serie.length - 1][0])}`}
        onMouseMove={mover} onMouseLeave={() => setFoco(null)}>
        <defs>
          <linearGradient id="relleno-rio" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="var(--hielo)" stopOpacity="0.28" />
            <stop offset="1" stopColor="var(--hielo)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {umbrales.evacuacion != null && (
          <rect className="zona-evacuacion" x={M.izquierda} width={ANCHO - M.izquierda - M.derecha}
            y={y(geo.hMax)} height={Math.max(0, y(umbrales.evacuacion) - y(geo.hMax))} />
        )}
        {umbrales.alerta != null && umbrales.evacuacion != null && (
          <rect className="zona-alerta" x={M.izquierda} width={ANCHO - M.izquierda - M.derecha}
            y={y(umbrales.evacuacion)} height={y(umbrales.alerta) - y(umbrales.evacuacion)} />
        )}

        {metros.map((h) => (
          <g key={h} className="grilla">
            <line x1={M.izquierda} x2={ANCHO - M.derecha} y1={y(h)} y2={y(h)} />
            <text x={M.izquierda - 8} y={y(h)} textAnchor="end" dominantBaseline="middle">{h}</text>
          </g>
        ))}
        {meses.map((f) => (
          <g key={f} className="grilla grilla-tiempo">
            <line x1={x(f)} x2={x(f)} y1={M.arriba} y2={ALTO - M.abajo} />
            <text x={x(f)} y={ALTO - 10} textAnchor="middle">
              {MESES[Number(f.slice(5, 7)) - 1]} {f.slice(2, 4)}
            </text>
          </g>
        ))}

        {umbralesVisibles.map(([k, nombre]) => (
          <g key={k} className={`linea-umbral umbral-${k}`}>
            <line x1={M.izquierda} x2={ANCHO - M.derecha} y1={y(umbrales[k])} y2={y(umbrales[k])} />
            <text x={ANCHO - M.derecha + 8} y={y(umbrales[k])} dominantBaseline="middle">
              {nombre} {formatearMetros(umbrales[k])}
            </text>
          </g>
        ))}

        <path className="area-serie" d={area} fill="url(#relleno-rio)" />
        <path className="linea-serie" d={camino} />

        {foco && (
          <g className="foco">
            <line x1={x(foco[0])} x2={x(foco[0])} y1={M.arriba} y2={ALTO - M.abajo} />
            <circle cx={x(foco[0])} cy={y(foco[1])} r="4.5" />
          </g>
        )}
      </svg>
      <figcaption className="grafico-lectura cifra" aria-live="polite">
        {foco ? `${formatearFecha(foco[0])} · ${formatearMetros(foco[1])}` : " "}
      </figcaption>
    </figure>
  );
}
