// Referencias fijas de Puerto Formosa para dibujar la escala antes de la primera consulta.
// Después de comparar, la escala usa los umbrales que devuelve el backend.

/** Kit K3 · catálogo INA consultado el 29/10/2026 · Dato observado */
export const ESTACION_FORMOSA = {
  nombre: "Puerto Formosa",
  umbrales: { aguas_bajas: 1.6, alerta: 7.8, evacuacion: 8.3 },
  fuente: "INA, catálogo de estaciones (kit K3), consultado el 29/10/2026",
};

/** Documento base AI LAB v1.1, figura 1 (fuente INA) · Dato observado */
export const MAXIMO_HISTORICO = { altura: 9.81, fecha: "2016-01-06", contexto: "Niño 2015-16" };

export const ESCALA_MAX_M = 10;

/** Recorte de las escenas Sentinel-2 (apps/backend/data/escenas/catalogo.json) */
export const ZONA_ESTUDIO = [[-26.24, -58.18], [-26.17, -58.11]];
