# 🚀 Pasos Finales para Despliegue Completo

## Estado Actual

✅ **Frontend**: Desplegado como Static Site en Render  
URL: `https://dwec-dwes-diw-proyecto-orgmedi.onrender.com`

❌ **Backend**: No desplegado (siguiente paso)  
❌ **Health Check**: No desplegado (siguiente paso)

---

## Paso 1: Desplegar Backend en Render

### 1.1 Crear Web Service para Backend

1. Ir a [dashboard.render.com](https://dashboard.render.com)
2. Hacer clic en **"New Web Service"**
3. Conectar repositorio GitHub: `Agsergio04/DWEC-DWES-DIW-Proyecto-ORGMedi`
4. Configurar:

| Campo | Valor |
|-------|-------|
| **Name** | `orgmedi-backend` |
| **Language** | `Docker` |
| **Branch** | `master` |
| **Root Directory** | `backend` |
| **Instance Type** | `Starter` ($7/mes) |

### 1.2 Agregar Variables de Entorno

En **"Environment"** agregar:

```
SPRING_PROFILES_ACTIVE = prod
SPRING_JPA_HIBERNATE_DDL_AUTO = update
```

### 1.3 Configurar Disco Persistente

- **Mount Path**: `/data`
- **Size**: 1 GB

### 1.4 Hacer Deploy

Hacer clic en **"Deploy"** y esperar 5-10 minutos.

---

## Paso 2: Obtener URL del Backend

Después que se despliegue exitosamente, anota esta URL:

```
https://orgmedi-backend-XXXX.onrender.com
```

Puedes verificar que está activo visitando:
```
https://orgmedi-backend-XXXX.onrender.com/actuator/health
```

Debería responder con:
```json
{
  "status": "UP"
}
```

---

## Paso 3: Desplegar Health Check en Render

### 3.1 Crear Web Service para Health Check

1. En **Dashboard** → **"New Web Service"**
2. Conectar repositorio GitHub: `Agsergio04/DWEC-DWES-DIW-Proyecto-ORGMedi`
3. Configurar:

| Campo | Valor |
|-------|-------|
| **Name** | `orgmedi-health-check` |
| **Language** | `Docker` |
| **Branch** | `master` |
| **Root Directory** | `health-check` |
| **Instance Type** | `Free` ✅ (gratis) |

### 3.2 Agregar Variables de Entorno

En **"Environment"** agregar:

```
BACKEND_URL = https://orgmedi-backend-XXXX.onrender.com/actuator/health
CHECK_INTERVAL = 600
```

**⚠️ IMPORTANTE**: Reemplaza `XXXX` con el ID real de tu backend.

### 3.3 Hacer Deploy

Hacer clic en **"Deploy"** y esperar 2-3 minutos.

---

## Paso 4: Verificar que Todo Funciona

### 4.1 Verificar Backend

```bash
curl https://orgmedi-backend-XXXX.onrender.com/actuator/health
```

Debe responder con `"status": "UP"`

### 4.2 Verificar Health Check

En **Dashboard → orgmedi-health-check → Logs**

Deberías ver cada 10 minutos:
```
[2026-01-21 10:30:45] ✅ Check #1 - Status: 200 - Backend activo
```

### 4.3 Verificar Frontend

Visita: `https://dwec-dwes-diw-proyecto-orgmedi.onrender.com`

---

## Paso 5: Actualizar CORS en Backend

Si el frontend no puede conectar con el backend, actualizar `application-prod.properties`:

```properties
app.cors.allowed-origins=https://dwec-dwes-diw-proyecto-orgmedi.onrender.com
```

Luego hacer un **Manual Deploy** en Render.

---

## Paso 6: Hacer Push a GitHub (Importante)

Para que Render lea los archivos nuevos:

```bash
cd "c:\Users\sergi\Desktop\Trabajo\fp\Segundo\Diseño de Interfaces web"

git add .
git commit -m "Agregar health-check y configuración de despliegue en Render"
git push origin master
```

---

## 🎯 URLs Finales

Una vez completado todo:

| Servicio | URL |
|----------|-----|
| **Frontend** | `https://dwec-dwes-diw-proyecto-orgmedi.onrender.com` |
| **Backend** | `https://orgmedi-backend-XXXX.onrender.com` |
| **Health Check** | `https://orgmedi-health-check-XXXX.onrender.com` |
| **Backend Health** | `https://orgmedi-backend-XXXX.onrender.com/actuator/health` |

---

## 📊 Coste Total

| Servicio | Precio |
|----------|--------|
| Frontend (Static Site) | **Gratis** |
| Backend (Web Service - Starter) | **$7/mes** |
| Health Check (Web Service - Free) | **Gratis** |
| **Total** | **$7/mes** |

---

## 🆘 Solución de Problemas

### ❌ "Build failed" en Backend

**Síntoma**: Error durante Maven build

**Solución**:
```bash
# Verificar localmente
cd backend
./mvnw clean package -DskipTests
```

Si hay errores, corregir en el código y hacer push a GitHub.

### ❌ Health Check no funciona

**Síntoma**: Logs vacíos o errores de conexión

**Solución**:
1. Verificar que `BACKEND_URL` sea correcta en Render
2. Esperar 1 minuto después que backend esté activo
3. En Dashboard → health-check → Manual Deploy

### ❌ Frontend no puede conectar Backend

**Síntoma**: Error 504 Gateway Timeout

**Soluciones**:
1. Verificar Backend está activo: `https://orgmedi-backend-XXXX.onrender.com/actuator/health`
2. Verificar CORS en `application-prod.properties`
3. En DevTools → Network → ver qué URL se intenta

---

## ✅ Checklist Final

- [ ] Backend desplegado en Render
- [ ] Health Check desplegado en Render
- [ ] Logs del health check muestran checks exitosos cada 10 minutos
- [ ] Frontend puede conectar con Backend
- [ ] CORS configurado correctamente
- [ ] URL real del Backend guardada (para el health-check)
- [ ] Código pusheado a GitHub

---

**Última actualización**: 21 de enero de 2026
