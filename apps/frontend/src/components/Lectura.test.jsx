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
