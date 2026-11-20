import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { resultado } from "../test/fixtures.js";
import Lectura from "./Lectura.jsx";
import MapaCambios from "./MapaCambios.jsx";
import Radar from "./Radar.jsx";

const pasada = (fecha) => ({
  id: `s1-${fecha}`, fecha, plataforma: "SENTINEL-1C", orbita_relativa: 141, resolucion_m: 10, satelite: "Sentinel-1",
});

const radar = {
  usado: true,
  motivo: "Una escena óptica tiene más de 20 % de nubes sobre la zona.",
  pasada_a: pasada("2026-10-01"),
  pasada_b: pasada("2026-10-25"),
  umbral_db: -13,
  area_agua_nueva_ha: 220.83,
  area_agua_perdida_ha: 27.74,
  overlay_png: "data:image/png;base64,RADAR",
  validacion: { iou_promedio: 0.873, texto: "Umbral calibrado con dos pares." },
  nota: "El radar confunde agua con superficies muy lisas.",
};

describe("Radar", () => {
  it("muestra el resultado con radar, las pasadas y la validación", () => {
    render(<Radar radar={radar} />);
    expect(screen.getByRole("heading", { name: "Resultado con radar (Sentinel-1)" })).toBeInTheDocument();
    expect(screen.getByText("220,8 ha")).toBeInTheDocument();
    expect(screen.getByText(/01\/10\/2026 y del 25\/10\/2026/)).toBeInTheDocument();
    expect(screen.getByText(/-13 dB/)).toBeInTheDocument();
    expect(screen.getByText(/0,873/)).toBeInTheDocument();
  });

  it("explica cuando no hay radar disponible", () => {
    render(<Radar radar={{ usado: false, motivo: "No hay pasadas de radar cercanas." }} />);
    expect(screen.getByText("Radar: No hay pasadas de radar cercanas.")).toBeInTheDocument();
  });

  it("no muestra nada si no hizo falta radar", () => {
    const { container } = render(<Radar radar={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("aparece dentro de la lectura de resultados", () => {
    render(<Lectura resultado={{ ...resultado, radar }} />);
    expect(screen.getByText("Resultado con radar (Sentinel-1)")).toBeInTheDocument();
  });
});

describe("MapaCambios en modo radar", () => {
  it("ofrece el modo radar solo cuando se usó, y muestra su capa", async () => {
    const { container, rerender } = render(<MapaCambios resultado={resultado} />);
    expect(screen.queryByLabelText("Radar")).not.toBeInTheDocument();
    rerender(<MapaCambios resultado={{ ...resultado, radar }} />);
    await userEvent.click(screen.getByLabelText("Radar"));
    const capas = [...container.querySelectorAll("img.leaflet-image-layer")].map((i) => i.getAttribute("src"));
    expect(capas).toEqual([radar.overlay_png]);
    expect(screen.getByText("Cambio de agua según radar (01/10/2026 → 25/10/2026)")).toBeInTheDocument();
  });
});
