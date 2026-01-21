# 📋 Checklist de Despliegue en Render

## Paso 1: Preparar Repositorio GitHub ✅

- [ ] Crear repositorio público en GitHub (si no existe)
- [ ] Clonar repositorio localmente
- [ ] Copiar código del proyecto

```bash
git clone https://github.com/TU_USUARIO/TU_REPO.git
cd TU_REPO
# Copiar archivos del proyecto aquí
```

## Paso 2: Verificar Archivos de Configuración ✅

Asegurar que existen estos archivos en la raíz del proyecto:

- [ ] `render.yaml` - Blueprint de Render ✅ (ya creado)
- [ ] `backend/src/main/resources/application-prod.properties` ✅ (ya creado)
- [ ] `frontend/server.js` ✅ (ya creado)
- [ ] `frontend/package.json` con scripts correctos ✅ (ya actualizado)
- [ ] `.gitignore` ✅ (ya creado)

## Paso 3: Base de Datos - H2 (Sin configuración necesaria) ✅

✅ **LA BASE DE DATOS YA ESTÁ CONFIGURADA CON H2**

No necesitas hacer nada adicional. El archivo `application-prod.properties` ya está configurado para usar H2:

```properties
spring.datasource.url=jdbc:h2:file:/data/orgmedi;MODE=MySQL;AUTO_SERVER=TRUE
spring.datasource.driverClassName=org.h2.Driver
```

✅ El disco persistente en Render (`/data`) guardará la BD automáticamente.

**Si prefieres PostgreSQL en lugar de H2:**
- Ver sección "Alternativa: PostgreSQL" más abajo

---

## Paso 3B (Opcional): Alternativa - PostgreSQL

Si quieres cambiar a PostgreSQL:

### A. Agregar Dependencia PostgreSQL en Backend

**Localizar en `backend/pom.xml`:**
```xml
<dependencies>
    ...
    <!-- Agregar esto -->
    <dependency>
        <groupId>org.postgresql</groupId>
        <artifactId>postgresql</artifactId>
        <version>42.7.1</version>
        <scope>runtime</scope>
    </dependency>
</dependencies>
```

### B. Actualizar `application-prod.properties`

Cambiar sección "Base de Datos" a:
```properties
spring.datasource.url=jdbc:postgresql://host:5432/database
spring.datasource.driverClassName=org.postgresql.Driver
spring.datasource.username=postgres
spring.datasource.password=password
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
```

### C. Crear BD PostgreSQL en Render

1. Dashboard → **"New +"** → **"PostgreSQL"**
2. Nombre: `orgmedi-db`
3. Copiar credenciales

### D. Agregar Variables en Backend

En Render Dashboard → `orgmedi-backend` → Settings → Environment:
```
SPRING_DATASOURCE_URL = (copiar de BD)
SPRING_DATASOURCE_USERNAME = postgres
SPRING_DATASOURCE_PASSWORD = (copiar de BD)
```

**Pero para este proyecto, H2 es suficiente y más simple.**

## Paso 4: Commit y Push a GitHub

```bash
# Desde raíz del proyecto
git add .
git commit -m "✨ Configuración para despliegue en Render con H2

- Agregar render.yaml con configuración de 2 servicios (backend + frontend)
- NO incluir PostgreSQL (usar H2 existente)
- Crear application-prod.properties con H2
- Crear server.js para servir frontend en producción
- Actualizar package.json con dependencias Express y Compression
- Actualizar .gitignore para producción
- Documentación de despliegue con H2"

git push origin main
```

## Paso 5: Crear Cuenta en Render (si no tienes)

1. Ir a https://render.com
2. Hacer clic en **"Sign up with GitHub"**
3. Autorizar Render para acceder a GitHub
4. Completar perfil

## Paso 6: Crear Servicios en Render

### Opción A: Despliegue Automático (RECOMENDADO) ⭐

**Usar Blueprint:**

