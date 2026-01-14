# Despliegue con Docker - ORGMedi

Este proyecto incluye configuración completa de Docker para desplegar tanto el backend (Spring Boot) como el frontend (Angular).

## Requisitos Previos

- Docker (v20.10+)
- Docker Compose (v2.0+)
- Git

## Estructura de Archivos Docker

```
.
├── docker-compose.yml          # Orquestación de servicios
├── .dockerignore               # Archivos a ignorar en build
├── backend/
│   ├── Dockerfile             # Build multi-stage para Java
│   └── .dockerignore          # Archivos a ignorar en backend
└── frontend/
    ├── Dockerfile             # Build multi-stage para Angular
    ├── nginx.conf             # Configuración de Nginx
    └── .dockerignore          # Archivos a ignorar en frontend
```

## Despliegue Rápido

### 1. Opción 1: Desplegar con Docker Compose (Recomendado)

```bash
# Desde la raíz del proyecto
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down
```

### 2. Opción 2: Construir y ejecutar manualmente

#### Backend
```bash
cd backend
docker build -t orgmedi-backend .
docker run -p 8080:8080 \
  -e SPRING_PROFILES_ACTIVE=docker \
  orgmedi-backend
```

#### Frontend
```bash
cd frontend
docker build -t orgmedi-frontend .
docker run -p 80:80 orgmedi-frontend
```

## Acceso a Aplicaciones

- **Frontend**: http://localhost:80
- **Backend (API)**: http://localhost:8080
- **H2 Console** (si está habilitada): http://localhost:8080/h2-console

## Configuración de Entorno

### Backend (docker-compose.yml)

```yaml
environment:
  SPRING_PROFILES_ACTIVE: docker
  JWT_SECRET: clave_secreta_demo_clave_mucho_mas_larga_0123456789
  JWT_EXPIRATION: 86400000
  SPRING_DATASOURCE_URL: jdbc:h2:mem:orgmedi
  # Para MySQL descomentar en docker-compose.yml
```

### Frontend

El frontend se configura automáticamente con Nginx para:
- Servir archivos estáticos con caché optimizado
- Proxy de peticiones `/api` al backend
- Soporte para routing de Angular (SPA)

## Características de los Dockerfiles

### Backend (Maven + Java 21)
- **Stage 1 (Builder)**: Compila el proyecto con Maven
- **Stage 2 (Runtime)**: Usa imagen JRE ligera
- **Health Check**: Verifica disponibilidad del backend
- **Configuración**: Variables de entorno para producción

### Frontend (Node + Nginx)
- **Stage 1 (Builder)**: Compila Angular con npm
- **Stage 2 (Runtime)**: Sirve con Nginx optimizado
- **Gzip**: Compresión habilitada
- **Caché**: Estrategia inteligente de caché
- **SPA Routing**: Soporte completo para Angular Router

## Construcción Personalizada

### Construir solo backend
```bash
docker build -t orgmedi-backend:latest ./backend
```

### Construir solo frontend
```bash
docker build -t orgmedi-frontend:latest ./frontend
```

### Especificar variables de entorno
```bash
docker build --build-arg JAVA_VERSION=21 -t orgmedi-backend ./backend
```

## Solución de Problemas

### El backend no inicia
```bash
# Ver logs detallados
docker-compose logs backend

# Reiniciar servicio
docker-compose restart backend
```

### El frontend muestra error 502
```bash
# Verificar que backend está corriendo
docker-compose ps

# Verificar conectividad entre contenedores
docker-compose logs frontend
```

### Limpiar todo y comenzar de nuevo
```bash
docker-compose down -v
docker system prune -a
docker-compose up -d
```

## Optimizaciones Realizadas

1. **Multi-stage builds**: Reduce tamaño de imágenes
2. **Health checks**: Verifica disponibilidad de servicios
3. **Caché en capas**: Acelera rebuilds
4. **Gzip compression**: Reduce tamaño de respuestas
5. **Nginx optimization**: Mejor rendimiento del frontend
6. **Networking**: Red bridge personalizada para comunicación

## Base de Datos

Por defecto usa **H2 en memoria**. Para usar MySQL:

1. Descomentar sección `mysql` en `docker-compose.yml`
2. Descomentar variables `SPRING_DATASOURCE_*` en backend
3. Ejecutar: `docker-compose up -d`

## Próximos Pasos

- [ ] Configurar variables de entorno en `.env`
- [ ] Implementar registros con ELK Stack
- [ ] Agregar certificados SSL/TLS
- [ ] Configurar CI/CD con GitHub Actions
- [ ] Desplegar en Kubernetes o Azure Container Instances

## Soporte

Para más información sobre Docker:
- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Best practices for writing Dockerfiles](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
