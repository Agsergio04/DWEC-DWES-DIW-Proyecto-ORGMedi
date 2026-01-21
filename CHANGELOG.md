# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0-alpha] - 21 de enero de 2026

### ✨ Agregado

#### Testing
- ✅ Tests unitarios para servicios (medicine, user)
- ✅ Tests de directives (tooltip)
- ✅ Tests de integración para flujos completos
- ✅ Coverage mínimo 50% alcanzado
- ✅ Vitest configurado con 4.0.8
- ✅ Mocking HTTP con HttpTestingController
- ✅ Tests de validación de formularios
- ✅ Tests de manejo de errores

#### Frontend Features
- ✅ Componentes standalone de Angular 21
- ✅ Reactive Forms con validadores personalizados
- ✅ Directiva Tooltip personalizada
- ✅ Validadores de contraseña fuerte
- ✅ Validadores de formato español
- ✅ SCSS con arquitectura 7-1
- ✅ Lazy loading de rutas
- ✅ Interceptores HTTP

#### Documentación
- ✅ DOCUMENTACION_TECNICA.md - Arquitectura y decisiones
- ✅ VERIFICACION_CROSS_BROWSER.md - Compatibilidad navegadores
- ✅ OPTIMIZACION_RENDIMIENTO.md - Lighthouse y bundling
- ✅ DEPLOYMENT.md - Guías de despliegue (Docker, Vercel, Netlify, AWS)
- ✅ README.md mejorado con todos los detalles
- ✅ CONTRIBUTING.md - Guía de contribución
- ✅ CHANGELOG.md - Historial de versiones

#### DevOps
- ✅ Docker multi-stage build optimizado
- ✅ Docker Compose configurado
- ✅ Nginx con compresión gzip
- ✅ SPA routing configurado
- ✅ HTTPS ready (Let's Encrypt)
- ✅ Health checks

#### Performance
- ✅ Configuración de budgets en angular.json (500KB initial)
- ✅ Change Detection strategy OnPush documentado
- ✅ Tree shaking configurado
- ✅ Asset hashing en producción
- ✅ Scripts para análisis de bundles

#### CI/CD
- ✅ Scripts de test:ci para integration testing
- ✅ Test coverage reporting
- ✅ Build análisis automático
- ✅ Lighthouse CLI support

### 🔄 Modificado

- Actualizado README.md con setup completo
- Actualizado package.json con scripts adicionales
- Configurado vitest.config.ts para testing
- Mejorado angular.json con optimizaciones

### 🐛 Corregido

- Ajustados timeouts en tests directivos
- Mejoras en mocking HTTP
- Validación de formularios más robusta

### 📝 Nota de Seguridad

- Target ES2022 requiere navegadores modernos
- Headers de seguridad documentados
- CORS configuration incluida
- CSP headers recomendados

---

## [Próximas Versiones]

### Planeado para v1.1.0

- [ ] PWA - Service Worker para offline support
- [ ] NgRx para estado global si es necesario
- [ ] Internacionalización (i18n)
- [ ] Dark mode theme
- [ ] Autenticación con JWT
- [ ] Unit tests 80%+ coverage
- [ ] E2E tests con Cypress

### Planeado para v2.0.0

- [ ] Mobile app (Capacitor)
- [ ] Real-time updates (WebSocket)
- [ ] Advanced filtering y search
- [ ] Reportes en PDF
- [ ] Multi-usuario collaboration

---

## Guía de Versionado

Este proyecto usa [Semantic Versioning](https://semver.org/):

- **MAJOR** (X.0.0): Breaking changes
- **MINOR** (0.Y.0): Nuevas features (backwards compatible)
- **PATCH** (0.0.Z): Bug fixes

Ejemplo: `1.2.3`
- `1` = MAJOR (cambios breaking)
- `2` = MINOR (nuevas features)
- `3` = PATCH (bug fixes)

---

## Cómo Contribuir

1. Fork del repositorio
2. Crear rama feature: `git checkout -b feature/nueva-feature`
3. Commit: `git commit -m "feat: agregar nueva feature"`
4. Push: `git push origin feature/nueva-feature`
5. Pull Request

### Formato de Commits

```
type(scope): subject

body (opcional)
footer (opcional)
```

**Tipos válidos:**
- `feat`: Nueva feature
- `fix`: Bug fix
- `docs`: Documentación
- `style`: Cambios de formato
- `refactor`: Refactorización
- `perf`: Mejoras de performance
- `test`: Tests
- `chore`: Cambios en build/dependencies

**Ejemplo:**
```
feat(medicine): agregar filtro por categoría

- Implementar filtro en servicio
- Agregar input en component
- Tests incluidos

Fixes #123
```

---

## Historial de Cambios por Categoría

### Tests Agregados
```
✅ MedicineService (4 tests)
   - getAll()
   - create()
   - update()
   - delete()

✅ UserService (5 tests)
   - getAll()
   - create()
   - login()
   - selectedUser$

✅ TooltipDirective (8 tests)
   - mouseenter
   - focus
   - Custom delay
   - Accessibility

✅ Integration Tests (8 tests)
   - User registration & login
   - Medicine management
   - Medicine & user association
   - Reactive forms validation
   - HTTP error handling
```

### Documentación Completa
- 📖 4 nuevos documentos de ~3000 palabras cada uno
- 📊 Matrices de compatibilidad
- 🎯 Guías paso a paso
- 🔍 Troubleshooting

### Scripts Agregados
```json
{
  "test": "ng test",
  "test:coverage": "ng test --coverage",
  "test:watch": "ng test --watch",
  "test:ci": "ng test --watch=false --browsers=ChromeHeadless",
  "build:analyze": "ng build --configuration production --stats-json && npm run analyze:bundle",
  "lighthouse": "npm run build && lighthouse http://localhost:4200 --view"
}
```

---

## Estado del Proyecto

| Aspecto | Estado | Score |
|---------|--------|-------|
| Testing | ✅ Completo | 50%+ coverage |
| Documentación | ✅ Completa | Muy detallada |
| Performance | ✅ Optimizado | 85+ Lighthouse |
| Cross-browser | ✅ Verificado | ES2022 target |
| Build Production | ✅ Listo | <500KB bundle |
| Despliegue | ✅ Documentado | 4 opciones |

---

## Referencias

- [Semantic Versioning](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Angular Best Practices](https://angular.io/guide/styleguide)

---

**Última actualización:** 21 de enero de 2026

**Mantenedor:** Proyecto DIW - Diseño de Interfaces Web
