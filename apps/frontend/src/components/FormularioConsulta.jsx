import { useState } from "react";
import { formatearFecha, formatearPorcentaje, validarSeleccion } from "../lib/vista.js";

function etiquetaEscena(e) {
  const simulada = e.categoria === "Simulado" ? " (simulada)" : "";
  return `${formatearFecha(e.fecha)}, nubes ${formatearPorcentaje(e.nubes_pct)}${simulada}`;
}

const INDICES = {
  ndwi: { nombre: "NDWI (verde e infrarrojo cercano)", ayuda: "El índice de agua clásico (McFeeters, 1996)." },
  mndwi: {
    nombre: "MNDWI (verde e infrarrojo de onda corta)",
    ayuda: "Separa mejor el agua de techos y calles: menos ruido en la ciudad (Xu, 2006).",
  },
};

/** Zonas presentes en las escenas, en el orden de `zonas` (o en el de aparición si no viene la lista). */
export function zonasDisponibles(escenas, zonas = []) {
  const ids = [...new Set(escenas.map((e) => e.zona ?? null))];
  const nombres = Object.fromEntries(zonas.map((z) => [z.id, z.nombre]));
  const orden = zonas.map((z) => z.id);
  return ids
    .map((id) => ({ id, nombre: nombres[id] ?? id ?? "Zona de estudio" }))
    .sort((a, b) => (orden.indexOf(a.id) + 1 || 999) - (orden.indexOf(b.id) + 1 || 999));
}

export default function FormularioConsulta({ escenas, zonas = [], cargando, onComparar, onZona }) {
  const opcionesZona = zonasDisponibles(escenas, zonas);
  const [zona, setZona] = useState(opcionesZona[0]?.id ?? null);
  const deZona = escenas.filter((e) => (e.zona ?? null) === zona);
  const [escenaA, setEscenaA] = useState(deZona[0]?.id ?? "");
  const [escenaB, setEscenaB] = useState(deZona[1]?.id ?? "");
  const [umbralTexto, setUmbralTexto] = useState("0");
  const [indice, setIndice] = useState("ndwi");

  const umbral = umbralTexto.trim() === "" ? NaN : Number(umbralTexto);
  const error = deZona.length < 2 ? "Esta zona necesita al menos dos fechas." : validarSeleccion(escenaA, escenaB, umbral);

  function cambiarZona(id) {
    const nuevas = escenas.filter((e) => (e.zona ?? null) === id);
    setZona(id);
    setEscenaA(nuevas[0]?.id ?? "");
    setEscenaB(nuevas[1]?.id ?? "");
    onZona?.(id);
  }

  function enviar(ev) {
    ev.preventDefault();
    if (!error && !cargando) onComparar({ escenaA, escenaB, umbral, indice });
  }

  const opciones = deZona.map((e) => (
    <option key={e.id} value={e.id}>
      {etiquetaEscena(e)}
    </option>
  ));
  const nombreIndice = indice.toUpperCase();

  return (
    <form className="consulta" onSubmit={enviar} noValidate>
      {opcionesZona.length > 1 && (
        <div className="campo">
          <label htmlFor="zona">Zona</label>
          <select id="zona" value={zona ?? ""} onChange={(e) => cambiarZona(e.target.value)}>
            {opcionesZona.map((z) => (
              <option key={z.id} value={z.id}>{z.nombre}</option>
            ))}
          </select>
        </div>
      )}
      <div className="campo">
        <label htmlFor="escena-a">Antes</label>
        <select id="escena-a" value={escenaA} onChange={(e) => setEscenaA(e.target.value)}>
          {opciones}
        </select>
      </div>
      <div className="campo">
        <label htmlFor="escena-b">Después</label>
        <select id="escena-b" value={escenaB} onChange={(e) => setEscenaB(e.target.value)}>
          {opciones}
        </select>
      </div>
      <div className="campo">
        <label htmlFor="indice">Índice de agua</label>
        <select id="indice" value={indice} onChange={(e) => setIndice(e.target.value)} aria-describedby="indice-ayuda">
          {Object.entries(INDICES).map(([id, i]) => (
            <option key={id} value={id}>{i.nombre}</option>
          ))}
        </select>
        <p id="indice-ayuda" className="ayuda">{INDICES[indice].ayuda}</p>
      </div>
      <div className="campo">
        <label htmlFor="umbral">Umbral de agua ({nombreIndice})</label>
        <input
          id="umbral"
          type="number"
          inputMode="decimal"
          step="0.05"
          min="-1"
          max="1"
          value={umbralTexto}
          onChange={(e) => setUmbralTexto(e.target.value)}
          aria-describedby="umbral-ayuda"
        />
        <p id="umbral-ayuda" className="ayuda">
          Un píxel cuenta como agua si su {nombreIndice} supera este valor. 0 es el criterio habitual.
        </p>
      </div>
      {error && (
        <p className="aviso aviso-error" role="alert">
          {error}
        </p>
      )}
      <button type="submit" disabled={Boolean(error) || cargando}>
        {cargando ? "Comparando…" : "Comparar fechas"}
      </button>
    </form>
  );
}
