# Guía de Optimización de Rendimiento y Despliegue

## 1. Análisis de Performance con Lighthouse

### Ejecución de Lighthouse
```bash
# Build de producción
npm run build

# Ejecutar Lighthouse (requiere Chrome instalado)
npm run lighthouse

# O manualmente desde Chrome DevTools
# - Abrir DevTools (F12)
# - Tab "Lighthouse"
# - Click en "Analyze page load"
```

### Objetivo: > 80 en Performance

**Métricas Clave Medidas:**
- **First Contentful Paint (FCP)**: < 1.8s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Cumulative Layout Shift (CLS)**: < 0.1
- **Total Blocking Time (TBT)**: < 200ms
- **Time to Interactive (TTI)**: < 3.8s

### Mejoras Implementadas

#### 1. Lazy Loading de Módulos
```typescript
// En app.routes.ts
const routes: Routes = [
  {
    path: 'medicines',
    loadComponent: () => import('./pages/medicines/medicines.component')
      .then(m => m.MedicinesComponent)
  },
  // ... más rutas con lazy loading
];
```

**Beneficio**: Reduce el bundle inicial, carga módulos bajo demanda.

#### 2. Change Detection OnPush
```typescript
@Component({
  selector: 'app-medicine-card',
  templateUrl: './medicine-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MedicineCardComponent {
  // ...
}
```

**Beneficio**: Mejora la performance en componentes sin cambios frecuentes.

#### 3. Image Optimization
```html
<!-- Usar responsive images -->
<img 
  [ngSrc]="medicineImage" 
  [width]="200" 
  [height]="200"
  loading="lazy"
  alt="Medicine image"
/>
```

**Beneficio**: Lazy load de imágenes, tamaños responsivos.

#### 4. Code Splitting y Tree Shaking
```json
// angular.json - ya configurado
"optimization": true,
"sourceMap": false,
"extractLicenses": true,
"buildOptimizer": true
```

**Beneficio**: 
- Dead code elimination
- Minificación agresiva
- Compilación de producción

#### 5. Service Worker (PWA)
```typescript
// Para próximas iteraciones
import { ServiceWorkerModule } from '@angular/service-worker';

// En app.config.ts
providePlatformBrowserDynamic().bootstrapModule(AppComponent, {
  ngZone: 'zone.js'
})
```

### Monitoreo Continuo

Después de deploy, monitorear usando:
- **Google Analytics (Web Vitals)**
- **Chrome User Experience Report (CrUX)**
- **Sentry** (para errores)

```bash
# Generar reporte de performance local
npm run build:analyze
```

## 2. Análisis de Bundle Size

### Tamaño Actual de Bundle

```bash
npm run build:analyze
```

**Objetivo**: Initial bundle < 500KB (ya configurado en angular.json)

### Desglose Esperado del Bundle:
- Angular Framework: ~150KB (gzipped)
- Zone.js: ~30KB
- RxJS: ~80KB
- Aplicación custom: ~50KB
- Otros (CSS, etc): ~50KB
- **Total aprox**: ~360KB

### Técnicas de Optimización:

1. **Eliminar dependencias no usadas**
```bash
# Auditar npm
npm audit

# Actualizar dependencias
npm update
```

2. **Usar librerías más ligeras**
```typescript
// ❌ No recomendado
import * as moment from 'moment'; // 67KB

// ✅ Recomendado
import { formatDate } from '@angular/common';
```

3. **Compression en servidor**
```nginx
# nginx.conf ya incluye gzip
gzip on;
gzip_types application/javascript text/css;
gzip_min_length 1000;
```

## 3. Configuración de Despliegue

### Build de Producción

```bash
# Build completo
npm run build

# Genera carpeta: dist/proyecto/

# Verificar que no hay errors ni warnings
# Output esperado:
# ✔ browser (development): 0 warnings
# ✔ browser (production): 0 warnings
```

### Estructura del Build

```
dist/proyecto/
├── index.html          # Entrada principal (SPA)
├── main-[hash].js      # Bundle principal
├── polyfills-[hash].js # Polyfills
├── styles-[hash].css   # Estilos globales
├── 404.html            # Manejo de rutas SPA
└── assets/
    ├── styles/
    ├── images/
    └── etc.
```

### Configuración de Base-Href

```bash
# Si se deploya en raíz
ng build --configuration production --base-href /

# Si se deploya en subdirectorio
ng build --configuration production --base-href /proyecto/
```

### Configuración para SPA (Sin hash routing)

**Problema**: Angular routing no funciona en reload si no se configura el servidor.

**Solución - Rewrite Rules para nginx** (ya en docker-compose):

```nginx
# nginx.conf
location / {
    try_files $uri $uri/ /index.html;
}
```

