import { describe, expect, it } from "vitest";
import {
  CAPAS,
  expandirDominio,
  formatearUtc,
  framesRadar,
  urlTeselaGibs,
  vistaDesdeHash,
} from "./envivo.js";

describe("expandirDominio (DescribeDomains de NASA GIBS)", () => {
  const xml = (d) => `<Domains><DimensionDomain><Domain>${d}</Domain></DimensionDomain></Domains>`;

  it("expande un intervalo con período de 10 minutos", () => {
    expect(expandirDominio(xml("2026-11-20T18:20:00Z/2026-11-20T18:50:00Z/PT10M"))).toEqual([
      "2026-11-20T18:20:00Z",
      "2026-11-20T18:30:00Z",
      "2026-11-20T18:40:00Z",
      "2026-11-20T18:50:00Z",
    ]);
  });

  it("une varios intervalos separados por coma y valores sueltos", () => {
    const t = expandirDominio(xml("2026-11-20T11:30:00Z/2026-11-20T12:00:00Z/PT30M,2026-11-20T12:30:00Z"));
    expect(t).toEqual(["2026-11-20T11:30:00Z", "2026-11-20T12:00:00Z", "2026-11-20T12:30:00Z"]);
  });

  it("devuelve una lista vacía si no hay dominio", () => {
    expect(expandirDominio("<Domains></Domains>")).toEqual([]);
  });
});

describe("urlTeselaGibs", () => {
  it("arma la URL WMTS con capa, tiempo y matriz", () => {
    expect(urlTeselaGibs(CAPAS.nubes, "2026-11-20T18:50:00Z")).toBe(
      "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/GOES-East_ABI_Band13_Clean_Infrared/default/2026-11-20T18:50:00Z/GoogleMapsCompatible_Level6/{z}/{y}/{x}.png",
    );
  });
});

describe("framesRadar (RainViewer)", () => {
  it("convierte los cuadros a URL de teselas con fecha ISO", () => {
    const frames = framesRadar({
      host: "https://tilecache.rainviewer.com",
      radar: { past: [{ time: 1795201200, path: "/v2/radar/abc" }] },
    });
    expect(frames).toEqual([
      {
        tiempo: "2026-11-20T19:00:00Z",
        url: "https://tilecache.rainviewer.com/v2/radar/abc/256/{z}/{x}/{y}/4/1_1.png",
      },
    ]);
  });

  it("tolera respuestas sin radar", () => {
    expect(framesRadar({})).toEqual([]);
  });
});

describe("formatearUtc", () => {
  it("muestra la hora UTC y la de Argentina", () => {
    expect(formatearUtc("2026-11-20T18:50:00Z")).toBe("18:50 UTC · 15:50 ART");
  });
});

describe("vistaDesdeHash", () => {
  it.each([
    ["", "envivo"],
    ["#/", "envivo"],
    ["#/comparar", "comparar"],
    ["#/rio", "rio"],
    ["#/no-existe", "envivo"],
  ])("%s → %s", (hash, vista) => {
    expect(vistaDesdeHash(hash)).toBe(vista);
  });
});
