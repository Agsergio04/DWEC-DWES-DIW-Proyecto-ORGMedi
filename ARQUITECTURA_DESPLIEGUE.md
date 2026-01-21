# 🏗️ Arquitectura de Despliegue - ORGMedi

```
┌─────────────────────────────────────────────────────────────────┐
│                      INTERNET / USUARIO                         │
└─────────────────────────────────────────────────────────────────┘
              │                           │
              │                           │
              ▼                           ▼
    ┌──────────────────┐      ┌──────────────────────┐
    │   FRONTEND       │      │  HEALTH CHECK (Cron) │
    │  (Static Site)   │      │   (Web Service)      │
    │   Free Tier      │      │   Free Tier          │
    │                  │      │                      │
    │ React/Angular    │      │ Pings cada 10 min    │
    │ Assets estáticos │      │ al Backend           │
    └────────┬─────────┘      └──────────┬───────────┘
             │                           │
             │  HTTP Requests            │ HTTP GET
             │  (API calls)              │
             └─────────────┬─────────────┘
                          │
                          ▼
                ┌──────────────────────┐
                │     BACKEND          │
                │   (Web Service)      │
                │   Starter Tier       │
                │   $7/mes             │
                │                      │
                │  Spring Boot API     │
                │  Java 21             │
                │  /actuator/health    │
                └──────────┬───────────┘
                          │
                          ▼
                ┌──────────────────────┐
                │   DATABASE (H2)      │
                │   In-Memory + File   │
                │   /data/orgmedi.h2   │
                │   Persistent Disk    │
                │   1 GB               │
                └──────────────────────┘
```

## 📍 Ubicaciones en Render

### Frontend (Ya Desplegado ✅)
- **Tipo**: Static Site
- **URL**: `https://dwec-dwes-diw-proyecto-orgmedi.onrender.com`
- **Rama**: `master`
- **Root Dir**: `frontend`
- **Build**: `npm install && npm run build`
- **Publish**: `frontend/dist/Proyecto/browser`

### Backend (Por Desplegar)
- **Tipo**: Web Service
- **URL**: `https://orgmedi-backend-XXXX.onrender.com`
- **Rama**: `master`
- **Root Dir**: `backend`
- **Plan**: Starter ($7/mes)
- **Build**: Docker (Dockerfile en backend/)
- **Health**: `/actuator/health`
- **BD**: H2 (archivo persistente)

### Health Check (Por Desplegar)
- **Tipo**: Web Service
- **URL**: `https://orgmedi-health-check-XXXX.onrender.com`
- **Rama**: `master`
- **Root Dir**: `health-check`
- **Plan**: Free (gratis)
- **Build**: Docker (Dockerfile en health-check/)
- **Función**: Hacer ping cada 10 minutos al backend

---

## 🔄 Flujo de Peticiones

### Usuario accede a Frontend
```
1. Usuario → https://dwec-dwes-diw-proyecto-orgmedi.onrender.com
2. Render sirve archivos estáticos de frontend/dist/Proyecto/browser
3. Angular carga en el navegador
```

### Frontend hace petición a API
```
1. Angular → https://orgmedi-backend-XXXX.onrender.com/api/...
2. Backend procesa la petición
3. Backend responde con datos JSON
4. Angular actualiza la UI
```

### Health Check mantiene Backend activo
```
CADA 10 MINUTOS:
1. Health Check → https://orgmedi-backend-XXXX.onrender.com/actuator/health
2. Backend responde 200 OK
3. Render ve que está activo (previene spin-down en Free)
4. Si no hay health check, Render apaga backend después de 15 min de inactividad
```

---

## 💾 Persistencia de Datos

La base de datos **H2** está configurada para:
- Guardar datos en archivo: `/data/orgmedi.h2.db`
- Render proporciona disco persistente de 1 GB
- Los datos se mantienen entre redesplegues
- No necesita base de datos SQL separada

---

## 🔐 Variables de Entorno

### Backend (Render Environment Variables)
```
SPRING_PROFILES_ACTIVE = prod
SPRING_JPA_HIBERNATE_DDL_AUTO = update
SPRING_DATASOURCE_URL = jdbc:h2:file:/data/orgmedi;...
SPRING_DATASOURCE_DRIVERNAME = org.h2.Driver
SPRING_DATASOURCE_USERNAME = sa
SPRING_H2_CONSOLE_ENABLED = true
SPRING_JPA_DATABASE_PLATFORM = org.hibernate.dialect.H2Dialect
```

### Health Check (Render Environment Variables)
```
BACKEND_URL = https://orgmedi-backend-XXXX.onrender.com/actuator/health
CHECK_INTERVAL = 600
```

---

## 🚀 Secuencia de Despliegue

```
PASO 1: Backend
┌─────────────────────┐
│ Nueva Web Service   │
│ - Docker runtime    │
│ - Starter tier      │
└──────────┬──────────┘
           │
           ▼
        BUILD ✅
        START ✅
        READY ✅
           │
           ▼
    Anotar URL: https://orgmedi-backend-XXXX.onrender.com

PASO 2: Health Check
┌─────────────────────┐
│ Nueva Web Service   │
│ - Docker runtime    │
│ - Free tier         │
│ - URL del backend   │
└──────────┬──────────┘
           │
           ▼
        BUILD ✅
        START ✅
        READY ✅
           │
           ▼
    Verificar logs: checks cada 10 min

PASO 3: Actualizar CORS (si es necesario)
┌─────────────────────┐
│ application-prod.   │
│ properties:         │
│ CORS_ALLOWED_       │
│ ORIGINS=frontend URL│
└──────────┬──────────┘
           │
           ▼
        git push
           │
           ▼
        Manual Deploy en Backend
```

---

## 📊 Diagrama de Costes

```
┌────────────────────────────────────────┐
│         RESUMEN DE COSTES              │
├────────────────────────────────────────┤
│                                        │
│  Frontend (Static Site)    = $0/mes    │
│  Backend (Starter)         = $7/mes    │
│  Health Check (Free)       = $0/mes    │
│  Database (H2 in-disk)     = $0/mes    │
│                             ──────────  │
│  TOTAL                     = $7/mes    │
│                                        │
└────────────────────────────────────────┘
```

---

## ✅ Todo junto: Tu Stack en Producción

```
                    RENDER.COM (Cloud)
        ┌───────────────────────────────────┐
        │                                   │
        │  Frontend (Static)  ▶ https://... │
        │     + HTML/CSS/JS                 │
        │                                   │
        │  Backend (Java)     ▶ https://... │
        │     + Spring Boot 3.2             │
        │     + H2 Database                 │
        │                                   │
        │  Health Check       ▶ https://... │
        │     + Cron automático             │
        │     + Mantiene backend activo     │
        │                                   │
        └───────────────────────────────────┘


             TU REPOSITORIO (GitHub)
        ┌───────────────────────────────────┐
        │                                   │
        │  /backend          ▶ Código Java  │
        │  /frontend         ▶ Código Angular
        │  /health-check     ▶ Script shell │
        │  /docs             ▶ Documentación│
        │                                   │
        └───────────────────────────────────┘
```

---

**Última actualización**: 21 de enero de 2026  
**Status**: 🚀 Listo para despliegue
