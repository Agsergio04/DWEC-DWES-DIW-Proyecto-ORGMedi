# Documentación Cliente
## Índice

1. [Fase 1 — Arquitectura de eventos](#fase-1--arquitectura-de-eventos)
    - [Flujo de eventos (diagrama textual)](#flujo-de-eventos-diagrama-textual)
    - [Patrones y buenas prácticas observadas](#patrones-y-buenas-prácticas-observados)
    - [Diagrama de flujo de eventos principales (texto expandido)](#diagrama-de-flujo-de-eventos-principales-texto-expandido)
    - [Tabla de compatibilidad: eventos usados](#tabla-de-compatibilidad-eventos-usados)
    - [Ejemplos prácticos (breve)](#ejemplos-prácticos-breve)
    - [Verificación y pruebas manuales recomendadas](#verificación-y-pruebas-manuales-recomendadas)
2. [Fase 2 — Componentes interactivos y comunicación](#fase-2--componentes-interactivos-y-comunicación)
    - [Principios clave](#principios-clave)
    - [Componentes interactivos](#componentes-interactivos)
    - [Comunicación entre componentes](#comunicación-entre-componentes)
    - [Tarea 5: Documentación (Arquitectura de servicios y patrones de comunicación)](#tarea-5-documentación-arquitectura-de-servicios-y-patrones-de-comunicación)
    - [Arquitectura de servicios y patrones de comunicación](#arquitectura-de-servicios-y-patrones-de-comunicación)
        - [Diagrama de arquitectura de servicios (resumen)](#diagrama-de-arquitectura-de-servicios-resumen)
        - [Patrones de comunicación implementados](#patrones-de-comunicación-implementados)
        - [Separación de responsabilidades (SRP)](#separación-de-responsabilidades-srp)
        - [Sistema de notificaciones y toasts](#sistema-de-notificaciones-y-toasts)
        - [Recomendaciones de estructura de carpetas (por feature)](#recomendaciones-de-estructura-de-carpetas-por-feature)
        - [Buenas prácticas y tips de escalabilidad](#buenas-prácticas-y-tips-de-escalabilidad)
        - [Mapping de requisitos (coverage)](#mapping-de-requisitos-coverage)
3. [Fase 3 : Documentación / Catálogo de validadores y FormArray](#fase-3--documentación--catálogo-de-validadores-y-formarray)
    - [Catálogo de validadores implementados](#catálogo-de-validadores-implementados)
    - [Guía de uso de FormArray (listas dinámicas)](#guía-de-uso-de-formarray-listas-dinámicas)
    - [Ejemplos de validación asíncrona (flujo completo)](#ejemplos-de-validación-asíncrona-flujo-completo)
4. [Fase 4 — Sistema de Rutas y Navegación](#fase-4--sistema-de-rutas-y-navegación)
  - [Tarea 1: Documentación](#tarea-1-documentación)

5. [Fase 5 — Servicios y Comunicación HTTP](#fase-5--servicios-y-comunicación-http)
  - [Tarea 1: Documentación](#tarea-1--documentación)
---
## Fase 1 — Arquitectura de eventos

La arquitectura de eventos en esta aplicación Angular sigue un patrón unidireccional de datos, apoyándose en los bindings nativos del DOM en las plantillas de componentes standalone. Se usan bindings como `(click)`, `(keydown)` o `(pointerdown)` directamente en las plantillas. Los eventos se manejan con la sintaxis `(eventName)="handler($event)"`, donde `$event` expone el objeto nativo (por ejemplo `KeyboardEvent`, `PointerEvent`), permitiendo acceder a campos como `event.key` o a métodos como `event.preventDefault()`.

Esta aproximación aprovecha Zone.js para la detección de cambios automática, por lo que los handlers pueden emitir datos hacia servicios inyectables o actualizar estados reactivos (signals) sin necesidad de usar `@Output` en componentes simples. Para flujos más complejos, la aplicación centraliza la gestión de eventos en servicios inyectables que utilizan `EventEmitter` o `RxJS` Subjects/Observables, reduciendo el acoplamiento directo entre componentes.

Además se usan modificadores y atajos en las plantillas, por ejemplo `(keyup.enter)` o `(click.alt)`, para filtrar eventos específicos y así simplificar la lógica en los handlers. Para casos especiales o eventos personalizados con comportamiento avanzado (por ejemplo debounce, throttle o integración con librerías externas), se extiende el gestor de eventos mediante `EVENT_MANAGER_PLUGINS` o se encapsula la lógica en directivas/servicios específicos.

---

### Flujo de eventos (diagrama textual)

El flujo principal de interacción en la aplicación puede resumirse así:

Usuario → DOM Event (click / keydown / pointerdown)
       → Template Binding (event handler en la plantilla)
       → Component Handler (ej. `onClick($event)`)
       → Service / State Update (signals, RxJS Subjects, EventEmitters)
       → View Re-render (Zone.js o estrategia OnPush)

Descripción: los eventos nativos se propagan de forma unidireccional desde la UI hacia la lógica de negocio. Cuando sea necesario bloquear comportamientos por defecto (p. ej. impedir el envío de un formulario con Enter), el handler puede llamar a `event.preventDefault()` y/o `event.stopPropagation()`.

Para flujos globales o cross-cutting, los handlers delegan en servicios inyectables que reemiten información a través de streams (Subjects/Observables) o `EventEmitter`, permitiendo a múltiples suscriptores reaccionar sin dependencia directa entre componentes.

---

### Patrones y buenas prácticas observadas

- Usar bindings nativos `(event)` para mantener handlers simples y cercanos al DOM. Esto mejora la legibilidad y rendimiento en componentes standalone.
- Delegar lógica de negocio a servicios inyectables y usar streams (RxJS) o `signals` para el estado compartido.
- Emplear modificadores de evento en plantillas (`(keyup.enter)`, `(click.alt)`) para reducir condicionales dentro de handlers.
- Para eventos complejos o con requisitos especiales (debounce, adaptación a librerías externas), envolver la lógica en directivas o extender `EVENT_MANAGER_PLUGINS` si se necesita un hook global del EventManager.
- Evitar el acoplamiento directo entre componentes; preferir la comunicación a través de servicios y Observables.

---

### Diagrama de flujo de eventos principales (texto expandido)

1. Usuario realiza una acción (click, touch, tecla, pointer).
2. El navegador genera el evento nativo y Angular procesa el binding en la plantilla.
3. Se ejecuta el handler del componente (`handler($event)`), que valida/filtra datos y delega a servicios si corresponde.
4. El servicio actualiza el estado compartido (signals o RxJS observables/subjects) o realiza llamadas HTTP.
5. Cambios en el estado disparan re-render (la detección de cambios de Angular o signals actualizan la vista). Si hay `OnPush`, el cambio se produce tras actualizar el estado reactivo.

---

### Tabla de compatibilidad: eventos usados

| Evento / característica | Compatibilidad (resumen) | Notas / alternativas |
|---|---:|---|
| click | Navegadores modernos + IE9+ | Soportado ampliamente; usar `pointer` events para mejorar soporte táctil si se desea.
| keydown / keyup | Navegadores modernos + IE9+ | Soportado ampliamente; para atajos de teclado usar `keyup.enter`, `keydown.ctrl.s` en plantillas Angular.
| pointerdown / pointerup | Navegadores modernos (Chrome, Edge, Firefox, Safari recientes) | Pointer Events unifican mouse/touch/pen; en navegadores antiguos usar `mousedown`/`touchstart` como fallback.
| Modificadores en plantilla (ej. `(keyup.enter)`) | Depende de Angular (plantilla) — compatible en toda la app | Angular interpreta el modificador en la plantilla; la compatibilidad es del framework no del navegador.
| Custom events / plugins (`EVENT_MANAGER_PLUGINS`) | Depende de la implementación | Permite extender el EventManager para casos especiales (debounce, terceros). Alternativa: directivas o RxJS operators.

> Nota: la compatibilidad exacta depende de la versión mínima de navegadores soportados por el proyecto. Para entornos legacy (IE11, navegadores antiguos) puede ser necesario polyfills (por ejemplo para `PointerEvent`) o usar eventos de fallback (`touchstart`, `mousedown`).

---

### Ejemplos prácticos (breve)

- Binding simple en plantilla:

```html
<button (click)="onSave($event)">Guardar</button>
```

- Uso de modificador de teclado:

```html
<input (keyup.enter)="onSubmit($event)" />
```

- Delegar a servicio con Subject:

```ts
// en component
this.eventsService.actions.next({ type: 'SAVE', payload: data });

// en service
readonly actions = new Subject<Action>();
```

- Custom event con EventManager plugin: si se necesita un comportamiento global (por ejemplo un 'debouncedClick'), implementar un plugin que detecte `debouncedClick` y emita el evento conforme a la lógica deseada.

---

### Verificación y pruebas manuales recomendadas

1. Testear interacciones básicas (clicks, teclas) en las páginas principales y verificar que los handlers se disparan.
2. Simular cambios de `pointer` vs `mouse` en dispositivos táctiles o con emulación en DevTools para validar `pointerdown`.
3. Comprobar flujos centralizados: observar que los servicios reciben los eventos (suscribirse a Subjects) y que la UI se actualiza.
4. Para compatibilidad, probar en los navegadores objetivo y añadir polyfills si se detectan incompatibilidades.

---

Si quieres, puedo:
- añadir un diagrama SVG o ASCII más detallado dentro del documento,
- añadir snippets de pruebas unitarias para handlers o servicios de eventos,
- integrar un ejemplo real en la página `demo` para ilustrar el flujo completo.

---

## FASE 2 — Componentes interactivos y comunicación

En esta fase se documentan las convenciones y patrones para componentes interactivos y los mecanismos de comunicación entre ellos. El objetivo es que los componentes gestionen únicamente la UI y la interacción, delegando la lógica de negocio y las comunicaciones en servicios reutilizables.

### Principios clave

- Componentes "dumb" (presentación): manejan sólo la plantilla, señales locales (signals) y eventos; delegan acciones a servicios.
- Servicios "smart" (dominio): encapsulan lógica, llamadas HTTP, validaciones, caching y orquestación entre APIs.
- Comunicación desacoplada mediante Observables/Subjects y BehaviorSubject para estado compartido y suscripciones tardías.
- Uso de Interceptors para lógica cross-cutting (loading global, headers, manejo de errores comunes).
- Preferir `AsyncPipe` y `signal()` para evitar subscribes manuales y fugas de memoria.

### Componentes interactivos

- Deben ser lo más pequeños y descriptivos posible (Single Responsibility).
- Mantener handlers simples que llaman a métodos de servicios (p.ej. `onSave() { this.userService.save(...) }`).
- Usar `ChangeDetectionStrategy.OnPush` cuando sea posible y signals para reactividad local.
- Evitar lógica de negocio, validaciones complejas o llamadas HTTP en el componente.

### Comunicación entre componentes

- Hermanos y componentes no relacionados: usar `CommunicationService` con `BehaviorSubject` o `Subject` según necesidad.
- Estado global (loading, auth, toast): servicios singleton (`providedIn: 'root'`) con BehaviorSubject/Observables.
- Para eventos one-shot (p.ej. navegación programática), usar `Subject` o `EventEmitter` en el servicio correspondiente.

### Tarea 5: Documentación (Arquitectura de servicios y patrones de comunicación)

A continuación se incluye la documentación de arquitectura de servicios y patrones (Tarea 5) para que quede agrupada dentro de la Fase 2.

## Arquitectura de servicios y patrones de comunicación

### Diagrama de arquitectura de servicios (resumen)

La arquitectura de servicios sigue un patrón jerárquico y desacoplado:

- Componentes (UI) → Services de dominio → HttpService/Interceptors → Estado reactivo global → View
- Servicios por dominio (p. ej. `UserService`, `ProductService`) encapsulan lógica y consumen `HttpClient` (vía `HttpService` o directamente) y publican resultados a servicios reactivos como `LoadingService` y `ToastService`.
- Servicios utilitarios y cross-cutting (Loading, Toast, Communication) actúan como singletons (`providedIn: 'root'`) y exponen Observables/BehaviorSubjects para suscriptores.

Flujo unidireccional recomendado:

1. El componente dispara una acción (evento, handler).
2. El componente llama al Service de dominio (p. ej. `userService.save()`).
3. El Service orquesta llamadas HTTP y transforma/valida datos.
4. El Service emite estado o notificaciones a través de servicios reactivos (BehaviorSubject / Signal).
5. Los componentes consumen esos Observables (o signals) y actualizan la vista (preferible con AsyncPipe o signals locales).


### Patrones de comunicación implementados

- Observable / Subject
  - `BehaviorSubject` en `CommunicationService` para estado compartido y suscripciones tardías.
  - `Subject` para eventos one-time (ej. acciones puntuales o navegación programática).

- Servicio Singleton
  - Servicios globales (`LoadingService`, `ToastService`, `CommunicationService`) declarados con `@Injectable({ providedIn: 'root' })`.

- HttpInterceptor
  - Interceptor para mostrar/ocultar `LoadingService` automáticamente y añadir headers comunes (auth token, content-type).

- Signals + AsyncPipe
  - Uso de `signal()` en componentes para estado local y `AsyncPipe` en plantillas para suscripción automática sin unsubscribe manual.

Buenas prácticas:
- Evitar suscripciones manuales en componentes (usar `AsyncPipe`, `takeUntilDestroyed()` o signals).
- Mantener los componentes libres de lógica de negocio y peticiones HTTP.


### Separación de responsabilidades (SRP)

- Componentes "dumb" (presentación):
  - Solo templates, signals locales, y handlers que delegan a servicios.
  - No contienen llamadas HTTP, lógica de validación o caching.

- Servicios "smart" (dominio):
  - Encapsulan lógica de negocio, orquestación entre APIs, caching y normalización de datos.
  - Expone métodos puros y Observables pipelineados (map, catchError, shareReplay cuando aplique).

Ejemplo correcto (componente limpio):

```ts
// user-list.component.ts (simplificado)
users$ = this.userService.getUsers();
selectedUser = signal<User | null>(null);

constructor(private userService: UserService) {}

onSelect(user: User) {
  this.selectedUser.set(user);
  this.userService.selectUser(user.id);
}
```

Ejemplo de Service (delegando HTTP y filtrado):

```ts
@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private http: HttpClient, private toast: ToastService) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>('/api/users').pipe(
      map(users => users.filter(u => u.active)),
      catchError(err => {
        this.toast.error('No se pudieron cargar los usuarios');
        return throwError(() => err);
      })
    );
  }
}
```


### Sistema de notificaciones y toasts

- `ToastService` centralizado emite mensajes tipados via `BehaviorSubject<ToastMessage | null>`.
- `ToastComponent` (overlay) se suscribe y muestra toasts con auto-dismiss configurables por mensaje (prop `duration`).
- Estilos y tipos (success | error | info | warning) permiten css dinámico para cada tipo.


### Recomendaciones de estructura de carpetas (por feature)

Mantener la separación por dominio facilita escalabilidad y pruebas:

```
src/app/
├── features/
│   ├── user/
│   │   ├── user.component.ts
│   │   ├── user.component.html
│   │   └── user.service.ts
│   └── product/
│       ├── product.component.ts
│       └── product.service.ts
├── shared/
│   ├── services/
│   │   ├── communication.service.ts
│   │   ├── toast.service.ts
│   │   └── loading.service.ts
│   └── components/
│       ├── toast/
│       │   ├── toast.component.ts
│       │   └── toast.component.scss
│       └── spinner/
│           ├── spinner.component.ts
│           └── spinner.component.scss
```


### Buenas prácticas y tips de escalabilidad

- Facade / Store: Para dominios complejos, crear un facade (o signalStore) que centralice múltiples servicios y exponga una API simple al componente.
- Caching: `shareReplay` o BehaviorSubjects en servicios para evitar llamadas redundantes.
- Testabilidad: Servicios con métodos puros y sin efectos secundarios son más fáciles de testear (mock HttpClient en unit tests).
- Accessibility: Toasts deben ser accesibles (role="status" y aria-live cuando aplique).


### Mapping de requisitos (coverage)

- Diagrama de arquitectura de servicios: He incluido el resumen del flujo unidireccional y los roles de los servicios. (Done)
- Patrones de comunicación: Observable/Subject, Singleton, HttpInterceptor, Signals + AsyncPipe. (Done)
- Separación de responsabilidades: Ejemplos de componente y servicio, y recomendaciones. (Done)
- Estructura de carpetas por feature: Ejemplo provisto. (Done)

---

## Fase 3 : Documentación / Catálogo de validadores y FormArray

### Catálogo de validadores implementados

A continuación se muestra un resumen (tabla) con los validadores usados en el proyecto — síncronos, personalizados y asíncronos — su tipo, nivel de aplicación, descripción breve y uso típico.

| Nombre | Tipo | Nivel | Descripción breve | Uso típico |
|---|---|---|---|---|
| Validators.required | Síncrono (built-in) | Campo | Obliga a que el control tenga valor no vacío | Campos obligatorios (nombre, email, etc.) |
| Validators.email | Síncrono (built-in) | Campo | Valida formato de email | Campo email |
| Validators.minLength(n) | Síncrono (built-in) | Campo | Longitud mínima de cadena | Password, username |
| Validators.pattern(...) | Síncrono (built-in) | Campo | Validación por expresión regular (NIF, CP, teléfono, etc.) | NIF, teléfono, CP |
| passwordStrength() | Personalizado | Campo | Comprueba mayúsculas, minúsculas, número, símbolo y longitud mínima (configurada) | Campo password (registro/edición) |
| nif() | Personalizado | Campo | Valida formato y letra de NIF español | Campo NIF en formularios de usuario/datos fiscales |
| telefono() | Personalizado | Campo | Valida teléfono móvil español (empieza en 6 o 7 y 9 dígitos) | Listado de teléfonos, contacto cliente |
| codigoPostal() | Personalizado | Campo | Valida código postal de 5 dígitos | Dirección (CP) |
| passwordMatch(...) | Cross-field (personalizado) | FormGroup | Valida que `password` y `confirmPassword` coincidan | Formulario de registro / cambiar contraseña |
| totalMinimo(...) | Cross-field (personalizado) | FormGroup | Valida que `price * quantity` supere un mínimo | Formularios de pedido / factura |
| atLeastOneRequired(...) | Cross-field (personalizado) | FormGroup | Obliga a rellenar al menos uno de varios campos | Al menos teléfono o email, contactos alternativos |
| emailUnique(...) / uniqueEmail(...) | Asíncrono (personalizado) | Campo | Comprueba contra API (simulada) que el email no está registrado; retorna `{ emailTaken: true }` si existe | Registro / edición de usuario (validación en blur) |
| usernameAvailable(...) | Asíncrono (personalizado) | Campo | Comprueba disponibilidad del username contra API simulada; retorna `{ usernameTaken: true }` si no disponible | Registro de usuario (validación en blur) |

**Notas rápidas**
- Los validadores síncronos retornan `null` (válido) o un `ValidationErrors` object (p. ej. `{ required: true }`).
- Los validadores asíncronos devuelven `Observable<ValidationErrors | null>` y marcan el control como `pending` mientras se resuelven.
- Para performance y UX se combina `debounce` + `updateOn: 'blur'` en controles con validación remota.

---

### Guía de uso de FormArray (listas dinámicas)

`FormArray` es la forma recomendada para modelar colecciones dinámicas en formularios reactivos (teléfonos, direcciones, ítems de factura, etc.). A continuación se muestra cómo definir, añadir, eliminar y validar elementos.

1. Definición en el formulario principal

```ts
this.form = this.fb.group({
  customer: ['', Validators.required],
  phones: this.fb.array([]),
  addresses: this.fb.array([]),
  items: this.fb.array([])
});
```

2. Acceso al FormArray desde el componente

```ts
get phones(): FormArray { return this.form.get('phones') as FormArray; }
get addresses(): FormArray { return this.form.get('addresses') as FormArray; }
get items(): FormArray { return this.form.get('items') as FormArray; }
```

3. Crear un nuevo elemento (ej. teléfono) con validadores por elemento

```ts
newPhone(): FormGroup {
  return this.fb.group({
    phone: ['', [Validators.required, telefono()]] // telefono() es el validador personalizado
  });
}

addPhone(): void { this.phones.push(this.newPhone()); }
removePhone(index: number): void { this.phones.removeAt(index); }
```

4. Uso en plantilla (Angular)

```html
<div formArrayName="phones">
  <div *ngFor="let phoneGroup of phones.controls; let i = index" [formGroupName]="i">
    <input formControlName="phone" placeholder="Teléfono">
    <button type="button" (click)="removePhone(i)" *ngIf="phones.length > 1">Eliminar</button>
    <small class="error" *ngIf="phoneGroup.get('phone')?.invalid && (phoneGroup.get('phone')?.touched || phoneGroup.get('phone')?.dirty)">
      Teléfono inválido
    </small>
  </div>
  <button type="button" (click)="addPhone()">Añadir teléfono</button>
</div>
```

5. Casos de uso documentados
- Lista de teléfonos del cliente (contacto).  
- Múltiples direcciones (envío / facturación).  
- Items de factura: descripción, cantidad, precio; cálculo de total y validación de `quantity >= 1` y `price >= 0`.

---

### Ejemplos de validación asíncrona (flujo completo)

Esta sección documenta el flujo típico de validadores asíncronos (simulación de API, AsyncValidatorFn y plantilla con estados `pending` / errores).

1) Servicio de validación simulado

```ts
@Injectable({ providedIn: 'root' })
export class ValidationService {
  private usedEmails = ['admin@ejemplo.com', 'user@test.com'];

  checkEmailUnique(email: string): Observable<boolean> {
    return of(email ? !this.usedEmails.includes(email.toLowerCase()) : true).pipe(delay(800));
  }
}
```

2) Validador asíncrono (debounce + map a ValidationErrors)

```ts
export function uniqueEmail(validationService: ValidationService): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    if (!control.value) return of(null);
    return timer(500).pipe( // debounce
      switchMap(() => validationService.checkEmailUnique(control.value)),
      map(isUnique => isUnique ? null : { emailTaken: true }),
      catchError(() => of(null)) // errores de red no bloquean la edición
    );
  };
}
```

3) Uso en FormBuilder (control con updateOn: 'blur')

```ts
this.form = this.fb.group({
  email: ['', {
    validators: [Validators.required, Validators.email],
    asyncValidators: [uniqueEmail(this.validationService)],
    updateOn: 'blur'
  }]
});
```

4) Plantilla con estados `pending` y error (mostrar solo tras touched/dirty)

```html
<input formControlName="email" placeholder="email@ejemplo.com">
<div *ngIf="email.pending" class="hint loading">Comprobando email...</div>
<div *ngIf="email.errors?.['emailTaken'] && !email.pending && (email.touched || email.dirty)" class="error">
  Este email ya está registrado.
</div>
<button type="submit" [disabled]="form.invalid || form.pending">{{ form.pending ? 'Validando...' : 'Guardar' }}</button>
```

**Notas**
- `pending` indica que la validación asíncrona está en curso; es útil para feedback visual y para deshabilitar envíos hasta que la validación termine.
- `timer` + `switchMap` implementan un debounce simple; para producción usar una estrategia en el servicio que reutilice `debounceTime` o `distinctUntilChanged` cuando sea necesario.

---

## Fase 4 — Rutas, navegación y carga de datos

### Mapa Completo de Rutas

| Ruta | Descripción | Lazy | Guards | Resolver |
|------|-------------|------|--------|----------|
| `/` | Página de inicio | ❌ | - | - |
| `/iniciar-sesion` | Autenticación del usuario | ✅ | - | - |
| `/registrarse` | Registro de nuevo usuario | ✅ | - | - |
| `/medicamentos` | Listado de medicamentos | ✅ | `authGuard` | `medicinesResolver` |
| `/medicamentos/crear` | Crear nuevo medicamento | ✅ | `authGuard`, `pendingChangesGuard` | - |
| `/medicamentos/crear-foto` | Crear medicamento desde foto | ✅ | `authGuard`, `pendingChangesGuard` | - |
| `/medicamentos/:id/editar` | Editar medicamento específico | ✅ | `authGuard`, `pendingChangesGuard` | `medicineDetailResolver` |
| `/calendario` | Vista de calendario | ✅ | - | - |
| `/guia-estilos` | Guía de estilos y componentes | ✅ | - | - |
| `/demostracion` | Página de demostración | ✅ | - | - |
| `/perfil` | Perfil del usuario | ✅ | `authGuard`, `pendingChangesGuard` | `profileResolver` |
| `**` | Página 404 (wildcard) | - | - | - |

---

### Lazy Loading — Estrategia de Carga Dinámica

#### Objetivo
Reducir el tamaño del bundle inicial dividiendo la aplicación en chunks independientes que se cargan bajo demanda.

#### Implementación

Todas las rutas exceptuando `/` utilizan lazy loading con `loadComponent()`:

```typescript
// app.routes.ts (ejemplo)
const MEDICINES_ROUTES: Routes = [
  {
    path: 'medicamentos',
    loadComponent: () =>
      import('./pages/medicines/medicines').then(m => m.MedicinesPage),
    data: { 
      chunkName: 'medicamentos',
      breadcrumb: 'Medicamentos'
    },
    canActivate: [authGuard],
    resolve: {
      medicines: medicinesResolver
    }
  },
  // ... más rutas
];
```

#### Precargar Módulos

```typescript
// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(APP_ROUTES, 
      withPreloadingStrategy(PreloadAllModules)
    )
  ]
};
```

#### Beneficios
- ✅ Bundle inicial: 306.83 kB → 83.27 kB (gzipped)
- ✅ 14 chunks lazy generados
- ✅ PreloadAllModules precarga chunks visibles
- ✅ Navegación más rápida después del primer load

#### Métricas de Bundle

```
Initial chunks:
- main-OZCLOPL3.js: 32.18 kB (core app)
- chunk-7ZT573BA.js: 154.92 kB (Angular framework)
- chunk-C7BQFHC4.js: 92.54 kB (app logic)
- chunk-KRM2EZBP.js: 17.96 kB (utilities)
- styles-R2WCJJQN.css: 6.36 kB

Total: 306.83 kB (83.27 kB comprimido)
14 lazy chunks generados
```

---

### Route Guards — Protección de Rutas

#### authGuard - Protección de autenticación

```typescript
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (authService.isAuthenticated()) {
    return true;
  }
  
  router.navigate(['/iniciar-sesion'], {
    queryParams: { returnUrl: state.url }
  });
  return false;
};
```

**Casos de uso**:
- Protege `/medicamentos`, `/medicamentos/crear`, `/medicamentos/:id/editar`, `/perfil`
- Redirige a `/iniciar-sesion` si no autenticado
- Preserva `returnUrl` para redirigir después del login

#### pendingChangesGuard - Prevención de pérdida de datos

```typescript
export const pendingChangesGuard: CanDeactivateFn<FormComponent> = 
  (component, currentRoute, currentState, nextState) => {
    
    if (component.isDirty && component.isDirty()) {
      return confirm('¿Abandonar sin guardar cambios?');
    }
    return true;
  };

interface FormComponent {
  isDirty(): boolean;
}
```

**Casos de uso**:
- Se aplica en `/medicamentos/crear`, `/medicamentos/:id/editar`, `/perfil`
- Advierte al usuario si hay cambios sin guardar
- Solo protege cuando el formulario está dirty

---

### Resolvers — Precarga de Datos

Los **resolvers** precarga datos antes de activar la ruta, mejorando UX.

#### Pattern ResolveFn

```typescript
export const miResolver: ResolveFn<MiDatos[]> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Promise<MiDatos[]> | Observable<MiDatos[]> => {
  return inject(MiServicio).cargarDatos();
};
```

#### 1. medicinesResolver - Lista de Medicamentos

```typescript
export const medicinesResolver: ResolveFn<Medicine[]> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Promise<Medicine[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 1, name: 'Paracetamol', dosage: '500mg' },
        { id: 2, name: 'Ibuprofen', dosage: '400mg' }
      ]);
    }, 300);
  });
};
```

**Ubicación**: `core/services/medicines.resolver.ts`
**Usado en**: Ruta `/medicamentos`
**En producción**: `return inject(MedicineService).getMedicines();`

#### 2. medicineDetailResolver - Medicamento por ID

```typescript
export const medicineDetailResolver: ResolveFn<Medicine | null> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Promise<Medicine | null> => {
  const router = inject(Router);
  const id = route.paramMap.get('id');
  
  if (!id) {
    router.navigate(['/medicamentos']);
    return Promise.resolve(null);
  }
  
  return new Promise((resolve) => {
    setTimeout(() => {
      const medicine = medicines.find(m => m.id === parseInt(id));
      if (!medicine) {
        router.navigate(['/medicamentos']);
        resolve(null);
      } else {
        resolve(medicine);
      }
    }, 300);
  });
};
```

**Ubicación**: `core/services/medicines.resolver.ts`
**Usado en**: Ruta `/medicamentos/:id/editar`
**Validaciones**: ID presente, medicamento existe

#### 3. profileResolver - Perfil del Usuario

```typescript
export const profileResolver: ResolveFn<UserProfile> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Promise<UserProfile> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: 1,
        name: 'Juan Pérez García',
        email: 'juan@example.com',
        birthDate: '1990-05-15',
        medicalConditions: ['Diabetes', 'Hipertensión'],
        allergies: ['Penicilina']
      });
    }, 300);
  });
};
```

**Ubicación**: `core/services/profile.resolver.ts`
**Usado en**: Ruta `/perfil`

#### Consumir Resolver en Componente

```typescript
export class EditMedicinePage implements OnInit {
  medicine: Medicine | null = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.data.subscribe((data: any) => {
      this.medicine = data['medicine'] || null;
    });
  }
}
```

---

### Breadcrumbs — Navegación Dinámica

Los **breadcrumbs** (migas de pan) muestran la ruta actual y permiten navegación hacia atrás.

#### Ejemplo Visual

```
Inicio › Medicamentos › Editar Medicamento
```

#### BreadcrumbService - Lógica de Generación

```typescript
@Injectable({ providedIn: 'root' })
export class BreadcrumbService {
  private readonly _breadcrumbs$ = new BehaviorSubject<Breadcrumb[]>([]);
  readonly breadcrumbs$ = this._breadcrumbs$.asObservable();

  constructor(private router: Router, private route: ActivatedRoute) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        const breadcrumbs: Breadcrumb[] = [];
        breadcrumbs.push({ label: 'Inicio', url: '/' });
        this.buildCrumbs(this.route.root, '', breadcrumbs);
        this._breadcrumbs$.next(breadcrumbs);
      });
  }

  private buildCrumbs(
    route: ActivatedRoute,
    url: string,
    breadcrumbs: Breadcrumb[]
  ): void {
    const children: ActivatedRoute[] = route.children;

    for (const child of children) {
      const routeURL = child.snapshot.url
        .map(segment => segment.path)
        .join('/');

      if (routeURL !== '') {
        url += `/${routeURL}`;
      }

      const label = child.snapshot.data['breadcrumb'];
      if (label && breadcrumbs[breadcrumbs.length - 1].label !== label) {
        breadcrumbs.push({ label, url });
      }

      this.buildCrumbs(child, url, breadcrumbs);
    }
  }
}
```

#### BreadcrumbComponent - Presentación

```typescript
@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss']
})
export class BreadcrumbComponent implements OnInit {
  breadcrumbs: Breadcrumb[] = [];

  constructor(private breadcrumbService: BreadcrumbService) {}

  ngOnInit() {
    this.breadcrumbService.breadcrumbs$.subscribe((crumbs: Breadcrumb[]) => {
      this.breadcrumbs = crumbs;
    });
  }
}
```

#### Template del Breadcrumb

```html
<nav *ngIf="breadcrumbs.length > 0" 
     aria-label="Navegación de migas de pan"
     class="breadcrumb-nav">
  <ol class="breadcrumb-list">
    <li *ngFor="let crumb of breadcrumbs; let last = last" 
        class="breadcrumb-item">
      <a *ngIf="!last" 
         [routerLink]="crumb.url" 
         class="breadcrumb-link">
        {{ crumb.label }}
      </a>
      <span *ngIf="last" 
            class="breadcrumb-text active" 
            aria-current="page">
        {{ crumb.label }}
      </span>
      <span *ngIf="!last" 
            class="breadcrumb-separator" 
            aria-hidden="true">›</span>
    </li>
  </ol>
</nav>
```

#### Configuración en Rutas

```typescript
export const APP_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then(m => m.HomePage),
    data: { breadcrumb: 'Inicio' }
  },
  {
    path: 'medicamentos',
    loadComponent: () => import('./pages/medicines/medicines').then(m => m.MedicinesPage),
    canActivate: [authGuard],
    resolve: { medicines: medicinesResolver },
    data: { breadcrumb: 'Medicamentos' }
  },
  {
    path: 'medicamentos/:id/editar',
    loadComponent: () => import('./pages/edit-medicine/edit-medicine').then(m => m.EditMedicinePage),
    canActivate: [authGuard],
    canDeactivate: [pendingChangesGuard],
    resolve: { medicine: medicineDetailResolver },
    data: { breadcrumb: 'Editar Medicamento' }
  }
];
```

#### Características
- ✅ Usa `BehaviorSubject` para estado reactivo
- ✅ Se suscribe a `NavigationEnd` events
- ✅ Algoritmo recursivo para construir árbol
- ✅ Accesibilidad WCAG 2.1 AA
- ✅ Responsividad y dark mode

---

### Flujos de Navegación Principales

#### Flujo de Autenticación

```
Usuario no autenticado intenta ir a /medicamentos
    ↓
authGuard intercepta y redirige a /iniciar-sesion
    ↓
Usuario se autentica
    ↓
Redirige automáticamente a /medicamentos
    ↓
medicinesResolver precarga datos
    ↓
MedicinesPage se renderiza con datos listos
```

#### Flujo de Edición de Medicamento

```
Usuario hace clic en "Editar medicamento"
    ↓
Navega a /medicamentos/1/editar
    ↓
medicineDetailResolver carga medicamento por ID
    ↓
EditMedicinePage recibe datos en route.data
    ↓
Formulario se renderiza precargado
    ↓
BreadcrumbComponent muestra: Inicio › Medicamentos › Editar Medicamento
```

#### Flujo de Perfil de Usuario

```
Usuario hace clic en "Mi Perfil"
    ↓
Navega a /perfil
    ↓
profileResolver carga datos del usuario
    ↓
ProfilePage muestra información
    ↓
BreadcrumbComponent muestra: Inicio › Perfil
```

---

### Resumen de Implementación

#### Archivos Creados
- `core/services/medicines.resolver.ts` - Resolvers para medicamentos
- `core/services/profile.resolver.ts` - Resolver para perfil
- `core/services/breadcrumb.service.ts` - Servicio de breadcrumbs
- `components/shared/breadcrumb/breadcrumb.component.ts` - Componente
- `components/shared/breadcrumb/breadcrumb.component.html` - Template
- `components/shared/breadcrumb/breadcrumb.component.scss` - Estilos

#### Archivos Modificados
- `app/app.routes.ts` - Integración de resolvers y metadatos
- `components/layout/header/header.ts` - Import BreadcrumbComponent
- `components/layout/header/header.html` - Inclusión de breadcrumb
- `pages/medicines/medicines.ts` - Consumo de medicinesResolver
- `pages/edit-medicine/edit-medicine.ts` - Reactive forms + resolver
- `pages/edit-medicine/edit-medicine.html` - Cambio a formControlName
- `pages/profile/profile.ts` - Consumo de profileResolver

#### Métricas de Build
- Bundle inicial: 306.83 kB (83.27 kB gzipped)
- Chunks lazy: 14
- Tiempo de build: 3.494 segundos
- Errores TypeScript: 0 ✅

---

## Fase 4 — Sistema de Rutas y Navegación

### Tarea 7: Documentación

Para la documentación de tu proyecto Angular, esta podría ser la sección de rutas y navegación para el README/mkdocs.

#### Mapa completo de rutas

Incluye un mapa resumido de todas las rutas con su propósito, guardas y resolvers.

##### Mapa de rutas de la aplicación

| Ruta                          | Descripción                     | Lazy | Guards                  | Resolver           |
|-------------------------------|---------------------------------|------|-------------------------|--------------------|
| `/`                          | Página de inicio                | ✅   | -                       | `homeResolver`     |
| `/iniciar-sesion`            | Pantalla de autenticación       | ✅   | -                       | -                  |
| `/registrarse`               | Formulario de registro          | ✅   | -                       | -                  |
| `/medicamentos`              | Listado de medicamentos         | ✅   | `authGuard`             | `medicinesResolver`|
| `/medicamentos/crear`        | Formulario crear medicamento    | ✅   | `authGuard`             | -                  |
| `/medicamentos/crear-foto`   | Crear medicamento desde foto    | ✅   | `authGuard`             | -                  |
| `/medicamentos/:id/editar`   | Editar medicamento específico   | ✅   | `authGuard`, `pendingChangesGuard` | `medicineDetailResolver` |
| `/perfil`                    | Perfil de usuario               | ✅   | `authGuard`             | `profileResolver`  |
| `/calendario`                | Calendario de medicamentos      | ✅   | -                       | -                  |
| `/guia-estilos`              | Guía de estilos de la app       | ✅   | -                       | -                  |
| `**`                         | Página 404                      | ✅   | -                       | -                  |

#### Estrategia de lazy loading explicada

Describe cómo se dividen las features y cómo se precargan.

##### Estrategia de lazy loading

- Todas las rutas utilizan lazy loading para optimizar el bundle inicial.
- Cada página se carga bajo demanda cuando el usuario navega a ella.

```typescript
// app.routes.ts (resumen)
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then(m => m.HomePage),
    resolve: { homeData: homeResolver }
  },
  {
    path: 'iniciar-sesion',
    loadComponent: () => import('./pages/iniciar-sesion/login').then(m => m.LoginPage)
  },
  {
    path: 'registrarse',
    loadComponent: () => import('./pages/registrarse/register').then(m => m.RegisterPage)
  },
  {
    path: 'medicamentos',
    loadComponent: () => import('./pages/medicines/medicines').then(m => m.MedicinesPage),
    canActivate: [authGuard],
    resolve: { medicines: medicinesResolver }
  },
  {
    path: 'medicamentos/crear',
    loadComponent: () => import('./pages/create-medicine/create-medicine').then(m => m.CreateMedicinePage),
    canActivate: [authGuard],
    canDeactivate: [pendingChangesGuard]
  },
  {
    path: 'medicamentos/:id/editar',
    loadComponent: () => import('./pages/edit-medicine/edit-medicine').then(m => m.EditMedicinePage),
    canActivate: [authGuard],
    canDeactivate: [pendingChangesGuard],
    resolve: { medicine: medicineDetailResolver }
  },
  {
    path: 'calendario',
    loadComponent: () => import('./pages/calendar/calendar').then(m => m.CalendarPage)
  },
  {
    path: 'perfil',
    loadComponent: () => import('./pages/profile/profile').then(m => m.ProfilePage),
    canActivate: [authGuard],
    resolve: { profile: profileResolver }
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found').then(m => m.NotFoundPage)
  }
];
```

- Se usa `PreloadAllModules` para precargar en segundo plano todos los módulos lazy una vez cargada la app:

```typescript
// app.config.ts
import { provideRouter, withPreloading, PreloadAllModules } from '@angular/router';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withPreloading(PreloadAllModules))
  ]
};
```

- En el build de producción (`ng build --configuration production`) se verifican los **chunks** generados: cada página lazy produce su propio `.js` separado, reduciendo el tamaño de `main`.

#### Guards y resolvers documentados

Explica para qué sirve cada guard/resolver y en qué rutas se aplica.

##### Guards implementados

**authGuard** (`CanActivateFn`)
- Objetivo: proteger rutas privadas si el usuario no está autenticado.
- Comportamiento: si no hay sesión, redirige a `/iniciar-sesion` pasando `returnUrl` en `queryParams`.
- Rutas: `/medicamentos`, `/medicamentos/**`, `/perfil`.

```typescript
export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.isAuthenticated()
    ? true
    : router.createUrlTree(['/iniciar-sesion'], { queryParams: { returnUrl: state.url } });
};
```

**pendingChangesGuard** (`CanDeactivateFn`)
- Objetivo: evitar perder cambios en formularios reactivos.
- Comportamiento: si form.dirty muestra un confirm() antes de salir.
- Rutas: `/medicamentos/crear`, `/medicamentos/crear-foto`, `/medicamentos/:id/editar`, `/perfil`.

```typescript
export interface FormComponent {
  form: FormGroup;
}

export const pendingChangesGuard: CanDeactivateFn<FormComponent> =
  (component) => component.form?.dirty
    ? confirm('Hay cambios sin guardar. ¿Salir igualmente?')
    : true;
```

##### Resolvers implementados

**homeResolver**
- Carga los datos de inicio antes de activar `/`.

**medicinesResolver**
- Carga el listado de medicamentos antes de activar `/medicamentos`.

**medicineDetailResolver**
- Carga un medicamento concreto antes de activar `/medicamentos/:id/editar`.

**profileResolver**
- Carga los datos del perfil antes de activar `/perfil`.

```typescript
export const medicineDetailResolver: ResolveFn<Medicine> = (route) => {
  const service = inject(MedicineService);
  const id = route.paramMap.get('id')!;
  return service.getMedicineById(id);
};

export const routes: Routes = [
  {
    path: 'medicamentos/:id/editar',
    loadComponent: () => import('./pages/edit-medicine/edit-medicine').then(m => m.EditMedicinePage),
    resolve: { medicine: medicineDetailResolver },
    canActivate: [authGuard],
    canDeactivate: [pendingChangesGuard]
  }
];
```

**Errores en resolvers:**
- En caso de error se redirige a `/medicamentos` con mensaje en state, o se devuelve un objeto `{ error, data: null }` que el componente interpreta para mostrar un mensaje de fallo.

---

## Fase 5 — Servicios y Comunicación HTTP

### Tarea 7: Documentación

La documentación de HTTP de tu proyecto Angular se estructura en tres secciones principales.

#### Catálogo de endpoints consumidos

Incluye una tabla con todos los endpoints que usa la SPA, el método, descripción y servicio Angular que los consume.

##### Endpoints REST

| Método | URL                         | Descripción                       | Servicio / método                    |
|--------|-----------------------------|-----------------------------------|--------------------------------------|
| GET    | `/api/medicines`           | Listado paginado de medicamentos  | `MedicineService.getAll()`          |
| GET    | `/api/medicines/:id`       | Detalle de medicamento            | `MedicineService.getById(id)`       |
| POST   | `/api/medicines`           | Crear nuevo medicamento           | `MedicineService.create(dto)`       |
| PUT    | `/api/medicines/:id`       | Actualizar medicamento completo   | `MedicineService.update(id, dto)`   |
| DELETE | `/api/medicines/:id`       | Eliminar medicamento              | `MedicineService.delete(id)`        |
| GET    | `/api/users/me`            | Datos del usuario autenticado     | `UserService.getProfile()`          |
| PUT    | `/api/users/me`            | Actualizar perfil                 | `UserService.updateProfile(dto)`    |
| POST   | `/api/auth/login`          | Login, devuelve token JWT         | `AuthService.login(credentials)`    |
| POST   | `/api/auth/register`       | Registro de nuevo usuario         | `AuthService.register(dto)`         |
| POST   | `/api/upload`              | Subida de ficheros (FormData)     | `UploadService.upload(file)`        |

#### Estructura de datos (interfaces)

Documenta las interfaces TypeScript que tipan las respuestas y cuerpos de petición.

##### Interfaces de dominio

```typescript
// Medicamento
export interface Medicine {
  id: string;
  name: string;
  description: string;
  dosage?: string;
  sideEffects?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

// Usuario autenticado
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

// Respuesta genérica paginada
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

// DTOs de entrada
export interface CreateMedicineDto {
  name: string;
  description: string;
  dosage?: string;
  sideEffects?: string;
}

export interface UpdateMedicineDto extends Partial<CreateMedicineDto> {}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}
```

#### Estrategia de manejo de errores

Explica el flujo global de errores: interceptor + servicios + feedback en UI.

##### Manejo de errores HTTP

**1. Interceptor global (`errorInterceptor`)**
   
   - Intercepta todas las respuestas de `HttpClient`.
   - Mapea códigos de estado a mensajes de usuario:
     - `0` → "No hay conexión con el servidor."
     - `401` → "Sesión caducada, vuelve a iniciar sesión."
     - `403` → "No tienes permisos para esta acción."
     - `404` → "Recurso no encontrado."
     - `5xx` → "Ha ocurrido un error en el servidor."
   - Lanza el error con `throwError` para que el servicio/componente pueda reaccionar.

```typescript
export const errorInterceptor: HttpInterceptorFn = (req, next) => 
  next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const message = mapStatusToMessage(error.status);
      toastService.error(message); // servicio de notificaciones
      return throwError(() => error);
    })
  );

function mapStatusToMessage(status: number): string {
  const errorMap: { [key: number]: string } = {
    0: 'No hay conexión con el servidor',
    401: 'Sesión caducada, inicia sesión nuevamente',
    403: 'No tienes permisos para esta acción',
    404: 'Recurso no encontrado',
    500: 'Error en el servidor',
    503: 'Servicio no disponible'
  };
  return errorMap[status] || 'Error desconocido';
}
```

**2. Servicios de dominio**
   
   - Pueden aplicar `catchError` adicional solo para casos de negocio.
   - Ejemplo: transformar un `409` (conflicto) en mensaje específico.
   - Devuelven observables tipados: `Observable<Medicine[]>`, `Observable<User>`, etc.

```typescript
export class MedicineService {
  private api = inject(HttpClient);

  getAll(): Observable<Medicine[]> {
    return this.api.get<PaginatedResponse<Medicine>>('/api/medicines').pipe(
      map(response => response.items),
      catchError(error => {
        console.error('Error al cargar medicamentos:', error);
        return throwError(() => error);
      })
    );
  }

  getById(id: string): Observable<Medicine> {
    return this.api.get<Medicine>(`/api/medicines/${id}`).pipe(
      catchError(error => {
        if (error.status === 404) {
          return throwError(() => new Error('Medicamento no encontrado'));
        }
        return throwError(() => error);
      })
    );
  }

  create(dto: CreateMedicineDto): Observable<Medicine> {
    return this.api.post<Medicine>('/api/medicines', dto).pipe(
      catchError(error => {
        if (error.status === 409) {
          return throwError(() => new Error('El medicamento ya existe'));
        }
        return throwError(() => error);
      })
    );
  }

  update(id: string, dto: UpdateMedicineDto): Observable<Medicine> {
    return this.api.put<Medicine>(`/api/medicines/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`/api/medicines/${id}`);
  }
}
```

**3. Componentes**
   
   - Gestionan estados `loading`, `error`, `empty`, `success` a nivel de UI.
   - No conocen detalles de HTTP, solo mensajes de alto nivel.
   - Usan signals para reactividad.

```typescript
export class MedicinesPage {
  private medicineService = inject(MedicineService);
  private toastService = inject(ToastService);

  state = signal<{
    loading: boolean;
    error: string | null;
    medicines: Medicine[];
  }>({
    loading: false,
    error: null,
    medicines: []
  });

  loadMedicines() {
    this.state.update(s => ({ ...s, loading: true, error: null }));
    
    this.medicineService.getAll().subscribe({
      next: (medicines) => {
        this.state.update(s => ({
          ...s,
          loading: false,
          medicines
        }));
      },
      error: (error) => {
        const message = error.message || 'No se pudieron cargar los medicamentos';
        this.state.update(s => ({
          ...s,
          loading: false,
          error: message
        }));
        this.toastService.error(message);
      }
    });
  }
}
```

##### Resumen del flujo de errores

```
Error HTTP (servidor)
    ↓
errorInterceptor captura y mapea código
    ↓
Toast de notificación global
    ↓
throwError pasa a servicio
    ↓
Servicio aplica lógica de negocio (si aplica)
    ↓
Componente captura en bloque error
    ↓
Actualiza signal de estado
    ↓
Template muestra mensaje al usuario
```

#### Operaciones CRUD completas

**GET - Obtener listados y elementos individuales**

```typescript
// Obtener listado completo
medicines$ = this.medicineService.getAll();

// Obtener por ID (resuelto antes de cargar ruta)
constructor(private route: ActivatedRoute) {
  this.medicine = this.route.snapshot.data['medicine'];
}
```

**POST - Crear nuevos recursos**

```typescript
createMedicine(dto: CreateMedicineDto) {
  this.medicineService.create(dto).subscribe({
    next: (newMedicine) => {
      this.medicines.push(newMedicine);
      this.toastService.success('Medicamento creado');
      this.router.navigate(['/medicamentos']);
    },
    error: (err) => this.toastService.error(err.message)
  });
}
```

**PUT - Actualizar recursos**

```typescript
updateMedicine(id: string, dto: UpdateMedicineDto) {
  this.medicineService.update(id, dto).subscribe({
    next: (updated) => {
      this.toastService.success('Medicamento actualizado');
      this.router.navigate(['/medicamentos', id]);
    },
    error: (err) => this.toastService.error(err.message)
  });
}
```

**DELETE - Eliminar recursos**

```typescript
deleteMedicine(id: string) {
  if (confirm('¿Estás seguro de que deseas eliminar este medicamento?')) {
    this.medicineService.delete(id).subscribe({
      next: () => {
        this.medicines = this.medicines.filter(m => m.id !== id);
        this.toastService.success('Medicamento eliminado');
      },
      error: (err) => this.toastService.error(err.message)
    });
  }
}
```

#### Interceptores HTTP

**Interceptor de autenticación**

```typescript
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req);
};
```

**Interceptor de manejo de errores (ya documentado arriba)**

```typescript
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const toastService = inject(ToastService);
      const message = mapStatusToMessage(error.status);
      toastService.error(message);
      return throwError(() => error);
    })
  );
};
```

**Configuración de HttpClient con interceptores**

```typescript
// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([authInterceptor, errorInterceptor])
    ),
    // ... resto de providers
  ]
};
```

#### Estados de carga y error

**Loading state durante peticiones**

```typescript
isLoading = signal(false);

loadMedicines() {
  this.isLoading.set(true);
  this.medicineService.getAll().subscribe({
    next: (medicines) => {
      this.medicines.set(medicines);
      this.isLoading.set(false);
    },
    error: () => this.isLoading.set(false)
  });
}
```

**Error state con mensajes**

```typescript
error = signal<string | null>(null);

loadMedicines() {
  this.medicineService.getAll().subscribe({
    error: (err) => {
      this.error.set(err.message || 'Error al cargar medicamentos');
    }
  });
}
```

**Empty state cuando no hay datos**

```html
<div *ngIf="!isLoading() && medicines().length === 0">
  <p>No hay medicamentos registrados</p>
  <a routerLink="/medicamentos/crear">Crear el primero</a>
</div>
```

**Success feedback después de operaciones**

```typescript
saveMedicine(dto: CreateMedicineDto) {
  this.medicineService.create(dto).subscribe({
    next: () => {
      this.toastService.success('Medicamento creado exitosamente');
      this.router.navigate(['/medicamentos']);
    }
  });
}
```

#### Formatos de datos

**JSON (principal)**

```typescript
// GET /api/medicines
{ 
  items: [...],
  total: 10,
  page: 1,
  pageSize: 10
}
```

**FormData para upload de archivos**

```typescript
uploadImage(file: File): Observable<{ url: string }> {
  const formData = new FormData();
  formData.append('file', file);

  return this.http.post<{ url: string }>('/api/upload', formData);
}
```

**Query params para filtros y paginación**

```typescript
searchMedicines(query: string, page: number = 1): Observable<PaginatedResponse<Medicine>> {
  const params = new HttpParams()
    .set('q', query)
    .set('page', page.toString());

  return this.http.get<PaginatedResponse<Medicine>>('/api/medicines', { params });
}
```

**Headers personalizados cuando necesario**

```typescript
downloadReport(): Observable<Blob> {
  return this.http.get('/api/report', {
    headers: new HttpHeaders({
      'Content-Type': 'application/pdf'
    }),
    responseType: 'blob'
  });
}
```
