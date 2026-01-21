# 🚀 Guía de Despliegue en Render

## Tabla de Contenidos

1. [Requisitos Previos](#requisitos-previos)
2. [Preparación del Proyecto](#preparación-del-proyecto)
3. [Despliegue en Render](#despliegue-en-render)
4. [Configuración del Backend](#configuración-del-backend)
5. [Configuración del Frontend](#configuración-del-frontend)
6. [Base de Datos](#base-de-datos)
7. [Variables de Entorno](#variables-de-entorno)
8. [Dominio Personalizado](#dominio-personalizado)
9. [Monitoreo y Logs](#monitoreo-y-logs)
10. [Solución de Problemas](#solución-de-problemas)

---

## Requisitos Previos

✅ Cuenta activa en [Render.com](https://render.com)  
✅ Repositorio GitHub público con el código del proyecto  
✅ Acceso a GitHub desde tu cuenta de Render  
✅ Java 21 instalado localmente (para pruebas)  
✅ Node.js 20+ instalado localmente (para pruebas)  

---

## Preparación del Proyecto

### 1. Verificar Estructura del Proyecto

```
proyecto-root/
├── backend/
│   ├── pom.xml (Maven configurado)
│   ├── src/
│   ├── mvnw
│   └── mvnw.cmd
├── frontend/
│   ├── package.json
│   ├── angular.json
│   └── src/
├── render.yaml (Configuración para Render)
├── docker-compose.yml
└── README.md
```

### 2. Asegurar Archivos Requeridos

**Backend - `backend/pom.xml`:**
- Debe tener Spring Boot 3.2.5+
- Dependencia `spring-boot-starter-web`
- Dependencia `spring-boot-starter-actuator` ✅ (ya añadido)

**Frontend - `frontend/package.json`:**
- Debe tener script `build`: `ng build --configuration production`
- Debe tener script `start`: `node server.js` o similiar para servir archivos estáticos

```json
{
  "scripts": {
    "build": "ng build --configuration production",
    "start": "node server.js",
    "dev": "ng serve",
    "test": "ng test"
  }
}
```

**Crear `frontend/server.js` (si no existe):**
```javascript
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'dist/Proyecto/browser')));

// Para SPA - redirigir todas las rutas a index.html
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/Proyecto/browser/index.html'));
});

app.listen(PORT, () => {
  console.log(`Frontend escuchando en puerto ${PORT}`);
});
```

### 3. Preparar el Archivo `render.yaml`

✅ Ya está creado en la raíz del proyecto con la configuración necesaria.

---

## Despliegue en Render

### Opción 1: Despliegue Automático desde GitHub

#### Paso 1: Push a GitHub

```bash
git add .
git commit -m "Configuración para despliegue en Render"
git push origin main
```

#### Paso 2: Conectar Render con GitHub

1. Ir a [dashboard.render.com](https://dashboard.render.com)
2. Hacer clic en **"New +"** → **"Blueprint"**
3. Seleccionar **"GitHub"** como origen
4. Autorizar Render para acceder a tu GitHub
5. Seleccionar el repositorio `diseño-de-interfaces-web`

#### Paso 3: Revisar Blueprint

Render leerá automáticamente `render.yaml` y mostrará:

```yaml
Services:
- orgmedi-backend (Web Service)
- orgmedi-frontend (Web Service)
- orgmedi-db (H2 Database)
```

✅ Hacer clic en **"Deploy"**

---

### Opción 2: Despliegue Manual desde Dashboard

#### A. Desplegar Backend

1. **Crear Web Service**
   - Ir a Dashboard → **"New Web Service"**
   - Conectar repositorio GitHub
   - Seleccionar rama: `main`
   - **Build Command**: `./mvnw clean package -DskipTests`
   - **Start Command**: `java -jar target/*.jar`

2. **Configurar Variables de Entorno**
   - `SPRING_PROFILES_ACTIVE` = `prod`
   - `SPRING_JPA_HIBERNATE_DDL_AUTO` = `update`
   - `SPRING_DATASOURCE_URL` = (Base de datos, ver sección [Base de Datos](#base-de-datos))
   - `SPRING_DATASOURCE_USERNAME` = (Usuario BD)
   - `SPRING_DATASOURCE_PASSWORD` = (Contraseña BD)

3. **Configurar Disco Persistente** (para datos)
   - Mount Path: `/data`
   - Size: 1 GB

4. **Desplegar**
   - Hacer clic en **"Deploy"**
   - Esperar 5-10 minutos

#### B. Desplegar Frontend

1. **Crear Web Service**
   - Ir a Dashboard → **"New Web Service"**
   - Conectar repositorio GitHub
   - Seleccionar rama: `main`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`

2. **Configurar Variables de Entorno**
   - `NODE_ENV` = `production`

3. **Desplegar**
   - Hacer clic en **"Deploy"**
   - Esperar 3-5 minutos

---

## Configuración del Backend

### 1. Crear Archivo `backend/application-prod.properties`

```properties
# ===== Servidor =====
server.port=8080
server.servlet.context-path=/

# ===== Base de Datos (PostgreSQL en Render) =====
spring.datasource.url=${SPRING_DATASOURCE_URL}
spring.datasource.username=${SPRING_DATASOURCE_USERNAME}
spring.datasource.password=${SPRING_DATASOURCE_PASSWORD}
spring.datasource.driver-class-name=org.postgresql.Driver

# ===== JPA/Hibernate =====
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.format_sql=true

# ===== CORS (Permitir Frontend) =====
app.cors.allowed-origins=${CORS_ALLOWED_ORIGINS:http://localhost:3000}
app.cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS,PATCH
app.cors.allowed-headers=*
app.cors.allow-credentials=true

# ===== Actuator (Health Checks) =====
management.endpoints.web.exposure.include=health,metrics,prometheus
management.endpoint.health.show-details=always

# ===== Logging =====
logging.level.root=INFO
logging.level.proyecto.orgmedi=DEBUG

# ===== Media Types =====
spring.mvc.hiddenmethod.filter.enabled=true
```

### 2. Agregar Dependencia PostgreSQL en `pom.xml`

```xml
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <version>42.7.1</version>
    <scope>runtime</scope>
</dependency>
```

### 3. Actualizar `pom.xml` con Maven Wrapper

Asegurar que Maven Wrapper esté configurado:

```bash
cd backend
mvn wrapper:wrapper -Dmaven.wrapper.version=3.9.6
git add mvnw mvnw.cmd .mvn/
git commit -m "Actualizar Maven Wrapper"
git push
```

---

## Configuración del Frontend

### 1. Asegurar `angular.json` Configurado

```json
{
  "projects": {
    "Proyecto": {
      "architect": {
        "build": {
          "configurations": {
            "production": {
              "optimization": true,
              "sourceMap": false,
              "namedChunks": false,
              "aot": true,
              "extractLicenses": true,
              "vendorChunk": false
            }
          }
        }
      }
    }
  }
}
```

### 2. Crear `frontend/server.js` para SPA

```javascript
const express = require('express');
const path = require('path');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(compression());
app.use(express.static(path.join(__dirname, 'dist/Proyecto/browser')));

// SPA Fallback
app.get('*', (req, res) => {
  if (req.path.startsWith('/assets/') || req.path.match(/\.[^/]*$/)) {
    res.status(404).send('Not Found');
  } else {
    res.sendFile(path.join(__dirname, 'dist/Proyecto/browser/index.html'));
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Frontend escuchando en http://localhost:${PORT}`);
});
```

### 3. Agregar `compression` a `package.json`

```json
{
  "dependencies": {
    "compression": "^1.7.4",
    "express": "^4.18.2"
  }
}
```

### 4. Variables de Entorno en Frontend

El frontend usará las URL de la API desde Render automáticamente:

**`frontend/src/app/core/services/data/api.service.ts`:**
```typescript
private getApiUrl(): string {
  // En producción, Render expone el backend en:
  // https://orgmedi-backend-xxxx.onrender.com
  return `${window.location.origin}/api`;
}
```

---

## Base de Datos

### ✅ Recomendado: H2 (Base de Datos en Archivo - Sin Configuración)

**Este proyecto usa H2 por defecto - ¡No necesita configuración adicional!**

La aplicación está configurada para usar **H2 en modo archivo**, que es perfecto para:

✅ **Ventajas:**
- Sin costo adicional
- Sin servicios externos que crear
- Almacenamiento persistente automático
- Compatible con modo MySQL
- Fácil de escalar a PostgreSQL después si lo necesitas

**Cómo funciona:**
- La BD se guarda en archivo: `/data/orgmedi.h2.db`
- Render proporciona disco persistente de 1GB
- Los datos se mantienen entre redesplegues

**Configuración lista (en `application-prod.properties`):**
```properties
spring.datasource.url=jdbc:h2:file:/data/orgmedi;MODE=MySQL;AUTO_SERVER=TRUE
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
```

**Console H2 para debug** (opcional):
```
https://orgmedi-backend-xxxx.onrender.com/h2-console
```

---

**Paso 3: Actualizar `application-prod.properties`**
```properties
spring.datasource.url=jdbc:postgresql://host:5432/database
spring.datasource.driverClassName=org.postgresql.Driver
spring.datasource.username=postgres
spring.datasource.password=password
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
```

**Pero para este proyecto, H2 es suficiente y más simple. ✅**

---

## Variables de Entorno

### Backend - Variables (H2 - Sin configuración)

Con H2, **NO necesitas agregar variables de entorno** para la BD.

| Variable | Valor | Notas |
|----------|-------|-------|
| `SPRING_PROFILES_ACTIVE` | `prod` | Opcional (automático con application-prod.properties) |

✅ La BD está configurada automáticamente en `application-prod.properties`

**Si cambias a PostgreSQL:**
```
SPRING_DATASOURCE_URL=jdbc:postgresql://host:5432/database
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=password
SPRING_JPA_HIBERNATE_DDL_AUTO=update
CORS_ALLOWED_ORIGINS=https://orgmedi-frontend-xxxx.onrender.com
```

### Frontend - Variables Requeridas

| Variable | Valor | Notas |
|----------|-------|-------|
| `NODE_ENV` | `production` | Activar optimizaciones |

### Agregar Variables en Render Dashboard

1. Ir a Web Service → **"Settings"** → **"Environment"**
2. Hacer clic en **"Add Environment Variable"**
3. Ingresar clave y valor
4. Hacer clic en **"Save"** (redespliega automáticamente)

---

## Dominio Personalizado

### Agregar Dominio Propio

#### 1. Backend
1. Ir a servicio `orgmedi-backend` → **"Settings"**
2. **"Custom Domain"** → **"Add Custom Domain"**
3. Ingresar: `api.tudominio.com`
4. Copiar registros DNS proporcionados
5. Agregar en tu proveedor de DNS (GoDaddy, Cloudflare, etc.)
6. Esperar propagación (5-30 min)

#### 2. Frontend
1. Ir a servicio `orgmedi-frontend` → **"Settings"**
2. **"Custom Domain"** → **"Add Custom Domain"**
3. Ingresar: `app.tudominio.com` o `tudominio.com`
4. Copiar registros DNS
5. Agregar en tu proveedor de DNS
6. Actualizar `CORS_ALLOWED_ORIGINS` en backend

---

## Monitoreo y Logs

### Ver Logs en Render

#### Backend
1. Dashboard → `orgmedi-backend`
2. **"Logs"** tab muestra:
   - Construcción (Maven output)
   - Inicio (Spring Boot startup)
   - Requests HTTP
   - Errores

#### Frontend
1. Dashboard → `orgmedi-frontend`
2. **"Logs"** tab muestra:
   - Build Angular
   - Servidor Express
   - Requests HTTP

### Monitorear Salud (Health Checks)

Backend expone `/actuator/health` para que Render verifique que está vivo:

```bash
curl https://orgmedi-backend-xxxx.onrender.com/actuator/health
```

Respuesta esperada:
```json
{
  "status": "UP",
  "components": {
    "db": {"status": "UP"},
    "diskSpace": {"status": "UP"}
  }
}
```

---

## Solución de Problemas

### ❌ Error: "Build failed"

**Síntoma**: Logs muestran error durante `./mvnw clean package`

**Soluciones**:
```bash
# 1. Verificar Maven Wrapper localmente
cd backend
./mvnw clean package -DskipTests

# 2. Verificar pom.xml sintaxis
mvn validate

# 3. Limpiar caché Render
# En Dashboard → "Manual Deploy" → seleccionar rama main
```

### ❌ Error: "504 Gateway Timeout"

**Síntoma**: Frontend no puede conectar a backend

**Causas**:
- Backend aún está iniciando (≤1 min después del deploy)
- CORS no configurado correctamente
- URL de API incorrecta

**Soluciones**:
```bash
# 1. Verificar backend está healthy
curl https://orgmedi-backend-xxxx.onrender.com/actuator/health

# 2. Verificar CORS en backend
# Logs deben mostrar: "CORS configured for origins: ..."

# 3. Verificar URL en frontend
# Abrir DevTools → Network → ver qué URL se intenta
```

### ❌ Error: "Database connection refused"

**Síntoma**: Backend no puede conectar a BD

**Soluciones**:
```bash
# 1. Verificar credenciales en Render Dashboard
# Variables → SPRING_DATASOURCE_*

# 2. Probar conexión a BD
psql -U username -h hostname -d database

# 3. Verificar permisos de BD
# Render → PostgreSQL → "Info" verificar puerto (normalmente 5432)
```

### ❌ Error: "404 Not Found" en frontend

**Síntoma**: Rutas Angular no funcionan (volver a "/" siempre)

**Causa**: El servidor Express no está sirviendo correctamente

**Solución**:
```javascript
// Verificar server.js en frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/Proyecto/browser/index.html'));
});
```

### ❌ Error: "Static files not found"

**Síntoma**: CSS, JS, imágenes no cargan (404)

**Soluciones**:
```bash
# 1. Verificar dist existe después de build
# en logs: "Generated dist/Proyecto/browser"

# 2. Verificar publicPath en angular.json
"publicPath": "/"

# 3. Forzar rebuild en Render
# Dashboard → Manual Deploy
```

---

## URLs Finales

Después del despliegue exitoso, tendrás:

| Servicio | URL |
|----------|-----|
| **Backend** | `https://orgmedi-backend-xxxx.onrender.com` |
| **Frontend** | `https://orgmedi-frontend-xxxx.onrender.com` |
| **Base de Datos** | PostgreSQL en `https://render.com/dashboard` |

---

## Checklist de Despliegue

- [ ] Repositorio GitHub público con código actualizado
- [ ] `render.yaml` en raíz del proyecto
- [ ] `backend/application-prod.properties` creado
- [ ] `frontend/server.js` creado
- [ ] `pom.xml` con dependencias PostgreSQL
- [ ] `package.json` con scripts `build` y `start`
- [ ] Variables de entorno configuradas en Render
- [ ] Base de datos PostgreSQL creada en Render
- [ ] Health check funciona: `/actuator/health`
- [ ] Frontend conecta con backend exitosamente
- [ ] CORS configurado correctamente
- [ ] Logs no muestran errores críticos

---

## Referencia Rápida

```bash
# Verificar build localmente antes de desplegar
cd backend && ./mvnw clean package -DskipTests && cd ..
cd frontend && npm install && npm run build && cd ..

# Crear .gitignore para Render
echo "target/" >> .gitignore
echo "node_modules/" >> .gitignore
echo "dist/" >> .gitignore
echo ".env" >> .gitignore

# Push a GitHub
git add .
git commit -m "Listo para despliegue en Render"
git push origin main
```

---

**Última actualización**: 21 de enero de 2026  
**Estado**: ✅ Guía completa y lista para despliegue
