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
    });
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
