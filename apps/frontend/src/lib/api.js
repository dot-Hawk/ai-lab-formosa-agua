// Cliente del backend. Contrato: docs/CONTRATO_API.md
const BASE = import.meta.env.VITE_API_BASE || "";

async function pedir(ruta, opciones) {
  let r;
  try {
    r = await fetch(`${BASE}${ruta}`, opciones);
  } catch {
    throw new Error("No se pudo conectar con el backend. ¿Está corriendo en el puerto 8000?");
  }
  const cuerpo = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(cuerpo.detalle || `Error ${r.status}`);
  return cuerpo;
}

export const listarEscenas = () => pedir("/api/escenas");

export const comparar = (escenaA, escenaB, umbralAgua, indiceAgua = "ndwi") =>
  pedir("/api/comparar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ escena_a: escenaA, escena_b: escenaB, umbral_agua: umbralAgua, indice_agua: indiceAgua }),
  });