1. En Dashboard de Render → **"New +"** → **"Blueprint"**
2. Seleccionar **"Deploy from GitHub"**
3. Buscar y seleccionar repositorio: `TU_REPO`
4. Render leerá automáticamente `render.yaml`
5. Revisar servicios:
   - `orgmedi-backend` (Web Service)
   - `orgmedi-frontend` (Web Service)
   - ❌ NO hay PostgreSQL (usaremos H2)
6. Hacer clic en **"Deploy Blueprint"**

✅ Render desplegará los 2 servicios automáticamente.

---

### Opción B: Despliegue Manual

#### Paso 6A: ~~Crear Base de Datos PostgreSQL~~ (No necesario - usamos H2)

✅ Saltamos este paso, ya que H2 está configurado.

#### Paso 6B: Desplegar Backend

1. Dashboard → **"New +"** → **"Web Service"**
2. **Repository**: Conectar GitHub y seleccionar repositorio
3. **Name**: `orgmedi-backend`
4. **Root Directory**: `backend`
5. **Build Command**: `./mvnw clean package -DskipTests`
6. **Start Command**: `java -jar target/*.jar`
7. **Environment**: (Sin variables adicionales necesarias)

8. **Disk**: 
   - Mount Path: `/data`
   - Size: 1 GB
   - ✅ Esto preservará la BD H2 entre redesplegues

9. Hacer clic en **"Create Web Service"**

⏳ Esperar 5-10 minutos mientras se compila y despliega

**Una vez desplegado:**
- Copiar URL: `https://orgmedi-backend-xxxx.onrender.com`

#### Paso 6C: Desplegar Frontend

1. Dashboard → **"New +"** → **"Web Service"**
2. **Repository**: Conectar GitHub y seleccionar repositorio
3. **Name**: `orgmedi-frontend`
4. **Root Directory**: `frontend`
5. **Build Command**: `npm install && npm run build`
6. **Start Command**: `npm run start`
7. **Environment**: Agregar variable:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |

8. Hacer clic en **"Create Web Service"**

⏳ Esperar 3-5 minutos mientras se compila y despliega

**Una vez desplegado:**
- Copiar URL: `https://orgmedi-frontend-xxxx.onrender.com`

---

## Paso 7: Verificar Despliegues (Sin variables de entorno adicionales) ✅

Sin PostgreSQL, no necesitas actualizar variables de entorno.

### ✅ Verificar Backend

```bash
# En navegador o terminal
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

### ✅ Verificar Frontend

1. Abrir en navegador: `https://orgmedi-frontend-xxxx.onrender.com`
2. Debería cargar la aplicación Angular
3. Abrir DevTools (F12) → Console → no debe haber errores

### ✅ Verificar Comunicación Frontend ↔ Backend

1. En la aplicación, hacer clic en **"Iniciar Sesión"** o acceder a cualquier ruta protegida
2. En DevTools → Network → buscar solicitud a `/api/...`
3. Debe retornar **200** o **401** (no **504** ni **500**)

---

## Paso 8: (Opcional) Agregar Dominio Personalizado

### Para Backend

1. Dashboard → **`orgmedi-backend`** → **"Settings"**
2. **"Custom Domain"** → **"Add Custom Domain"**
3. Ingresar: `api.tudominio.com`
4. Copiar registros DNS
5. Ir a proveedor de DNS (GoDaddy, Namecheap, Cloudflare, etc.)
6. Agregar registros CNAME/A
7. Esperar propagación (5-30 min)

### Para Frontend

1. Dashboard → **`orgmedi-frontend`** → **"Settings"**
2. **"Custom Domain"** → **"Add Custom Domain"**
3. Ingresar: `tudominio.com` o `app.tudominio.com`
4. Copiar registros DNS
5. Agregar en proveedor de DNS
6. **Actualizar variables en backend**:
   - `CORS_ALLOWED_ORIGINS` = `https://tudominio.com`

