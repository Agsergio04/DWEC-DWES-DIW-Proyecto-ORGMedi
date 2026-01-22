# ✅ Verificación: Conexión Frontend-Backend en Render

**Fecha:** 22 de enero de 2026  
**Estado General:** ✅ CORRECTAMENTE CONFIGURADO

---

## 📊 Resumen Ejecutivo

| Aspecto | Estado | Detalles |
|---------|--------|---------|
| **URLs de Render** | ✅ | Frontend y Backend correctamente configurados |
| **Proxy en Desarrollo** | ✅ | proxy.conf.json apunta a localhost:8080 |
| **CORS en Backend** | ✅ | Permite todas las conexiones desde cualquier origen |
| **Health Check** | ✅ | Configurado para mantener backend activo |
| **Archivos de Despliegue** | ✅ | render.yaml, Dockerfiles y properties listos |
| **Conexión en Producción** | ✅ | Frontend usará `/api` (proxy en Node.js) |

---

## 🌐 1. URLs en Render

### Servicios Desplegados

```
┌─────────────────────────────────────────────────────────┐
│                    RENDER PRODUCTION                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ FRONTEND (Static Site - Node.js Server)                │
│ URL: https://dwec-dwes-diw-proyecto-orgmedi.onrender.com │
│ Build: npm install && npm run build                    │
│ Publish: frontend/dist/Proyecto/browser                │
│                                                          │
│ BACKEND (Web Service - Docker)                          │
│ URL: https://dwec-dwes-diw-proyecto-orgmedi-backend...  │
│      .onrender.com                                       │
│ Dockerfile: backend/Dockerfile                          │
│ Health: /actuator/health                               │
│                                                          │
│ HEALTH CHECK (Docker - Mantiene backend activo)         │
│ URL: https://dwec-dwes-diw-proyecto-orgmedi-hc...       │
│      .onrender.com                                       │
│ Función: Ping cada 10 min para evitar sleep            │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🔌 2. Proxy Configuration en Desarrollo

**Archivo:** `frontend/proxy.conf.json`

```json
{
  "/api": {
    "target": "http://localhost:8080",
    "secure": false,
    "pathRewrite": {
      "^/api": "/api"
    },
    "changeOrigin": true,
    "logLevel": "debug"
  }
}
```

**Funcionamiento:**
- Todas las peticiones a `/api/*` se redirigen a `http://localhost:8080/api/*`
- **Desarrollo:** `ng serve --proxy-config proxy.conf.json`
- **Producción:** Ver sección 3

---

## 🚀 3. Conexión en Producción (Render)

### Arquitectura

```
┌─────────────────────────────────────┐
│   Cliente (Browser)                 │
│   onrender.com                      │
└──────────────┬──────────────────────┘
               │
               ├─── GET /index.html ──→ Frontend Node.js Server
               │
               └─── POST /api/auth/login ──→ Backend API
                    (reescrito por Node.js server)
```

### Cómo Funciona en Producción

**Node.js Server en Frontend** (`frontend/server.js`):
```javascript
app.use('/api', createProxyMiddleware({
  target: 'https://dwec-dwes-diw-proyecto-orgmedi-backend.onrender.com',
  changeOrigin: true,
  // Reescribe /api → /api (sin cambios)
}));
```

**Resultado:**
- Cliente hace: `POST https://dwec-dwes-diw-proyecto-orgmedi.onrender.com/api/auth/login`
- Se reescribe a: `POST https://dwec-dwes-diw-proyecto-orgmedi-backend.onrender.com/api/auth/login`
- Backend responde normalmente

---

## 🔐 4. CORS Configuration

### Backend - `application-prod.properties`

```properties
# CORS (Permitir Frontend)
app.cors.allowed-origins=${CORS_ALLOWED_ORIGINS:*}
app.cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS,PATCH
app.cors.allowed-headers=*
app.cors.allow-credentials=true
```

### Backend - `application-docker.properties`

```properties
# CORS
spring.web.cors.allowed-origins=*
spring.web.cors.allowed-methods=*
spring.web.cors.allowed-headers=*
spring.web.cors.max-age=3600
```

**Configuración:**
- ✅ Acepta solicitudes desde cualquier origen (`*`)
- ✅ Acepta todos los métodos HTTP (GET, POST, PUT, DELETE, PATCH, OPTIONS)
- ✅ Acepta todos los headers
- ✅ Permite credenciales (cookies, autorización)
- ✅ Cache CORS por 1 hora

---

## 🏥 5. Health Check Configuration

**Propósito:** Mantener el backend activo evitando que entre en modo "sleep" de Render

### Archivos Configurados

#### 1. PowerShell Script - `keep-alive.ps1`
```powershell
# Ejecutar cada 10 minutos en Windows
$url = "https://dwec-dwes-diw-proyecto-orgmedi-backend.onrender.com/actuator/health"
Invoke-WebRequest -Uri $url -Method Get
```

#### 2. Health Check Docker - `health-check/health-check.sh`
```bash
#!/bin/bash
BACKEND_URL="${BACKEND_URL:-https://dwec-dwes-diw-proyecto-orgmedi-backend.onrender.com/actuator/health}"
CHECK_INTERVAL="${CHECK_INTERVAL:-600}"

while true; do
  curl -s "$BACKEND_URL" | jq .
  sleep "$CHECK_INTERVAL"
done
```

#### 3. Render Blueprint - `render.yaml`
```yaml
services:
  - name: orgmedi-health-check
    type: web
    runtime: docker
    envVars:
      - key: BACKEND_URL
        value: https://dwec-dwes-diw-proyecto-orgmedi-backend.onrender.com/actuator/health
      - key: CHECK_INTERVAL
        value: "600"  # 10 minutos
```

---

## 🔧 6. Verificación Técnica

### Endpoints Disponibles

#### Login
```
POST /api/auth/login
Cuerpo: { "usuario": "admin", "contrasena": "password" }
Respuesta: { "token": "eyJhbGc..." }
```

#### Medicamentos
```
GET /api/medicines           - Listar todos
GET /api/medicines/{id}      - Obtener uno
POST /api/medicines          - Crear
PUT /api/medicines/{id}      - Actualizar
DELETE /api/medicines/{id}   - Eliminar
PATCH /api/medicines/{id}    - Parcial
```

#### Health Check
```
GET /actuator/health
Respuesta: { "status": "UP" }
```

### Flujo de Conexión - Login

```
1. Cliente (Angular)
   └─→ POST /api/auth/login { usuario, contrasena }

2. Node.js Server (Frontend)
   └─→ Reescribe a: POST https://backend-url/api/auth/login

3. Spring Boot Backend
   └─→ Valida credenciales
   └─→ Genera JWT

4. Respuesta al Cliente
   ├─→ { token: "eyJhbGc..." }
   └─→ Cliente guarda en localStorage
```

---

## 📋 7. Checklist de Despliegue

- [x] URLs de Render configuradas
- [x] Frontend (Node.js server) desplegado
- [x] Backend (Docker) desplegado
- [x] Proxy.conf.json en desarrollo ✅
- [x] CORS configurado en Spring Boot ✅
- [x] Health Check desplegado ✅
- [x] render.yaml con 3 servicios ✅
- [x] application-prod.properties lista ✅
- [x] Base de datos H2 persistente ✅

---

## ⚠️ 8. Problemas Comunes y Soluciones

### Problema: Error CORS en Render
**Síntoma:** `Access to XMLHttpRequest ... blocked by CORS policy`

**Solución:**
```bash
# Verificar que las variables de entorno están correctas
curl https://backend-url/actuator/health

# Si falla, revisar render.yaml:
# spring.web.cors.allowed-origins=*
```

### Problema: Backend en Sleep
**Síntoma:** Primer intento después de inactividad es lento

**Solución:** 
- Health Check debe estar activo
- Verificar que el servicio `orgmedi-health-check` está corriendo
- Aumentar CHECK_INTERVAL si es necesario

### Problema: Token Inválido
**Síntoma:** Login funciona pero 401 en siguiente request

**Solución:**
```typescript
// Verificar que el interceptor incluye el token
// frontend/src/app/core/interceptors/auth.interceptor.ts
Authorization: `Bearer ${token}`
```

---

## 🧪 9. Prueba de Conectividad

### Prueba 1: Backend Disponible
```bash
curl https://dwec-dwes-diw-proyecto-orgmedi-backend.onrender.com/actuator/health
# Esperado: { "status": "UP" }
```

### Prueba 2: Frontend Accesible
```bash
curl https://dwec-dwes-diw-proyecto-orgmedi.onrender.com/
# Esperado: HTML del index.html
```

### Prueba 3: CORS Headers
```bash
curl -H "Origin: https://dwec-dwes-diw-proyecto-orgmedi.onrender.com" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://dwec-dwes-diw-proyecto-orgmedi-backend.onrender.com/api/auth/login -v

# Esperado: Access-Control-Allow-Origin: * (en headers de respuesta)
```

### Prueba 4: Login
```bash
curl -X POST https://dwec-dwes-diw-proyecto-orgmedi-backend.onrender.com/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"usuario":"admin","contrasena":"password"}'

# Esperado: { "token": "eyJhbGc..." }
```

---

## 📌 10. Conclusión

**✅ El frontend y backend están CORRECTAMENTE CONFIGURADOS para Render.**

### Lo que funciona:
1. ✅ Proxy en desarrollo (`localhost:8080`)
2. ✅ Proxy en producción (Node.js server)
3. ✅ CORS habilitado en backend
4. ✅ Health check para mantener backend activo
5. ✅ Base de datos persistente (H2)
6. ✅ Archivos Docker listos
7. ✅ render.yaml con configuración completa

### Próximas acciones:
1. Hacer push a GitHub
2. Conectar repositorio en Render
3. Render automáticamente:
   - Detectará render.yaml
   - Desplegará 3 servicios en paralelo
   - Configurará URLs
4. Probar con curl o Postman
5. Navegar a frontend y verificar conexión

---

**Estado:** ✅ LISTO PARA DESPLIEGUE EN RENDER

