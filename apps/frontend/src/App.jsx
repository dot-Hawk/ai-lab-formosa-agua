import { useEffect, useState } from "react";
import EscalaHidrometrica from "./components/EscalaHidrometrica.jsx";
import FormularioConsulta from "./components/FormularioConsulta.jsx";
import Lectura from "./components/Lectura.jsx";
import MapaCambios from "./components/MapaCambios.jsx";
import { comparar, listarEscenas, listarZonas, verProvincia } from "./lib/api.js";
import { ESTACION_FORMOSA } from "./lib/estacion.js";

const LEYENDA_PROTOTIPO = "PROTOTIPO · AI LAB Misión: Código Formosa · no es una herramienta oficial";

export default function App() {
  const [escenas, setEscenas] = useState(null); // null = cargando
  const [errorCarga, setErrorCarga] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [comparando, setComparando] = useState(false);
  const [errorComparar, setErrorComparar] = useState(null);
  const [zonas, setZonas] = useState([]);
  const [provincia, setProvincia] = useState(null);
  const [zonaActual, setZonaActual] = useState(null);

  useEffect(() => {
    listarEscenas().then(setEscenas, (err) => setErrorCarga(err.message));
    // Zonas y vista provincial son complementos: si fallan, la herramienta sigue funcionando
    listarZonas().then(setZonas, () => setZonas([]));
    verProvincia().then(setProvincia, () => setProvincia(null));
  }, []);

  function alCambiarZona(id) {
    setZonaActual(id);
    setResultado(null);
    setErrorComparar(null);
  }

  async function alComparar({ escenaA, escenaB, umbral, indice }) {
    setComparando(true);
    setErrorComparar(null);
    try {
      setResultado(await comparar(escenaA, escenaB, umbral, indice));
    } catch (err) {
      setErrorComparar(err.message);
    } finally {
      setComparando(false);
    }
  }

  const nivel = resultado?.nivel_rio ?? null;
  const escalaFormosa = !resultado || (nivel && /FORMOSA/i.test(nivel.estacion));
  const umbrales = nivel?.umbrales ?? ESTACION_FORMOSA.umbrales;
  const lecturas = resultado && nivel
    ? [
        { etiqueta: "Antes", fecha: resultado.nivel_rio.fecha_a, altura: resultado.nivel_rio.altura_a },
        { etiqueta: "Después", fecha: resultado.nivel_rio.fecha_b, altura: resultado.nivel_rio.altura_b },
      ]
    : [];

  return (
    <div className="app">
      <p className="prototipo">{LEYENDA_PROTOTIPO}</p>

      <header className="cabecera">
        <h1>Comparador de imágenes satelitales</h1>
        <p>
          Cambios en la superficie de agua del territorio formoseño, a partir de imágenes Sentinel-2.
          Operación Agua, Equipo 1, Instituto Politécnico Formosa.
        </p>
      </header>

      <main className="tablero">
        <aside className="panel">
          <section aria-labelledby="consulta-titulo">
            <h2 id="consulta-titulo">Fechas a comparar</h2>
            {errorCarga && <p className="aviso aviso-error" role="alert">{errorCarga}</p>}
            {!errorCarga && escenas === null && <p className="ayuda" role="status">Cargando imágenes disponibles…</p>}
            {escenas && escenas.length < 2 && (
              <p className="aviso" role="status">
                El catálogo necesita al menos dos escenas para comparar. Cargá más imágenes en el backend.
              </p>
            )}
            {escenas && escenas.length >= 2 && (
              <FormularioConsulta escenas={escenas} zonas={zonas} cargando={comparando} onComparar={alComparar}
                onZona={alCambiarZona} />
            )}
            {errorComparar && <p className="aviso aviso-error" role="alert">{errorComparar}</p>}
          </section>

          {resultado && <Lectura resultado={resultado} />}
        </aside>

        <MapaCambios resultado={resultado} provincia={provincia} zonas={zonas}
          zonaActual={zonaActual} />

        <aside className="panel panel-escala">
          {escalaFormosa ? (
            <EscalaHidrometrica estacion={ESTACION_FORMOSA.nombre} umbrales={umbrales} lecturas={lecturas} />
          ) : (
            <section className="sin-escala" aria-labelledby="sin-escala-titulo">
              <h2 id="sin-escala-titulo">Río en la zona</h2>
              {nivel ? (
                <p className="ayuda">
                  Esta zona usa la escala de {nivel.estacion}: su altura y sus umbrales están en la tabla de resultados.
                </p>
              ) : (
                <p className="ayuda">
                  Esta zona no tiene una escala hidrométrica del INA cercana. La escala de Puerto Formosa no
                  representa lo que pasa acá.
                </p>
              )}
            </section>
          )}
        </aside>
      </main>
    </div>
  );
}
