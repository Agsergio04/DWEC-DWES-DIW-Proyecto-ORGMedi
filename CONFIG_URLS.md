# ✅ Configuración Final - URLs en Render

## 🌐 URLs en Producción

| Servicio | URL |
|----------|-----|
| **Frontend** | `https://dwec-dwes-diw-proyecto-orgmedi.onrender.com` |
| **Backend** | `https://dwec-dwes-diw-proyecto-orgmedi-backend.onrender.com` |
| **Health Check Backend** | `https://dwec-dwes-diw-proyecto-orgmedi-backend.onrender.com/actuator/health` |

---

## ✔️ Archivos Actualizados

### 1. Health Check Script (PowerShell)
- **Archivo**: `keep-alive.ps1`
- **URL Configurada**: `https://dwec-dwes-diw-proyecto-orgmedi-backend.onrender.com/actuator/health`
- **Estado**: ✅ Listo para usar

### 2. Health Check Docker Script
- **Archivo**: `health-check/health-check.sh`
- **URL Configurada**: `https://dwec-dwes-diw-proyecto-orgmedi-backend.onrender.com/actuator/health`
- **Estado**: ✅ Listo para desplegar

### 3. Render Blueprint
- **Archivo**: `render.yaml`
- **URL Backend**: `https://dwec-dwes-diw-proyecto-orgmedi-backend.onrender.com/actuator/health`
- **Estado**: ✅ Configurado

---

## 🚀 Próximos Pasos

### Opción A: Usar Health Check de Docker (Recomendado para Render)

**Si aún no tienes desplegado el health-check en Render:**

1. Ir a [Render Dashboard](https://dashboard.render.com)
2. Crear **New Web Service**
3. Conectar repositorio y seleccionar:
   - **Branch**: `master`
   - **Root Directory**: `health-check/`
   - **Instance Type**: `Free`
   - **Language**: Docker

4. **Variables de Entorno** (ya están en render.yaml):
   ```
   BACKEND_URL = https://dwec-dwes-diw-proyecto-orgmedi-backend.onrender.com/actuator/health
   CHECK_INTERVAL = 600
   ```

5. Hacer clic en **Deploy**

**Resultado**: El health-check de Docker se ejecutará automáticamente cada 10 minutos, sin necesidad de tener una terminal abierta.

---

### Opción B: Usar Health Check de PowerShell (Windows Local)

**Si ejecutas esto desde tu computadora Windows:**

```powershell
# En PowerShell como administrador
cd "c:\Users\sergi\Desktop\Trabajo\fp\Segundo\Diseño de Interfaces web"

powershell -ExecutionPolicy Bypass -File "keep-alive.ps1"
```

O simplemente:
```powershell
./run-health-check.bat
```

**Resultado**: Cada 10 minutos hará un ping al backend. Mantiene una terminal abierta.

---

## 📋 Integración Frontend-Backend

### En el Frontend (`environment.prod.ts`)

Asegúrate de que la URL del API está configurada correctamente:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://dwec-dwes-diw-proyecto-orgmedi-backend.onrender.com'
};
```

### En el Backend (`application-prod.properties`)

CORS configurado para aceptar peticiones del frontend:

```properties
app.cors.allowed-origins=https://dwec-dwes-diw-proyecto-orgmedi.onrender.com
app.cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS,PATCH
app.cors.allowed-headers=*
app.cors.allow-credentials=true
```

---

## ✅ Verificación

### 1. Backend está activo
```bash
curl https://dwec-dwes-diw-proyecto-orgmedi-backend.onrender.com/actuator/health
```

Debe responder:
```json
{
  "status": "UP"
}
```

### 2. Frontend puede conectar
1. Abre: `https://dwec-dwes-diw-proyecto-orgmedi.onrender.com`
2. DevTools → **Network** tab
3. Interactúa con la app
4. Busca peticiones HTTP hacia el backend
5. Deberían ser exitosas (200 OK)

### 3. Health Check está funcionando
En Render Dashboard → **orgmedi-health-check** → **Logs**

Deberías ver:
```
✅ Check #1 - Status: 200 - Backend activo
✅ Check #2 - Status: 200 - Backend activo
...
```

---

## 🎯 Resumen Final

**Tu aplicación ORGMedi ahora está completa:**

```
┌─────────────────────────────────────────┐
│   USUARIO EN INTERNET                   │
└─────────────────┬───────────────────────┘
                  │
        ┌─────────▼─────────┐
        │   FRONTEND        │
        │   Static Site     │
        │   (Render)        │
        │                   │
        │  https://dwec-    │
        │  dwes-diw-...     │
        │                   │
        └─────────┬─────────┘
                  │
                  │ API Calls
                  ▼
        ┌─────────────────────────┐
        │   BACKEND               │
        │   Web Service           │
        │   (Render)              │
        │                         │
        │  https://dwec-dwes-     │
        │  diw-...-backend        │
        │                         │
        │  ✅ CORS Habilitado     │
        │  ✅ Health Check Activo │
        └─────────┬───────────────┘
                  │
                  ▼
        ┌─────────────────────┐
        │   BASE DE DATOS     │
        │   H2 (Archivo)      │
        │                     │
        │   /data/orgmedi.h2  │
        └─────────────────────┘
```

---

## 📝 Nota Final

**Archivos que se pueden eliminar (opcional):**
- `keep-alive.ps1` - Ya no es necesario si usas Docker health-check
- `run-health-check.bat` - Ya no es necesario si usas Docker health-check

**Mantén:**
- `health-check/` - Para despliegue en Render
- `docker-compose.yml` - Para desarrollo local

---

**Estado**: ✅ **CONFIGURACIÓN COMPLETA**  
**Última actualización**: 21 de enero de 2026
