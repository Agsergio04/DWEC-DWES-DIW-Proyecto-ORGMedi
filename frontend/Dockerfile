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

# Copiar configuración optimizada
COPY nginx.conf /etc/nginx/nginx.conf

# Copiar archivos compilados
COPY --from=builder /app/dist/Proyecto/browser /usr/share/nginx/html

# Copiar recursos estáticos
COPY public /usr/share/nginx/html/public

# Limpiar archivos innecesarios
RUN find /usr/share/nginx/html -type f \( -name "*.map" -o -name "*.md" \) -delete

# Exponer puerto
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=2 \
    CMD wget -q -O- http://localhost/actuator/health || exit 1

# Ejecutar Nginx
CMD ["nginx", "-g", "daemon off;"]
EXPOSE 80

# Comando para ejecutar Nginx
CMD ["nginx", "-g", "daemon off;"]
