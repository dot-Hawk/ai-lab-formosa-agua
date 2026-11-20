import { estadoNivel, formatearFecha, formatearHectareas, formatearMetros } from "../lib/vista.js";

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
    ["Satélite", a.satelite, b.satelite],
    ["Producto", a.producto, b.producto],
    ["Resolución", `${a.resolucion_m} m`, `${b.resolucion_m} m`],
    ["Cobertura de nubes", `${a.nubes_pct} %`, `${b.nubes_pct} %`],
    ["Fuente", a.fuente, b.fuente],
    ["Categoría", <Categoria valor={a.categoria} />, <Categoria valor={b.categoria} />],
    [
      `Río en ${n.estacion.replace(/^FORMOSA \((.*)\)$/, "$1")}`,
      <Nivel altura={n.altura_a} umbrales={n.umbrales} />,
      <Nivel altura={n.altura_b} umbrales={n.umbrales} />,
    ],
  ];

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

      <p className="aviso aviso-indicio">{resultado.advertencia}</p>
    </section>
  );
}
