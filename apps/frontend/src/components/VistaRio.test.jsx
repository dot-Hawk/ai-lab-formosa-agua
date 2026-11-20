import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import VistaRio from "./VistaRio.jsx";

const RIO = {
  unidad: "m",
  estaciones: [
    {
      nombre: "Puerto Formosa", lat: -26.18, lon: -58.18, fuente: "INA, kit K1",
      umbrales: { aguas_bajas: 1.6, alerta: 7.8, evacuacion: 8.3 },
      serie: [["2026-10-30", 5.5], ["2026-10-31", 5.6]],
    },
    {
      nombre: "Puerto Bermejo", lat: -26.9, lon: -58.5, fuente: "INA",
      umbrales: { aguas_bajas: null, alerta: 6.5, evacuacion: 7 },
      serie: [["2026-10-31", 7.1]],
    },
  ],
};

describe("VistaRio", () => {
  beforeEach(() => vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true, json: async () => RIO }))));
  afterEach(() => vi.unstubAllGlobals());

  it("muestra la última altura de cada escala con su estado", async () => {
    render(<VistaRio />);
    const formosa = await screen.findByRole("button", { name: /Puerto Formosa/ });
    expect(within(formosa).getByText("5,60 m")).toBeInTheDocument();
    const bermejo = screen.getByRole("button", { name: /Puerto Bermejo/ });
    expect(within(bermejo).getByText("Nivel de evacuación")).toBeInTheDocument();
  });

  it("cambia el gráfico al elegir otra escala", async () => {
    render(<VistaRio />);
    await userEvent.click(await screen.findByRole("button", { name: /Puerto Bermejo/ }));
    expect(screen.getByRole("img", { name: /Altura del río en Puerto Bermejo/ })).toBeInTheDocument();
  });

  it("explica el error si la API no responde", async () => {
    fetch.mockRejectedValueOnce(new Error("sin red"));
    render(<VistaRio />);
    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });
});
