#!/bin/bash

# Script de despliegue para Docker

set -e

echo "======================================"
echo "ORGMedi - Docker Deployment"
echo "======================================"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker no está instalado${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker encontrado${NC}"

# Verificar Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose no está instalado${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker Compose encontrado${NC}"

# Menu
echo ""
echo -e "${YELLOW}Selecciona una opción:${NC}"
echo "1) Desplegar (desarrollo con Docker Compose)"
echo "2) Detener contenedores"
echo "3) Ver logs"
echo "4) Limpiar volúmenes y contenedores"
echo "5) Desplegar en producción"
echo "6) Salir"
echo ""

read -p "Opción: " option

case $option in
    1)
        echo -e "${YELLOW}🚀 Iniciando despliegue en desarrollo...${NC}"
        docker-compose up -d
        echo -e "${GREEN}✓ Aplicación desplegada${NC}"
        echo ""
        echo -e "${YELLOW}Accede a:${NC}"
        echo "  Frontend: http://localhost:80"
        echo "  Backend API: http://localhost:8080"
        echo "  H2 Console: http://localhost:8080/h2-console"
        ;;
    2)
        echo -e "${YELLOW}⏹️  Deteniendo contenedores...${NC}"
        docker-compose down
        echo -e "${GREEN}✓ Contenedores detenidos${NC}"
        ;;
    3)
        echo -e "${YELLOW}📋 Mostrando logs...${NC}"
        docker-compose logs -f
        ;;
    4)
        echo -e "${YELLOW}🧹 Limpiando volúmenes y contenedores...${NC}"
        read -p "¿Estás seguro? (s/n): " confirm
        if [ "$confirm" = "s" ]; then
            docker-compose down -v
            docker system prune -af
            echo -e "${GREEN}✓ Sistema limpiado${NC}"
        fi
        ;;
    5)
        echo -e "${YELLOW}🔐 Despliegue en producción${NC}"
        if [ ! -f ".env" ]; then
            echo -e "${RED}❌ Archivo .env no encontrado${NC}"
            echo "Copia .env.example a .env y configura las variables"
            exit 1
        fi
        echo -e "${YELLOW}Iniciando despliegue...${NC}"
        docker-compose -f docker-compose.prod.yml up -d
        echo -e "${GREEN}✓ Aplicación en producción${NC}"
        ;;
    6)
        echo "Saliendo..."
        exit 0
        ;;
    *)
        echo -e "${RED}❌ Opción inválida${NC}"
        exit 1
        ;;
esac
