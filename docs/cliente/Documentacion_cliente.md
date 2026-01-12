# Documentación Cliente
## Índice

1. [Fase 1 — Arquitectura de eventos](#fase-1--arquitectura-de-eventos)
    - [Flujo de eventos (diagrama textual)](#flujo-de-eventos-diagrama-textual)
    - [Patrones y buenas prácticas observadas](#patrones-y-buenas-prácticas-observadas)
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
