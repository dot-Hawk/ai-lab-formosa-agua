import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { resultado } from "../test/fixtures.js";
import MapaCambios, { longitudDeCorte } from "./MapaCambios.jsx";

const capas = (c) => [...c.querySelectorAll("img.leaflet-image-layer")].map((i) => i.getAttribute("src"));

describe("MapaCambios con agua de siempre", () => {
  it("muestra todos los cambios y permite ver solo el agua inusual", async () => {
    const { container } = render(<MapaCambios resultado={resultado} />);
    expect(capas(container)).toEqual([resultado.overlay_png]);
    await userEvent.click(screen.getByLabelText("Solo agua nueva donde normalmente no hay"));
    expect(capas(container)).toEqual([resultado.agua_habitual.overlay_inusual_png]);
  });

  it("superpone el agua de siempre y la explica en la leyenda", async () => {
    const { container } = render(<MapaCambios resultado={resultado} />);
    await userEvent.click(screen.getByLabelText("Ver agua de siempre"));
    expect(capas(container)).toContain(resultado.agua_habitual.agua_de_siempre_png);
    expect(screen.getByText("Agua de siempre (1984-2021)")).toBeInTheDocument();
  });

  it("sin la capa del backend no ofrece las opciones nuevas", () => {
    render(<MapaCambios resultado={{ ...resultado, agua_habitual: null }} />);
    expect(screen.queryByLabelText("Ver agua de siempre")).not.toBeInTheDocument();
  });
});

describe("MapaCambios en modo antes / después", () => {
  const conFechas = { ...resultado, agua_a_png: "data:image/png;base64,AAAA1", agua_b_png: "data:image/png;base64,BBBB2" };

  it("muestra el agua de las dos fechas y recorta la de después según el deslizador", async () => {
    const { container } = render(<MapaCambios resultado={conFechas} />);
    await userEvent.click(screen.getByLabelText("Antes / después"));
    expect(capas(container)).toEqual([conFechas.agua_a_png, conFechas.agua_b_png]);
    const despues = container.querySelectorAll("img.leaflet-image-layer")[1];
    expect(despues.style.clipPath).toBe("inset(0 0 0 50%)");
    fireEvent.change(screen.getByLabelText("Posición del deslizador"), { target: { value: "20" } });
    expect(despues.style.clipPath).toBe("inset(0 0 0 20%)");
    expect(screen.getByText("Antes (01/10/2026)")).toBeInTheDocument();
  });

  it("vuelve a la vista de cambios", async () => {
    const { container } = render(<MapaCambios resultado={conFechas} />);
    await userEvent.click(screen.getByLabelText("Antes / después"));
    await userEvent.click(screen.getByLabelText("Cambios"));
    expect(capas(container)).toEqual([conFechas.overlay_png]);
  });

  it("sin las imágenes por fecha no ofrece el deslizador", () => {
    render(<MapaCambios resultado={resultado} />);
    expect(screen.queryByLabelText("Antes / después")).not.toBeInTheDocument();
  });
});

describe("longitudDeCorte", () => {
  it("interpola la longitud entre los bordes de la escena", () => {
    const b = [[-26.24, -58.18], [-26.17, -58.11]];
    expect(longitudDeCorte(b, 0)).toBeCloseTo(-58.18);
    expect(longitudDeCorte(b, 50)).toBeCloseTo(-58.145);
    expect(longitudDeCorte(b, 100)).toBeCloseTo(-58.11);
  });
});
