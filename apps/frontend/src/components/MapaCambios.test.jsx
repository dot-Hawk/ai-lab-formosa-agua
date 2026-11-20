import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { resultado } from "../test/fixtures.js";
import MapaCambios, { capasDeslizador, encuadre, longitudDeCorte } from "./MapaCambios.jsx";

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

describe("Deslizador con color real y NDVI", () => {
  const completo = {
    ...resultado,
    agua_a_png: "data:image/png;base64,AGUA_A", agua_b_png: "data:image/png;base64,AGUA_B",
    color_a_jpg: "data:image/jpeg;base64,COLOR_A", color_b_jpg: "data:image/jpeg;base64,COLOR_B",
    ndvi_a_png: "data:image/png;base64,NDVI_A", ndvi_b_png: "data:image/png;base64,NDVI_B",
  };

  it("ofrece solo las capas que mandó la API", () => {
    expect(capasDeslizador(completo).map((c) => c.id)).toEqual(["agua", "color", "ndvi"]);
    expect(capasDeslizador({ ...completo, color_a_jpg: null }).map((c) => c.id)).toEqual(["agua", "ndvi"]);
    expect(capasDeslizador(null)).toEqual([]);
  });

  it("cambia la capa de las dos fechas", async () => {
    const { container } = render(<MapaCambios resultado={completo} />);
    await userEvent.click(screen.getByLabelText("Antes / después"));
    await userEvent.click(screen.getByLabelText("Color real"));
    expect(capas(container)).toEqual([completo.color_a_jpg, completo.color_b_jpg]);
    await userEvent.click(screen.getByLabelText("NDVI"));
    expect(capas(container)).toEqual([completo.ndvi_a_png, completo.ndvi_b_png]);
    expect(screen.getByText("NDVI: vegetación en cada fecha")).toBeInTheDocument();
  });
});

describe("encuadre del mapa", () => {
  const zonas = [{ id: "formosa", bounds: [[1, 1], [2, 2]] }, { id: "clorinda", bounds: [[3, 3], [4, 4]] }];
  const provincia = { bounds: [[-27, -62], [-22, -57]] };

  it("prioriza el resultado, después la zona elegida y después la provincia", () => {
    expect(encuadre(resultado, zonas, "clorinda", provincia)).toEqual(resultado.bounds);
    expect(encuadre(null, zonas, "clorinda", provincia)).toEqual([[3, 3], [4, 4]]);
    expect(encuadre(null, zonas, "no-existe", provincia)).toEqual(provincia.bounds);
    expect(encuadre(null, [], null, null)).toBeNull();
  });

  it("antes de comparar muestra la leyenda de la provincia y deja ocultar su capa", async () => {
    const prov = {
      ...provincia, contorno: [[-27, -62], [-22, -62], [-22, -57]],
      agua_siempre: { png: "data:image/png;base64,PROV", fuente: "GSW", resolucion_aprox_m: 270 },
      contorno_fuente: "IGN",
    };
    const { container } = render(<MapaCambios resultado={null} provincia={prov} zonas={zonas} zonaActual="formosa" />);
    expect(capas(container)).toEqual([prov.agua_siempre.png]);
    expect(screen.getByText("Zonas clave (10 m)")).toBeInTheDocument();
    await userEvent.click(screen.getByLabelText("Agua de siempre en la provincia"));
    expect(capas(container)).toEqual([]);
  });
});
