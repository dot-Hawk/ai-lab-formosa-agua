import { useEffect, useState } from "react";
import EnVivo from "./components/EnVivo.jsx";
import EscalaHidrometrica from "./components/EscalaHidrometrica.jsx";
import FormularioConsulta from "./components/FormularioConsulta.jsx";
import Lectura from "./components/Lectura.jsx";
import MapaCambios from "./components/MapaCambios.jsx";
import VistaRio from "./components/VistaRio.jsx";
import { comparar, listarEscenas } from "./lib/api.js";
import { VISTAS, vistaDesdeHash } from "./lib/envivo.js";
import { ESTACION_FORMOSA } from "./lib/estacion.js";

const LEYENDA_PROTOTIPO = "PROTOTIPO · AI LAB Misión: Código Formosa · no es una herramienta oficial";

function useVista() {
  const [vista, setVista] = useState(() => vistaDesdeHash(window.location.hash));
  useEffect(() => {
    const alCambiar = () => setVista(vistaDesdeHash(window.location.hash));
    window.addEventListener("hashchange", alCambiar);
    return () => window.removeEventListener("hashchange", alCambiar);
  }, []);
  return vista;
}

function Reloj() {
  const [ahora, setAhora] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setAhora(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <time className="reloj cifra" dateTime={ahora.toISOString()}>
      {ahora.toISOString().slice(11, 19)} <span>UTC</span>
    </time>
  );
}

function VistaComparar({ escenas, errorCarga, resultado, comparando, errorComparar, onComparar }) {
  const umbrales = resultado?.nivel_rio.umbrales ?? ESTACION_FORMOSA.umbrales;
  const lecturas = resultado
    ? [
        { etiqueta: "Antes", fecha: resultado.nivel_rio.fecha_a, altura: resultado.nivel_rio.altura_a },
        { etiqueta: "Después", fecha: resultado.nivel_rio.fecha_b, altura: resultado.nivel_rio.altura_b },
      ]
    : [];

  return (
    <div className="comparar">
      <aside className="panel panel-consulta">
        <section aria-labelledby="consulta-titulo">
          <h2 id="consulta-titulo">Fechas a comparar</h2>
          {errorCarga && <p className="aviso aviso-error" role="alert">{errorCarga}</p>}
          {!errorCarga && escenas === null && <p className="estado-carga" role="status">Cargando escenas…</p>}
          {escenas && escenas.length < 2 && (
            <p className="aviso" role="status">El catálogo necesita al menos dos escenas para comparar.</p>
          )}
          {escenas && escenas.length >= 2 && (
            <FormularioConsulta escenas={escenas} cargando={comparando} onComparar={onComparar} />
          )}
          {errorComparar && <p className="aviso aviso-error" role="alert">{errorComparar}</p>}
        </section>
        {resultado && <Lectura resultado={resultado} />}
      </aside>

      <MapaCambios resultado={resultado} />

      <aside className="panel panel-escala">
        <EscalaHidrometrica estacion={ESTACION_FORMOSA.nombre} umbrales={umbrales} lecturas={lecturas} />
      </aside>
    </div>
  );
}

export default function App() {
  const vista = useVista();
  const [escenas, setEscenas] = useState(null); // null = cargando
  const [errorCarga, setErrorCarga] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [comparando, setComparando] = useState(false);
  const [errorComparar, setErrorComparar] = useState(null);

  useEffect(() => {
    listarEscenas().then(setEscenas, (err) => setErrorCarga(err.message));
  }, []);

  async function alComparar({ escenaA, escenaB, umbral }) {
    setComparando(true);
    setErrorComparar(null);
    try {
      setResultado(await comparar(escenaA, escenaB, umbral));
    } catch (err) {
      setErrorComparar(err.message);
    } finally {
      setComparando(false);
    }
  }

  return (
    <div className="app">
      <header className="barra">
        <a className="marca" href="#/">
          <span className="marca-simbolo" aria-hidden="true" />
          <span className="marca-nombre">Operación Agua</span>
          <span className="marca-lugar">Formosa</span>
        </a>
        <nav className="navegacion" aria-label="Vistas">
          {VISTAS.map((v) => (
            <a key={v.id} href={`#/${v.id === "envivo" ? "" : v.id}`} aria-current={vista === v.id ? "page" : undefined}>
              {v.nombre}
            </a>
          ))}
        </nav>
        <Reloj />
      </header>

      <main className={`vista vista-${vista}`}>
        {vista === "envivo" && <EnVivo onIrAComparar={() => { window.location.hash = "#/comparar"; }} />}
        {vista === "comparar" && (
          <VistaComparar
            escenas={escenas}
            errorCarga={errorCarga}
            resultado={resultado}
            comparando={comparando}
            errorComparar={errorComparar}
            onComparar={alComparar}
          />
        )}
        {vista === "rio" && <VistaRio />}
      </main>

      <footer className="pie">
        <span>{LEYENDA_PROTOTIPO}</span>
        <span>Equipo 1 · Instituto Politécnico Formosa</span>
      </footer>
    </div>
  );
}
