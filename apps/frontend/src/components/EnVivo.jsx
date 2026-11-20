import { useCallback, useEffect, useState } from "react";

const ESPERA_MAXIMA_MS = 12_000; // si algún cuadro no carga, se anima igual con los que hay
import { obtenerRio } from "../lib/api.js";
import {
  CAPAS,
  expandirDominio,
  formatearUtc,
  framesRadar,
  URL_RADAR,
  urlDominio,
  urlTeselaGibs,
} from "../lib/envivo.js";
import { ultimaLectura } from "../lib/grafico.js";
import MapaEnVivo from "./MapaEnVivo.jsx";

const VELOCIDAD_MS = 650;

const prefiereMenosMovimiento = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

async function cargarFrames(capa) {
  if (capa.id === "radar") {
    const r = await fetch(URL_RADAR);
    if (!r.ok) throw new Error("RainViewer no respondió. Probá de nuevo en unos minutos.");
    return framesRadar(await r.json());
  }
  const r = await fetch(urlDominio(capa));
  if (!r.ok) throw new Error("NASA GIBS no respondió. Probá de nuevo en unos minutos.");
  const tiempos = expandirDominio(await r.text()).slice(-capa.cuadros);
  return tiempos.map((tiempo) => ({ tiempo, url: urlTeselaGibs(capa, tiempo) }));
}

function minutosDesde(tiempo) {
  const min = Math.round((Date.now() - Date.parse(tiempo)) / 60e3);
  return min < 90 ? `hace ${min} min` : `hace ${Math.round(min / 60)} h`;
}

