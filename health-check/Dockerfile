FROM alpine:latest

# Instalar curl
RUN apk add --no-cache curl

# Copiar script de health check
COPY health-check.sh /app/health-check.sh

# Permisos de ejecución
RUN chmod +x /app/health-check.sh

# Ejecutar el script
CMD ["/app/health-check.sh"]
