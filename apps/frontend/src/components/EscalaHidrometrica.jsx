import { ESCALA_MAX_M, MAXIMO_HISTORICO } from "../lib/estacion.js";
import { formatearFecha, formatearMetros, posicionEnEscala } from "../lib/vista.js";

// Geometría del dibujo (unidades del viewBox)
const ALTO = 420;
const MARGEN = 14;
const X_REGLA = 30; // borde izquierdo de la regla
const ANCHO_REGLA = 30;
const X_TEXTO = X_REGLA + ANCHO_REGLA + 10;
const y = (m) => MARGEN + posicionEnEscala(m, { max: ESCALA_MAX_M, alto: ALTO });

/**
 * Escala hidrométrica como la de los puertos: una regla graduada de 0 a 10 m con
 * las franjas de referencia del INA y una marca por cada fecha comparada.
 */
export default function EscalaHidrometrica({ estacion, umbrales, lecturas, maximo = MAXIMO_HISTORICO }) {
  const hay = (clave) => umbrales[clave] != null;
  const metros = Array.from({ length: ESCALA_MAX_M * 2 + 1 }, (_, i) => i / 2);
  const conDato = lecturas.filter((l) => l.altura != null);
  const sinDato = lecturas.filter((l) => l.altura == null);

  const descripcion =
    `Escala hidrométrica de ${estacion}:` +
    (hay("aguas_bajas") ? ` aguas bajas ${formatearMetros(umbrales.aguas_bajas)},` : "") +
    ` alerta ${formatearMetros(umbrales.alerta)}, evacuación ${formatearMetros(umbrales.evacuacion)}.` +
    conDato.map((l) => ` ${l.etiqueta}: ${formatearMetros(l.altura)}.`).join("");

  return (
    <figure className="escala">
      <figcaption>
        <span className="escala-titulo">Río Paraguay en {estacion}</span>
        <span className="escala-sub">Altura de la escala, en metros</span>
      </figcaption>

      <svg viewBox={`0 0 210 ${ALTO + MARGEN * 2}`} role="img" aria-label={descripcion}>
        {/* Franjas de referencia */}
        <rect className="franja-evacuacion" x={X_REGLA} y={y(ESCALA_MAX_M)} width={ANCHO_REGLA}
          height={y(umbrales.evacuacion) - y(ESCALA_MAX_M)} />
        <rect className="franja-alerta" x={X_REGLA} y={y(umbrales.evacuacion)} width={ANCHO_REGLA}
          height={y(umbrales.alerta) - y(umbrales.evacuacion)} />
        {hay("aguas_bajas") && (
          <rect className="franja-bajas" x={X_REGLA} y={y(umbrales.aguas_bajas)} width={ANCHO_REGLA}
            height={y(0) - y(umbrales.aguas_bajas)} />
        )}
        <rect className="regla" x={X_REGLA} y={y(ESCALA_MAX_M)} width={ANCHO_REGLA} height={ALTO} />

        {/* Graduación: marca larga cada metro, corta cada medio metro */}
        {metros.map((m) => {
          const entero = Number.isInteger(m);
          return (
            <g key={m}>
              <line className="graduacion" x1={X_REGLA} x2={X_REGLA + (entero ? 12 : 6)} y1={y(m)} y2={y(m)} />
              {entero && (
                <text className="graduacion-num" x={X_REGLA - 6} y={y(m)} textAnchor="end" dominantBaseline="middle">
                  {m}
                </text>
              )}
            </g>
          );
        })}

        {/* Umbrales */}
        {[
          ["evacuacion", `Evacuación ${formatearMetros(umbrales.evacuacion)}`],
          ["alerta", `Alerta ${formatearMetros(umbrales.alerta)}`],
          ["aguas_bajas", `Aguas bajas ${formatearMetros(umbrales.aguas_bajas)}`],
        ].filter(([clave]) => hay(clave)).map(([clave, texto]) => (
          <g key={clave} className={`umbral umbral-${clave}`}>
            <line x1={X_REGLA} x2={X_TEXTO - 2} y1={y(umbrales[clave])} y2={y(umbrales[clave])} />
            <text x={X_TEXTO} y={y(umbrales[clave])} dy={clave === "alerta" ? 12 : -4}>
              {texto}
            </text>
          </g>
        ))}

        {/* Máximo histórico de la serie */}
        {maximo && (
          <g className="maximo">
            <line x1={X_REGLA - 4} x2={X_REGLA + ANCHO_REGLA + 4} y1={y(maximo.altura)} y2={y(maximo.altura)} />
            <text x={X_TEXTO} y={y(maximo.altura)} dy={-4}>
              Máximo {formatearMetros(maximo.altura)}, {formatearFecha(maximo.fecha)}
            </text>
          </g>
        )}

        {/* Lecturas de las fechas comparadas */}
        {conDato.map((l) => (
          <g key={l.etiqueta} className="marca" data-testid={`marca-${l.etiqueta}`}>
            <path d={`M ${X_REGLA + ANCHO_REGLA} ${y(l.altura)} l 9 -6 v 12 z`} />
            <line x1={X_REGLA} x2={X_REGLA + ANCHO_REGLA} y1={y(l.altura)} y2={y(l.altura)} />
            <text x={X_TEXTO + 2} y={y(l.altura)} dominantBaseline="middle">
              {l.etiqueta} {formatearMetros(l.altura)}
            </text>
          </g>
        ))}
      </svg>

      {sinDato.length > 0 && (
        <ul className="escala-faltantes">
          {sinDato.map((l) => (
            <li key={l.etiqueta}>
              {l.etiqueta}, {formatearFecha(l.fecha)}: sin dato en la serie del INA limpiada por el equipo.
            </li>
          ))}
        </ul>
      )}
      <p className="fuente">
        Umbrales: INA.{maximo && ` Máximo: serie INA, ${maximo.contexto}.`}
      </p>
    </figure>
  );
}
