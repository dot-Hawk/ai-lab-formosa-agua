import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { escenas, resultado } from "./test/fixtures.js";

vi.mock("./lib/api.js", () => ({ listarEscenas: vi.fn(), comparar: vi.fn() }));
// Leaflet necesita un navegador real; en los tests se reemplaza por un marcador.
vi.mock("./components/MapaCambios.jsx", () => ({ default: () => <div data-testid="mapa" /> }));

const api = await import("./lib/api.js");
const { default: App } = await import("./App.jsx");

describe("App", () => {
  beforeEach(() => vi.resetAllMocks());

  it("muestra la leyenda obligatoria de prototipo", async () => {
    api.listarEscenas.mockResolvedValue(escenas);
    render(<App />);
    expect(screen.getByText("PROTOTIPO · AI LAB Misión: Código Formosa · no es una herramienta oficial")).toBeInTheDocument();
  });

  it("flujo principal: carga escenas, compara y muestra la lectura", async () => {
    api.listarEscenas.mockResolvedValue(escenas);
    api.comparar.mockResolvedValue(resultado);
    render(<App />);

    await userEvent.click(await screen.findByRole("button", { name: "Comparar fechas" }));

    expect(api.comparar).toHaveBeenCalledWith("demo-2026-10-01", "demo-2026-10-31", 0, "ndwi");
    expect(await screen.findByText("80,0 ha")).toBeInTheDocument();
  });

  it("explica el error si el backend no responde", async () => {
    api.listarEscenas.mockRejectedValue(new Error("No se pudo conectar con el backend."));
    render(<App />);
    expect(await screen.findByText("No se pudo conectar con el backend.")).toBeInTheDocument();
  });

  it("muestra el error del backend al comparar y permite reintentar", async () => {
    api.listarEscenas.mockResolvedValue(escenas);
    api.comparar.mockRejectedValue(new Error("Escena(s) inexistente(s): x"));
    render(<App />);

    await userEvent.click(await screen.findByRole("button", { name: "Comparar fechas" }));

    expect(await screen.findByText("Escena(s) inexistente(s): x")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Comparar fechas" })).toBeEnabled();
  });

  it("avisa cuando el catálogo tiene menos de dos escenas", async () => {
    api.listarEscenas.mockResolvedValue([escenas[0]]);
    render(<App />);
    expect(await screen.findByText(/al menos dos escenas/)).toBeInTheDocument();
  });
});
