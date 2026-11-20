import { describe, expect, it } from "vitest";
import { caminoArea, caminoSerie, dominioAlturas, ultimaLectura } from "./grafico.js";

describe("caminoSerie", () => {
  const escalaX = (f) => ({ "2026-10-01": 0, "2026-10-02": 10, "2026-10-03": 20, "2026-10-10": 90 })[f];
  const escalaY = (h) => 100 - h * 10;

  it("une días consecutivos en un solo trazo", () => {
    const serie = [["2026-10-01", 2], ["2026-10-02", 3], ["2026-10-03", 4]];
    expect(caminoSerie(serie, escalaX, escalaY)).toBe("M0,80L10,70L20,60");
  });

  it("corta el trazo cuando faltan días: no se dibuja lo que no se midió", () => {
    const serie = [["2026-10-01", 2], ["2026-10-02", 3], ["2026-10-10", 5]];
    expect(caminoSerie(serie, escalaX, escalaY)).toBe("M0,80L10,70M90,50");
  });

  it("devuelve vacío sin datos", () => {
    expect(caminoSerie([], escalaX, escalaY)).toBe("");
  });
});

describe("dominioAlturas", () => {
  it("incluye la serie y los umbrales con margen", () => {
    const [min, max] = dominioAlturas([["2026-10-01", 2.4], ["2026-10-02", 5.6]], { alerta: 7.8, evacuacion: 8.3 });
    expect(min).toBeLessThanOrEqual(0);
    expect(max).toBeGreaterThanOrEqual(8.3);
  });

  it("baja de cero con valores negativos reales", () => {
    const [min] = dominioAlturas([["2024-11-07", -0.86]], { alerta: 7.8, evacuacion: 8.3 });
    expect(min).toBeLessThan(-0.86);
  });
});

describe("ultimaLectura", () => {
  it("devuelve la última fecha y altura", () => {
    expect(ultimaLectura([["2026-10-30", 5.5], ["2026-10-31", 5.6]])).toEqual({ fecha: "2026-10-31", altura: 5.6 });
  });

  it("devuelve null sin datos", () => {
    expect(ultimaLectura([])).toBeNull();
  });
});

describe("caminoArea", () => {
  const escalaX = (f) => ({ "2026-10-01": 0, "2026-10-02": 10, "2026-10-10": 90 })[f];
  const escalaY = (h) => 100 - h * 10;

  it("cierra cada tramo contra la base, sin unir tramos separados por huecos", () => {
    const serie = [["2026-10-01", 2], ["2026-10-02", 3], ["2026-10-10", 5]];
    expect(caminoArea(serie, escalaX, escalaY, 100)).toBe("M0,100L0,80L10,70L10,100ZM90,100L90,50L90,100Z");
  });
});
