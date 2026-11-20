import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { escenas } from "../test/fixtures.js";
import FormularioConsulta from "./FormularioConsulta.jsx";

describe("FormularioConsulta", () => {
  it("propone por defecto la primera y la segunda escena y envía la consulta", async () => {
    const onComparar = vi.fn();
    render(<FormularioConsulta escenas={escenas} cargando={false} onComparar={onComparar} />);

    await userEvent.click(screen.getByRole("button", { name: "Comparar fechas" }));

    expect(onComparar).toHaveBeenCalledWith({
      escenaA: "demo-2026-10-01",
      escenaB: "demo-2026-10-31",
      umbral: 0,
      indice: "ndwi",
    });
  });

  it("permite elegir MNDWI y lo explica", async () => {
    const onComparar = vi.fn();
    render(<FormularioConsulta escenas={escenas} cargando={false} onComparar={onComparar} />);
    await userEvent.selectOptions(screen.getByLabelText("Índice de agua"), "mndwi");
    expect(screen.getByText(/techos y calles/)).toBeInTheDocument();
    expect(screen.getByLabelText("Umbral de agua (MNDWI)")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Comparar fechas" }));
    expect(onComparar).toHaveBeenCalledWith(expect.objectContaining({ indice: "mndwi" }));
  });

  it("con varias zonas, elige la zona y muestra solo sus fechas", async () => {
    const conZonas = [
      { ...escenas[0], zona: "formosa" },
      { ...escenas[1], zona: "formosa" },
      { ...escenas[0], id: "s2-clorinda-1", zona: "clorinda", fecha: "2025-04-10" },
      { ...escenas[1], id: "s2-clorinda-2", zona: "clorinda", fecha: "2026-10-20" },
    ];
    const zonas = [{ id: "formosa", nombre: "Formosa" }, { id: "clorinda", nombre: "Clorinda" }];
    const onComparar = vi.fn();
    const onZona = vi.fn();
    render(<FormularioConsulta escenas={conZonas} zonas={zonas} cargando={false} onComparar={onComparar} onZona={onZona} />);
    await userEvent.selectOptions(screen.getByLabelText("Zona"), "clorinda");
    expect(onZona).toHaveBeenCalledWith("clorinda");
    expect(screen.getAllByRole("option", { name: /10\/04\/2025/ })).toHaveLength(2);
    await userEvent.click(screen.getByRole("button", { name: "Comparar fechas" }));
    expect(onComparar).toHaveBeenCalledWith(expect.objectContaining({ escenaA: "s2-clorinda-1", escenaB: "s2-clorinda-2" }));
  });

  it("sin zonas en las escenas no muestra el selector de zona", () => {
    render(<FormularioConsulta escenas={escenas} cargando={false} onComparar={() => {}} />);
    expect(screen.queryByLabelText("Zona")).not.toBeInTheDocument();
  });

  it("marca las escenas simuladas en las opciones", () => {
    render(<FormularioConsulta escenas={escenas} cargando={false} onComparar={() => {}} />);
    expect(screen.getAllByRole("option", { name: /simulada/i }).length).toBeGreaterThan(0);
  });

  it("bloquea la consulta y explica el error si se elige la misma fecha", async () => {
    const onComparar = vi.fn();
    render(<FormularioConsulta escenas={escenas} cargando={false} onComparar={onComparar} />);

    await userEvent.selectOptions(screen.getByLabelText("Después"), "demo-2026-10-01");

    expect(screen.getByRole("alert")).toHaveTextContent("Elegí dos escenas distintas para comparar.");
    expect(screen.getByRole("button", { name: "Comparar fechas" })).toBeDisabled();
    expect(onComparar).not.toHaveBeenCalled();
  });

  it("muestra el estado de carga en el botón", () => {
    render(<FormularioConsulta escenas={escenas} cargando onComparar={() => {}} />);
    expect(screen.getByRole("button", { name: "Comparando…" })).toBeDisabled();
  });
});
