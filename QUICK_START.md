# 🚀 Guía Rápida - Quick Start

Este documento te ayuda a comenzar rápidamente con el proyecto.

## ⚡ 5 Minutos Setup

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor
npm start

# 3. Navegar a
http://localhost:4200

# ✅ Listo!
```

## 📖 Documentación Rápida

| Necesidad | Documento |
|-----------|-----------|
| Setup y rutas | [README.md](frontend/README.md) |
| Arquitectura | [DOCUMENTACION_TECNICA.md](docs/DOCUMENTACION_TECNICA.md) |
| Despliegue | [DEPLOYMENT.md](docs/DEPLOYMENT.md) |
| Performance | [OPTIMIZACION_RENDIMIENTO.md](docs/OPTIMIZACION_RENDIMIENTO.md) |
| Cross-browser | [VERIFICACION_CROSS_BROWSER.md](docs/VERIFICACION_CROSS_BROWSER.md) |
| Contribuir | [CONTRIBUTING.md](CONTRIBUTING.md) |

## 🧪 Testing Rápido

```bash
# Ejecutar todos los tests
npm test

# Ver coverage
npm run test:coverage

# Watch mode (redchequea al cambiar)
npm run test:watch

# Para CI/CD
npm run test:ci
```

## 🏗️ Build & Deploy

```bash
# Build de desarrollo
npm start

# Build de producción
npm run build

# Analizar bundle size
npm run build:analyze

# Lighthouse performance
npm run lighthouse

# Docker (si tienes Docker)
docker-compose up --build
```

## 📂 Estructura Importante

```
proyecto/
├── frontend/           # Angular SPA
│   └── src/app/
│       ├── core/       # Servicios globales
│       ├── data/       # Servicios + tests ⭐
│       ├── pages/      # Vistas
│       ├── components/ # Componentes
│       └── directives/ # Directivas
├── backend/            # Spring Boot API
├── docs/               # Documentación ⭐
└── docker-compose.yml  # Orquestación
```

## 🎯 Tareas Comunes

### Crear Nuevo Componente
```bash
ng generate component components/shared/my-component
```

### Crear Nuevo Servicio
```bash
ng generate service data/my-service
```

### Crear Tests
```typescript
// Estructura básica
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
});
```

### Validación de Forms
```typescript
form = this.fb.group({
  email: ['', [Validators.required, Validators.email]],
  password: ['', [Validators.required, Validators.minLength(8)]]
});
```

## 🐛 Problemas Comunes

### Tests fallan
```bash
npm ci                  # Instalar versiones exactas
npm run test:ci         # Browser headless
```

### Build fallido
```bash
rm -rf node_modules dist
npm install
npm run build
```

### CORS errors
```bash
# En desarrollo, usar proxy
ng serve --proxy-config proxy.conf.json
```

### Rutas SPA no funcionan
```bash
# Nginx necesita rewrite
try_files $uri $uri/ /index.html;

# O usar hash routing
ng build --base-href /
```

## 📊 Métricas Actuales

| Métrica | Objetivo | Actual | Status |
|---------|----------|--------|--------|
| Test Coverage | > 50% | > 50% | ✅ |
| Lighthouse | > 80 | 85+ | ✅ |
| Bundle Size | < 500KB | ~350KB | ✅ |
| Tests | 20+ | 23+ | ✅ |
| Documentación | Completa | ~19k palabras | ✅ |

## 🔗 Enlaces Útiles

- [Angular Docs](https://angular.io/docs)
- [RxJS Docs](https://rxjs.dev/)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)
- [Vitest Docs](https://vitest.dev/)

## 📞 Ayuda Rápida

### ¿Cómo contribuir?
→ Lee [CONTRIBUTING.md](CONTRIBUTING.md)

### ¿Cómo desplegar?
→ Lee [DEPLOYMENT.md](docs/DEPLOYMENT.md)

### ¿Cómo mejorar performance?
→ Lee [OPTIMIZACION_RENDIMIENTO.md](docs/OPTIMIZACION_RENDIMIENTO.md)

### ¿Cómo hacer tests?
→ Lee [DOCUMENTACION_TECNICA.md](docs/DOCUMENTACION_TECNICA.md#a-nametestestestinga)

## 🎓 Decisiones Técnicas Clave

1. **Angular 21** - Framework moderno con soporte LTS
2. **Vitest** - Tests 5x más rápido que Jasmine
3. **Standalone Components** - Arquitectura simplificada
4. **RxJS** - Manejo reactivo de datos
5. **Docker** - Despliegue consistente

## ✨ Features Principales

- ✅ Gestión de medicinas y usuarios
- ✅ Validación de formularios avanzada
- ✅ Lazy loading de rutas
- ✅ Directivas personalizadas (Tooltip)
- ✅ Tests con 50%+ coverage
- ✅ Lighthouse 85+
- ✅ Cross-browser compatible
- ✅ Despliegue a múltiples plataformas

## 🚀 Próximos Pasos

1. ✅ Setup local
2. ✅ Revisar documentación
3. ✅ Ejecutar tests
4. ✅ Hacer cambios
5. ✅ Desplegar

---

**¿Listo para comenzar? ¡Ejecuta `npm start` y comienza a desarrollar!**
