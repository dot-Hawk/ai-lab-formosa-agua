import { useEffect, useMemo, useState } from "react";
import { obtenerRio } from "../lib/api.js";
import { MAXIMO_HISTORICO } from "../lib/estacion.js";
import { ultimaLectura } from "../lib/grafico.js";
import { estadoNivel, formatearFecha, formatearMetros } from "../lib/vista.js";
import EscalaHidrometrica from "./EscalaHidrometrica.jsx";
import GraficoNivel from "./GraficoNivel.jsx";

const PERIODOS = [
  { id: "6m", nombre: "6 meses", dias: 183 },
  { id: "1a", nombre: "1 año", dias: 365 },
  { id: "3a", nombre: "3 años", dias: 1095 },
  { id: "todo", nombre: "Todo", dias: null },
];

function recortar(serie, dias) {
  if (!dias || !serie.length) return serie;
  const fin = Date.parse(serie[serie.length - 1][0]);
  const desde = new Date(fin - dias * 86_400_000).toISOString().slice(0, 10);
  return serie.filter(([f]) => f >= desde);
}

// sin nivel de aguas bajas informado, no se marca "aguas bajas"
const umbralesParaEstado = (u) => ({ ...u, aguas_bajas: u.aguas_bajas ?? -Infinity });

export default function VistaRio() {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState(null);
  const [elegida, setElegida] = useState("Puerto Formosa");
  const [periodo, setPeriodo] = useState("1a");

  useEffect(() => {
    obtenerRio().then(setDatos, (err) => setError(err.message || "No se pudo cargar la serie del río."));
  }, []);

  const estacion = datos?.estaciones.find((e) => e.nombre === elegida) ?? datos?.estaciones[0];
  const serie = useMemo(
    () => (estacion ? recortar(estacion.serie, PERIODOS.find((p) => p.id === periodo).dias) : []),
    [estacion, periodo],
  );

  if (error) return <div className="vista-centrada"><p className="aviso aviso-error" role="alert">{error}</p></div>;
  if (!datos) return <div className="vista-centrada"><p className="estado-carga" role="status">Cargando el río…</p></div>;

  const ultima = ultimaLectura(estacion.serie);

  return (
    <div className="rio">
      <nav className="rio-estaciones" aria-label="Escalas del río Paraguay">
        {datos.estaciones.map((e) => {
          const u = ultimaLectura(e.serie);
          const estado = u ? estadoNivel(u.altura, umbralesParaEstado(e.umbrales)) : null;
          return (
            <button key={e.nombre} type="button" className="tarjeta-estacion" aria-pressed={e.nombre === estacion.nombre}
              onClick={() => setElegida(e.nombre)}>
              <span className="tarjeta-nombre">{e.nombre}</span>
              <span className="tarjeta-altura cifra">{u ? formatearMetros(u.altura) : "sin dato"}</span>
              {estado && <span className={`nivel nivel-${estado.clase}`}>{estado.texto.split(" · ")[0]}</span>}
              {u && <span className="tarjeta-fecha">{formatearFecha(u.fecha)}</span>}
            </button>
          );
        })}
      </nav>

      <section className="rio-grafico" aria-labelledby="rio-titulo">
        <header className="rio-cabecera">
          <h2 id="rio-titulo">{estacion.nombre}</h2>
          <div className="selector-periodo" role="group" aria-label="Período">
            {PERIODOS.map((p) => (
              <button key={p.id} type="button" aria-pressed={p.id === periodo} onClick={() => setPeriodo(p.id)}>
                {p.nombre}
              </button>
            ))}
          </div>
        </header>
        <GraficoNivel estacion={estacion.nombre} serie={serie} umbrales={estacion.umbrales} />
        <p className="fuente">{estacion.fuente}. Altura diaria en metros; los huecos son días sin medición.</p>
      </section>

      <aside className="rio-escala">
        <EscalaHidrometrica
          estacion={estacion.nombre}
          umbrales={estacion.umbrales}
          lecturas={ultima ? [{ etiqueta: formatearFecha(ultima.fecha).slice(0, 5), fecha: ultima.fecha, altura: ultima.altura }] : []}
          maximo={estacion.nombre === "Puerto Formosa" ? MAXIMO_HISTORICO : null}
        />
      </aside>
    </div>
  );
}
