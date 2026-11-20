import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { resultado } from "../test/fixtures.js";
import Lectura from "./Lectura.jsx";

describe("Lectura", () => {
  it("muestra las superficies de agua nueva y perdida", () => {
    render(<Lectura resultado={resultado} />);
    expect(screen.getByText("80,0 ha")).toBeInTheDocument();
    expect(screen.getByText("0,0 ha")).toBeInTheDocument();
  });

  it("compara los metadatos de ambas escenas en una tabla", () => {
    render(<Lectura resultado={resultado} />);
    const tabla = screen.getByRole("table", { name: "Escenas comparadas" });
    expect(within(tabla).getByText("01/10/2026")).toBeInTheDocument();
    expect(within(tabla).getByText("31/10/2026")).toBeInTheDocument();
    expect(within(tabla).getByText("12 %")).toBeInTheDocument();
    expect(within(tabla).getAllByText("Simulado")).toHaveLength(2);
  });

  it("muestra la altura y su estado, y un único 'sin dato' cuando falta", () => {
    render(<Lectura resultado={resultado} />);
    const fila = screen.getByRole("row", { name: /Río en/ });
    expect(within(fila).getByText("2,37 m")).toBeInTheDocument();
    expect(within(fila).getByText("Por debajo del nivel de alerta")).toBeInTheDocument();
    expect(within(fila).getAllByText(/sin dato/i)).toHaveLength(1);
  });

  it("incluye la advertencia del backend", () => {
    render(<Lectura resultado={resultado} />);
    expect(screen.getByText(/indicio, no una afectación comprobada/)).toBeInTheDocument();
  });
});

describe("Lectura con decimales", () => {
  it("muestra la cobertura de nubes con coma decimal", () => {
    const nublado = { ...resultado, escena_b: { ...resultado.escena_b, nubes_pct: 20.1 } };
    render(<Lectura resultado={nublado} />);
    expect(screen.getByText("20,1 %")).toBeInTheDocument();
  });
});

describe("Lectura con ficha de confianza", () => {
  it("muestra la hora de captura en hora de Argentina", () => {
    render(<Lectura resultado={resultado} />);
    const fila = screen.getByRole("row", { name: /Hora/ });
    expect(within(fila).getByText("11:09")).toBeInTheDocument();
    expect(within(fila).getByText("10:59")).toBeInTheDocument();
  });

  it("muestra el semáforo con su nivel, los motivos y los criterios", () => {
    render(<Lectura resultado={resultado} />);
    expect(screen.getByRole("heading", { name: /Confianza del resultado: Media/ })).toBeInTheDocument();
    expect(screen.getByText("Nubes sobre la zona: hasta 12 %")).toBeInTheDocument();
    expect(screen.getByText("Reglas definidas por el equipo.")).toBeInTheDocument();
  });

  it("muestra los avisos del backend", () => {
    const conAviso = { ...resultado, avisos: ["Haría falta radar (Sentinel-1)."] };
    render(<Lectura resultado={conAviso} />);
    expect(screen.getByText("Haría falta radar (Sentinel-1).")).toBeInTheDocument();
  });

  it("funciona con un backend sin confianza ni avisos", () => {
    const viejo = { ...resultado };
    delete viejo.confianza;
    delete viejo.avisos;
    render(<Lectura resultado={viejo} />);
    expect(screen.queryByText(/Confianza del resultado/)).not.toBeInTheDocument();
  });
});
