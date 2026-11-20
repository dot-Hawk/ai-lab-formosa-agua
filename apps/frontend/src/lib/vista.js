// Lógica de presentación sin DOM ni red: se prueba con `npm test`.

/** Devuelve un mensaje de error para el usuario, o null si la selección es válida. */
export function validarSeleccion(escenaA, escenaB, umbral) {
  if (!escenaA || !escenaB) return "Elegí una fecha \"antes\" y una fecha \"después\".";
  if (escenaA === escenaB) return "Elegí dos escenas distintas para comparar.";
  if (!Number.isFinite(umbral) || umbral < -1 || umbral > 1) return "El umbral NDWI debe estar entre -1 y 1.";
  return null;
}

/** Clasifica una altura de la escala frente a los umbrales del INA (K3). */
export function estadoNivel(altura, umbrales) {
  if (altura == null) return { clase: "sin-dato", texto: "Sin dato (falta la serie K1 limpia)" };
  const ref = " · referencia de la escala, no una decisión";
  if (altura >= umbrales.evacuacion) return { clase: "evacuacion", texto: `Nivel de evacuación${ref}` };
  if (altura >= umbrales.alerta) return { clase: "alerta", texto: `Nivel de alerta${ref}` };
  if (altura <= umbrales.aguas_bajas) return { clase: "aguas-bajas", texto: `Aguas bajas${ref}` };
  return { clase: "normal", texto: `Por debajo del nivel de alerta${ref}` };
}

const numero = (v, decimales) =>
  v.toLocaleString("es-AR", { minimumFractionDigits: decimales, maximumFractionDigits: decimales });

/** 5.6 -> "5,60 m" */
export const formatearMetros = (v) => (v == null ? "sin dato" : `${numero(v, 2)} m`);

/** 1234.5 -> "1.234,5 ha" */
export const formatearHectareas = (v) => `${numero(v, 1)} ha`;

/** "2026-10-01" -> "01/10/2026" (sin pasar por Date para no correr el día por zona horaria) */
export function formatearFecha(iso) {
  const [a, m, d] = String(iso).split("-");
  return `${d}/${m}/${a}`;
}

/** Coordenada vertical (px) de una altura en la escala: 0 m abajo, `max` arriba. */
export function posicionEnEscala(altura, { max, alto }) {
  const recortada = Math.min(Math.max(altura, 0), max);
  return alto - (recortada / max) * alto;
}
