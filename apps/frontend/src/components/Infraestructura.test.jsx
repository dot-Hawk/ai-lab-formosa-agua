import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { resultado } from "../test/fixtures.js";
import Infraestructura from "./Infraestructura.jsx";
import Lectura from "./Lectura.jsx";
import MapaCambios, { marcadores } from "./MapaCambios.jsx";

const infraestructura = {
  radio_m: 500,
  referencia: "agua nueva donde normalmente no hay agua",
  referencia_ha: 43.3,
  conteo: { educacion: { en_zona: 83, cerca: 2, en_agua: 0 }, salud: { en_zona: 6, cerca: 1, en_agua: 1 } },
  establecimientos: [
    { tipo: "salud", nombre: "Centro de Salud Ribera", lat: -26.2, lon: -58.15, en_agua: true },
    { tipo: "educacion", nombre: "Escuela N° 1", lat: -26.21, lon: -58.16, en_agua: false },
  ],
  rutas: { tramos_en_zona: 1, km_en_agua: 0, km_cerca: 0.35 },
  fuente: "IGN, Capas SIG",
  consultado: "2026-11-20",
  categoria: "Referencia (cartografía oficial)",
  nota: "Indica exposición posible, no afectación.",
};

describe("Infraestructura", () => {
  it("resume los establecimientos y rutas cerca del agua nueva", () => {
    render(<Infraestructura infraestructura={infraestructura} />);
    const tabla = screen.getByRole("table", { name: "Establecimientos expuestos" });
    const salud = within(tabla).getByRole("row", { name: /Salud/ });
    expect(within(salud).getByText("6")).toBeInTheDocument();
    const rutas = within(tabla).getByRole("row", { name: /Rutas/ });
    expect(within(rutas).getByText("0,4 km")).toBeInTheDocument();
    expect(screen.getByText("Centro de Salud Ribera")).toBeInTheDocument();
    expect(screen.getByText("(Salud, dentro del agua)")).toBeInTheDocument();
    expect(within(rutas).getByText("1 tramo")).toBeInTheDocument();
    expect(screen.getByText(/consultado el 20\/11\/2026/)).toBeInTheDocument();
  });

  it("lo dice cuando no hay establecimientos cerca", () => {
    render(<Infraestructura infraestructura={{ ...infraestructura, establecimientos: [] }} />);
    expect(screen.getByText("Ningún establecimiento a menos de 500 m del agua nueva.")).toBeInTheDocument();
  });

  it("aparece en la lectura y no rompe sin datos", () => {
    const { rerender } = render(<Lectura resultado={{ ...resultado, infraestructura }} />);
    expect(screen.getByText("Infraestructura cerca del agua nueva")).toBeInTheDocument();
    rerender(<Lectura resultado={{ ...resultado, infraestructura: null }} />);
    expect(screen.queryByText("Infraestructura cerca del agua nueva")).not.toBeInTheDocument();
  });
});

describe("MapaCambios con establecimientos", () => {
  // En jsdom Leaflet dibuja los círculos en <canvas>, que no se puede inspeccionar:
  // se prueba la lógica (marcadores) y el control, y el dibujo se verifica en el navegador.
  it("marca los establecimientos cercanos solo si están visibles", () => {
    const conInfra = { ...resultado, infraestructura };
    expect(marcadores(conInfra, true)).toEqual(infraestructura.establecimientos);
    expect(marcadores(conInfra, false)).toEqual([]);
    expect(marcadores(resultado, true)).toEqual([]);
  });

  it("ofrece ocultar los establecimientos", async () => {
    render(<MapaCambios resultado={{ ...resultado, infraestructura }} />);
    const control = screen.getByLabelText("Establecimientos cerca del agua nueva");
    expect(control).toBeChecked();
    await userEvent.click(control);
    expect(control).not.toBeChecked();
  });

  it("no ofrece el control si no hay establecimientos cerca", () => {
    render(<MapaCambios resultado={{ ...resultado, infraestructura: { ...infraestructura, establecimientos: [] } }} />);
    expect(screen.queryByLabelText("Establecimientos cerca del agua nueva")).not.toBeInTheDocument();
  });
});
