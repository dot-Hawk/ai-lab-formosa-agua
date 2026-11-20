import { useState } from "react";
import { formatearFecha, formatearPorcentaje, validarSeleccion } from "../lib/vista.js";

function etiquetaEscena(e) {
  const simulada = e.categoria === "Simulado" ? " (simulada)" : "";
  return `${formatearFecha(e.fecha)}, nubes ${formatearPorcentaje(e.nubes_pct)}${simulada}`;
}

export default function FormularioConsulta({ escenas, cargando, onComparar }) {
  const [escenaA, setEscenaA] = useState(escenas[0]?.id ?? "");
  const [escenaB, setEscenaB] = useState(escenas[1]?.id ?? "");
  const [umbralTexto, setUmbralTexto] = useState("0");

  const umbral = umbralTexto.trim() === "" ? NaN : Number(umbralTexto);
  const error = validarSeleccion(escenaA, escenaB, umbral);

  function enviar(ev) {
    ev.preventDefault();
    if (!error && !cargando) onComparar({ escenaA, escenaB, umbral });
  }

  const opciones = escenas.map((e) => (
    <option key={e.id} value={e.id}>
      {etiquetaEscena(e)}
    </option>
  ));

  return (
    <form className="consulta" onSubmit={enviar} noValidate>
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
        <label htmlFor="umbral">Umbral de agua (NDWI)</label>
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
          Un píxel cuenta como agua si su NDWI supera este valor. 0 es el criterio habitual.
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
