import { formatearFecha, formatearHectareas } from "../lib/vista.js";

/** Resultado de la comparación con radar Sentinel-1, que la API usa cuando hay muchas nubes. */
export default function Radar({ radar }) {
  if (!radar) return null;
  if (!radar.usado) {
    return <p className="aviso" role="note">Radar: {radar.motivo}</p>;
  }
  const { pasada_a: a, pasada_b: b } = radar;

  return (
    <section className="radar" aria-labelledby="radar-titulo">
      <h3 id="radar-titulo">Resultado con radar (Sentinel-1)</h3>
      <p className="ayuda">
        {radar.motivo} El radar ve a través de las nubes. Pasadas del {formatearFecha(a.fecha)} y del{" "}
        {formatearFecha(b.fecha)} ({a.plataforma}, órbita {a.orbita_relativa}, {a.resolucion_m} m).
      </p>
      <dl className="superficies">
        <div className="superficie superficie-nueva">
          <dt>Agua nueva</dt>
          <dd className="cifra">{formatearHectareas(radar.area_agua_nueva_ha)}</dd>
        </div>
        <div className="superficie superficie-perdida">
          <dt>Agua que ya no está</dt>
          <dd className="cifra">{formatearHectareas(radar.area_agua_perdida_ha)}</dd>
        </div>
      </dl>
      <p className="ayuda">
        Agua = retrodispersión VV por debajo de {radar.umbral_db.toLocaleString("es-AR")} dB.{" "}
        {radar.validacion.texto} Coincidencia con el óptico (IoU):{" "}
        {radar.validacion.iou_promedio?.toLocaleString("es-AR")}. {radar.nota}
      </p>
    </section>
  );
}
