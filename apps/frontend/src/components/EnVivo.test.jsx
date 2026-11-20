import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Leaflet necesita un navegador real: el mapa se reemplaza por un marcador con sus props.
vi.mock("./MapaEnVivo.jsx", async () => {
  const { useEffect } = await import("react");
  return {
    default: function MapaFalso({ frames, indice, onCargado }) {
      useEffect(() => { frames.forEach((f) => onCargado(f.url)); }, [frames, onCargado]);
      return <div data-testid="mapa-envivo" data-cuadros={frames.length} data-indice={indice} />;
    },
  };
});

const { default: EnVivo } = await import("./EnVivo.jsx");

const DOMINIO = "<Domains><Domain>2026-11-20T18:20:00Z/2026-11-20T18:50:00Z/PT10M</Domain></Domains>";
const RADAR = { host: "https://h", radar: { past: [{ time: 1795201200, path: "/p" }] } };

function respuesta(url) {
  if (url.includes("rainviewer")) return { ok: true, json: async () => RADAR };
  if (url.includes("/api/rio")) return { ok: true, json: async () => ({ estaciones: [] }) };
  return { ok: true, text: async () => DOMINIO };
}

describe("EnVivo", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.stubGlobal("fetch", vi.fn(async (url) => respuesta(String(url))));
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("carga los cuadros de nubes y muestra la hora del último", async () => {
    render(<EnVivo reproducirAlInicio={false} />);
    expect(await screen.findByText("18:50 UTC · 15:50 ART")).toBeInTheDocument();
    // carga progresiva: empieza por el último cuadro y termina con los 4 montados
    await waitFor(() => expect(screen.getByTestId("mapa-envivo")).toHaveAttribute("data-cuadros", "4"));
    expect(screen.getByRole("button", { name: /Color real/ })).toHaveAttribute("aria-pressed", "true");
  });

  it("cambia de capa al radar", async () => {
    render(<EnVivo reproducirAlInicio={false} />);
    await screen.findByText("18:50 UTC · 15:50 ART");
    await userEvent.click(screen.getByRole("button", { name: /Radar/ }));
    expect(await screen.findByText("19:00 UTC · 16:00 ART")).toBeInTheDocument();
  });

  it("arranca reproduciendo y se puede pausar", async () => {
    render(<EnVivo />);
    await screen.findByText(/UTC · /);
    await userEvent.click(screen.getByRole("button", { name: "Pausar" }));
    expect(screen.getByRole("button", { name: "Reproducir" })).toBeInTheDocument();
  });

  it("explica el error y permite reintentar si NASA GIBS no responde", async () => {
    fetch.mockImplementation(async (url) =>
      String(url).includes("gibs") ? { ok: false, status: 503 } : respuesta(String(url)),
    );
    render(<EnVivo />);
    expect(await screen.findByRole("alert")).toHaveTextContent(/NASA GIBS/);
    expect(screen.getByRole("button", { name: "Reintentar" })).toBeInTheDocument();
  });

  it("espera a que carguen los cuadros antes de animar", async () => {
    vi.doMock("./MapaEnVivo.jsx", () => ({ default: () => <div data-testid="mapa-envivo" /> }));
    vi.resetModules();
    const { default: EnVivoSinCarga } = await import("./EnVivo.jsx");
    render(<EnVivoSinCarga />);
    expect(await screen.findByText("Cargando 0/4")).toBeInTheDocument();
    vi.doUnmock("./MapaEnVivo.jsx");
  });
});

