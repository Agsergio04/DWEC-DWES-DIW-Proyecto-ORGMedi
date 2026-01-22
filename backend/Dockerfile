# Stage 1: Build - Lightweight builder
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder

WORKDIR /app

# Copiar solo pom.xml para descargar dependencias
COPY pom.xml .
COPY mvnw .
COPY mvnw.cmd .
COPY .mvn .mvn

# Descargar dependencias
RUN mvn dependency:resolve -DskipTests -q

# Copiar código fuente
COPY src src

# Compilar - FUERZA BUILD v0.0.2 (2026-01-22 20:00)
RUN mvn clean package -DskipTests -q && \
    rm -rf ~/.m2/repository

# Stage 2: Runtime - Minimal JRE
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Instalar solo Tesseract OCR necesario (minimal)
RUN apk add --no-cache \
    curl \
    tesseract-ocr \
    tesseract-ocr-data-spa \
    tesseract-ocr-data-eng \
    && rm -rf /var/cache/apk/*

# Copiar JAR desde builder
COPY --from=builder /app/target/*.jar app.jar

# Exponer puerto
EXPOSE 8080

# Optimizar JVM para contenedores pequeños
ENV SPRING_PROFILES_ACTIVE=prod
ENV JAVA_OPTS="-Xmx256m -Xms128m -XX:+UseG1GC -XX:MaxGCPauseMillis=200 -XX:+ParallelRefProcEnabled"
ENV TESSDATA_PREFIX=/usr/share/tesseract-ocr/tessdata

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8080/actuator/health || exit 1

# Ejecutar
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
