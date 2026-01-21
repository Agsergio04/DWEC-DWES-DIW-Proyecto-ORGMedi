# Script de Health Check Automático para Backend en Render
# Mantiene el backend activo haciendo ping periódico a /actuator/health

# ===== CONFIGURACIÓN =====
$backendUrl = "https://dwec-dwes-diw-proyecto-orgmedi-backend.onrender.com/actuator/health"  # ⚠️ CAMBIAR XXX POR TU URL
$checkInterval = 600  # segundos (10 minutos)
$timeoutSeconds = 5

# Colores para output
$successColor = "Green"
$errorColor = "Red"
$infoColor = "Cyan"

# ===== FUNCIÓN DE PING =====
function Test-BackendHealth {
    param(
        [string]$Url
    )
    
    try {
        $response = Invoke-WebRequest -Uri $Url -TimeoutSec $timeoutSeconds -UseBasicParsing
        return @{
            Success = $true
            StatusCode = $response.StatusCode
            Message = "Health check exitoso"
        }
    } catch {
        return @{
            Success = $false
            StatusCode = $_.Exception.Response.StatusCode
            Message = $_.Exception.Message
        }
    }
}

# ===== VALIDAR CONFIGURACIÓN =====
if ($backendUrl -like "*xxxx*") {
    Write-Host "❌ ERROR: Debes cambiar la URL del backend en el script" -ForegroundColor $errorColor
    Write-Host "Cambia: `$backendUrl = `"https://orgmedi-backend-XXXX.onrender.com/actuator/health`"" -ForegroundColor $infoColor
    exit 1
}

# ===== BUCLE PRINCIPAL =====
Write-Host "🚀 Iniciando Health Check Automático" -ForegroundColor $infoColor
Write-Host "📍 Backend: $backendUrl" -ForegroundColor $infoColor
Write-Host "⏱️  Intervalo: $checkInterval segundos ($([math]::Round($checkInterval/60)) minutos)" -ForegroundColor $infoColor
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor $infoColor
Write-Host ""

$checkCount = 0

while ($true) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $checkCount++
    
    $result = Test-BackendHealth -Url $backendUrl
    
    if ($result.Success) {
        Write-Host "[$timestamp] ✅ Check #$checkCount - Status: $($result.StatusCode) - Backend activo" -ForegroundColor $successColor
    } else {
        Write-Host "[$timestamp] ⚠️  Check #$checkCount - Error: $($result.Message)" -ForegroundColor $errorColor
    }
    
    Write-Host "⏳ Próximo check en $checkInterval segundos..." -ForegroundColor "Gray"
    Start-Sleep -Seconds $checkInterval
}
