import { formatearHectareas } from "../lib/vista.js";

const NOMBRE_TIPO = { educacion: "Educación", salud: "Salud" };

const kilometros = (v) => `${v.toLocaleString("es-AR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} km`;

/** Establecimientos y rutas del IGN cerca del agua nueva inusual. */
export default function Infraestructura({ infraestructura: inf }) {
  if (!inf) return null;
  const metros = inf.radio_m.toLocaleString("es-AR");
  const tipos = Object.keys(inf.conteo);

  return (
    <section className="infraestructura" aria-labelledby="infra-titulo">
      <h3 id="infra-titulo">Infraestructura cerca del agua nueva</h3>
      <p className="ayuda">
        Referencia: {inf.referencia} ({formatearHectareas(inf.referencia_ha)}). Distancia: {metros} m.
      </p>

      <table className="comparacion" aria-label="Establecimientos expuestos">
        <thead>
          <tr>
            <td />
            <th scope="col">En la zona</th>
            <th scope="col">A menos de {metros} m</th>
            <th scope="col">Dentro del agua</th>
          </tr>
        </thead>
        <tbody>
          {tipos.map((t) => (
            <tr key={t}>
              <th scope="row">{NOMBRE_TIPO[t] ?? t}</th>
              <td>{inf.conteo[t].en_zona}</td>
              <td><strong>{inf.conteo[t].cerca}</strong></td>
              <td>{inf.conteo[t].en_agua}</td>
            </tr>
          ))}
          <tr>
            <th scope="row">Rutas y caminos</th>
            <td>{inf.rutas.tramos_en_zona} {inf.rutas.tramos_en_zona === 1 ? "tramo" : "tramos"}</td>
            <td>{kilometros(inf.rutas.km_cerca)}</td>
            <td>{kilometros(inf.rutas.km_en_agua)}</td>
          </tr>
        </tbody>
      </table>

      {inf.establecimientos.length > 0 ? (
        <ul className="lista-establecimientos">
          {inf.establecimientos.map((e) => (
            <li key={`${e.tipo}-${e.nombre}-${e.lat}`}>
              <span className={`punto punto-${e.tipo}`} aria-hidden="true" />
              <span>
                {e.nombre} <span className="ayuda">({NOMBRE_TIPO[e.tipo] ?? e.tipo}{e.en_agua ? ", dentro del agua" : ""})</span>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="ayuda">Ningún establecimiento a menos de {metros} m del agua nueva.</p>
      )}

      <p className="fuente">
        Fuente: {inf.fuente} · {inf.categoria} · consultado el {inf.consultado.split("-").reverse().join("/")}. {inf.nota}
      </p>
    </section>
  );
}
