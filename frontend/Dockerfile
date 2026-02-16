# Stage 1: Build - Lightweight Node builder
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependencias
RUN npm ci --prefer-offline --no-audit

# Copiar código fuente
COPY . .

# Construir aplicación
RUN npm run build

# Stage 2: Nginx minimal
FROM nginx:alpine

# Instalar wget y curl para health checks
RUN apk add --no-cache wget curl

# Copiar configuración de Nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Copiar archivos compilados del build
COPY --from=builder /app/dist/Proyecto/browser /usr/share/nginx/html

# Copiar archivos estáticos públicos desde builder
COPY --from=builder /app/public /usr/share/nginx/html/public

# Crear directorio de logs
RUN mkdir -p /var/log/nginx

# Exponer puerto HTTP
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=2 \
    CMD wget -q -O- http://localhost/ || exit 1

# Ejecutar Nginx
CMD ["nginx", "-g", "daemon off;"]