---

## Paso 9: Monitorear Logs

### Ver Logs en Vivo

**Backend:**
```bash
Dashboard → orgmedi-backend → "Logs" tab
```

Buscar líneas como:
- ✅ `Started Application in X seconds`
- ✅ `HikariPool connected to database`
- ✅ `Mapping endpoints with "POST /api/..."`

**Frontend:**
```bash
Dashboard → orgmedi-frontend → "Logs" tab
```

Buscar líneas como:
- ✅ `Frontend corriendo en http://0.0.0.0:PORT`
- ✅ `Health check: http://0.0.0.0:PORT/health`

---

## Solución de Problemas

### ❌ Build failed en backend

**Solución:**
```bash
# Verificar localmente
cd backend
./mvnw clean package -DskipTests

# Si falla, revisar pom.xml
mvn validate

# Si hay warnings, ver logs en Render
```

### ❌ Frontend muestra "Cannot GET /"

**Causa:** `npm run start` no se ejecutó correctamente

**Solución:**
1. Verificar `frontend/server.js` existe
2. Verificar `npm run build` generó `dist/Proyecto/browser`
3. En Dashboard → Manual Redeploy

### ❌ API returns 504 Gateway Timeout

**Causa:** Backend aún iniciando o CORS incorrecto

**Solución:**
1. Esperar 1-2 minutos (backend tarda en arrancar)
2. Verificar `/actuator/health` retorna `UP`
3. Verificar `CORS_ALLOWED_ORIGINS` en backend

### ❌ Database connection refused

**Causa:** Variables de BD incorrectas

**Solución:**
1. Copiar URL exacta de BD desde PostgreSQL service
2. Verificar usuario y contraseña
3. Redeploy backend

---

## URLs Finales del Proyecto

Una vez completado el despliegue:

| Servicio | URL |
|----------|-----|
| **Frontend** | `https://orgmedi-frontend-xxxx.onrender.com` |
| **Backend API** | `https://orgmedi-backend-xxxx.onrender.com` |
| **BD H2** | Almacenada en disco persistente `/data/orgmedi.h2.db` |
| **H2 Console** (debug) | `https://orgmedi-backend-xxxx.onrender.com/h2-console` |

---

## Resumen Rápido

```
┌─────────────────────────────────────────┐
│        FLUJO DE DESPLIEGUE RENDER       │
├─────────────────────────────────────────┤
│ 1. GitHub → Render                      │
│ 2. Render crea 2 servicios             │
│    • Backend (Java/Maven)               │
│    • Frontend (Node/Express)            │
│ 3. Backend ↔ BD H2 (archivo)            │
│ 4. Frontend ↔ Backend (API)            │
│ 5. Usuario → Frontend (Navegador)      │
└─────────────────────────────────────────┘

✅ SIN necesidad de:
- PostgreSQL externo
- Variables de BD en Render
- Disco PostgreSQL en Render

✅ CON:
- H2 en archivo persistente
- Mismo código que desarrollo
- Máxima compatibilidad
```

---

## Checklist Final

- [ ] Código en GitHub actualizado
- [ ] render.yaml verificado (2 servicios, sin PostgreSQL)
- [ ] ~~Dependencies PostgreSQL en pom.xml~~ (No necesario)
- [ ] application-prod.properties configurado con H2 ✅
- [ ] server.js en frontend ✅
- [ ] package.json actualizado ✅
- [ ] Servicios creados en Render (backend + frontend)
- [ ] ~~Variables de BD en Render~~ (No necesario)
- [ ] Backend retorna /actuator/health UP
- [ ] Frontend carga en navegador
- [ ] API requests funcionan (Network tab)
- [ ] No hay errores 500 ni 504
- [ ] Disco persistente en backend montado en `/data`

---

**Estado**: 🚀 Listo para desplegar  
**Fecha**: 21 de enero de 2026
