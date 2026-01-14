# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar código fuente
COPY . .

# Construir la aplicación Angular
RUN npm run build

# Stage 2: Runtime con Nginx
FROM nginx:alpine

# Copiar configuración de Nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Copiar archivos construidos desde el stage anterior
COPY --from=builder /app/dist/Proyecto/browser /usr/share/nginx/html

# Copiar carpeta public (archivos estáticos)
COPY public /usr/share/nginx/html/public

# Exponer puerto
EXPOSE 80

# Comando para ejecutar Nginx
CMD ["nginx", "-g", "daemon off;"]
