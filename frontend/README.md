# Frontend — ORGMedi

Mini-README específico del frontend con pasos rápidos para desarrollo, pruebas y despliegue.

Requisitos
- Node.js 18+
- npm

Setup rápido

```powershell
cd frontend
npm install
```

Comandos útiles
- `npm run dev` → servidor de desarrollo (ng serve)
- `npm start` → servidor estático `server.js` (usado en Docker/producción local)
- `npm run build` → build de producción (`--configuration production`)
- `npm run test` → tests unitarios (Karma/Jasmine)
- `npm run test:coverage` → tests + coverage
- `npm run test:e2e:playwright` → ejecutar Playwright E2E (asegúrate de `npx playwright install`)

E2E Playwright (local)

```powershell
cd frontend
npx playwright install
npx playwright test --project=chromium
```

Build y análisis de bundles

```powershell
cd frontend
npm run build
npm run build:analyze
```

Producción (servir `dist/` con `server.js` o Nginx)

```powershell
cd frontend
npm run build
node server.js
# o construir una imagen Docker con Dockerfile existente
```

Consejos rápidos
- Para CI ejecutar `npm ci` en lugar de `npm install`.
- Usar `--base-href` en builds cuando la app se sirva desde una subruta.
- Ejecutar `npx playwright install --with-deps` en runners Linux para instalar navegadores.
# Proyecto

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.0.1.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

