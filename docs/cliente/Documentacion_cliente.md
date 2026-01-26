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

6. [Fase 6 — Optimización y Rendimiento](#fase-6--optimización-y-rendimiento)
  - [Tarea 7: Documentación (Patrón de estado con Signals)](#tarea-7-documentación-patrón-de-estado-con-signals)
  - [Cross-browser y polyfills](#cross-browser-y-polyfills)
  - [Gestión de estado y Signals (resumen)](#gestión-de-estado-y-signals-resumen)
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
| `/` | Página de inicio | ✅  | - | - |
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

Todas las rutas exceptuando `/` utilizan lazy loading con `loadComponent()`.



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


#### Métricas de Build
- Bundle inicial: 306.83 kB (83.27 kB gzipped)
- Chunks lazy: 14
- Tiempo de build: 3.494 segundos
- Errores TypeScript: 0 

---

## Fase 4 — Sistema de Rutas y Navegación

### Tarea 7: Documentación

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

##### Estrategia de lazy loading

- Todas las rutas utilizan lazy loading para optimizar el bundle inicial.
- Cada página se carga bajo demanda cuando el usuario navega a ella.



- Se usa `PreloadAllModules` para precargar en segundo plano todos los módulos lazy una vez cargada la app:


- En el build de producción (`ng build --configuration production`) se verifican los **chunks** generados: cada página lazy produce su propio `.js` separado, reduciendo el tamaño de `main`.


##### Guards implementados

**authGuard** (`CanActivateFn`)
- Objetivo: proteger rutas privadas si el usuario no está autenticado.
- Comportamiento: si no hay sesión, redirige a `/iniciar-sesion` pasando `returnUrl` en `queryParams`.
- Rutas: `/medicamentos`, `/medicamentos/**`, `/perfil`.

**pendingChangesGuard** (`CanDeactivateFn`)
- Objetivo: evitar perder cambios en formularios reactivos.
- Comportamiento: si form.dirty muestra un confirm() antes de salir.
- Rutas: `/medicamentos/crear`, `/medicamentos/crear-foto`, `/medicamentos/:id/editar`, `/perfil`.


##### Resolvers implementados

**homeResolver**
- Carga los datos de inicio antes de activar `/`.

**medicinesResolver**
- Carga el listado de medicamentos antes de activar `/medicamentos`.

**medicineDetailResolver**
- Carga un medicamento concreto antes de activar `/medicamentos/:id/editar`.

**profileResolver**
- Carga los datos del perfil antes de activar `/perfil`.

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
---

## Fase 6 — Optimización y Rendimiento

### Tarea 7: Documentación (Patrón de estado con Signals)

Esta sección documenta el patrón de gestión de estado elegido para la aplicación, las decisiones de optimización aplicadas, y las alternativas evaluadas.

---

#### Patrón de estado elegido y justificación

**Patrón elegido:** Servicios de dominio (store por feature) que exponen estado mediante **signals, computed y métodos para mutarlo** (set, update).

##### Justificación:

1. **Integración nativa con el nuevo modelo de Angular** 
   - Las Signals son una primitiva de Angular 17+, diseñadas para detección de cambios más eficiente que BehaviorSubject puro.
   - Código más simple y declarativo comparado con Subjects.
   - Compatible con \`ChangeDetectionStrategy.OnPush\` de forma nativa sin necesidad de \`async\` pipe.

2. **Curva de aprendizaje adecuada para un proyecto docente**
   - Más simple que NgRx (sin actions, effects, selectors complejos).
   - Mantiene un flujo de datos unidireccional claro sin la complejidad de un store global.
   - Ideal para enseñanza: estudiantes pueden entender el estado sin sumergirse en patrones avanzados.

3. **Facilita el encapsulamiento de lógica de negocio**
   - Los servicios (stores) contienen:
     - Estado privado (signals mutables: \`_products\`, \`_loading\`, \`_error\`).
     - Acceso público solo-lectura (signals públicas: \`products\`, \`loading\`, \`error\` con \`.asReadonly()\`).
     - Métodos para mutar estado de forma controlada (\`load()\`, \`add()\`, \`update()\`, \`delete()\`).
   - Los componentes son presentacionales y no acceden directamente a estado privado.

#### Estrategias de optimización aplicadas

En la documentación se detallan las siguientes decisiones de rendimiento:

##### 1. ChangeDetectionStrategy.OnPush en componentes de listas y vistas de solo lectura

- Reduce ciclos innecesarios de detección de cambios.
- Aprovecha las actualizaciones inmutables de signals.
- Angular solo revisa el componente cuando sus inputs cambian o se ejecuta un evento.
- Aplicado en: \`MedicineCardComponent\`, \`MedicinesPage\`, \`CalendarPage\`, etc.

##### 2. Uso sistemático de trackBy en *ngFor en listados grandes

- Evita recrear nodos DOM al refrescar datos (CRUD, filtros, paginación).
- Sin \`trackBy\`: cambios menores pueden recrear 100+ nodos DOM.
- Con \`trackBy\`: solo se recrean los elementos que realmente cambiaron.

\`\`\`typescript
trackByMedicineId = (index: number, medicine: Medicine) => medicine.id;

// En template
<div *ngFor=\"let medicine of medicines(); trackBy: trackByMedicineId\">
  {{ medicine.name }}
</div>
\`\`\`

##### 3. Preferencia por async pipe y signals frente a subscribe manual

- Previene memory leaks: el framework gestiona automáticamente suscripciones.
- Simplifica la gestión del ciclo de vida de observables.
- No requiere \`takeUntil(destroy\$)\` manual.

##### 4. Servicios de loading y toasts centralizados

- Manejan estados de carga y error de forma coherente.
- Evita lógica repetida por componente.
- Interfaz consistente para feedback al usuario.


##### 5. Paginación o infinite scroll en vez de cargar grandes volúmenes de datos

- Carga bajo demanda en lugar de todo de golpe.
- Combinado con \`debounceTime\` (300ms) en búsquedas para reducir llamadas al servidor.
- Mejor UX: tiempos de carga más rápidos, menor consumo de ancho de banda.

---

#### Comparativa de opciones de gestión de estado evaluadas

En la sección de arquitectura se incluye una tabla que explica las alternativas de gestión de estado y por qué se eligió signals:

| Opción | Complejidad | Ventajas principales | Inconvenientes / Motivo de descarte |
|---|---|---|---|
| **Servicios + BehaviorSubject** | Baja | Patrón conocido, bueno para comunicación entre componentes | Más RxJS "plumbing", riesgo de leaks si mal usado, más verboso que signals |
| **Servicios + Signals (elegida)** | Media | Integración nativa Angular, sintaxis simple, OnPush compatible, cambios detectados automáticamente | Requiere Angular 17+, menos material legacy disponible |
| **NgRx (store global, actions, etc.)** | Alta | Escalable, tooling avanzado, time-travel debugging | Sobredimensionado para este proyecto, curva de aprendizaje empinada, mucho boilerplate |
| **MobX / Zustand** | Baja-Media | Reactividad simplificada | Dependencia externa, no es estándar Angular, riesgo de mantenimiento |
| **Componente state (sin store)** | Baja | Código simple para apps pequeñas | No escala, lift-state-up problem, difícil mantener sincronización |

**Conclusión:** El patrón de **Servicios + Signals** ofrece el mejor equilibrio entre **simplicidad, rendimiento y escalabilidad** para un proyecto educativo de mediano tamaño.

---

#### Recomendaciones para mantener y extender el patrón

1. **Mantener servicios por feature:** Cada feature (medicines, calendar, users) tiene su propio store.
2. **Evitar estado global innecesario:** Solo compartir estado si múltiples features lo necesitan.
3. **Usar computed para valores derivados:** No duplicar datos en múltiples signals.
4. **Testing:** Los servicios con signals son fáciles de testear.
5. **Documentación:** Cada store debe documentar su estado público y métodos disponibles.

---

## Gestión de estado y Signals 

En este proyecto se utiliza un **patrón de gestión de estado centralizado** basado en servicios (store) y Signals de Angular.

**¿Cómo funciona?**
- Cada feature (por ejemplo, medicamentos) tiene un store propio (`MedicineStoreSignals`).
- El store mantiene el estado con signals y expone métodos para mutarlo (`add`, `update`, `remove`).
- Los componentes inyectan el store y leen el estado reactivo directamente.
- El template se actualiza automáticamente cuando cambia el estado, sin recargar ni navegar.

**Ventajas:**
- Sincronización automática de la UI tras crear, editar o eliminar.
- Sin fugas de memoria (no hay subscribes manuales).
- Mejor rendimiento (detección granular de cambios).

**Diagrama simplificado:**
```
Componente
  │
  ▼
Store (Signals)
  │
  ▼
Servicio HTTP
```

**Alternativas consideradas:**
- BehaviorSubject (RxJS): flexible pero más verboso.
- NgRx: potente pero excesivo para este tamaño de app.

**Decisión:** Signals + Store propio por simplicidad, rendimiento y claridad.

Para más detalles, consulta la sección [Tarea 7: Documentación (Patrón de estado con Signals)](#tarea-7-documentación-patrón-de-estado-con-signals).


## Cross-browser y polyfills
Breve guía práctica para compatibilidad entre navegadores (Chrome, Firefox, Safari, Edge).

Resumen rápido
- Navegadores objetivo: Chrome, Firefox, Safari y Edge (últimas 2 versiones).
- Polyfills mínimos añadidos en `frontend/src/polyfills.ts`: `zone.js`, `Promise.allSettled`, `Element.prototype.closest`, `matchMedia`.

Snippets importantes

- Incluir `polyfills.ts` en el build (ya registrado en `angular.json`).

- Ejemplo de polyfill relevante (ya en `frontend/src/polyfills.ts`):

```ts
// Promise.allSettled polyfill (Safari antiguas)
if (!Promise.allSettled) {
  (Promise as any).allSettled = function (promises: any[]) {
    return Promise.all(
      promises.map(p =>
        Promise.resolve(p)
          .then((value) => ({ status: 'fulfilled', value }))
          .catch((reason) => ({ status: 'rejected', reason }))
      )
    );
  } as any;
}
```

Cómo probar rápidamente
- Instalar Playwright (devDependency añadido) y ejecutar tests E2E:

```bash
cd frontend
npm install
npx playwright install
npx playwright test
```

Recomendaciones prácticas
- Verificar en Safari Mobile/Desktop los puntos de CSS y APIs no soportadas (e.g. `backdrop-filter`).
- Usar `matchMedia` y `prefers-color-scheme` con fallbacks cuando sea necesario.
- Añadir polyfills solo cuando sea necesario: evitar cargarlos si objetivo son navegadores modernos.

Notas
- El polyfills creado es deliberadamente mínimo y conservador; amplíalo si necesitas soportar navegadores legacy (IE11 no está soportado por Angular v21).
- Para integración continua, añade un job que ejecute `npx playwright test --project=chromium,firefox,webkit`.

---

## Testing y cobertura (guía rápida)

Objetivos mínimos:
- Unit tests: al menos 3 componentes y 3 servicios con coverage >= 50%.
- Integración: tests de flujos completos con mocks HTTP.

Comandos útiles:

```bash
# Ejecutar tests unitarios (Karma/Jasmine)
cd frontend
npm run test

# Generar coverage
npm run test:coverage

# Ejecutar E2E con Playwright
npm install
npx playwright install
npx playwright test
```

Recomendaciones:
- Utilizar `HttpClientTestingModule` para mocks HTTP en unit tests de servicios.
- Usar spies para simular respuestas en servicios que delegan en `ApiService`.
- Configurar tests E2E en CI (Playwright) para Chrome/Firefox/WebKit.

---

## Checklist detallado de Testing (añadido)

- **Testing unitario (objetivo mínimo):**
  - **Componentes:** escribir al menos 3 tests de componentes principales (p. ej. `MedicinesPage`, `MedicineCardComponent`, `ProfilePage`).
  - **Servicios:** al menos 3 tests de servicios (p. ej. `MedicineService`, `AuthService`, `ApiService`) usando `HttpClientTestingModule`.
  - **Pipes personalizados:** testear pipes si existen (transformaciones puras y casos borde).
  - **Coverage:** objetivo mínimo global >= 50% (aumentar con tests de integración/componentes si hace falta).

- **Testing de integración (unit/integration):**
  - Tests que comprueben flujos completos a nivel de componentes y servicios: crear producto, login, flujo de checkout (simulado).
  - Mockear llamadas HTTP con `HttpTestingController` en tests de integración donde se quiera aislar la API.
  - Verificar formularios reactivos: validaciones, estados `pending`, `dirty` y envíos.

Ejemplo breve: mockear petición en un test de servicio

```ts
it('debería crear medicamento', inject([HttpTestingController, MedicineService], (httpMock: HttpTestingController, service: MedicineService) => {
  const dto = { name: 'Paracetamol' };
  service.create(dto).subscribe(res => expect(res.name).toBe('Paracetamol'));
  const req = httpMock.expectOne('/api/medicines');
  expect(req.request.method).toBe('POST');
  req.flush({ id: 1, ...dto });
  httpMock.verify();
}));
```

Ejemplo de test de formulario reactivo

```ts
it('form válido tras llenar campos', () => {
  component.form.controls['name'].setValue('Paracetamol');
  component.form.controls['price'].setValue(1.23);
  expect(component.form.valid).toBeTrue();
});
```

---

## Testing de integración E2E (Playwright)

- Definir flujos E2E representativos: registro/login, crear producto, añadir al carrito y checkout.
- Utilizar Playwright para cross-browser: `chromium`, `firefox`, `webkit`.
- En CI: ejecutar `npx playwright install --with-deps` y luego `npx playwright test --project=chromium,firefox,webkit`.

Recomendación: para pasos que requieren backend, usar un mock server o fixtures que devuelvan respuestas consistentes.

---

## Verificación cross-browser (pasos concretos)

1. Instalar dependencias y Playwright:

```powershell
cd frontend
npm install
npx playwright install
```

2. Ejecutar E2E en los tres motores:

```powershell
npx playwright test --project=chromium,firefox,webkit
```

3. Documentar cualquier incompatibilidad encontrada (API faltante, CSS no soportado, comportamientos distintos). Añadir polyfills en `frontend/src/polyfills.ts` cuando sea necesario.

4. Verificar que `angular.json` incluye los targets/browsers configurados en `browserslist` y que `tsconfig`/`target` y `lib` son compatibles con los navegadores objetivo.

---

## Optimización de rendimiento (acciones y herramientas)

- **Lighthouse:** ejecutar auditoría y apuntar a Performance > 80.

```powershell
# lanzar una instancia de la app (servidor estático o build dev)
npm run start
# desde otra terminal ejecutar lighthouse (instalar npm i -g lighthouse o usar npx)
npx lighthouse http://localhost:4200 --output html --output-path=./reports/lighthouse.html
```

- **Lazy loading:** comprobar que módulos grandes se cargan bajo demanda (usar Network tab y analizar chunks generados).
- **Tree shaking:** verificar que build de producción elimina código no usado.
- **Analizar bundles:** usar `source-map-explorer` para entender tamaño y buscar optimizaciones.

```powershell
npx source-map-explorer "dist/**/main.*.js" --html dist/report-bundle.html
```

Objetivo de bundle inicial: < 500KB (gzip/brotli preferible). Si está por encima, identificar dependencias grandes y considerar lazy-load o reemplazo por alternativas más ligeras.

---

## Build de producción (checklist)

1. Ejecutar:

```powershell
cd frontend
npm run build -- --configuration production
```

2. Verificar que no hay errores ni warnings críticos en la consola.
3. Analizar bundles con `source-map-explorer` (ver arriba).
4. Configurar `--base-href` si la app se sirve desde subruta:

```powershell
ng build --configuration production --base-href "/mi-subruta/"
```

5. Asegurar que el servidor devuelve `index.html` para rutas de la SPA (fallback) y configurar redirects si es necesario.

---

## Despliegue (chequeo final)

- Desplegar en la misma URL que DIW: ajustar `base-href` y/o configuración del servidor.
- Verificar todas las rutas con navegación manual y pruebas E2E.
- Comprobar llamadas HTTP en producción (CORS, endpoints correctos en `environment.prod.ts`).
- Configurar redirecciones en el servidor (Nginx ejemplo):

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

- Probar el deploy final y documentar pasos (script de deploy o CI job) en el README.

---

## Documentación técnica final y resumen de decisiones (Fase 7, simplificado)

- **README:** incluir setup (instalar deps, comandos dev/build/test), arquitectura resumida, y cómo ejecutar E2E y Lighthouse.
- **Contribución:** `CONTRIBUTING.md` con reglas de commits, PRs y formato de tests.
- **Changelog:** `CHANGELOG.md` con releases semánticos o usar `keep a changelog`.
- **Decisiones técnicas (resumen):**
  - Gestión de estado: **Services + Signals** (simplicidad y rendimiento).
  - Detección de cambios: `OnPush` en componentes de alto costo.
  - Test E2E: **Playwright** por cross-browser (Chromium/Firefox/WebKit).
  - Polyfills: añadir sólo cuando se detecten incompatibilidades (polyfills mínimos ya en `frontend/src/polyfills.ts`).
  - Dependencias pesadas: evitar incluir libs grandes en bundle inicial; usar lazy-load.

---

He añadido estas secciones aquí para que queden integradas en la documentación cliente. Si quieres, puedo:
- generar ejemplos concretos de tests para 3 componentes y 3 servicios y añadirlos al repo,
- añadir un job de CI (GitHub Actions) que haga `npm ci`, `npm run test:coverage`, `npx playwright install` y `npx playwright test`.

