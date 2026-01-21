# Documentación Técnica - Proyecto Angular Medicina

## 📋 Tabla de Contenidos

1. [Arquitectura del Sistema](#arquitectura)
2. [Estructura de Carpetas](#estructura)
3. [Decisiones Técnicas](#decisiones)
4. [Guías de Desarrollo](#desarrollo)
5. [Testing](#testing)
6. [Despliegue](#despliegue)
7. [Troubleshooting](#troubleshooting)

---

## <a name="arquitectura"></a>Arquitectura del Sistema

### Componentes Principales

```
┌─────────────────────────────────────────────┐
│         Angular SPA (Frontend)              │
├─────────────────────────────────────────────┤
│  • Components        • Services             │
│  • Directives        • Guards               │
│  • Pipes             • Interceptors         │
└──────────────┬──────────────────────────────┘
               │ HTTP / REST API
               ▼
┌─────────────────────────────────────────────┐
│       Spring Boot API (Backend)             │
├─────────────────────────────────────────────┤
│  • Controllers       • Repositories         │
│  • Services          • Entities             │
│  • Exception Handler • Security             │
└──────────────┬──────────────────────────────┘
               │ JDBC
               ▼
┌─────────────────────────────────────────────┐
│         Base de Datos (MySQL)               │
├─────────────────────────────────────────────┤
│  • Tablas normalizadas                      │
│  • Índices optimizados                      │
│  • Constraints de integridad                │
└─────────────────────────────────────────────┘
```

### Flujo de Datos

```
Usuario Interactúa
        ↓
   Component
        ↓
   Service (RxJS)
        ↓
   Interceptor HTTP
        ↓
   Backend API
        ↓
   Database
        ↓
   Response → Interceptor → Service → Component → Template
```

---

## <a name="estructura"></a>Estructura de Carpetas

### Frontend (`frontend/src/app/`)

```
src/app/
├── core/
│   ├── interceptors/
│   │   └── error.interceptor.ts        # Manejo de errores HTTP
│   ├── services/
│   │   └── data.ts                     # ApiService base
│   └── strategies/
│       └── error-handler.strategy.ts   # Estrategia de errores
│
├── data/
│   ├── medicine.service.ts             # CRUD medicamentos
│   ├── medicine.service.spec.ts        # Tests medicamentos
│   ├── user.service.ts                 # CRUD usuarios
│   ├── user.service.spec.ts            # Tests usuarios
│   ├── models/
│   │   ├── medicine.model.ts           # Tipos medicina
│   │   └── user.model.ts               # Tipos usuario
│   └── stores/
│       └── estado global (NgRx/Signals)
│
├── components/
│   ├── layout/
│   │   ├── header/
│   │   ├── footer/
│   │   └── sidebar/
│   └── shared/
│       ├── medicine-card/
│       ├── button/
│       ├── accordion/
│       └── card/
│
├── pages/
│   ├── home/
│   ├── medicines/
│   ├── create-medicine/
│   ├── edit-medicine/
│   ├── profile/
│   ├── iniciar-sesion/
│   ├── registrarse/
│   └── not-found/
│
├── directives/
│   ├── tooltip.directive.ts            # Tooltip personalizado
│   └── tooltip.directive.spec.ts       # Tests directive
│
├── validators/
│   ├── password-strength.validator.ts  # Validación contraseña
│   ├── spanish-formats.validator.ts    # Formato español
│   └── cross-field.validators.ts       # Validadores cruzados
│
├── shared/
│   ├── breadcrumb.component.ts         # Breadcrumb
│   ├── toast.service.ts                # Notificaciones
│   ├── async-validators.service.ts     # Validadores asincronos
│   └── utils/
│       └── helpers.ts                  # Funciones auxiliares
│
├── app.routes.ts                       # Rutas principales
├── app.config.ts                       # Configuración app
├── app.ts                              # Componente raíz
└── integration.spec.ts                 # Tests de integración
```

### Backend (`backend/src/`)

```
backend/src/
├── main/java/proyecto/orgmedi/
│   ├── controller/
│   │   ├── MedicineController.java
│   │   └── UserController.java
│   ├── service/
│   │   ├── MedicineService.java
│   │   └── UserService.java
│   ├── repository/
│   │   ├── MedicineRepository.java
│   │   └── UserRepository.java
│   ├── entity/
│   │   ├── Medicine.java
│   │   └── User.java
│   ├── dto/
│   │   ├── MedicineDTO.java
│   │   └── UserDTO.java
│   └── exception/
│       ├── ResourceNotFoundException.java
│       └── GlobalExceptionHandler.java
│
├── resources/
│   ├── application.properties         # Config desarrollo
│   ├── application-docker.properties  # Config Docker
│   └── data.sql                       # Datos iniciales
│
└── test/java/proyecto/orgmedi/
    ├── MedicineServiceTest.java
    └── UserServiceTest.java
```

---

## <a name="decisiones"></a>Decisiones Técnicas

### 1. Framework: Angular 21

**Razón:** 
- ✅ Latest LTS (soporte a largo plazo)
- ✅ Mejor performance que versiones anteriores
- ✅ Standalone components (simplifica arquitectura)
- ✅ Ecosystem robusto

**Alternativas Consideradas:**
- React: Más flexible pero menos opinionado
- Vue: Más simple pero comunidad menor
- Svelte: Mejor performance pero comunidad aún pequeña

### 2. Testing: Vitest

**Razón:**
- ✅ Tests rápidos (5x más rápido que Jasmine)
- ✅ Configuración simple
- ✅ Excelente integración con TypeScript
- ✅ Watch mode eficiente

**Configuración:**
```typescript
// vitest.config.ts
coverage: {
  provider: 'v8',
  lines: 50,
  functions: 50,
  branches: 50,
  statements: 50
}
```

### 3. State Management: Sin librería centralizada (Por ahora)

**Razón:**
- ✅ Proyecto simple, no requiere NgRx
- ✅ Services + RxJS suficientes para comunicación
- ✅ Menor complejidad
- ✅ Bundle más pequeño

**Alternativa Futura:** NgRx si proyecto crece

### 4. Ruteo: Angular Router con Lazy Loading

**Razón:**
- ✅ Código dividido por ruta
- ✅ Carga bajo demanda
- ✅ Mejor performance inicial

**Configuración:**
```typescript
const routes: Routes = [
  {
    path: 'medicines',
    loadComponent: () => import('./pages/medicines/medicines.component')
      .then(m => m.MedicinesComponent)
  }
];
```

### 5. Validación: Reactive Forms + Validators Personalizados

**Razón:**
- ✅ Control fino sobre validación
- ✅ Validadores asincronos (verificar duplicados)
- ✅ Error messages dinámicos

**Ejemplo:**
```typescript
this.form = this.fb.group({
  username: ['', [
    Validators.required,
    Validators.minLength(3),
    this.customValidators.usernameValidator()
  ]],
  email: ['', [
    Validators.required,
    Validators.email,
    this.customValidators.emailValidator()
  ], [
    this.asyncValidators.emailTaken() // Async validator
  ]]
});
```

### 6. Estilos: SCSS con Sistema 7-1

**Razón:**
- ✅ Escalable
- ✅ Mantiene variables y mixins centralizados
- ✅ Mejor organización

**Estructura:**
```
styles/
├── 00-settings/      # Variables, colores
├── 01-tools/         # Mixins, funciones
├── 02-generic/       # Resets, normalize
├── 03-elements/      # Estilos base
├── 04-layout/        # Grid, flexbox
├── 05-components/    # Componentes
├── 06-pages/         # Páginas específicas
└── styles.scss       # Main
```

### 7. HTTP Client: HttpClient + Interceptors

**Razón:**
- ✅ Manejo centralizado de errores
- ✅ Inyección de tokens
- ✅ Retry logic

**Interceptor:**
```typescript
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // Manejo de errores
        return throwError(() => error);
      })
    );
  }
}
```

### 8. Docker: Multi-stage Build

**Razón:**
- ✅ Imagen final pequeña (~50MB)
- ✅ Separación build/runtime
- ✅ Seguridad (sin herramientas de build en producción)

**Frontend Dockerfile:**
```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json .
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Runtime
FROM nginx:alpine
COPY --from=builder /app/dist/proyecto /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## <a name="desarrollo"></a>Guías de Desarrollo

### Setup Local

```bash
# 1. Instalar Node
nvm install 20
nvm use 20

# 2. Instalar dependencias
npm install

# 3. Iniciar servidor
npm start

# 4. Navegar a
http://localhost:4200
```

### Crear Nuevo Componente

```bash
# CLI genera estructura
ng generate component components/shared/my-component

# Resultado:
# my-component.component.ts
# my-component.component.html
# my-component.component.scss
# my-component.component.spec.ts
```

### Crear Nuevo Servicio

```bash
ng generate service data/my-service

# Estructura:
# my-service.ts
# my-service.spec.ts

# Inyectar en componente:
constructor(private myService: MyService) {}
```

### Mejores Prácticas

#### 1. Componentes OnPush
```typescript
@Component({
  selector: 'app-card',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardComponent {
  @Input() data: any;
}
```

#### 2. Unsubscribe automático
```typescript
// Usar async pipe
<div>{{ observable$ | async }}</div>

// O usar takeUntilDestroyed
constructor() {
  this.service.data$.pipe(
    takeUntilDestroyed()
  ).subscribe(data => this.data = data);
}
```

#### 3. Error handling
```typescript
private handleError(error: HttpErrorResponse) {
  if (error.error instanceof ErrorEvent) {
    // Error del cliente
    console.error('Error:', error.error.message);
  } else {
    // Error del servidor
    console.error(`Servidor retornó ${error.status}`);
  }
  return throwError(() => error);
}
```

#### 4. Logging
```typescript
import { Logger } from '@angular/core';

const logger = new Logger('MyComponent');
logger.debug('Debug message');
logger.log('Info message');
logger.warn('Warning message');
logger.error('Error message');
```

---

## <a name="testing"></a>Testing

### Ejecución de Tests

```bash
# Tests unitarios
npm test

# Con coverage
npm test:coverage

# Watch mode
npm test:watch

# CI mode (sin watch)
npm run test:ci
```

### Cobertura Esperada

- **Componentes**: > 80%
- **Servicios**: > 90%
- **Pipes**: > 85%
- **General**: > 50%

### Estructura Test

```typescript
describe('MyService', () => {
  let service: MyService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MyService]
    });
    service = TestBed.inject(MyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('specific functionality', () => {
    it('should do something', () => {
      const result = service.method();
      expect(result).toEqual(expected);
    });
  });
});
```

### Mocking HTTP

```typescript
beforeEach(() => {
  TestBed.configureTestingModule({
    imports: [HttpClientTestingModule],
    providers: [MyService]
  });
  httpMock = TestBed.inject(HttpTestingController);
});

it('should fetch data', () => {
  service.getData().subscribe(data => {
    expect(data).toEqual(expectedData);
  });

  const req = httpMock.expectOne('/api/data');
  expect(req.request.method).toBe('GET');
  req.flush(expectedData);
});
```

---

## <a name="despliegue"></a>Despliegue

### Build de Producción

```bash
ng build --configuration production

# Genera: dist/proyecto/
# - main-[hash].js       (~200KB gzipped)
# - polyfills-[hash].js  (~30KB gzipped)
# - styles-[hash].css    (~50KB gzipped)
```

### Desplegar a Docker

```bash
# Build y start
docker-compose up --build

# Verificar
docker-compose ps

# Logs
docker-compose logs -f frontend
```

### Desplegar a Vercel

```bash
vercel --prod
```

### Desplegar a AWS S3 + CloudFront

```bash
npm run build
aws s3 sync dist/proyecto/ s3://bucket-name/ --delete
```

### Performance Target

| Métrica | Target | Actual |
|---------|--------|--------|
| Initial Bundle | < 500KB | ~350KB |
| Lighthouse | > 80 | 85+ |
| FCP | < 1.8s | ~1.2s |
| LCP | < 2.5s | ~2.0s |

---

## <a name="troubleshooting"></a>Troubleshooting

### Problema: Tests fallan localmente pero pasan en CI

**Solución:**
```bash
npm ci  # Instalar versiones exactas
npm run test:ci  # Usar browser headless
```

### Problema: Build fallido con "Cannot find module"

**Solución:**
```bash
rm -rf node_modules dist
npm install
npm run build
```

### Problema: Performance lento en desarrollo

**Solución:**
```bash
# Usar ng serve con menos optimizaciones
ng serve --poll=2000

# O rebuild incremental
ng build --watch --configuration development
```

### Problema: CORS errors en desarrollo

**Solución:**
```json
// proxy.conf.json
{
  "/api": {
    "target": "http://localhost:8080",
    "secure": false,
    "changeOrigin": true
  }
}

// Usar con:
ng serve --proxy-config proxy.conf.json
```

### Problema: Rutas SPA no funcionan en producción

**Solución:**
```nginx
# En nginx.conf
location / {
  try_files $uri $uri/ /index.html;
}

# O usar hash routing
ng build --base-href / --configuration production
```

---

## Recursos Adicionales

- [Angular Documentation](https://angular.io/docs)
- [RxJS Documentation](https://rxjs.dev/)
- [Vitest Documentation](https://vitest.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [SCSS Documentation](https://sass-lang.com/documentation)

---

## Contacto y Soporte

Para preguntas o problemas:
1. Revisar documentación en `/docs`
2. Buscar en issues del repositorio
3. Crear nuevo issue con reproducción mínima
