import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import { CircleMarker, ImageOverlay, MapContainer, Polyline, Rectangle, TileLayer, Tooltip, useMap } from "react-leaflet";
import { formatearFecha } from "../lib/vista.js";

const CENTRO_FORMOSA = [-26.183, -58.183]; // Puerto Formosa (K3)

function Encuadre({ bounds }) {
  const mapa = useMap();
  useEffect(() => {
    if (bounds) mapa.fitBounds(bounds, { padding: [32, 32] });
  }, [mapa, bounds]);
  return null;
}

/** Longitud de la línea divisoria. En Web Mercator la longitud es lineal en x, igual que la imagen. */
export function longitudDeCorte(bounds, corte) {
  const [[, oeste], [, este]] = bounds;
  return oeste + (este - oeste) * (corte / 100);
}

const recorte = (corte) => `inset(0 0 0 ${corte}%)`;

/** Establecimientos a marcar en el mapa: los cercanos al agua nueva, si el usuario quiere verlos. */
export function marcadores(resultado, visibles) {
  return visibles ? (resultado?.infraestructura?.establecimientos ?? []) : [];
}

/** Imagen de la fecha "después" recortada desde la izquierda: deja ver la de "antes" debajo. */
function ImagenRecortada({ url, bounds, corte }) {
  const capa = useRef(null);
  useEffect(() => {
    const el = capa.current?.getElement();
    if (el) el.style.clipPath = recorte(corte);
  });
  return (
    <ImageOverlay
      ref={capa}
      url={url}
      bounds={bounds}
      opacity={1}
      eventHandlers={{ load: (e) => { e.target.getElement().style.clipPath = recorte(corte); } }}
    />
  );
}

