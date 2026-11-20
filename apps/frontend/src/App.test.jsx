import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { escenas, resultado } from "./test/fixtures.js";

vi.mock("./lib/api.js", () => ({ listarEscenas: vi.fn(), comparar: vi.fn() }));
// Leaflet y las capas externas se reemplazan por marcadores.
vi.mock("./components/MapaCambios.jsx", () => ({ default: () => <div data-testid="mapa" /> }));
vi.mock("./components/EnVivo.jsx", () => ({ default: () => <div data-testid="envivo" /> }));
vi.mock("./components/VistaRio.jsx", () => ({ default: () => <div data-testid="rio" /> }));

const api = await import("./lib/api.js");
const { default: App } = await import("./App.jsx");

function irA(hash) {
  window.location.hash = hash;
}

describe("App", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    irA("");
  });
  afterEach(() => irA(""));

  it("abre en la vista en vivo y lleva la leyenda de prototipo al pie", () => {
    api.listarEscenas.mockResolvedValue(escenas);
    render(<App />);
    expect(screen.getByTestId("envivo")).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toHaveTextContent(
      "PROTOTIPO · AI LAB Misión: Código Formosa · no es una herramienta oficial",
    );
  });

  it("navega entre vistas con el menú", async () => {
    api.listarEscenas.mockResolvedValue(escenas);
    render(<App />);
    await userEvent.click(screen.getByRole("link", { name: "Río" }));
    expect(await screen.findByTestId("rio")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Río" })).toHaveAttribute("aria-current", "page");
  });

  it("flujo principal: compara y muestra la lectura", async () => {
    irA("#/comparar");
    api.listarEscenas.mockResolvedValue(escenas);
    api.comparar.mockResolvedValue(resultado);
    render(<App />);

    await userEvent.click(await screen.findByRole("button", { name: "Comparar fechas" }));

    expect(api.comparar).toHaveBeenCalledWith("demo-2026-10-01", "demo-2026-10-31", 0);
    expect(await screen.findByText("80,0 ha")).toBeInTheDocument();
  });

  it("conserva el resultado al cambiar de vista y volver", async () => {
    irA("#/comparar");
    api.listarEscenas.mockResolvedValue(escenas);
    api.comparar.mockResolvedValue(resultado);
    render(<App />);
    await userEvent.click(await screen.findByRole("button", { name: "Comparar fechas" }));
    await screen.findByText("80,0 ha");

    await act(async () => irA("#/rio"));
    await screen.findByTestId("rio");
    await act(async () => irA("#/comparar"));
    expect(await screen.findByText("80,0 ha")).toBeInTheDocument();
  });

  it("explica el error si el backend no responde", async () => {
    irA("#/comparar");
    api.listarEscenas.mockRejectedValue(new Error("No se pudo conectar con el backend."));
    render(<App />);
    expect(await screen.findByText("No se pudo conectar con el backend.")).toBeInTheDocument();
  });

  it("muestra el error del backend al comparar y permite reintentar", async () => {
    irA("#/comparar");
    api.listarEscenas.mockResolvedValue(escenas);
    api.comparar.mockRejectedValue(new Error("Escena(s) inexistente(s): x"));
    render(<App />);

    await userEvent.click(await screen.findByRole("button", { name: "Comparar fechas" }));

    expect(await screen.findByText("Escena(s) inexistente(s): x")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Comparar fechas" })).toBeEnabled();
  });

  it("avisa cuando el catálogo tiene menos de dos escenas", async () => {
    irA("#/comparar");
    api.listarEscenas.mockResolvedValue([escenas[0]]);
    render(<App />);
    expect(await screen.findByText(/al menos dos escenas/)).toBeInTheDocument();
  });
});
