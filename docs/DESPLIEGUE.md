# Despliegue con Docker y Kubernetes

> PROTOTIPO · AI LAB Misión: Código Formosa · no es una herramienta oficial

La aplicación se entrega como **una sola imagen**: FastAPI sirve la API en `/api` y la interfaz React ya compilada en `/`. No hace falta configurar nada entre servicios, porque es un contenedor con un puerto.

| Característica | Valor |
|---|---|
| Puerto del contenedor | `8000` (HTTP) |
| Chequeo de salud | `GET /api/salud` → `{"estado": "ok", ...}` |
| Usuario | `10001`, sin privilegios |
| Sistema de archivos | Funciona en solo lectura (necesita `/tmp` escribible) |
| Estado | Ninguno: los datos (escenas Sentinel-2, serie K1 limpia, umbrales K3) van dentro de la imagen |
| Conexión a internet | Solo la usa el navegador para el mapa de fondo (OpenStreetMap). El contenedor no hace llamadas externas |
| Tamaño | ~375 MB descomprimida |

## Construir y probar localmente

```bash
# Desde la raíz del repositorio
docker build -t operacion-agua .
docker run -p 8080:8000 operacion-agua
# Abrir http://localhost:8080
```

O con Compose: `docker compose up --build`.

## Kubernetes

El manifiesto `deploy/kubernetes.yaml` crea un Deployment y un Service (`ClusterIP`, puerto 80), con chequeos de disponibilidad y de vida sobre `/api/salud`, límites de recursos, usuario sin privilegios y sistema de archivos de solo lectura.

```bash
kubectl apply -f deploy/kubernetes.yaml
kubectl port-forward svc/operacion-agua 8080:80
# Abrir http://localhost:8080
```

Antes de aplicarlo hay que reemplazar el campo `image` por la ubicación donde se publique la imagen. Si el clúster no tiene acceso a un registro, la imagen se puede pasar como archivo:

```bash
docker save operacion-agua -o operacion-agua.tar   # quien la construye
docker load -i operacion-agua.tar                   # quien la recibe
```

## Publicar la imagen en GitHub Container Registry (opcional)

Requiere iniciar sesión con un token de GitHub con permiso `write:packages`:

```bash
docker login ghcr.io -u <usuario-de-github>
docker tag operacion-agua ghcr.io/dot-hawk/ai-lab-formosa-agua:v1.0
docker push ghcr.io/dot-hawk/ai-lab-formosa-agua:v1.0
```

Si el repositorio es privado, el paquete también lo es: hay que hacerlo público desde la configuración del paquete en GitHub, o darle acceso a la mesa.
