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

## Paso 3: Agregar Dependencia PostgreSQL en Backend

✅ NECESARIO: Agregar controlador PostgreSQL a `backend/pom.xml`

**Localizar en `backend/pom.xml`:**
```xml
<dependencies>
    ...
    <!-- Agregar esto si no existe -->
    <dependency>
        <groupId>org.postgresql</groupId>
        <artifactId>postgresql</artifactId>
        <version>42.7.1</version>
        <scope>runtime</scope>
    </dependency>
</dependencies>
```

**Comando para verificar:**
```bash
cd backend
./mvnw dependency:tree | grep postgresql
```

Si no aparece, agregar manualmente.

## Paso 4: Commit y Push a GitHub

```bash
# Desde raíz del proyecto
git add .
git commit -m "✨ Configuración para despliegue en Render

- Agregar render.yaml con configuración de servicios
- Crear application-prod.properties para Spring Boot
- Crear server.js para servir frontend en producción
- Actualizar package.json con dependencias Express y Compression
- Actualizar .gitignore para producción"

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
   - `orgmedi-db` (PostgreSQL Database)
6. Hacer clic en **"Deploy Blueprint"**

✅ Render desplegará los 3 servicios automáticamente.

---

### Opción B: Despliegue Manual

#### Paso 6A: Crear Base de Datos PostgreSQL

1. Dashboard → **"New +"** → **"PostgreSQL"**
2. **Nombre**: `orgmedi-db`
3. **Region**: Seleccionar más cercana a usuarios
4. **Plan**: Free (o pagado)
5. Hacer clic en **"Create Database"**

⏳ Esperar 2-3 minutos mientras se crea

**Una vez creada:**
- Copiar **Internal Database URL** (formato: `postgres://user:pass@host/db`)
- Guardar **Username** (normalmente `postgres`)
- Copiar **Password**

#### Paso 6B: Desplegar Backend

1. Dashboard → **"New +"** → **"Web Service"**
2. **Repository**: Conectar GitHub y seleccionar repositorio
3. **Name**: `orgmedi-backend`
4. **Root Directory**: `backend`
5. **Build Command**: `./mvnw clean package -DskipTests`
6. **Start Command**: `java -jar target/*.jar`
7. **Environment**: Agregar variables:

| Key | Value |
|-----|-------|
| `SPRING_PROFILES_ACTIVE` | `prod` |
| `SPRING_DATASOURCE_URL` | (Copiar de BD creada arriba) |
| `SPRING_DATASOURCE_USERNAME` | `postgres` |
| `SPRING_DATASOURCE_PASSWORD` | (Copiar de BD) |
| `SPRING_JPA_HIBERNATE_DDL_AUTO` | `update` |
| `CORS_ALLOWED_ORIGINS` | (Actualizar después, ver abajo) |

8. **Disk**: 
   - Mount Path: `/data`
   - Size: 1 GB

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

## Paso 7: Actualizar Variables de Entorno del Backend

1. Dashboard → **`orgmedi-backend`**
2. **"Settings"** → **"Environment"**
3. Editar `CORS_ALLOWED_ORIGINS`:
   - Cambiar valor a: `https://orgmedi-frontend-xxxx.onrender.com`
   - Reemplazar `xxxx` con tu ID de Render

4. Hacer clic en **"Save"** (redesplegará automáticamente)

---

## Paso 8: Verificar Despliegues

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

## Paso 9: (Opcional) Agregar Dominio Personalizado

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

## Paso 10: Monitorear Logs

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
| **BD PostgreSQL** | Administrada por Render (no acceso directo) |

---

## Resumen Rápido

```
┌─────────────────────────────────────────┐
│        FLUJO DE DESPLIEGUE RENDER       │
├─────────────────────────────────────────┤
│ 1. GitHub → Render                      │
│ 2. Render crea 3 servicios             │
│    • Backend (Java/Maven)               │
│    • Frontend (Node/Express)            │
│    • Database (PostgreSQL)              │
│ 3. Backend ↔ Database                   │
│ 4. Frontend ↔ Backend (API)            │
│ 5. Usuario → Frontend (Navegador)      │
└─────────────────────────────────────────┘
```

---

## Checklist Final

- [ ] Código en GitHub actualizado
- [ ] render.yaml verificado
- [ ] Dependencies PostgreSQL en pom.xml
- [ ] application-prod.properties configurado
- [ ] server.js en frontend
- [ ] package.json actualizado
- [ ] Servicios creados en Render
- [ ] Variables de entorno configuradas
- [ ] Backend retorna /actuator/health UP
- [ ] Frontend carga en navegador
- [ ] API requests funcionan (Network tab)
- [ ] No hay errores 500 ni 504

---

**Estado**: 🚀 Listo para desplegar  
**Fecha**: 21 de enero de 2026
