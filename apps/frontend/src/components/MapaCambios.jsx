import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { ImageOverlay, MapContainer, Rectangle, TileLayer, useMap } from "react-leaflet";

const CENTRO_FORMOSA = [-26.183, -58.183]; // Puerto Formosa (K3)

function Encuadre({ bounds }) {
  const mapa = useMap();
  useEffect(() => {
    if (bounds) mapa.fitBounds(bounds, { padding: [32, 32] });
  }, [mapa, bounds]);
  return null;
}

export default function MapaCambios({ resultado }) {
  const [visible, setVisible] = useState(true);
  const [opacidad, setOpacidad] = useState(0.8);
  const [soloInusual, setSoloInusual] = useState(false);
  const [verSiempre, setVerSiempre] = useState(false);
  const simulado = resultado && [resultado.escena_a, resultado.escena_b].some((e) => e.categoria === "Simulado");
  const habitual = resultado?.agua_habitual ?? null;
  const capa = habitual && soloInusual ? habitual.overlay_inusual_png : resultado?.overlay_png;

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
            {habitual && verSiempre && (
              <ImageOverlay url={habitual.agua_de_siempre_png} bounds={resultado.bounds} opacity={0.9} />
            )}
            {visible && <ImageOverlay key={capa} url={capa} bounds={resultado.bounds} opacity={opacidad} />}
            <Encuadre bounds={resultado.bounds} />
          </>
        )}
      </MapContainer>

      <div className="mapa-leyenda">
        <p className="leyenda-titulo">Cambio de superficie de agua</p>
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
            {habitual && (
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
            <label>
              Opacidad
              <input type="range" min="0" max="1" step="0.05" value={opacidad}
                onChange={(e) => setOpacidad(Number(e.target.value))} disabled={!visible} />
            </label>
          </div>
        ) : (
          <p className="ayuda">Elegí dos fechas y compará para ver los cambios.</p>
        )}
        {simulado && <p className="leyenda-simulado">Imágenes simuladas, no son capturas reales.</p>}
      </div>
    </div>
  );
}
