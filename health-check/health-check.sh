#!/bin/sh

# Health Check Script para Render Backend
# Mantiene el backend activo haciendo ping periódico

# ===== CONFIGURACIÓN =====
BACKEND_URL="${BACKEND_URL:-https://dwec-dwes-diw-proyecto-orgmedi-backend.onrender.com/actuator/health}"
CHECK_INTERVAL="${CHECK_INTERVAL:-600}"  # 600 segundos = 10 minutos
TIMEOUT="${TIMEOUT:-5}"

# ===== INFORMACIÓN =====
echo "🚀 Iniciando Health Check Automático"
echo "📍 Backend: $BACKEND_URL"
echo "⏱️  Intervalo: $CHECK_INTERVAL segundos ($(($CHECK_INTERVAL/60)) minutos)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ===== BUCLE PRINCIPAL =====
CHECK_COUNT=0

while true; do
    CHECK_COUNT=$((CHECK_COUNT + 1))
    TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
    
    # Hacer request al health check
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
        --max-time $TIMEOUT \
        "$BACKEND_URL" 2>/dev/null)
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo "[$TIMESTAMP] ✅ Check #$CHECK_COUNT - Status: $HTTP_CODE - Backend activo"
    elif [ "$HTTP_CODE" = "000" ]; then
        echo "[$TIMESTAMP] ⚠️  Check #$CHECK_COUNT - Conexión fallida (timeout/sin conexión)"
    else
        echo "[$TIMESTAMP] ⚠️  Check #$CHECK_COUNT - Status: $HTTP_CODE - Error"
    fi
    
    echo "⏳ Próximo check en $CHECK_INTERVAL segundos..."
    sleep "$CHECK_INTERVAL"
done
