import { describe, expect, it } from "vitest";
import {
  estadoNivel,
  formatearFecha,
  formatearHoraArgentina,
  formatearHectareas,
  formatearMetros,
  formatearPorcentaje,
  posicionEnEscala,
  validarSeleccion,
} from "./vista.js";

describe("validarSeleccion", () => {
  it("acepta dos escenas distintas y un umbral válido", () => {
    expect(validarSeleccion("a", "b", 0)).toBeNull();
  });

  it("rechaza la misma escena en ambos campos", () => {
    expect(validarSeleccion("a", "a", 0)).toMatch(/distintas/);
  });

  it("rechaza campos vacíos", () => {
    expect(validarSeleccion("", "b", 0)).toMatch(/Elegí/);
  });

  it.each([-1.5, 1.01, NaN])("rechaza el umbral fuera de rango %s", (umbral) => {
    expect(validarSeleccion("a", "b", umbral)).toMatch(/umbral/i);
  });
});

describe("estadoNivel", () => {
  const umbrales = { aguas_bajas: 1.6, alerta: 7.8, evacuacion: 8.3 };

  it("sin dato cuando la altura es null", () => {
    expect(estadoNivel(null, umbrales).clase).toBe("sin-dato");
  });

  it.each([
    [1.2, "aguas-bajas"],
    [5.6, "normal"],
    [7.8, "alerta"],
    [8.3, "evacuacion"],
    [9.81, "evacuacion"],
  ])("altura %s m → %s", (altura, clase) => {
    expect(estadoNivel(altura, umbrales).clase).toBe(clase);
  });

  it("aclara que la decisión no la toma la herramienta", () => {
    expect(estadoNivel(8.5, umbrales).texto).toMatch(/referencia/i);
  });
});


describe("formatos argentinos", () => {
  it("formatea metros con coma decimal y dos decimales", () => {
    expect(formatearMetros(5.6)).toBe("5,60 m");
    expect(formatearMetros(null)).toBe("sin dato");
  });

  it("formatea hectáreas con separador de miles", () => {
    expect(formatearHectareas(1234.5)).toBe("1.234,5 ha");
  });

  it("formatea fechas ISO como dd/mm/aaaa sin corrimiento de zona horaria", () => {
    expect(formatearFecha("2026-10-01")).toBe("01/10/2026");
  });
});

describe("posicionEnEscala", () => {
  it("ubica 0 m abajo y el máximo arriba", () => {
    expect(posicionEnEscala(0, { max: 10, alto: 400 })).toBe(400);
    expect(posicionEnEscala(10, { max: 10, alto: 400 })).toBe(0);
    expect(posicionEnEscala(7.8, { max: 10, alto: 400 })).toBeCloseTo(88);
  });

  it("recorta valores fuera de la escala", () => {
    expect(posicionEnEscala(-1, { max: 10, alto: 400 })).toBe(400);
    expect(posicionEnEscala(12, { max: 10, alto: 400 })).toBe(0);
  });
});

describe("formatearPorcentaje", () => {
  it("usa coma decimal y omite decimales en enteros", () => {
    expect(formatearPorcentaje(20.1)).toBe("20,1 %");
    expect(formatearPorcentaje(0)).toBe("0 %");
  });
});

describe("formatearHoraArgentina", () => {
  it("pasa de UTC a la hora de Argentina", () => {
    expect(formatearHoraArgentina("2026-10-26T13:59:57Z")).toBe("10:59");
    expect(formatearHoraArgentina("2026-10-26T01:05:00Z")).toBe("22:05");
  });

  it("indica cuando falta el dato", () => {
    expect(formatearHoraArgentina(undefined)).toBe("sin dato");
  });
});