export default function MapaCambios({ resultado }) {
  const [visible, setVisible] = useState(true);
  const [opacidad, setOpacidad] = useState(0.8);
  const [soloInusual, setSoloInusual] = useState(false);
  const [verSiempre, setVerSiempre] = useState(false);
  const [modo, setModo] = useState("cambios");
  const [corte, setCorte] = useState(50);
  const [verInfra, setVerInfra] = useState(true);

  const simulado = resultado && [resultado.escena_a, resultado.escena_b].some((e) => e.categoria === "Simulado");
  const habitual = resultado?.agua_habitual ?? null;
  const capa = habitual && soloInusual ? habitual.overlay_inusual_png : resultado?.overlay_png;
  const hayDeslizador = Boolean(resultado?.agua_a_png && resultado?.agua_b_png);
  const hayRadar = Boolean(resultado?.radar?.usado);
  const deslizador = hayDeslizador && modo === "deslizador";
  const radar = hayRadar && modo === "radar";
  const lonCorte = resultado ? longitudDeCorte(resultado.bounds, corte) : null;

  return (
    <div className="mapa">
      <MapContainer center={CENTRO_FORMOSA} zoom={13} scrollWheelZoom className="mapa-lienzo">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap. Mapa de fondo de referencia"
        />
        {resultado && (
          <>
            <Rectangle bounds={resultado.bounds} pathOptions={{ className: "marco-escena", fill: false }} />
            {!deslizador && !radar && habitual && verSiempre && (
              <ImageOverlay url={habitual.agua_de_siempre_png} bounds={resultado.bounds} opacity={0.9} />
            )}
            {!deslizador && !radar && visible && (
              <ImageOverlay key={capa} url={capa} bounds={resultado.bounds} opacity={opacidad} />
            )}
            {radar && visible && (
              <ImageOverlay key={resultado.radar.overlay_png} url={resultado.radar.overlay_png} bounds={resultado.bounds} opacity={opacidad} />
            )}
            {deslizador && (
              <>
                <ImageOverlay key={resultado.agua_a_png} url={resultado.agua_a_png} bounds={resultado.bounds} opacity={1} />
                <ImagenRecortada key={resultado.agua_b_png} url={resultado.agua_b_png} bounds={resultado.bounds} corte={corte} />
                <Polyline
                  positions={[[resultado.bounds[0][0], lonCorte], [resultado.bounds[1][0], lonCorte]]}
                  pathOptions={{ className: "linea-corte", weight: 3 }}
                />
              </>
            )}
            {marcadores(resultado, verInfra).map((e) => (
              <CircleMarker key={`${e.tipo}-${e.nombre}-${e.lat}`} center={[e.lat, e.lon]} radius={7}
                pathOptions={{ className: `marcador marcador-${e.tipo}` }}>
                <Tooltip>{e.nombre}{e.en_agua ? " (dentro del agua)" : ""}</Tooltip>
              </CircleMarker>
            ))}
            <Encuadre bounds={resultado.bounds} />
          </>
        )}
      </MapContainer>

      <div className="mapa-leyenda">
        {(hayDeslizador || hayRadar) && (
          <div className="modos" role="radiogroup" aria-label="Vista del mapa">
            <label>
              <input type="radio" name="modo" value="cambios" checked={modo === "cambios"} onChange={() => setModo("cambios")} />
              Cambios
            </label>
            {hayDeslizador && (
              <label>
                <input type="radio" name="modo" value="deslizador" checked={modo === "deslizador"}
                  onChange={() => setModo("deslizador")} />
                Antes / después
              </label>
            )}
            {hayRadar && (
              <label>
                <input type="radio" name="modo" value="radar" checked={modo === "radar"} onChange={() => setModo("radar")} />
                Radar
              </label>
            )}
          </div>
        )}

        {deslizador ? (
          <>
            <p className="leyenda-titulo">Agua en cada fecha</p>
            <ul>
              <li>
                <span className="muestra muestra-nueva" aria-hidden="true" /> Agua (NDWI mayor que{" "}
                {resultado.umbral_agua.toLocaleString("es-AR")})
              </li>
              <li><span className="muestra muestra-sin-dato" aria-hidden="true" /> Sin dato (nube o borde)</li>
            </ul>
            <label className="corte">
              <span className="corte-fechas">
                <span>Antes ({formatearFecha(resultado.escena_a.fecha)})</span>
                <span>Después ({formatearFecha(resultado.escena_b.fecha)})</span>
              </span>
              <input type="range" min="0" max="100" step="1" value={corte} aria-label="Posición del deslizador"
                onChange={(e) => setCorte(Number(e.target.value))} />
            </label>
          </>
        ) : (
          <>
            <p className="leyenda-titulo">
              {radar ? `Cambio de agua según radar (${formatearFecha(resultado.radar.pasada_a.fecha)} → ${formatearFecha(resultado.radar.pasada_b.fecha)})` : "Cambio de superficie de agua"}
            </p>
            <ul>
              <li><span className="muestra muestra-nueva" aria-hidden="true" /> Agua nueva</li>
              <li><span className="muestra muestra-perdida" aria-hidden="true" /> Agua que ya no está</li>
              {habitual && verSiempre && (
                <li><span className="muestra muestra-siempre" aria-hidden="true" /> Agua de siempre ({habitual.periodo})</li>
              )}
              <li><span className="muestra muestra-marco" aria-hidden="true" /> Área de la escena</li>
            </ul>
            {resultado ? (
              <div className="leyenda-controles">
                <label>
                  <input type="checkbox" checked={visible} onChange={(e) => setVisible(e.target.checked)} />
                  Mostrar cambios
                </label>
                {habitual && !radar && (
                  <>
                    <label>
                      <input type="checkbox" checked={soloInusual} disabled={!visible}
                        onChange={(e) => setSoloInusual(e.target.checked)} />
                      Solo agua nueva donde normalmente no hay
                    </label>
                    <label>
                      <input type="checkbox" checked={verSiempre} onChange={(e) => setVerSiempre(e.target.checked)} />
                      Ver agua de siempre
                    </label>
                  </>
                )}
                {resultado.infraestructura?.establecimientos?.length > 0 && (
                  <label>
                    <input type="checkbox" checked={verInfra} onChange={(e) => setVerInfra(e.target.checked)} />
                    Establecimientos cerca del agua nueva
                  </label>
                )}
                <label>
                  Opacidad
                  <input type="range" min="0" max="1" step="0.05" value={opacidad}
                    onChange={(e) => setOpacidad(Number(e.target.value))} disabled={!visible} />
                </label>
              </div>
            ) : (
              <p className="ayuda">Elegí dos fechas y compará para ver los cambios.</p>
            )}
          </>
        )}
        {simulado && <p className="leyenda-simulado">Imágenes simuladas, no son capturas reales.</p>}
      </div>
    </div>
  );
}