export default function EnVivo({ reproducirAlInicio = true, onIrAComparar }) {
  const [capaId, setCapaId] = useState("color");
  const [frames, setFrames] = useState([]);
  const [indice, setIndice] = useState(0);
  const [reproduciendo, setReproduciendo] = useState(reproducirAlInicio && !prefiereMenosMovimiento());
  const [opacidad, setOpacidad] = useState(0.85);
  const [estado, setEstado] = useState("cargando");
  const [error, setError] = useState(null);
  const [cursor, setCursor] = useState(null);
  const [estaciones, setEstaciones] = useState([]);
  const [cargados, setCargados] = useState(() => new Set());
  const [esperaCumplida, setEsperaCumplida] = useState(false);
  const capa = CAPAS[capaId];

  const cargar = useCallback(async () => {
    setEstado("cargando");
    setError(null);
    try {
      const nuevos = await cargarFrames(CAPAS[capaId]);
      setCargados(new Set());
      setEsperaCumplida(false);
      setFrames(nuevos);
      setIndice(Math.max(0, nuevos.length - 1));
      setEstado(nuevos.length ? "listo" : "vacio");
    } catch (err) {
      setFrames([]);
      setError(err.message);
      setEstado("error");
    }
  }, [capaId]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  // Últimas alturas observadas del río (hasta la fecha de corte del kit)
  useEffect(() => {
    obtenerRio("2026-10-01")
      .then(({ estaciones: lista }) => setEstaciones(lista.map((e) => ({ ...e, ultima: ultimaLectura(e.serie) }))))
      .catch(() => setEstaciones([]));
  }, []);

  const alCargar = useCallback((url) => setCargados((c) => (c.has(url) ? c : new Set(c).add(url))), []);
  // Carga progresiva: primero el cuadro más reciente, después los anteriores de a dos.
  const montados = frames
    .map((f, i) => ({ ...f, i }))
    .slice(Math.max(0, frames.length - 1 - 2 * cargados.size));
  const todosCargados = esperaCumplida || (frames.length > 0 && frames.every((f) => cargados.has(f.url)));

  useEffect(() => {
    if (!frames.length) return undefined;
    const id = setTimeout(() => setEsperaCumplida(true), ESPERA_MAXIMA_MS);
    return () => clearTimeout(id);
  }, [frames]);

  useEffect(() => {
    if (!reproduciendo || !todosCargados || frames.length < 2) return undefined;
    const id = setInterval(() => setIndice((i) => (i + 1) % frames.length), VELOCIDAD_MS);
    return () => clearInterval(id);
  }, [reproduciendo, todosCargados, frames.length]);

  const actual = frames[indice];

  return (
    <div className="envivo">
      <MapaEnVivo
        frames={montados}
        indice={indice}
        opacidad={opacidad}
        zoomNativo={capa.zoomNativo}
        mezcla={capa.mezcla}
        onCargado={alCargar}
        estaciones={estaciones}
        onCursor={setCursor}
        onZona={onIrAComparar}
      />

      <aside className="flotante panel-capas" aria-label="Capas">
        <ul className="lista-capas">
          {Object.entries(CAPAS).map(([id, c]) => (
            <li key={id}>
              <button type="button" className="boton-capa" aria-pressed={id === capaId} onClick={() => setCapaId(id)}>
                <span className="boton-capa-nombre">{c.nombre}</span>
                <span className="boton-capa-detalle">{c.detalle}</span>
              </button>
            </li>
          ))}
        </ul>
        {capa.escala && (
          <div className="escala-color">
            <span className={`escala-barra ${capa.escala.clase}`} aria-hidden="true" />
            <span className="escala-extremos">
              <span>{capa.escala.desde}</span>
              <span>{capa.escala.hasta}</span>
            </span>
          </div>
        )}
        <label className="control-opacidad">
          <span>Opacidad</span>
          <input type="range" min="0.2" max="1" step="0.05" value={opacidad}
            onChange={(e) => setOpacidad(Number(e.target.value))} />
        </label>
        <p className="fuente-capa">{capa.fuente}</p>
      </aside>

      <div className="flotante linea-tiempo">
        {estado === "error" && (
          <div className="linea-tiempo-error" role="alert">
            <span>{error}</span>
            <button type="button" className="boton-texto" onClick={cargar}>Reintentar</button>
          </div>
        )}
        {estado === "cargando" && <span className="linea-tiempo-estado" role="status">Cargando imágenes…</span>}
        {estado === "vacio" && <span className="linea-tiempo-estado" role="status">Sin imágenes recientes para esta capa.</span>}
        {estado === "listo" && actual && (
          <>
            <button type="button" className="boton-reproducir" onClick={() => setReproduciendo((r) => !r)}
              aria-label={reproduciendo ? "Pausar" : "Reproducir"}>
              <span className={reproduciendo ? "icono-pausa" : "icono-play"} aria-hidden="true" />
            </button>
            <div className="linea-tiempo-pista">
              <input type="range" min="0" max={frames.length - 1} value={indice} aria-label="Instante"
                onChange={(e) => { setReproduciendo(false); setIndice(Number(e.target.value)); }} />
              <ol className="marcas-tiempo" aria-hidden="true">
                {frames.map((f, i) => <li key={f.tiempo} className={i === indice ? "activa" : ""} />)}
              </ol>
            </div>
            <div className="linea-tiempo-hora">
              <span className="cifra hora-actual">{formatearUtc(actual.tiempo)}</span>
              <span className="hora-relativa">
                {todosCargados ? (
                  <>
                    {indice === frames.length - 1 && <span className="punto-vivo" aria-hidden="true" />}
                    {minutosDesde(actual.tiempo)}
                  </>
                ) : (
                  <span role="status">{`Cargando ${frames.filter((f) => cargados.has(f.url)).length}/${frames.length}`}</span>
                )}
              </span>
            </div>
          </>
        )}
      </div>

      {cursor && (
        <p className="flotante lectura-cursor cifra" aria-hidden="true">
          {Math.abs(cursor.lat).toFixed(3)}° S · {Math.abs(cursor.lng).toFixed(3)}° O
        </p>
      )}
    </div>
  );
}
