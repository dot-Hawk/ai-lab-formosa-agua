import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import EscalaHidrometrica from "./EscalaHidrometrica.jsx";

const umbrales = { aguas_bajas: 1.6, alerta: 7.8, evacuacion: 8.3 };

describe("EscalaHidrometrica", () => {
  it("dibuja los tres umbrales del INA con su valor", () => {
    render(<EscalaHidrometrica estacion="Puerto Formosa" umbrales={umbrales} lecturas={[]} />);
    expect(screen.getByText("Evacuación 8,30 m")).toBeInTheDocument();
    expect(screen.getByText("Alerta 7,80 m")).toBeInTheDocument();
    expect(screen.getByText("Aguas bajas 1,60 m")).toBeInTheDocument();
  });

  it("muestra el máximo histórico de referencia", () => {
    render(<EscalaHidrometrica estacion="Puerto Formosa" umbrales={umbrales} lecturas={[]} />);
    expect(screen.getByText(/9,81 m/)).toBeInTheDocument();
  });

  it("marca cada lectura con dato y avisa las que no tienen", () => {
    render(
      <EscalaHidrometrica
        estacion="Puerto Formosa"
        umbrales={umbrales}
        lecturas={[
          { etiqueta: "Antes", fecha: "2026-10-01", altura: 2.37 },
          { etiqueta: "Después", fecha: "2026-10-31", altura: null },
        ]}
      />,
    );
    expect(screen.getByTestId("marca-Antes")).toBeInTheDocument();
    expect(screen.queryByTestId("marca-Después")).not.toBeInTheDocument();
    expect(screen.getByText(/Después, 31\/10\/2026: sin dato/)).toBeInTheDocument();
  });

  it("tiene una descripción accesible", () => {
    render(<EscalaHidrometrica estacion="Puerto Formosa" umbrales={umbrales} lecturas={[]} />);
    expect(screen.getByRole("img", { name: /Escala hidrométrica de Puerto Formosa/ })).toBeInTheDocument();
  });
});
