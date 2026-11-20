import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./style.css";
import { comparar, listarEscenas } from "./api.js";

const $ = (id) => document.getElementById(id);
const estado = (texto, tipo = "info") => {
  $("estado").textContent = texto;
  $("estado").className = tipo;
};

// Centro aproximado: Puerto Formosa (K3)
const mapa = L.map("mapa").setView([-26.183, -58.183], 13);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap · mapa de fondo de referencia",
}).addTo(mapa);
let capaCambio = null;

function opcion(e) {
  return `<option value="${e.id}">${e.fecha} · ${e.satelite} · nubes ${e.nubes_pct}%${
    e.categoria === "Simulado" ? " · SIMULADO" : ""
  }</option>`;
}

const fila = (etiqueta, valor) => `<tr><th>${etiqueta}</th><td>${valor ?? "sin dato"}</td></tr>`;
const altura = (v) => (v == null ? "sin dato (falta serie K1 limpia)" : `${v} m`);

function ficha(e, titulo) {
  return `<h3>${titulo}</h3><table>
    ${fila("Fecha", e.fecha)}
    ${fila("Fuente", e.fuente)}
    ${fila("Satélite / producto", `${e.satelite} · ${e.producto ?? ""}`)}
    ${fila("Resolución", `${e.resolucion_m} m`)}
    ${fila("Nubes", `${e.nubes_pct}%`)}
    ${fila("Categoría", `<span class="cat-${e.categoria.toLowerCase()}">${e.categoria.toUpperCase()}</span>`)}
  </table>`;
}

function mostrarResultado(r) {
  const n = r.nivel_rio;
  $("resultado").innerHTML = `
    <h2>Resultado</h2>
    <p><span class="chip azul"></span> Agua nueva: <strong>${r.area_agua_nueva_ha} ha</strong></p>
    <p><span class="chip naranja"></span> Agua que ya no está: <strong>${r.area_agua_perdida_ha} ha</strong></p>
    ${ficha(r.escena_a, "Antes")}
    ${ficha(r.escena_b, "Después")}
    <h3>Nivel del río · ${n.estacion}</h3>
    <table>
      ${fila(n.fecha_a, altura(n.altura_a))}
      ${fila(n.fecha_b, altura(n.altura_b))}
      ${fila("Alerta / Evacuación", `${n.umbrales.alerta} m / ${n.umbrales.evacuacion} m`)}
    </table>
    <p class="fuente">${n.fuente}</p>
    <p class="advertencia">${r.advertencia}</p>`;
  $("resultado").hidden = false;

  if (capaCambio) mapa.removeLayer(capaCambio);
  capaCambio = L.imageOverlay(r.overlay_png, r.bounds, { opacity: 0.85 }).addTo(mapa);
  mapa.fitBounds(r.bounds);
}

async function iniciar() {
  estado("Cargando escenas…");
  try {
    const escenas = await listarEscenas();
    if (escenas.length < 2) {
      estado("Se necesitan al menos dos escenas en el catálogo para comparar.", "vacio");
      return;
    }
    $("escena-a").innerHTML = escenas.map(opcion).join("");
    $("escena-b").innerHTML = escenas.map(opcion).join("");
    $("escena-b").selectedIndex = 1;
    estado(`${escenas.length} escenas disponibles.`);
  } catch (err) {
    estado(err.message, "error");
  }
}

$("form-comparar").addEventListener("submit", async (ev) => {
  ev.preventDefault();
  const boton = ev.target.querySelector("button");
  boton.disabled = true;
  estado("Comparando escenas…");
  try {
    const r = await comparar($("escena-a").value, $("escena-b").value, Number($("umbral").value));
    mostrarResultado(r);
    estado("Comparación lista.");
  } catch (err) {
    estado(err.message, "error"); // el usuario puede corregir y volver a intentar
  } finally {
    boton.disabled = false;
  }
});

iniciar();
