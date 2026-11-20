import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { CircleMarker, MapContainer, Rectangle, TileLayer, Tooltip, useMap, useMapEvents } from "react-leaflet";
import { GIBS } from "../lib/envivo.js";
import { ZONA_ESTUDIO } from "../lib/estacion.js";
import { formatearMetros } from "../lib/vista.js";

const CENTRO = [-25.6, -59.6]; // provincia de Formosa y el NEA
const FONDO = `${GIBS}/VIIRS_Black_Marble/default/2016-01-01/GoogleMapsCompatible_Level8/{z}/{y}/{x}.png`;
// Las capas Reference_Features_15m y Reference_Labels_15m de GIBS no se usan: en varias
// teselas vienen negras y opacas y tapan las imágenes.
const ATRIBUCION = "NASA GIBS · NOAA GOES-East · NASA GPM · RainViewer";

/** Leaflet calcula las teselas con el tamaño inicial del contenedor: se lo recalcula si cambia. */
function AjustarTamano() {
  const mapa = useMap();
  useEffect(() => {
    const contenedor = mapa.getContainer();
    const observador = new ResizeObserver(() => mapa.invalidateSize());
    observador.observe(contenedor);
    mapa.invalidateSize();
    return () => observador.disconnect();
  }, [mapa]);
  return null;
}

function Cursor({ onCursor }) {
  useMapEvents({
    mousemove: (e) => onCursor(e.latlng),
    mouseout: () => onCursor(null),
  });
  return null;
}

/**
 * Cada cuadro de la animación es una capa propia: todas quedan cargadas y solo cambia la
 * opacidad, así la reproducción no espera a que bajen las teselas.
 */
export default function MapaEnVivo({ frames, indice, opacidad, zoomNativo, mezcla, estaciones, onCursor, onZona, onCargado }) {
  return (
    <MapContainer center={CENTRO} zoom={6} minZoom={4} maxZoom={11} zoomControl={false} className="mapa-envivo"
      attributionControl>
      <TileLayer url={FONDO} maxNativeZoom={8} maxZoom={11} attribution={ATRIBUCION} />
      {frames.map((f, i) => (
        <TileLayer
          key={f.url}
          url={f.url}
          opacity={(f.i ?? i) === indice ? opacidad : 0}
          maxNativeZoom={zoomNativo}
          maxZoom={11}
          className={`capa-cuadro${mezcla ? ` mezcla-${mezcla}` : ""}`}
          zIndex={10}
          eventHandlers={{ load: () => onCargado(f.url) }}
        />
      ))}

      <Rectangle bounds={ZONA_ESTUDIO} pathOptions={{ className: "zona-estudio" }}
        eventHandlers={{ click: onZona }}>
        <Tooltip direction="top">Zona de estudio · Formosa y Alberdi</Tooltip>
      </Rectangle>

      {estaciones.map((e) => (
        <CircleMarker key={e.nombre} center={[e.lat, e.lon]} radius={5} pathOptions={{ className: "punto-estacion" }}>
          <Tooltip permanent direction="right" offset={[8, 0]} className="etiqueta-estacion">
            {e.nombre}
            {e.ultima && <span className="cifra"> {formatearMetros(e.ultima.altura)}</span>}
          </Tooltip>
        </CircleMarker>
      ))}
      <Cursor onCursor={onCursor} />
      <AjustarTamano />
    </MapContainer>
  );
}
