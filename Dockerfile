# Operación Agua · Comparador de imágenes satelitales
# Imagen única: FastAPI sirve la API en /api y la interfaz React compilada en /.
#
#   docker build -t operacion-agua .
#   docker run -p 8080:8000 operacion-agua      -> http://localhost:8080

# --- 1. Compilar el frontend ---------------------------------------------------
FROM node:22.11.0-alpine3.20 AS frontend
WORKDIR /src
COPY apps/frontend/package.json apps/frontend/package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY apps/frontend/ ./
RUN npm run build

# --- 2. Entorno de Python (uv y su caché quedan en esta etapa) ---------------
FROM python:3.14-slim-bookworm AS dependencias
COPY --from=ghcr.io/astral-sh/uv:0.12.7 /uv /usr/local/bin/uv
ENV UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    UV_PYTHON_DOWNLOADS=never \
    UV_NO_CACHE=1
WORKDIR /app
# Sin el grupo de tests ni el de descarga de escenas (rasterio)
COPY apps/backend/pyproject.toml apps/backend/uv.lock apps/backend/.python-version ./
RUN uv sync --frozen --no-dev

# --- 3. Imagen final -------------------------------------------------------------
FROM python:3.14-slim-bookworm
ENV PYTHONUNBUFFERED=1
WORKDIR /app
COPY --from=dependencias /app/.venv ./.venv

# Código y solo los datos que usa la API en tiempo de ejecución
COPY apps/backend/app ./app
COPY apps/backend/data/escenas ./data/escenas
COPY apps/backend/data/K3_estaciones_umbrales.json apps/backend/data/niveles_formosa_limpio.csv ./data/
COPY --from=frontend /src/dist ./static

ENV STATIC_DIR=/app/static \
    PATH="/app/.venv/bin:$PATH"

RUN useradd --uid 10001 --no-create-home --shell /usr/sbin/nologin app
USER 10001

EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s \
  CMD ["python", "-c", "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/api/salud', timeout=2)"]

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
