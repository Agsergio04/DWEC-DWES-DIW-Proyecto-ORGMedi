@echo off
REM Script para ejecutar el Health Check Automático
REM Ejecuta keep-alive.ps1 en PowerShell

echo.
echo ========================================
echo  Health Check Automatico - Render
echo ========================================
echo.

REM Verificar que el archivo existe
if not exist "keep-alive.ps1" (
    echo ERROR: No se encuentra keep-alive.ps1 en la carpeta actual
    pause
    exit /b 1
)

REM Ejecutar el script PowerShell
echo Iniciando Health Check Automatico...
echo.
powershell -ExecutionPolicy Bypass -NoProfile -File "keep-alive.ps1"

pause
