import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// En desarrollo, /api se redirige al backend (puerto 8000).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: { "/api": process.env.VITE_BACKEND_URL || "http://localhost:8000" },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.js"],
    css: false,
    // En una máquina lenta, la primera prueba de cada archivo carga Leaflet y React en frío
    // y podía superar los 5 s por defecto (falla intermitente en un clon limpio).
    testTimeout: 15000,
  },
});
