import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { resultado } from "../test/fixtures.js";
import MapaCambios from "./MapaCambios.jsx";

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