Esto asegura que cualquier ruta desconocida se redirige a index.html, permitiendo que Angular Router maneje la navegación.

### Configuración para SPA (Con hash routing)

```typescript
// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withHashLocation()),
    // ...
  ]
};
```

Ventaja: No requiere rewrite en servidor.

## 4. Despliegue en Producción

### Opción 1: Docker (Recomendado)

```bash
# Build Docker
docker-compose up --build

# Verifica en http://localhost (o tu URL configurada)
```

**Dockerfile ya incluido y optimizado:**
- Multi-stage build
- Node alpine para menor tamaño
- Nginx para servir archivos estáticos

### Opción 2: Vercel / Netlify

```bash
# Vercel
vercel

# Netlify
netlify deploy --prod --dir=dist/proyecto
```

### Opción 3: AWS S3 + CloudFront

```bash
# Build
npm run build

# Deploy a S3
aws s3 sync dist/proyecto/ s3://tu-bucket/ --delete

# Invalidar CloudFront
aws cloudfront create-invalidation --distribution-id <ID> --paths "/*"
```

## 5. Verificación Post-Deploy

### Checklist de Verificación

- [ ] Build completado sin errores
  ```bash
  npm run build 2>&1 | grep -i "error"
  ```

- [ ] No hay warnings
  ```bash
  npm run build 2>&1 | grep -i "warning"
  ```

- [ ] Bundle size < 500KB
  ```bash
  npm run build:analyze
  ```

- [ ] Lighthouse Performance > 80
  ```bash
  npm run lighthouse
  ```

- [ ] Todas las rutas funcionan
  - Navegar a `/medicines`
  - Navegar a `/profile`
  - Navegar a `/login`
  - Navegar a URL aleatoria → redirecciona a home

- [ ] Llamadas HTTP funcionan
  - GET `/api/medicamentos`
  - GET `/api/usuarios`
  - POST login
  - Verificar CORS headers

- [ ] Assets cargan correctamente
  - Estilos SCSS compilados
  - Imágenes resuelven
  - Fonts cargan

- [ ] Compresión gzip activa
  ```bash
  curl -I https://tu-url.com | grep -i content-encoding
  # Debe mostrar: gzip
  ```

- [ ] HTTPS configurado
  - Certificado SSL válido
  - Redirección HTTP → HTTPS

- [ ] CSP (Content Security Policy) headers
  ```
  Content-Security-Policy: default-src 'self';
  ```

### Monitoreo Continuo

```bash
# Instalar herramientas de monitoring
npm install --save-dev @sentry/angular

# En main.ts
import * as Sentry from "@sentry/angular";

Sentry.init({
  dsn: "tu-sentry-dsn",
  environment: "production"
});
```

## 6. Optimizaciones Específicas Implementadas

### 1. Lazy Loading
- ✅ Rutas configuradas con lazy loading
- ✅ Componentes cargados bajo demanda

### 2. Tree Shaking
- ✅ Solo importar lo necesario de RxJS
- ✅ Usar import destructuring

```typescript
// ✅ Correcto - solo importa operadores necesarios
import { map, filter } from 'rxjs/operators';

// ❌ Evitar - importa toda la librería
import * as rx from 'rxjs';
```

### 3. Change Detection Strategy
- ✅ OnPush en componentes puros
- ✅ Default en componentes con lógica compleja

### 4. Minificación y Uglification
- ✅ Habilitado en build production
- ✅ Source maps únicamente en desarrollo

### 5. CSS Minificación
- ✅ Estilos compilados a CSS minificado
- ✅ CSS Variables para temas dinámicos

## 7. Benchmarks Esperados

### Antes de Optimización
- Initial bundle: ~850KB (sin gzip)
- Lighthouse: 65
- FCP: 2.5s
- LCP: 4.0s

### Después de Optimización
- Initial bundle: ~350KB (sin gzip)
- Lighthouse: 85+
- FCP: 1.2s
- LCP: 2.0s

## 8. Troubleshooting

### Build Fallido
```bash
# Limpiar caché
rm -rf node_modules dist
npm install
npm run build
```

### Performance lento
```bash
# Analizar dependencias
npm ls

# Buscar duplicados
npm dedupe
```

### Errores de routing en SPA
```bash
# Verificar nginx config tiene:
# try_files $uri $uri/ /index.html;

# O usar hash routing
ng build --base-href / --configuration production
```

## Referencias

- [Angular Performance Guide](https://angular.io/guide/performance-best-practices)
- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse Scoring](https://developers.google.com/web/tools/lighthouse/v3/scoring)
- [Bundle Analysis](https://angular.io/guide/build#configuration-options)
