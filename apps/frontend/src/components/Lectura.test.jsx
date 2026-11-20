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
    const fila = screen.getByRole("row", { name: /Río en Puerto Formosa/ });
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

describe("Lectura con región y lluvia", () => {
  it("muestra las otras escalas del río con su estado o sin dato", () => {
    render(<Lectura resultado={resultado} />);
    const pilcomayo = screen.getByRole("row", { name: /Río en Puerto Pilcomayo/ });
    expect(within(pilcomayo).getByText("4,93 m")).toBeInTheDocument();
    const bermejo = screen.getByRole("row", { name: /Río en Puerto Bermejo/ });
    expect(within(bermejo).getByText("Sin dato")).toBeInTheDocument();
    // sin nivel de aguas bajas informado, una altura negativa no se marca como "aguas bajas"
    expect(within(bermejo).getByText("Por debajo del nivel de alerta")).toBeInTheDocument();
  });

  it("muestra la lluvia estimada, marcada como estimación", () => {
    render(<Lectura resultado={resultado} />);
    const fila = screen.getByRole("row", { name: /Lluvia 30 días antes \(estimada\)/ });
    expect(within(fila).getByText("227,3 mm")).toBeInTheDocument();
    expect(within(fila).getByText("368,8 mm")).toBeInTheDocument();
    expect(screen.getByText(/Entre las dos fechas: 258,0 mm/)).toBeInTheDocument();
    expect(screen.getByText("Estimado")).toBeInTheDocument();
  });
});

describe("Lectura con agua de siempre", () => {
  it("separa el agua nueva inusual de la habitual y cita la fuente", () => {
    render(<Lectura resultado={resultado} />);
    expect(screen.getByText("30,5 ha")).toBeInTheDocument();
    expect(screen.getByText("49,5 ha")).toBeInTheDocument();
    expect(screen.getByText(/al menos el 50 % del tiempo entre 1984 y 2021/)).toBeInTheDocument();
  });

  it("no muestra el bloque si el backend no tiene la capa", () => {
    render(<Lectura resultado={{ ...resultado, agua_habitual: null }} />);
    expect(screen.queryByText(/normalmente no hay agua/)).not.toBeInTheDocument();
  });
});

describe("Lectura con NDVI", () => {
  it("muestra el NDVI medio de cada fecha", () => {
    render(<Lectura resultado={{ ...resultado, ndvi_medio: { a: 0.518, b: 0.419 } }} />);
    const fila = screen.getByRole("row", { name: /NDVI medio/ });
    expect(within(fila).getByText("0,518")).toBeInTheDocument();
    expect(within(fila).getByText("0,419")).toBeInTheDocument();
  });
});
