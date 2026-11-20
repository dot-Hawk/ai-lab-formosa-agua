import Confianza from "./Confianza.jsx";
import Infraestructura from "./Infraestructura.jsx";
import Radar from "./Radar.jsx";
import {
  estadoNivel,
  formatearFecha,
  formatearHoraArgentina,
  formatearHectareas,
  formatearMetros,
  formatearMilimetros,
  formatearPorcentaje,
} from "../lib/vista.js";

function Categoria({ valor }) {
  return <span className={`categoria categoria-${valor.toLowerCase()}`}>{valor}</span>;
}

function Nivel({ altura, umbrales }) {
  // El motivo del faltante se explica debajo de la escala hidrométrica
  if (altura == null) return <span className="nivel nivel-sin-dato">Sin dato</span>;
  const estado = estadoNivel(altura, umbrales);
  return (
    <>
      <span className="cifra">{formatearMetros(altura)}</span>
      <span className={`nivel nivel-${estado.clase}`}>{estado.texto.split(" · ")[0]}</span>
    </>
  );
}

export default function Lectura({ resultado }) {
  const { escena_a: a, escena_b: b, nivel_rio: n } = resultado;

  const filas = [
    ["Fecha de captura", formatearFecha(a.fecha), formatearFecha(b.fecha)],
    ["Hora (Argentina)", formatearHoraArgentina(a.captura_utc), formatearHoraArgentina(b.captura_utc)],
    ["Satélite", a.satelite, b.satelite],
    ["Producto", a.producto, b.producto],
    ["Resolución", `${a.resolucion_m} m`, `${b.resolucion_m} m`],
    ["Cobertura de nubes", formatearPorcentaje(a.nubes_pct), formatearPorcentaje(b.nubes_pct)],
    ["Fuente", a.fuente, b.fuente],
    ["Categoría", <Categoria valor={a.categoria} />, <Categoria valor={b.categoria} />],
    [
      `Río en ${n.estacion.replace(/^FORMOSA \((.*)\)$/, "$1")}`,
      <Nivel altura={n.altura_a} umbrales={n.umbrales} />,
      <Nivel altura={n.altura_b} umbrales={n.umbrales} />,
    ],
    ...(resultado.region?.estaciones ?? []).map((e) => {
      // sin nivel de aguas bajas informado, no se marca "aguas bajas"
      const umbrales = { ...e.umbrales, aguas_bajas: e.umbrales.aguas_bajas ?? -Infinity };
      return [
        `Río en ${e.nombre}`,
        <Nivel altura={e.altura_a} umbrales={umbrales} />,
        <Nivel altura={e.altura_b} umbrales={umbrales} />,
      ];
    }),
    ...(resultado.lluvia
      ? [[
          `Lluvia ${resultado.lluvia.dias_previos} días antes (estimada)`,
          formatearMilimetros(resultado.lluvia.previa_a_mm),
          formatearMilimetros(resultado.lluvia.previa_b_mm),
        ]]
      : []),
  ];
  const lluvia = resultado.lluvia;

  return (
    <section className="lectura" aria-labelledby="lectura-titulo">
      <h2 id="lectura-titulo">Cambios entre las dos fechas</h2>

      <dl className="superficies">
        <div className="superficie superficie-nueva">
          <dt>Agua nueva</dt>
          <dd className="cifra">{formatearHectareas(resultado.area_agua_nueva_ha)}</dd>
        </div>
        <div className="superficie superficie-perdida">
          <dt>Agua que ya no está</dt>
          <dd className="cifra">{formatearHectareas(resultado.area_agua_perdida_ha)}</dd>
        </div>
      </dl>
      <p className="ayuda">Calculado con un umbral NDWI de {resultado.umbral_agua.toLocaleString("es-AR")}.</p>

      {resultado.agua_habitual && (
        <div className="habitual">
          <p>
            De ese agua nueva, <strong className="cifra">{formatearHectareas(resultado.agua_habitual.area_agua_nueva_inusual_ha)}</strong>{" "}
            están donde normalmente no hay agua, y{" "}
            <span className="cifra">{formatearHectareas(resultado.agua_habitual.area_agua_nueva_habitual_ha)}</span>{" "}
            donde el agua suele estar (el río o lagunas que vuelven a su lugar).
          </p>
          <p className="ayuda">
            Agua de siempre: píxeles con agua al menos el {resultado.agua_habitual.umbral_pct} % del tiempo entre{" "}
            {resultado.agua_habitual.periodo.replace("-", " y ")} ({resultado.agua_habitual.fuente},{" "}
            {resultado.agua_habitual.resolucion_original_m} m). {resultado.agua_habitual.nota}
          </p>
        </div>
      )}

      <Confianza confianza={resultado.confianza} />
      {(resultado.avisos ?? []).map((aviso) => (
        <p key={aviso} className="aviso aviso-indicio" role="note">{aviso}</p>
      ))}
      <Radar radar={resultado.radar} />
      <Infraestructura infraestructura={resultado.infraestructura} />

      <table className="comparacion" aria-label="Escenas comparadas">
        <thead>
          <tr>
            <td />
            <th scope="col">Antes</th>
            <th scope="col">Después</th>
          </tr>
        </thead>
        <tbody>
          {filas.map(([nombre, va, vb]) => (
            <tr key={nombre}>
              <th scope="row">{nombre}</th>
              <td>{va}</td>
              <td>{vb}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="fuente">{n.fuente}</p>
      {resultado.region && <p className="fuente">Otras escalas: {resultado.region.fuente}</p>}
      {lluvia && (
        <p className="fuente">
          Lluvia: {lluvia.fuente} · <strong>{lluvia.categoria}</strong>. {lluvia.nota}
          {lluvia.entre_fechas_mm != null && ` Entre las dos fechas: ${formatearMilimetros(lluvia.entre_fechas_mm)}.`}
        </p>
      )}

      <p className="aviso aviso-indicio">{resultado.advertencia}</p>
    </section>
  );
}
