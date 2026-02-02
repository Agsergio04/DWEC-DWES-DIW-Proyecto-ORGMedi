# Stage 1: Build - Lightweight Node builder
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --prefer-offline --no-audit && \
    npm cache clean --force

# Copiar código fuente
COPY . .

# Construir - output optimizado
RUN npm run build -- --configuration production --optimization

# Stage 2: Nginx minimal
FROM nginx:alpine

# Instalar wget para health checks
RUN apk add --no-cache wget curl

# Copiar configuración optimizada
COPY nginx.conf /etc/nginx/nginx.conf

# Copiar archivos compilados del build
COPY --from=builder /app/dist/Proyecto/browser /usr/share/nginx/html

# Copiar archivos estáticos públicos (assets, redirects, etc.)
COPY --chown=nginx:nginx public /usr/share/nginx/html/public

# Limpiar archivos innecesarios (.map, .md)
RUN find /usr/share/nginx/html -type f \( -name "*.map" -o -name "*.md" \) -delete

# Crear directorio de logs si no existe
RUN mkdir -p /var/log/nginx

# Exponer puerto HTTP
EXPOSE 80

# Health check - verifica que Nginx está respondiendo
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=2 \
    CMD wget -q -O- http://localhost/ || exit 1

# Ejecutar Nginx en foreground
CMD ["nginx", "-g", "daemon off;"]
