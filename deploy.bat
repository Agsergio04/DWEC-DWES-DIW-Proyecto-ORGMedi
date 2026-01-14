@echo off
REM Script de despliegue para Docker en Windows

setlocal enabledelayedexpansion

echo ======================================
echo ORGMedi - Docker Deployment
echo ======================================

REM Verificar Docker
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker no está instalado
    exit /b 1
)

echo ✓ Docker encontrado

REM Verificar Docker Compose
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Compose no está instalado
    exit /b 1
)

echo ✓ Docker Compose encontrado

echo.
echo Selecciona una opción:
echo 1) Desplegar ^(desarrollo con Docker Compose^)
echo 2) Detener contenedores
echo 3) Ver logs
echo 4) Limpiar volúmenes y contenedores
echo 5) Desplegar en producción
echo 6) Salir
echo.

set /p option="Opción: "

if "%option%"=="1" (
    echo 🚀 Iniciando despliegue en desarrollo...
    docker-compose up -d
    echo ✓ Aplicación desplegada
    echo.
    echo Accede a:
    echo   Frontend: http://localhost:80
    echo   Backend API: http://localhost:8080
    echo   H2 Console: http://localhost:8080/h2-console
) else if "%option%"=="2" (
    echo ⏹️  Deteniendo contenedores...
    docker-compose down
    echo ✓ Contenedores detenidos
) else if "%option%"=="3" (
    echo 📋 Mostrando logs...
    docker-compose logs -f
) else if "%option%"=="4" (
    echo 🧹 Limpiando volúmenes y contenedores...
    set /p confirm="¿Estás seguro? (s/n): "
    if "%confirm%"=="s" (
        docker-compose down -v
        docker system prune -af
        echo ✓ Sistema limpiado
    )
) else if "%option%"=="5" (
    echo 🔐 Despliegue en producción
    if not exist ".env" (
        echo ❌ Archivo .env no encontrado
        echo Copia .env.example a .env y configura las variables
        exit /b 1
    )
    echo Iniciando despliegue...
    docker-compose -f docker-compose.prod.yml up -d
    echo ✓ Aplicación en producción
) else if "%option%"=="6" (
    echo Saliendo...
    exit /b 0
) else (
    echo ❌ Opción inválida
    exit /b 1
)
