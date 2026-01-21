# Health Check Automático con Docker

Servicio Docker que mantiene el backend activo haciendo health checks periódicos.

## 📁 Estructura

```
health-check/
├── Dockerfile
└── health-check.sh
```

## 🚀 Cómo usar

### Opción 1: Con docker-compose (Recomendado)

El servicio de health check está integrado en `docker-compose.yml`. Solo ejecuta:

```bash
docker-compose up -d
```

Esto levantará:
- ✅ Backend
- ✅ Frontend  
- ✅ Health Check (automático)

### Opción 2: Levantar solo el health check

```bash
docker-compose up -d health-check
```

### Opción 3: Build y run manual

```bash
# Build
docker build -t orgmedi-health-check ./health-check

# Run
docker run -d \
  --name orgmedi-health-check \
  --network orgmedi-network \
  -e BACKEND_URL="http://orgmedi-backend:8080/actuator/health" \
  -e CHECK_INTERVAL=600 \
  orgmedi-health-check
```

## 📊 Configuración

Edita el `docker-compose.yml` para cambiar:

```yaml
health-check:
  environment:
    BACKEND_URL: "http://orgmedi-backend:8080/actuator/health"  # URL del backend
    CHECK_INTERVAL: "600"  # Intervalo en segundos (10 minutos)
```

### Variables de Entorno:

| Variable | Por defecto | Descripción |
|----------|------------|-------------|
| `BACKEND_URL` | `http://orgmedi-backend:8080/actuator/health` | URL del health check |
| `CHECK_INTERVAL` | `600` | Intervalo entre checks en segundos |
| `TIMEOUT` | `5` | Timeout para cada request en segundos |

## 🔍 Ver Logs

```bash
# Ver logs del health check
docker logs -f orgmedi-health-check

# Ver logs de todos los servicios
docker-compose logs -f

# Solo últimas 50 líneas
docker logs --tail 50 -f orgmedi-health-check
```

## ⚙️ Cambiar Intervalo

Para checks cada 5 minutos (300 segundos):

```yaml
health-check:
  environment:
    CHECK_INTERVAL: "300"  # 5 minutos
```

O en producción (Render), con tu URL real:

```yaml
health-check:
  environment:
    BACKEND_URL: "https://orgmedi-backend-xxxx.onrender.com/actuator/health"
    CHECK_INTERVAL: "600"  # 10 minutos
```

## 🛑 Detener el Health Check

```bash
docker-compose down health-check
# o
docker stop orgmedi-health-check
```

## ✅ Ejemplo de Output

```
🚀 Iniciando Health Check Automático
📍 Backend: http://orgmedi-backend:8080/actuator/health
⏱️  Intervalo: 600 segundos (10 minutos)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[2026-01-21 10:30:45] ✅ Check #1 - Status: 200 - Backend activo
⏳ Próximo check en 600 segundos...
[2026-01-21 10:40:45] ✅ Check #2 - Status: 200 - Backend activo
⏳ Próximo check en 600 segundos...
```

## 🐳 Con Docker Desktop

En Windows/Mac con Docker Desktop:

```bash
# En la carpeta del proyecto
docker-compose up -d

# Ver todos los servicios
docker-compose ps

# Ver logs
docker-compose logs -f health-check
```

---

**Nota**: Este servicio solo funciona si el backend también está en Docker. Para Render (producción), usa el script PowerShell o configura un sistema de monitoreo externo.
