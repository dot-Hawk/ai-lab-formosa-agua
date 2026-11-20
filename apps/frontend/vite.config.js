import { defineConfig } from "vite";

// En desarrollo, /api se redirige al backend (puerto 8000).
export default defineConfig({
  server: {
    port: 5173,
    proxy: { "/api": process.env.VITE_BACKEND_URL || "http://localhost:8000" },
  },
});
