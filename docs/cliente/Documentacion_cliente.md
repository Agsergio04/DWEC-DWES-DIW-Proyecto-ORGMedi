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
4. [Fase 4 — Rutas, navegación y carga de datos](#fase-4--rutas-navegación-y-carga-de-datos)
    - [Mapa Completo de Rutas](#mapa-completo-de-rutas)
    - [Lazy Loading — Estrategia de Carga Dinámica](#lazy-loading--estrategia-de-carga-dinámica)
    - [Route Guards — Protección de Rutas](#route-guards--protección-de-rutas)
    - [Resolvers — Precarga de Datos](#resolvers--precarga-de-datos)
    - [Breadcrumbs — Navegación Dinámica](#breadcrumbs--navegación-dinámica)
    - [Flujos de Navegación Principales](#flujos-de-navegación-principales)
    - [Resumen de Implementación](#resumen-de-implementación)
5. [Tarea 1 — Configuración de HttpClient](#tarea-1--configuración-de-httpclient)
    - [Importar y Configurar HttpClient](#importar-y-configurar-httpclient)
    - [Servicio Base para HTTP](#servicio-base-para-http)
    - [Interceptores para Headers Comunes](#interceptores-para-headers-comunes)
    - [Integración de Múltiples Interceptores](#integración-de-múltiples-interceptores)
6. [Tarea 2 — Operaciones CRUD Completas](#tarea-2--operaciones-crud-completas)
    - [GET: Listados e Individuales](#get-listados-e-individuales)
    - [POST: Crear Recursos](#post-crear-recursos)
    - [PUT/PATCH: Actualizar Recursos](#putpatch-actualizar-recursos)
    - [DELETE: Eliminar Recursos](#delete-eliminar-recursos)
    - [Buenas Prácticas CRUD](#buenas-prácticas-crud)
    - [Ejemplo Completo: MedicineService](#ejemplo-completo-medicineservice)
7. [Tarea 3 — Manejo de Respuestas HTTP](#tarea-3--manejo-de-respuestas-http)
    - [Tipado con Interfaces](#tipado-con-interfaces)
    - [Transformación de Datos con map](#transformación-de-datos-con-map)
    - [Manejo de Errores con catchError](#manejo-de-errores-con-catcherror)
    - [Retry Logic para Peticiones Fallidas](#retry-logic-para-peticiones-fallidas)
    - [Implementación Completa en MedicineService](#implementación-completa-en-medicineservice)
8. [Tarea 4 — Diferentes Formatos de Petición y Respuesta](#tarea-4--diferentes-formatos-de-petición-y-respuesta)
    - [JSON como Formato Principal](#json-como-formato-principal)
    - [FormData para Subida de Archivos](#formdata-para-subida-de-archivos)
    - [Query Params para Filtros y Paginación](#query-params-para-filtros-y-paginación)
    - [Headers Personalizados](#headers-personalizados)
    - [Tabla Resumen: Formatos por Endpoint](#tabla-resumen-formatos-por-endpoint)
9. [Tarea 6 — Interceptores HTTP](#tarea-6--interceptores-http)
    - [Interceptor de Autenticación](#interceptor-de-autenticación)
    - [Interceptor de Manejo Global de Errores](#interceptor-de-manejo-global-de-errores)
    - [Interceptor de Logging](#interceptor-de-logging)
    - [Integración en app.config.ts](#integración-en-appconfigts)
    - [Ejemplo Completo: Todos los Interceptores en ORGMedi](#ejemplo-completo-todos-los-interceptores-en-orgmedi)
10. [Tarea 7 — Documentación de API](#tarea-7--documentación-de-api)
    - [Catálogo de Endpoints Consumidos](#catálogo-de-endpoints-consumidos)
    - [Estructura de Datos: Interfaces TypeScript](#estructura-de-datos-interfaces-typescript)
    - [Estrategia de Manejo de Errores](#estrategia-de-manejo-de-errores-completa)
11. [Tarea 5 — Estados de Carga y Error](#tarea-5--estados-de-carga-y-error)
    - [Patrón de Estado Unificado](#patrón-de-estado-unificado)
    - [Loading State](#loading-state)
    - [Error State con Reintentos](#error-state-con-reintentos)
    - [Empty State](#empty-state)
    - [Success Feedback](#success-feedback)
    - [Ejemplo Completo: MedicinesPage](#ejemplo-completo-medicinespage)

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

## Tarea 1 — Configuración de HttpClient

### Introducción

La configuración recomendada en Angular actual es usar **`provideHttpClient`** con interceptores funcionales, más un servicio base que envuelva las operaciones HTTP comunes. Esta aproximación proporciona:

- ✅ Configuración a nivel de aplicación (sin módulos)
- ✅ Interceptores funcionales (sin clases)
- ✅ Centralización de URL base y manejo de errores
- ✅ Type-safe con genéricos

---

### Importar y Configurar HttpClient

En lugar de `HttpClientModule`, define `provideHttpClient` en tu `app.config.ts`:

```typescript
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor]) // aquí se registran los interceptores
    )
  ]
};
```

**Ventajas de esta configuración**:
- No requiere importar módulos en `app.ts`
- Los interceptores se registran de forma declarativa
- Compatible con lazy loading
- Facilita testing sin necesidad de `HttpClientTestingModule`

---

### Servicio Base para HTTP

Crea un servicio que centralice la URL base y maneje errores de forma genérica:

```typescript
// core/services/api.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/api'; // URL del backend

  /**
   * Realiza una petición GET
   * @param endpoint Ruta del endpoint (ej: 'products' o 'products/1')
   * @param options Opciones adicionales de HttpClient
   * @returns Observable<T> con los datos
   */
  get<T>(endpoint: string, options?: object): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${endpoint}`, options)
      .pipe(catchError(this.handleError));
  }

  /**
   * Realiza una petición POST
   * @param endpoint Ruta del endpoint
   * @param body Datos a enviar
   * @param options Opciones adicionales
   * @returns Observable<T> con la respuesta
   */
  post<T>(endpoint: string, body: unknown, options?: object): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${endpoint}`, body, options)
      .pipe(catchError(this.handleError));
  }

  /**
   * Realiza una petición PUT
   * @param endpoint Ruta del endpoint
   * @param body Datos a actualizar
   * @param options Opciones adicionales
   * @returns Observable<T> con la respuesta
   */
  put<T>(endpoint: string, body: unknown, options?: object): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/${endpoint}`, body, options)
      .pipe(catchError(this.handleError));
  }

  /**
   * Realiza una petición DELETE
   * @param endpoint Ruta del endpoint
   * @param options Opciones adicionales
   * @returns Observable<T> con la respuesta
   */
  delete<T>(endpoint: string, options?: object): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}/${endpoint}`, options)
      .pipe(catchError(this.handleError));
  }

  /**
   * PATCH para actualizaciones parciales
   * @param endpoint Ruta del endpoint
   * @param body Datos a actualizar parcialmente
   * @param options Opciones adicionales
   * @returns Observable<T> con la respuesta
   */
  patch<T>(endpoint: string, body: unknown, options?: object): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}/${endpoint}`, body, options)
      .pipe(catchError(this.handleError));
  }

  /**
   * Maneja errores HTTP de forma centralizada
   * @param error HttpErrorResponse del servidor
   * @returns Observable que emite el error
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Error desconocido';

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del servidor
      errorMessage = `Código ${error.status}: ${error.message}`;
      console.error(`Backend retornó código ${error.status}, body:`, error.error);
    }

    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
```

#### Características de ApiService

| Método | Uso |
|--------|-----|
| `get<T>(endpoint)` | Obtener datos (GET) |
| `post<T>(endpoint, body)` | Crear recurso (POST) |
| `put<T>(endpoint, body)` | Reemplazar recurso (PUT) |
| `patch<T>(endpoint, body)` | Actualizar parcialmente (PATCH) |
| `delete<T>(endpoint)` | Eliminar recurso (DELETE) |
| `handleError()` | Centralizar manejo de errores |

---

### Servicios de Dominio que Delegan en ApiService

Los servicios específicos del dominio (products, medicines, etc.) **no hacen llamadas HTTP directas**, sino que delegan en `ApiService`:

```typescript
// features/medicines/services/medicine.service.ts
import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';

export interface Medicine {
  id: number;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  description?: string;
}

@Injectable({ providedIn: 'root' })
export class MedicineService {
  private api = inject(ApiService);

  /**
   * Obtiene la lista completa de medicamentos
   * @returns Observable<Medicine[]>
   */
  getMedicines() {
    return this.api.get<Medicine[]>('medicines');
  }

  /**
   * Obtiene un medicamento por ID
   * @param id ID del medicamento
   * @returns Observable<Medicine>
   */
  getMedicine(id: string | number) {
    return this.api.get<Medicine>(`medicines/${id}`);
  }

  /**
   * Crea un nuevo medicamento
   * @param medicine Datos del medicamento
   * @returns Observable<Medicine>
   */
  createMedicine(medicine: Omit<Medicine, 'id'>) {
    return this.api.post<Medicine>('medicines', medicine);
  }

  /**
   * Actualiza un medicamento existente
   * @param id ID del medicamento
   * @param medicine Datos actualizados
   * @returns Observable<Medicine>
   */
  updateMedicine(id: string | number, medicine: Partial<Medicine>) {
    return this.api.put<Medicine>(`medicines/${id}`, medicine);
  }

  /**
   * Elimina un medicamento
   * @param id ID del medicamento
   * @returns Observable<void>
   */
  deleteMedicine(id: string | number) {
    return this.api.delete<void>(`medicines/${id}`);
  }
}
```

#### Ventajas de esta arquitectura

- ✅ **Single Responsibility**: MedicineService solo sabe de lógica de negocio
- ✅ **Reutilizable**: ApiService se usa en todos los servicios de dominio
- ✅ **Testeable**: Fácil de mockear ApiService en tests
- ✅ **Consistencia**: Todas las peticiones pasan por el mismo handleError

---

### Interceptores para Headers Comunes

Define un interceptor funcional para añadir headers como `Authorization`, `Content-Type` o cualquier cabecera de tracking:

#### 1. Interceptor de Autenticación

```typescript
// core/interceptors/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken(); // o localStorage.getItem('token')

  // Headers por defecto
  let headers = req.headers
    .set('Content-Type', 'application/json')
    .set('X-App-Client', 'Angular-ORGMedi');

  // Agregar token si existe
  if (token) {
    headers = headers.set('Authorization', `Bearer ${token}`);
  }

  // Clonar la petición con los nuevos headers
  const cloned = req.clone({ headers });
  return next(cloned);
};
```

**Headers añadidos**:
- `Content-Type: application/json` - Indica formato JSON
- `X-App-Client: Angular-ORGMedi` - Identifica el cliente
- `Authorization: Bearer <token>` - Token JWT si existe

#### 2. Interceptor de Logging

```typescript
// core/interceptors/logging.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { tap } from 'rxjs';

export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  const start = performance.now();
  
  console.log(`[HTTP] ${req.method} ${req.url}`);

  return next(req).pipe(
    tap({
      next: (event: any) => {
        if (event.body) {
          const duration = performance.now() - start;
          console.log(`[HTTP] ✅ ${req.method} ${req.url} (${duration.toFixed(2)}ms)`);
        }
      },
      error: (error) => {
        const duration = performance.now() - start;
        console.error(`[HTTP] ❌ ${req.method} ${req.url} (${duration.toFixed(2)}ms)`, error);
      }
    })
  );
};
```

**Funcionalidad**:
- ✅ Registra todas las peticiones HTTP
- ✅ Mide tiempo de ejecución
- ✅ Diferencia entre éxito y error
- ✅ Útil para debugging

#### 3. Interceptor de Manejo de Errores

```typescript
// core/interceptors/error.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Error en la petición HTTP';

      switch (error.status) {
        case 400:
          errorMessage = 'Solicitud inválida';
          break;
        case 401:
          errorMessage = 'No autorizado. Por favor, inicia sesión';
          authService.logout();
          router.navigate(['/iniciar-sesion']);
          break;
        case 403:
          errorMessage = 'No tienes permiso para acceder a este recurso';
          break;
        case 404:
          errorMessage = 'Recurso no encontrado';
          break;
        case 500:
          errorMessage = 'Error del servidor';
          break;
        default:
          errorMessage = `Error ${error.status}: ${error.message}`;
      }

      toastService.error(errorMessage);
      return throwError(() => error);
    })
  );
};
```

**Funcionalidad**:
- ✅ Maneja diferentes códigos HTTP
- ✅ Muestra mensajes legibles al usuario
- ✅ Redirige a login si 401
- ✅ Centraliza manejo de errores

---

### Integración de Múltiples Interceptores

En `app.config.ts`, registra los interceptores en el orden correcto:

```typescript
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { loggingInterceptor } from './core/interceptors/logging.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([
        authInterceptor,     // 1. Primero: Agregar headers
        loggingInterceptor,  // 2. Segundo: Registrar petición
        errorInterceptor     // 3. Tercero: Manejar errores
      ])
    )
  ]
};
```

#### Orden de Ejecución

```
┌─────────────────────────────────────────┐
│ Petición HTTP Original                  │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│ authInterceptor                         │
│ → Añade Authorization header            │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│ loggingInterceptor                      │
│ → Registra: [HTTP] GET /api/medicines   │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│ errorInterceptor                        │
│ → Prepara manejo de errores             │
└──────────────┬──────────────────────────┘
               ↓
     ┌─────────────────────┐
     │  Servidor Backend    │
     │  Respuesta HTTP      │
     └─────────────────────┘
               ↓
┌──────────────────────────────────────────┐
│ errorInterceptor (retorno)               │
│ → Si error, muestra toast y redirige     │
└──────────────┬─────────────────────────┘
               ↓
┌──────────────────────────────────────────┐
│ loggingInterceptor (retorno)             │
│ → Registra tiempo: ✅ GET ... (145ms)    │
└──────────────┬─────────────────────────┘
               ↓
     ┌──────────────────────┐
     │ Componente recibe     │
     │ datos u error        │
     └──────────────────────┘
```

---

### Uso en Componentes

Inyecta el servicio de dominio y llama a sus métodos. Los interceptores funcionan automáticamente:

```typescript
// pages/medicines/medicines.ts
import { Component, OnInit, inject } from '@angular/core';
import { MedicineService, Medicine } from '../services/medicine.service';

@Component({
  selector: 'app-medicines',
  templateUrl: './medicines.html',
  styleUrls: ['./medicines.scss']
})
export class MedicinesPage implements OnInit {
  medicineService = inject(MedicineService);
  medicines: Medicine[] = [];
  loading = false;
  error: string | null = null;

  ngOnInit() {
    this.loadMedicines();
  }

  loadMedicines() {
    this.loading = true;
    this.error = null;

    this.medicineService.getMedicines().subscribe({
      next: (data) => {
        this.medicines = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar medicamentos';
        this.loading = false;
        console.error(err);
      }
    });
  }

  deleteMedicine(id: number) {
    if (confirm('¿Eliminar medicamento?')) {
      this.medicineService.deleteMedicine(id).subscribe({
        next: () => {
          this.medicines = this.medicines.filter(m => m.id !== id);
        },
        error: (err) => {
          console.error('Error al eliminar', err);
        }
      });
    }
  }
}
```

**Flujo automático**:
1. Componente llama a `medicineService.getMedicines()`
2. MedicineService llama a `apiService.get('medicines')`
3. authInterceptor añade el token
4. loggingInterceptor registra la petición
5. errorInterceptor prepara manejo de errores
6. Petición se envía al servidor
7. En respuesta, los interceptores retroceden
8. Componente recibe los datos o error

---

### Resumen de Configuración

| Componente | Responsabilidad |
|-----------|-----------------|
| **app.config.ts** | Registra provideHttpClient e interceptores |
| **ApiService** | Centraliza URL base y handleError |
| **authInterceptor** | Añade Authorization header |
| **loggingInterceptor** | Registra peticiones y tiempos |
| **errorInterceptor** | Maneja errores HTTP y notifica al usuario |
| **MedicineService** | Delegaciones a ApiService |
| **Componente** | Llama a servicios de dominio |

Esta arquitectura permite:
- ✅ Código limpio y organizado
- ✅ Reutilización de ApiService en todos los servicios
- ✅ Manejo centralizado de errores y headers
- ✅ Fácil de testear y mantener
- ✅ Compatible con cambios en backend sin tocar componentes

---

## Tarea 2 — Operaciones CRUD Completas

### Introducción

Las operaciones CRUD (Create, Read, Update, Delete) en Angular se implementan con `HttpClient` en servicios de dominio, tipando bien las respuestas y usando observables para gestionar el flujo asíncrono.

Esta tarea cubre:
- ✅ GET: obtener listados y recursos individuales
- ✅ POST: crear nuevos recursos
- ✅ PUT/PATCH: actualizar recursos completa o parcialmente
- ✅ DELETE: eliminar recursos
- ✅ Buenas prácticas de tipado y manejo de errores

---

### GET: Listados e Individuales

#### Obtener Listado Completo

```typescript
// features/medicines/services/medicine.service.ts
import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { Observable } from 'rxjs';

export interface Medicine {
  id: number;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  description?: string;
}

@Injectable({ providedIn: 'root' })
export class MedicineService {
  private api = inject(ApiService);

  /**
   * Obtiene la lista completa de medicamentos
   * @returns Observable<Medicine[]> - Array de medicamentos
   */
  getAll(): Observable<Medicine[]> {
    return this.api.get<Medicine[]>('medicines');
  }
}
```

#### Obtener Recurso Individual

```typescript
/**
 * Obtiene un medicamento específico por ID
 * @param id ID del medicamento
 * @returns Observable<Medicine> - Medicamento encontrado
 */
getById(id: string | number): Observable<Medicine> {
  return this.api.get<Medicine>(`medicines/${id}`);
}

/**
 * Obtiene medicamentos filtrados por estado (activos, vencidos, etc)
 * @param status Estado del medicamento
 * @returns Observable<Medicine[]> - Medicamentos filtrados
 */
getByStatus(status: 'active' | 'expired' | 'all'): Observable<Medicine[]> {
  return this.api.get<Medicine[]>(`medicines?status=${status}`);
}
```

#### Uso en Componentes

```typescript
// pages/medicines/medicines.ts
import { Component, OnInit, inject } from '@angular/core';
import { MedicineService, Medicine } from '../services/medicine.service';

@Component({
  selector: 'app-medicines',
  templateUrl: './medicines.html'
})
export class MedicinesPage implements OnInit {
  medicineService = inject(MedicineService);

  // Opción 1: Usando OnInit + subscribe
  medicines: Medicine[] = [];
  loading = false;

  ngOnInit() {
    this.loadMedicines();
  }

  loadMedicines() {
    this.loading = true;
    this.medicineService.getAll().subscribe({
      next: (data) => {
        this.medicines = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar medicamentos', err);
        this.loading = false;
      }
    });
  }

  // Opción 2: Usando async pipe con observable (recomendado)
  medicines$ = this.medicineService.getAll();
}
```

**Template con async pipe:**

```html
<div *ngIf="medicines$ | async as medicines; else loading">
  <div *ngFor="let medicine of medicines" class="medicine-card">
    <h3>{{ medicine.name }}</h3>
    <p>{{ medicine.dosage }} - {{ medicine.frequency }}</p>
  </div>
</div>

<ng-template #loading>
  <p>Cargando medicamentos...</p>
</ng-template>
```

#### Ventajas del async pipe

- ✅ Automáticamente se suscribe y desuscribe (evita memory leaks)
- ✅ OnPush change detection compatible
- ✅ Código más limpio y reactivo
- ✅ No necesita `ngOnDestroy` manual

---

### POST: Crear Recursos

#### DTOs para Creación

```typescript
// features/medicines/models/medicine.dto.ts

/**
 * DTO para crear un medicamento
 * No incluye id (generado por servidor) ni timestamps
 */
export interface CreateMedicineDto {
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  description?: string;
}

/**
 * DTO para actualizar un medicamento
 * Todos los campos son opcionales (PATCH)
 */
export interface UpdateMedicineDto {
  name?: string;
  dosage?: string;
  frequency?: string;
  startDate?: string;
  description?: string;
}
```

#### Método Create en el Servicio

```typescript
/**
 * Crea un nuevo medicamento
 * @param medicine Datos del medicamento a crear
 * @returns Observable<Medicine> - Medicamento creado con ID asignado
 */
create(medicine: CreateMedicineDto): Observable<Medicine> {
  return this.api.post<Medicine>('medicines', medicine);
}
```

#### Formulario de Creación

```typescript
// pages/create-medicine/create-medicine.ts
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MedicineService, CreateMedicineDto } from '../services/medicine.service';
import { ToastService } from '../../../shared/services/toast.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-medicine',
  templateUrl: './create-medicine.html',
  styleUrls: ['./create-medicine.scss']
})
export class CreateMedicinePage {
  medicineService = inject(MedicineService);
  toastService = inject(ToastService);
  router = inject(Router);
  fb = inject(FormBuilder);

  form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    dosage: ['', Validators.required],
    frequency: ['', Validators.required],
    startDate: ['', Validators.required],
    description: ['']
  });

  saving = false;

  onSubmit() {
    if (this.form.invalid) {
      this.toastService.warning('Por favor completa todos los campos');
      return;
    }

    this.saving = true;
    const formData: CreateMedicineDto = this.form.value;

    this.medicineService.create(formData).subscribe({
      next: (medicine) => {
        this.toastService.success(`Medicamento "${medicine.name}" creado exitosamente`);
        this.router.navigate(['/medicamentos', medicine.id]);
        this.saving = false;
      },
      error: (err) => {
        this.toastService.error('Error al crear medicamento');
        console.error(err);
        this.saving = false;
      }
    });
  }
}
```

---

### PUT/PATCH: Actualizar Recursos

#### Diferencia entre PUT y PATCH

| Método | Uso | Datos |
|--------|-----|-------|
| **PUT** | Reemplaza todo el recurso | Todos los campos requeridos |
| **PATCH** | Actualiza solo campos específicos | Solo los campos a cambiar |

#### Métodos en el Servicio

```typescript
/**
 * Actualiza un medicamento completamente (PUT)
 * Requiere todos los campos
 * @param id ID del medicamento
 * @param medicine Datos completos actualizados
 * @returns Observable<Medicine>
 */
update(id: string | number, medicine: Omit<Medicine, 'id'>): Observable<Medicine> {
  return this.api.put<Medicine>(`medicines/${id}`, medicine);
}

/**
 * Actualiza parcialmente un medicamento (PATCH)
 * Solo los campos incluidos se actualizan
 * @param id ID del medicamento
 * @param partial Campos a actualizar
 * @returns Observable<Medicine>
 */
patch(id: string | number, partial: Partial<UpdateMedicineDto>): Observable<Medicine> {
  return this.api.patch<Medicine>(`medicines/${id}`, partial);
}
```

#### Componente de Edición

```typescript
// pages/edit-medicine/edit-medicine.ts
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MedicineService, Medicine } from '../services/medicine.service';

@Component({
  selector: 'app-edit-medicine',
  templateUrl: './edit-medicine.html',
  styleUrls: ['./edit-medicine.scss']
})
export class EditMedicinePage implements OnInit {
  medicineService = inject(MedicineService);
  route = inject(ActivatedRoute);
  router = inject(Router);
  fb = inject(FormBuilder);

  form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    dosage: ['', Validators.required],
    frequency: ['', Validators.required],
    startDate: ['', Validators.required],
    description: ['']
  });

  medicineId: string | null = null;
  saving = false;
  originalForm: Medicine | null = null;

  ngOnInit() {
    this.medicineId = this.route.snapshot.paramMap.get('id');
    if (this.medicineId) {
      this.loadMedicine(this.medicineId);
    }
  }

  loadMedicine(id: string) {
    this.medicineService.getById(id).subscribe({
      next: (medicine) => {
        this.originalForm = medicine;
        this.form.patchValue(medicine);
      },
      error: (err) => {
        console.error('Error al cargar medicamento', err);
      }
    });
  }

  onSubmit() {
    if (this.form.invalid || !this.medicineId) return;

    this.saving = true;
    
    this.medicineService.update(this.medicineId, this.form.value).subscribe({
      next: (medicine) => {
        console.log('Medicamento actualizado', medicine);
        this.router.navigate(['/medicamentos']);
        this.saving = false;
      },
      error: (err) => {
        console.error('Error al actualizar', err);
        this.saving = false;
      }
    });
  }

  isDirty(): boolean {
    return this.form.dirty;
  }

  reset() {
    if (this.originalForm) {
      this.form.reset(this.originalForm);
    }
  }
}
```

---

### DELETE: Eliminar Recursos

#### Método en el Servicio

```typescript
/**
 * Elimina un medicamento por ID
 * @param id ID del medicamento a eliminar
 * @returns Observable<void>
 */
delete(id: string | number): Observable<void> {
  return this.api.delete<void>(`medicines/${id}`);
}
```

#### Uso en Componente con Confirmación

```typescript
// En medicines.ts
onDelete(medicine: Medicine) {
  if (!confirm(`¿Está seguro de que desea eliminar "${medicine.name}"?`)) {
    return;
  }

  this.medicineService.delete(medicine.id).subscribe({
    next: () => {
      this.toastService.success(`"${medicine.name}" ha sido eliminado`);
      this.loadMedicines();
    },
    error: (err) => {
      this.toastService.error('No se pudo eliminar el medicamento');
      console.error(err);
    }
  });
}
```

---

### Buenas Prácticas CRUD

#### 1. Centralizar URL Base y Manejo de Errores

```typescript
// ✅ CORRECTO: Usar ApiService como base
@Injectable({ providedIn: 'root' })
export class MedicineService {
  private api = inject(ApiService);

  getAll() {
    return this.api.get<Medicine[]>('medicines');
  }
}

// ❌ INCORRECTO: HttpClient directo en el servicio
@Injectable({ providedIn: 'root' })
export class MedicineService {
  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<Medicine[]>('http://localhost:8080/api/medicines');
  }
}
```

#### 2. Tipado Completo

```typescript
// ✅ CORRECTO: Tipos específicos para cada operación
create(medicine: CreateMedicineDto): Observable<Medicine> { }
update(id: number, medicine: UpdateMedicineDto): Observable<Medicine> { }
getAll(): Observable<Medicine[]> { }

// ❌ INCORRECTO: Tipado genérico
create(medicine: any): Observable<any> { }
update(id: any, medicine: any): Observable<any> { }
```

#### 3. DTOs Separados

```typescript
// ✅ CORRECTO: DTOs específicos para cada operación
interface CreateMedicineDto {
  name: string;
  dosage: string;
}

interface UpdateMedicineDto {
  name?: string;
  dosage?: string;
}
```

#### 4. Async Pipe vs Subscribe

```typescript
// ✅ RECOMENDADO: Async pipe (automático unsubscribe)
medicines$ = this.medicineService.getAll();

// Template
<div *ngIf="medicines$ | async as medicines">
  <div *ngFor="let m of medicines">{{ m.name }}</div>
</div>

// ⚠️ MANUAL: Subscribe (requiere ngOnDestroy)
medicines: Medicine[] = [];

ngOnInit() {
  this.subscription = this.medicineService.getAll()
    .subscribe(data => this.medicines = data);
}

ngOnDestroy() {
  this.subscription.unsubscribe();
}
```

---

### Ejemplo Completo: MedicineService

```typescript
// features/medicines/services/medicine.service.ts
import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { Observable } from 'rxjs';

export interface Medicine {
  id: number;
  name: string;
  dosage: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  startDate: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateMedicineDto {
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  description?: string;
}

export interface UpdateMedicineDto {
  name?: string;
  dosage?: string;
  frequency?: string;
  startDate?: string;
  description?: string;
}

@Injectable({ providedIn: 'root' })
export class MedicineService {
  private api = inject(ApiService);
  private readonly endpoint = 'medicines';

  // === READ Operations ===

  getAll(): Observable<Medicine[]> {
    return this.api.get<Medicine[]>(this.endpoint);
  }

  getById(id: string | number): Observable<Medicine> {
    return this.api.get<Medicine>(`${this.endpoint}/${id}`);
  }

  getActive(): Observable<Medicine[]> {
    return this.api.get<Medicine[]>(`${this.endpoint}?status=active`);
  }

  // === CREATE Operation ===

  create(medicine: CreateMedicineDto): Observable<Medicine> {
    return this.api.post<Medicine>(this.endpoint, medicine);
  }

  // === UPDATE Operations ===

  update(id: string | number, medicine: Omit<Medicine, 'id'>): Observable<Medicine> {
    return this.api.put<Medicine>(`${this.endpoint}/${id}`, medicine);
  }

  patch(id: string | number, partial: Partial<UpdateMedicineDto>): Observable<Medicine> {
    return this.api.patch<Medicine>(`${this.endpoint}/${id}`, partial);
  }

  // === DELETE Operation ===

  delete(id: string | number): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }
}
```

---

### Resumen de Endpoints por Operación

| Operación | Método | Endpoint | Servicio |
|-----------|--------|----------|----------|
| Listar medicamentos | GET | `/medicines` | `getAll()` |
| Obtener medicamento | GET | `/medicines/:id` | `getById(id)` |
| Crear medicamento | POST | `/medicines` | `create(dto)` |
| Actualizar medicamento | PUT | `/medicines/:id` | `update(id, dto)` |
| Actualizar parcial | PATCH | `/medicines/:id` | `patch(id, dto)` |
| Eliminar medicamento | DELETE | `/medicines/:id` | `delete(id)` |

---

## Tarea 3 — Manejo de Respuestas HTTP

### Introducción

El manejo de respuestas HTTP en Angular se basa en tipar bien los datos y usar operadores RxJS (`map`, `catchError`, `retry`) sobre los observables que devuelve `HttpClient`. Una arquitectura robusta requiere:

- ✅ Tipado fuerte con interfaces TypeScript
- ✅ Transformación de datos con operadores RxJS
- ✅ Manejo centralizado de errores
- ✅ Reintentos para fallos temporales
- ✅ Mensajes de error descriptivos

---

### Tipado con Interfaces

Define interfaces para las respuestas de tu API y úsalas como genérico en HttpClient:

#### Interfaces de Modelos

```typescript
// models/medicine.models.ts

/**
 * Modelo de medicamento en la base de datos
 */
export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  description?: string;
  quantity?: number;
  remainingDays?: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * DTO para crear un medicamento
 */
export interface CreateMedicineDto {
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  description?: string;
  quantity?: number;
}

/**
 * DTO para actualizar un medicamento
 */
export interface UpdateMedicineDto {
  name?: string;
  dosage?: string;
  frequency?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  quantity?: number;
}

/**
 * Respuesta genérica para listados
 */
export interface ApiListResponse<T> {
  items: T[];
  total: number;
  page?: number;
  pageSize?: number;
}

/**
 * Respuesta genérica para operaciones individuales
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  timestamp?: string;
}

/**
 * Respuesta de error de la API
 */
export interface ApiErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  timestamp?: string;
}
```

#### Uso en el Servicio

```typescript
// medicine.service.ts

/**
 * Obtiene todos los medicamentos tipados
 * @returns Observable<Medicine[]>
 */
getAll(): Observable<Medicine[]> {
  return this.http.get<ApiListResponse<Medicine>>(`${this.apiUrl}`)
    .pipe(
      map(response => response.items), // Extraer solo el array de items
      catchError(this.handleError)
    );
}

/**
 * Obtiene un medicamento individual
 * @param id ID del medicamento
 * @returns Observable<Medicine>
 */
getById(id: string): Observable<Medicine> {
  return this.http.get<Medicine>(`${this.apiUrl}/${id}`)
    .pipe(
      catchError(this.handleError)
    );
}
```

**Ventajas del tipado:**
- ✅ Autocompletado en el IDE
- ✅ Chequeo de tipos en tiempo de compilación
- ✅ Documentación clara de qué espera y retorna cada método
- ✅ Errores detectados temprano en desarrollo

---

### Transformación de Datos con map

Usa `map` para adaptar la respuesta del backend al modelo de tu UI (añadir campos calculados, convertir fechas, etc.):

#### Ejemplo: Calcular campos derivados

```typescript
/**
 * Obtiene medicamentos con campos calculados para la UI
 * Agrega priceWithTax, convierte fechas a objetos Date
 */
getMedicinesViewModel(): Observable<MedicineViewModel[]> {
  return this.http.get<ApiListResponse<Medicine>>(`${this.apiUrl}`)
    .pipe(
      map(response => response.items),
      map(medicines => medicines.map(medicine => ({
        ...medicine,
        startDate: new Date(medicine.startDate), // Convertir a objeto Date
        endDate: medicine.endDate ? new Date(medicine.endDate) : null,
        daysLeft: this.calculateDaysLeft(medicine),
        isExpired: this.isExpired(medicine),
        displayFrequency: this.translateFrequency(medicine.frequency)
      })))
    );
}

/**
 * Calcula los días restantes
 */
private calculateDaysLeft(medicine: Medicine): number {
  if (!medicine.endDate) return -1;
  const end = new Date(medicine.endDate);
  const now = new Date();
  const diffTime = end.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Traduce la frecuencia a español
 */
private translateFrequency(frequency: string): string {
  const translations: { [key: string]: string } = {
    'daily': 'Diario',
    'weekly': 'Semanal',
    'monthly': 'Mensual',
    'each-4-6-hours': 'Cada 4-6 horas',
    'each-8-hours': 'Cada 8 horas',
    'as-needed': 'Según sea necesario'
  };
  return translations[frequency] || frequency;
}
```

#### Uso en el Componente

```typescript
// medicines.ts
@Component({...})
export class MedicinesPage {
  medicineService = inject(MedicineService);

  // Observable con datos transformados
  medicines$ = this.medicineService.getMedicinesViewModel();
}
```

**Template:**

```html
<div *ngIf="medicines$ | async as medicines">
  <div *ngFor="let medicine of medicines" class="medicine-card">
    <h3>{{ medicine.name }}</h3>
    <p>{{ medicine.dosage }} - {{ medicine.displayFrequency }}</p>
    <p class="days-left" [class.expired]="medicine.isExpired">
      {{ medicine.daysLeft }} días restantes
    </p>
  </div>
</div>
```

**Ventajas de map:**
- ✅ Adaptar respuestas del backend sin modificar componentes
- ✅ Centralizar lógica de transformación
- ✅ Componentes se enfocán en presentación, no en cálculos
- ✅ Reutilizable en múltiples componentes

---

### Manejo de Errores con catchError

Centraliza el tratamiento de errores con `catchError`, devolviendo un observable "seguro" o relanzando el error:

#### Estrategia 1: Relanzar el error

```typescript
private handleError(error: HttpErrorResponse): Observable<never> {
  let errorMessage = 'Error desconocido';

  if (error.error instanceof ErrorEvent) {
    // Error del cliente (network error)
    errorMessage = `Error: ${error.error.message}`;
    console.error('Error en el cliente:', error.error);
  } else {
    // Error del servidor
    errorMessage = error.error?.message || `Código de error: ${error.status}`;
    console.error('Error del servidor:', error.error);
  }

  // Relanzar error para que el componente lo maneje
  return throwError(() => new Error(errorMessage));
}

/**
 * Obtiene medicamentos y relanza el error al componente
 */
getAll(): Observable<Medicine[]> {
  return this.http.get<ApiListResponse<Medicine>>(`${this.apiUrl}`)
    .pipe(
      map(response => response.items),
      catchError(error => this.handleError(error))
    );
}
```

**Uso en el componente:**

```typescript
loadMedicines() {
  this.medicineService.getAll().subscribe({
    next: (medicines) => {
      this.medicines = medicines;
      this.loading = false;
    },
    error: (err) => {
      this.error = err.message;
      this.loading = false;
      this.toastService.error(err.message);
    }
  });
}
```

#### Estrategia 2: Devolver valor "vacío"

Para no interrumpir el flujo, retorna un observable seguro (array vacío, null, etc.):

```typescript
/**
 * Obtiene medicamentos pero devuelve array vacío en caso de error
 */
getSafe(): Observable<Medicine[]> {
  return this.http.get<ApiListResponse<Medicine>>(`${this.apiUrl}`)
    .pipe(
      map(response => response.items),
      catchError(() => {
        console.warn('Error al cargar medicamentos, mostrando lista vacía');
        return of([]); // Observable que devuelve array vacío
      })
    );
}
```

#### Estrategia 3: Manejo específico por código HTTP

```typescript
/**
 * Maneja errores específicos según el código HTTP
 */
private handleErrorByStatus(error: HttpErrorResponse): Observable<never> {
  let errorMessage = '';

  switch (error.status) {
    case 400:
      errorMessage = 'Solicitud inválida';
      break;
    case 401:
      errorMessage = 'No autorizado. Inicia sesión';
      break;
    case 403:
      errorMessage = 'No tienes permiso para acceder';
      break;
    case 404:
      errorMessage = 'Recurso no encontrado';
      break;
    case 500:
      errorMessage = 'Error interno del servidor';
      break;
    default:
      errorMessage = `Error: ${error.status} ${error.statusText}`;
  }

  console.error(errorMessage, error);
  return throwError(() => new Error(errorMessage));
}
```

---

### Retry Logic para Peticiones Fallidas

Para fallos temporales (timeouts, 5xx) puedes reintentar con `retry` o `retryWhen`:

#### Estrategia 1: Reintentos simples

```typescript
import { retry } from 'rxjs/operators';

/**
 * Reintentas 2 veces antes de fallar
 */
getWithRetry(): Observable<Medicine[]> {
  return this.http.get<ApiListResponse<Medicine>>(`${this.apiUrl}`)
    .pipe(
      retry(2), // Reintentar 2 veces
      map(response => response.items),
      catchError(error => this.handleError(error))
    );
}
```

#### Estrategia 2: Reintentos con backoff

```typescript
import { retryWhen, delay, scan } from 'rxjs/operators';

/**
 * Reintentos con backoff exponencial
 * - Máximo 3 reintentos
 * - Solo para errores 5xx
 * - Espera 1 segundo entre intentos
 */
getWithBackoff(): Observable<Medicine[]> {
  return this.http.get<ApiListResponse<Medicine>>(`${this.apiUrl}`)
    .pipe(
      retryWhen(errors =>
        errors.pipe(
          scan((acc, error) => {
            // Si no es error 5xx o ya reintentó 3 veces, relanzar
            if (acc >= 3 || (error.status && error.status < 500)) {
              throw error;
            }
            return acc + 1;
          }, 0),
          delay(1000) // Esperar 1 segundo antes de reintentar
        )
      ),
      map(response => response.items),
      catchError(error => this.handleError(error))
    );
}
```

#### Estrategia 3: Backoff exponencial

```typescript
/**
 * Backoff exponencial: 1s, 2s, 4s, 8s
 */
getWithExponentialBackoff(): Observable<Medicine[]> {
  return this.http.get<ApiListResponse<Medicine>>(`${this.apiUrl}`)
    .pipe(
      retryWhen(errors =>
        errors.pipe(
          scan((acc, error) => {
            if (acc >= 3 || (error.status && error.status < 500)) {
              throw error;
            }
            return acc + 1;
          }, 0),
          delay(attempt => Math.pow(2, attempt) * 1000) // 1s, 2s, 4s, 8s
        )
      ),
      map(response => response.items),
      catchError(error => this.handleError(error))
    );
}
```

**Cuándo usar cada estrategia:**
- ✅ `retry(n)`: Fallos temporales predecibles (network timeouts)
- ✅ `retryWhen` + `delay`: Control fino de reintentos
- ✅ Backoff exponencial: APIs públicas con rate limiting
- ✅ Nunca reintentar: POST/PUT/DELETE (pueden generar duplicados)

---

### Implementación Completa en MedicineService

```typescript
// data/medicine.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { map, catchError, retry, retryWhen, delay, scan } from 'rxjs/operators';

export interface MedicineViewModel extends Medicine {
  daysLeft: number;
  isExpired: boolean;
  displayFrequency: string;
}

@Injectable({ providedIn: 'root' })
export class MedicineService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/medicines';

  // === GET con transformaciones ===

  /**
   * Obtiene medicamentos con cálculos para la UI
   * @returns Observable<MedicineViewModel[]>
   */
  getMedicinesViewModel(): Observable<MedicineViewModel[]> {
    return this.http.get<ApiListResponse<Medicine>>(this.apiUrl)
      .pipe(
        retry(2), // Reintentar 2 veces en caso de error 5xx
        map(response => response.items),
        map(medicines => medicines.map(m => this.toViewModel(m))),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Obtiene un medicamento con backoff exponencial
   * @param id ID del medicamento
   * @returns Observable<Medicine>
   */
  getByIdWithBackoff(id: string): Observable<Medicine> {
    return this.http.get<Medicine>(`${this.apiUrl}/${id}`)
      .pipe(
        retryWhen(errors =>
          errors.pipe(
            scan((acc, error) => {
              if (acc >= 3 || (error.status && error.status < 500)) {
                throw error;
              }
              return acc + 1;
            }, 0),
            delay(attempt => Math.pow(2, attempt) * 1000)
          )
        ),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Obtiene medicamentos de forma segura (devuelve array vacío si falla)
   * @returns Observable<Medicine[]>
   */
  getSafe(): Observable<Medicine[]> {
    return this.http.get<ApiListResponse<Medicine>>(this.apiUrl)
      .pipe(
        map(response => response.items),
        catchError(() => {
          console.warn('Error al cargar medicamentos, devolviendo lista vacía');
          return of([]);
        })
      );
  }

  // === POST/PUT/DELETE sin reintentos ===

  /**
   * Crea un medicamento (sin reintentos para evitar duplicados)
   * @param medicine Datos del medicamento
   * @returns Observable<Medicine>
   */
  create(medicine: CreateMedicineDto): Observable<Medicine> {
    return this.http.post<Medicine>(this.apiUrl, medicine)
      .pipe(
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Actualiza un medicamento
   * @param id ID del medicamento
   * @param medicine Datos actualizados
   * @returns Observable<Medicine>
   */
  update(id: string, medicine: Omit<Medicine, 'id'>): Observable<Medicine> {
    return this.http.put<Medicine>(`${this.apiUrl}/${id}`, medicine)
      .pipe(
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Elimina un medicamento
   * @param id ID del medicamento
   * @returns Observable<void>
   */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(error => this.handleError(error))
      );
  }

  // === Métodos privados ===

  /**
   * Transforma Medicine a MedicineViewModel
   */
  private toViewModel(medicine: Medicine): MedicineViewModel {
    const daysLeft = medicine.endDate
      ? Math.ceil((new Date(medicine.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : -1;

    return {
      ...medicine,
      daysLeft,
      isExpired: daysLeft === 0,
      displayFrequency: this.translateFrequency(medicine.frequency)
    };
  }

  /**
   * Traduce frecuencia a español
   */
  private translateFrequency(frequency: string): string {
    const translations: { [key: string]: string } = {
      'daily': 'Diario',
      'weekly': 'Semanal',
      'monthly': 'Mensual'
    };
    return translations[frequency] || frequency;
  }

  /**
   * Maneja errores HTTP centralizadamente
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Error desconocido';

    if (error.error instanceof ErrorEvent) {
      // Error del cliente
      errorMessage = `Error: ${error.error.message}`;
      console.error('Error en cliente:', error.error);
    } else {
      // Error del servidor
      const status = error.status;
      if (status === 400) {
        errorMessage = 'Solicitud inválida';
      } else if (status === 401) {
        errorMessage = 'No autorizado. Inicia sesión.';
      } else if (status === 403) {
        errorMessage = 'No tienes permiso para acceder';
      } else if (status === 404) {
        errorMessage = 'Medicamento no encontrado';
      } else if (status === 500 || status === 503) {
        errorMessage = 'Servidor no disponible. Intenta más tarde.';
      } else {
        errorMessage = `Error ${status}: ${error.statusText}`;
      }
      console.error(`Error HTTP ${status}:`, error.error);
    }

    return throwError(() => new Error(errorMessage));
  }
}
```

---

### Resumen de Estrategias

| Estrategia | Uso | Reintentos | Async |
|-----------|-----|-----------|-------|
| `getAll()` | Listados | 2 (retry) | map + catchError |
| `getById()` | Individual | Backoff | map + catchError |
| `getSafe()` | Opcional | 0 | of([]) en error |
| `create()` | Crear recurso | 0 (evitar duplicados) | catchError |
| `update()` | Actualizar | 0 (evitar cambios inesperados) | catchError |
| `delete()` | Eliminar | 0 (evitar eliminaciones múltiples) | catchError |

---

### Beneficios de Implementar Tarea 3

- ✅ **Type Safety**: Errores detectados en tiempo de compilación
- ✅ **Mantenibilidad**: Cambios en API solo afectan servicios
- ✅ **Resiliencia**: Reintentos automáticos para fallos temporales
- ✅ **UX**: Mensajes de error descriptivos para el usuario
- ✅ **Debugging**: Logs centralizados de errores
- ✅ **Performance**: Transformaciones en servicios, no en componentes

---

---

## Tarea 4 — Diferentes Formatos de Petición y Respuesta

En una aplicación Angular real, la comunicación HTTP no se limita a JSON. Existen varios formatos y estrategias para enviar/recibir datos, según el caso de uso.

Esta tarea documenta:

1. **JSON como formato estándar** para la mayoría de peticiones CRUD
2. **FormData** para subida de archivos (imágenes de medicamentos, documentos médicos)
3. **Query Params** para filtros, búsqueda y paginación
4. **Headers Personalizados** para casos especiales (API key, versión del cliente, tenant ID)

---

### JSON como Formato Principal

La mayoría de peticiones en la API (GET, POST, PUT, PATCH, DELETE) usa **JSON** como formato de entrada y salida. HttpClient de Angular lo maneja por defecto.

#### Ejemplo: CRUD Básico

```typescript
// GET: Obtener lista de medicamentos
getMedicines(): Observable<ApiListResponse<Medicine>> {
  return this.http.get<ApiListResponse<Medicine>>('/api/medicines');
  // Response: {"items": [...], "total": 10, "page": 1, "pageSize": 20}
}

// GET: Obtener un medicamento por ID
getMedicineById(id: string): Observable<ApiResponse<Medicine>> {
  return this.http.get<ApiResponse<Medicine>>(`/api/medicines/${id}`);
  // Response: {"data": {...}, "message": "OK", "timestamp": "2026-01-12T..."}
}

// POST: Crear medicamento
createMedicine(dto: CreateMedicineDto): Observable<ApiResponse<Medicine>> {
  return this.http.post<ApiResponse<Medicine>>('/api/medicines', dto);
  // Request Body (JSON): {"name": "Ibuprofen", "dosage": "200mg", ...}
  // Response: {"data": {...}, "message": "Medicamento creado"}
}

// PUT: Actualizar medicamento completo
updateMedicine(id: string, dto: UpdateMedicineDto): Observable<ApiResponse<Medicine>> {
  return this.http.put<ApiResponse<Medicine>>(`/api/medicines/${id}`, dto);
  // Request Body (JSON): {"name": "Ibuprofen 400mg", ...}
}

// PATCH: Actualizar campos específicos
patchMedicine(id: string, fields: Partial<UpdateMedicineDto>): Observable<ApiResponse<Medicine>> {
  return this.http.patch<ApiResponse<Medicine>>(`/api/medicines/${id}`, fields);
  // Request Body (JSON): {"dosage": "400mg"}  // Solo el campo a cambiar
}

// DELETE: Eliminar medicamento
deleteMedicine(id: string): Observable<void> {
  return this.http.delete<void>(`/api/medicines/${id}`);
  // No tiene body
}
```

#### Interceptor de Headers JSON

El interceptor de autenticación automáticamente configura `Content-Type: application/json`:

```typescript
// src/app/core/interceptors/auth.interceptor.ts
export function authInterceptor(
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> {
  
  // Agregar token y Content-Type
  const authReq = req.clone({
    headers: req.headers
      .set('Authorization', `Bearer ${this.authService.getToken()}`)
      .set('Content-Type', 'application/json')
  });
  
  return next(authReq);
}
```

#### ¿Cuándo usar PUT vs PATCH?

| Operación | Método | Body | Idempotente | Caso de Uso |
|-----------|--------|------|-------------|-----------|
| Actualizar todo | PUT | Objeto completo | ✅ Sí | Reemplazar medicamento entero |
| Actualizar parcial | PATCH | Solo campos cambiados | ⚠️ Depende | Cambiar solo dosificación |

---

### FormData para Subida de Archivos

Cuando el usuario sube una **imagen del medicamento**, **documento PDF**, o **foto de la etiqueta**, se usa `FormData` con tipo `multipart/form-data`. Esto permite mezclar campos de texto con ficheros binarios.

#### Ejemplo: Subir Foto de Medicamento

```typescript
// src/app/data/medicine.service.ts

uploadMedicineImage(medicineId: string, file: File): Observable<ApiResponse<{ imageUrl: string }>> {
  const formData = new FormData();
  formData.append('image', file);                    // Archivo binario
  formData.append('medicineId', medicineId);        // Campo de texto
  formData.append('uploadedAt', new Date().toISOString());

  // ⚠️ NO fijar Content-Type manualmente
  // El navegador genera el boundary correcto automáticamente
  return this.http.post<ApiResponse<{ imageUrl: string }>>('/api/medicines/upload-image', formData)
    .pipe(
      tap(response => console.log('Imagen subida:', response.data.imageUrl)),
      catchError((error: HttpErrorResponse) => {
        const message = error.status === 413 
          ? 'Archivo demasiado grande (máximo 5MB)'
          : error.error?.message || 'Error al subir imagen';
        return throwError(() => new Error(message));
      })
    );
}
```

#### En el Componente

```typescript
// src/app/pages/edit-medicine/edit-medicine.ts

@Component({...})
export class EditMedicinePage {
  medicineId: string = '';
  imageFile: File | null = null;
  uploading = false;
  uploadError: string | null = null;

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Validar tipo y tamaño
      if (!file.type.startsWith('image/')) {
        this.uploadError = 'Solo se aceptan imágenes';
        return;
      }
      if (file.size > 5 * 1024 * 1024) {  // 5MB
        this.uploadError = 'Imagen demasiado grande';
        return;
      }
      
      this.imageFile = file;
      this.uploadError = null;
    }
  }

  uploadImage(): void {
    if (!this.imageFile || !this.medicineId) return;
    
    this.uploading = true;
    this.medicineService.uploadMedicineImage(this.medicineId, this.imageFile)
      .subscribe({
        next: (response) => {
          console.log('Imagen guardada en:', response.data.imageUrl);
          this.uploading = false;
          this.imageFile = null;
        },
        error: (err) => {
          this.uploadError = err.message;
          this.uploading = false;
        }
      });
  }
}
```

#### Template HTML

```html
<div class="medicine-image-upload">
  <label for="imageInput">Subir Foto del Medicamento</label>
  <input 
    #imageInput
    type="file" 
    id="imageInput"
    accept="image/*"
    (change)="onImageSelected($event)"
  />
  
  <div *ngIf="imageFile" class="file-preview">
    <p>Archivo seleccionado: {{ imageFile.name }}</p>
    <button 
      (click)="uploadImage()" 
      [disabled]="uploading"
      class="btn btn--primary"
    >
      {{ uploading ? 'Subiendo...' : 'Subir Imagen' }}
    </button>
  </div>

  <div *ngIf="uploadError" class="error-message">
    {{ uploadError }}
  </div>
</div>
```

#### Diferencias con JSON

| Aspecto | JSON | FormData |
|--------|------|----------|
| **Tipo MIME** | `application/json` | `multipart/form-data` |
| **Body** | String JSON | Stream multipart binario |
| **Content-Type** | Fijar manualmente | ⚠️ Dejar que navegador lo genere |
| **Boundary** | N/A | Automático (ej: `----WebKitFormBoundary...`) |
| **Casos** | Datos estructurados | Archivos + campos de texto |

---

### Query Params para Filtros y Paginación

Los parámetros de búsqueda, filtrado y paginación se envían en la **URL como query params** (no en el body). Esto mantiene las peticiones **idempotentes** y permite cachear resultados.

#### Ejemplo: Listar Medicamentos con Filtros

```typescript
// src/app/data/medicine.service.ts

getMedicinesFiltered(
  page: number = 1,
  pageSize: number = 10,
  search?: string,
  status?: 'active' | 'expiring-soon' | 'expired',
  sortBy?: 'name' | 'expirationDate'
): Observable<ApiListResponse<Medicine>> {
  
  let params = new HttpParams()
    .set('page', page.toString())
    .set('pageSize', pageSize.toString());
  
  // Agregar parámetros opcionales si existen
  if (search) {
    params = params.set('search', search);
  }
  if (status) {
    params = params.set('status', status);
  }
  if (sortBy) {
    params = params.set('sortBy', sortBy);
  }

  return this.http.get<ApiListResponse<Medicine>>('/api/medicines', { params })
    .pipe(
      retry(2),
      catchError((error) => this.handleError(error, 'getMedicinesFiltered'))
    );
}
```

#### URLs Generadas

```
GET /api/medicines?page=1&pageSize=10
GET /api/medicines?page=2&pageSize=20&search=ibuprofen
GET /api/medicines?page=1&pageSize=10&status=expiring-soon&sortBy=expirationDate
GET /api/medicines?page=1&pageSize=10&search=aspirin&status=active&sortBy=name
```

#### Componente: Tabla con Paginación y Búsqueda

```typescript
// src/app/pages/medicines/medicines.ts

@Component({...})
export class MedicinesPage implements OnInit {
  medicines: MedicineViewModel[] = [];
  
  // Paginación
  currentPage = 1;
  pageSize = 10;
  totalMedicines = 0;
  
  // Filtros
  searchText = '';
  selectedStatus: 'active' | 'expiring-soon' | 'expired' | '' = '';
  sortBy: 'name' | 'expirationDate' = 'name';
  
  isLoading = false;
  error: string | null = null;

  constructor(private medicineService = inject(MedicineService)) {}

  ngOnInit(): void {
    this.loadMedicines();
  }

  loadMedicines(): void {
    this.isLoading = true;
    this.error = null;

    this.medicineService.getMedicinesFiltered(
      this.currentPage,
      this.pageSize,
      this.searchText || undefined,
      this.selectedStatus || undefined,
      this.sortBy
    ).subscribe({
      next: (response) => {
        this.medicines = response.items;
        this.totalMedicines = response.total;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = err.message;
        this.isLoading = false;
      }
    });
  }

  onSearch(text: string): void {
    this.searchText = text;
    this.currentPage = 1;  // Volver a página 1
    this.loadMedicines();
  }

  onFilterByStatus(status: string): void {
    this.selectedStatus = status as any;
    this.currentPage = 1;
    this.loadMedicines();
  }

  onSortChange(sortBy: string): void {
    this.sortBy = sortBy as any;
    this.currentPage = 1;
    this.loadMedicines();
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.loadMedicines();
  }
}
```

#### Template HTML

```html
<div class="medicines-container">
  <!-- Búsqueda -->
  <div class="search-bar">
    <input 
      type="text" 
      placeholder="Buscar medicamento..."
      [value]="searchText"
      (input)="onSearch($event.target.value)"
      class="input-search"
    />
  </div>

  <!-- Filtros -->
  <div class="filters">
    <select [(ngModel)]="selectedStatus" (change)="onFilterByStatus(selectedStatus)" class="select">
      <option value="">Todos los estados</option>
      <option value="active">Activos</option>
      <option value="expiring-soon">Por vencer</option>
      <option value="expired">Vencidos</option>
    </select>

    <select [(ngModel)]="sortBy" (change)="onSortChange(sortBy)" class="select">
      <option value="name">Ordenar por nombre</option>
      <option value="expirationDate">Ordenar por vencimiento</option>
    </select>
  </div>

  <!-- Tabla de medicamentos -->
  <table *ngIf="medicines.length > 0" class="medicines-table">
    <thead>
      <tr>
        <th>Nombre</th>
        <th>Dosificación</th>
        <th>Estado</th>
        <th>Acciones</th>
      </tr>
    </thead>
    <tbody>
      <tr *ngFor="let medicine of medicines">
        <td>{{ medicine.name }}</td>
        <td>{{ medicine.dosage }}</td>
        <td>{{ medicine.expirationStatus }}</td>
        <td>
          <button (click)="editMedicine(medicine.id)">Editar</button>
          <button (click)="deleteMedicine(medicine)">Eliminar</button>
        </td>
      </tr>
    </tbody>
  </table>

  <!-- Paginación -->
  <div class="pagination" *ngIf="totalMedicines > pageSize">
    <button 
      (click)="goToPage(currentPage - 1)" 
      [disabled]="currentPage === 1"
      class="btn btn--secondary"
    >
      Anterior
    </button>
    <span>Página {{ currentPage }} de {{ Math.ceil(totalMedicines / pageSize) }}</span>
    <button 
      (click)="goToPage(currentPage + 1)" 
      [disabled]="currentPage * pageSize >= totalMedicines"
      class="btn btn--secondary"
    >
      Siguiente
    </button>
  </div>

  <!-- Estados de carga y error -->
  <div *ngIf="isLoading" class="loading">Cargando medicamentos...</div>
  <div *ngIf="error" class="error-message">{{ error }}</div>
  <div *ngIf="!isLoading && medicines.length === 0" class="empty-state">
    No hay medicamentos que mostrar
  </div>
</div>
```

---

### Headers Personalizados

Además de los headers comunes gestionados por **interceptores** (`Authorization`, `Content-Type`), algunos endpoints especiales pueden requerir cabeceras personalizadas.

#### Casos de Uso Comunes

| Header | Valor Ejemplo | Significado | Caso de Uso |
|--------|---------------|------------|-----------|
| `X-Client-Version` | `web-1.0.0` | Versión del cliente | Debugging, compatibilidad |
| `X-Tenant-Id` | `tenant-123` | ID del tenant en multi-tenant | SaaS, sistemas con múltiples clientes |
| `X-Request-Id` | UUID | ID único de petición | Trazabilidad, logging correlacionado |
| `X-Report-Format` | `pdf` o `csv` | Formato de respuesta | Exportación de reportes |
| `Accept-Language` | `es-ES` | Idioma preferido | Localización de mensajes |

#### Ejemplo: Descargar Reporte de Medicamentos

```typescript
// src/app/data/medicine.service.ts

downloadMedicineReport(
  format: 'pdf' | 'csv',
  startDate?: string,
  endDate?: string
): Observable<Blob> {
  
  const headers = new HttpHeaders()
    .set('X-Report-Format', format)
    .set('X-Client-Version', 'web-1.0.0')
    .set('Accept-Language', 'es-ES');
  
  let params = new HttpParams()
    .set('format', format);
  
  if (startDate) {
    params = params.set('startDate', startDate);
  }
  if (endDate) {
    params = params.set('endDate', endDate);
  }

  return this.http.get('/api/medicines/report', {
    headers,
    params,
    responseType: 'blob' as 'json'  // Indicar que la respuesta es un archivo
  }).pipe(
    tap(blob => {
      // Descargar el archivo automáticamente
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `medicinas-reporte.${format === 'pdf' ? 'pdf' : 'csv'}`;
      link.click();
      window.URL.revokeObjectURL(url);
    }),
    catchError((error: HttpErrorResponse) => {
      const message = error.status === 403
        ? 'No tienes permisos para descargar reportes'
        : 'Error al descargar reporte';
      return throwError(() => new Error(message));
    })
  );
}

// Usar con tenant ID dinámico
downloadMedicineReportForTenant(
  tenantId: string,
  format: 'pdf' | 'csv'
): Observable<Blob> {
  
  const headers = new HttpHeaders()
    .set('X-Tenant-Id', tenantId)
    .set('X-Client-Version', 'web-1.0.0');
  
  return this.http.get(`/api/medicines/report?format=${format}`, {
    headers,
    responseType: 'blob' as 'json'
  });
}
```

#### Componente: Descargar Reporte

```typescript
// src/app/pages/medicines/medicines.ts

export class MedicinesPage {
  startDate: string = '';
  endDate: string = '';
  downloading = false;
  downloadError: string | null = null;

  constructor(private medicineService = inject(MedicineService)) {}

  downloadReport(format: 'pdf' | 'csv'): void {
    this.downloading = true;
    this.downloadError = null;

    this.medicineService.downloadMedicineReport(
      format,
      this.startDate || undefined,
      this.endDate || undefined
    ).subscribe({
      next: () => {
        this.downloading = false;
        console.log(`Reporte ${format} descargado`);
      },
      error: (err) => {
        this.downloadError = err.message;
        this.downloading = false;
      }
    });
  }
}
```

#### Template HTML

```html
<div class="report-download">
  <h3>Descargar Reporte de Medicamentos</h3>
  
  <div class="date-range">
    <input 
      type="date" 
      [(ngModel)]="startDate" 
      placeholder="Fecha inicio"
      class="input"
    />
    <input 
      type="date" 
      [(ngModel)]="endDate" 
      placeholder="Fecha fin"
      class="input"
    />
  </div>

  <div class="buttons">
    <button 
      (click)="downloadReport('pdf')" 
      [disabled]="downloading"
      class="btn btn--primary"
    >
      📄 Descargar PDF
    </button>
    <button 
      (click)="downloadReport('csv')" 
      [disabled]="downloading"
      class="btn btn--secondary"
    >
      📊 Descargar CSV
    </button>
  </div>

  <div *ngIf="downloading" class="loading">Preparando descarga...</div>
  <div *ngIf="downloadError" class="error-message">{{ downloadError }}</div>
</div>
```

#### Respuesta Esperada

- **PDF**: Header `Content-Type: application/pdf`, body binario
- **CSV**: Header `Content-Type: text/csv`, body de texto

---

### Tabla Resumen: Formatos por Endpoint

| Endpoint | Método | Content-Type | Body | Params | Headers Especiales | ResponseType |
|----------|--------|--------------|------|--------|------------------|--------------|
| `/api/medicines` | GET | N/A | ❌ | ✅ (page, pageSize, search) | Authorization | JSON |
| `/api/medicines/{id}` | GET | N/A | ❌ | ❌ | Authorization | JSON |
| `/api/medicines` | POST | `application/json` | ✅ (Medicine JSON) | ❌ | Authorization | JSON |
| `/api/medicines/{id}` | PUT | `application/json` | ✅ (Medicine JSON) | ❌ | Authorization | JSON |
| `/api/medicines/{id}` | PATCH | `application/json` | ✅ (Partial JSON) | ❌ | Authorization | JSON |
| `/api/medicines/{id}` | DELETE | N/A | ❌ | ❌ | Authorization | JSON |
| `/api/medicines/upload-image` | POST | `multipart/form-data` | ✅ (FormData) | ❌ | Authorization | JSON |
| `/api/medicines/report` | GET | N/A | ❌ | ✅ (format, startDate, endDate) | X-Report-Format, X-Client-Version | **blob** |
| `/api/medicines/search` | GET | N/A | ❌ | ✅ (q, filters) | Accept-Language | JSON |

---

### Beneficios de Entender Diferentes Formatos

- ✅ **Interoperabilidad**: Trabajar con APIs heterogéneas (JSON, XML, archivos, gráficos)
- ✅ **Escalabilidad**: Subidas de archivos sin afectar peticiones JSON
- ✅ **Flexibilidad**: Adaptarse a requisitos de negocio (exportar PDF, subir fotos)
- ✅ **UX**: Descargas directas, previsualizaciones de imágenes
- ✅ **Performance**: Query params permiten caching HTTP (GET idempotente)
- ✅ **Seguridad**: Validaciones de tipo MIME, tamaños de archivo, headers de CORS

---

---

## Tarea 6 — Interceptores HTTP

Un **interceptor HTTP** en Angular actúa como middleware que se ejecuta **antes y después** de cada petición realizada con `HttpClient`. Permite centralizar lógica común como:

- Añadir autenticación (token)
- Gestionar errores globalmente
- Registrar (logging) de peticiones y respuestas
- Transformar requests/responses
- Medir tiempos de respuesta

### Interceptor de Autenticación

El interceptor de autenticación añade automáticamente el token JWT a todos los requests que lo necesiten, evitando repetir código en cada servicio.

#### Implementación

```typescript
// src/app/core/interceptors/auth.interceptor.ts

import { HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Obtener token del servicio de autenticación
  const token = authService.getToken();

  // URLs públicas que NO necesitan autenticación
  const publicUrls = ['/login', '/register', '/api/public'];
  const isPublicUrl = publicUrls.some(url => req.url.includes(url));

  // Si no hay token o es URL pública, continuar sin modificar
  if (!token || isPublicUrl) {
    return next(req);
  }

  // Clonar la request y añadir header de autenticación
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  console.log('[Auth Interceptor] Token añadido a petición:', authReq.url);

  return next(authReq);
};
```

#### AuthService

```typescript
// src/app/core/services/auth.service.ts

import { Injectable } from '@angular/core';
import { signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenSignal = signal<string | null>(
    localStorage.getItem('token')
  );

  getToken(): string | null {
    return this.tokenSignal();
  }

  setToken(token: string): void {
    this.tokenSignal.set(token);
    localStorage.setItem('token', token);
  }

  clearToken(): void {
    this.tokenSignal.set(null);
    localStorage.removeItem('token');
  }

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }
}
```

#### Cómo Funciona

1. **En el login**: AuthService.setToken() guarda el token en localStorage y en signal
2. **En peticiones**: authInterceptor obtiene el token y lo añade al header Authorization
3. **En logout**: AuthService.clearToken() elimina el token y la petición siguiente no lo incluirá

| Escenario | Token | Header | Resultado |
|-----------|-------|--------|-----------|
| Usuario autenticado | ✅ | `Authorization: Bearer eyJhbGc...` | Incluye token |
| Login/Register (público) | ✅ | NO se añade | URL excluida |
| Sin autenticación | ❌ | NO se añade | Sin header |

---

### Interceptor de Manejo Global de Errores

El interceptor de errores captura todos los errores HTTP y proporciona mensajes consistentes al usuario, sin necesidad de repetir lógica en cada servicio.

#### Implementación

```typescript
// src/app/core/interceptors/error.interceptor.ts

import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../../shared/toast.service';
import { Router } from '@angular/router';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Información común
      const errorCode = error.status;
      const errorUrl = req.url;
      let userMessage = 'Ocurrió un error inesperado';

      // Clasificar error por status code
      if (errorCode === 0) {
        // Sin conexión (CORS, timeout, network)
        userMessage = '❌ No hay conexión con el servidor. Verifica tu internet.';
        console.error('[Error Interceptor] Sin conexión:', error);

      } else if (errorCode === 400) {
        // Bad Request (datos inválidos)
        userMessage = '❌ Los datos enviados son inválidos.';
        console.error('[Error Interceptor] Solicitud inválida:', error.error);

      } else if (errorCode === 401) {
        // Unauthorized (sesión expirada)
        userMessage = '⚠️ Tu sesión ha expirado. Por favor, inicia sesión de nuevo.';
        console.warn('[Error Interceptor] No autenticado, redirigiendo a login');
        router.navigate(['/login']);

      } else if (errorCode === 403) {
        // Forbidden (permiso denegado)
        userMessage = '🔒 No tienes permiso para acceder a este recurso.';
        console.error('[Error Interceptor] Acceso denegado:', errorUrl);

      } else if (errorCode === 404) {
        // Not Found (recurso no existe)
        userMessage = '🔍 El recurso solicitado no fue encontrado.';
        console.error('[Error Interceptor] Recurso no encontrado:', errorUrl);

      } else if (errorCode === 409) {
        // Conflict (duplicado, por ejemplo medicamento ya existe)
        userMessage = '⚠️ Ya existe un registro con esos datos.';
        console.error('[Error Interceptor] Conflicto de datos:', error.error);

      } else if (errorCode >= 500) {
        // Server Error (5xx)
        userMessage = '🔴 El servidor no está disponible. Intenta más tarde.';
        console.error(`[Error Interceptor] Error del servidor ${errorCode}:`, error.error);
      }

      // Mostrar toast al usuario
      toastService.error(userMessage);

      // Registrar error para debugging
      const errorLog = {
        timestamp: new Date().toISOString(),
        status: errorCode,
        method: req.method,
        url: errorUrl,
        message: error.error?.message || error.message,
        userMessage
      };
      console.error('[Error Log]', errorLog);

      // Relanzar el error para que servicios puedan manejarlo si necesitan
      return throwError(() => ({
        ...error,
        userMessage
      }));
    })
  );
};
```

#### ToastService (para mostrar notificaciones)

```typescript
// src/app/shared/toast.service.ts

import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts = signal<Toast[]>([]);

  success(message: string, duration = 3000): void {
    this.show(message, 'success', duration);
  }

  error(message: string, duration = 5000): void {
    this.show(message, 'error', duration);
  }

  warning(message: string, duration = 4000): void {
    this.show(message, 'warning', duration);
  }

  info(message: string, duration = 3000): void {
    this.show(message, 'info', duration);
  }

  private show(message: string, type: Toast['type'], duration: number): void {
    const id = Math.random().toString(36).slice(2);
    const toast: Toast = { id, message, type, duration };

    this.toasts.update(current => [...current, toast]);

    // Auto-remover después de duration
    setTimeout(() => {
      this.remove(id);
    }, duration);
  }

  remove(id: string): void {
    this.toasts.update(current => current.filter(t => t.id !== id));
  }
}
```

#### Errores Manejados en ORGMedi

| Status | Causa | Mensaje Usuario | Acción |
|--------|-------|-----------------|--------|
| **0** | Sin conexión/CORS | "No hay conexión" | Reintentar |
| **400** | Validación fallida | "Datos inválidos" | Revisar formulario |
| **401** | Token expirado | "Sesión expirada" | Redirigir a login |
| **403** | Sin permisos | "Acceso denegado" | Mostrar error |
| **404** | Medicamento no existe | "Recurso no encontrado" | Volver a lista |
| **409** | Duplicado | "Ya existe ese medicamento" | Editar existente |
| **5xx** | Error servidor | "Servidor no disponible" | Reintentar más tarde |

---

### Interceptor de Logging

El interceptor de logging registra todas las peticiones y respuestas (útil para debugging en desarrollo). **En producción debe desactivarse** para evitar logs excesivos.

#### Implementación

```typescript
// src/app/core/interceptors/logging.interceptor.ts

import { HttpInterceptorFn, HttpResponse, HttpRequest } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  // Solo loguear en desarrollo
  if (environment.production) {
    return next(req);
  }

  const requestStartTime = performance.now();
  const requestId = Math.random().toString(36).slice(2, 9);

  console.log(
    `%c[${requestId}] 📤 REQUEST`,
    'color: #4a90e2; font-weight: bold;',
    {
      method: req.method,
      url: req.urlWithParams,
      headers: req.headers,
      body: req.body || 'sin body'
    }
  );

  return next(req).pipe(
    tap({
      next: (event) => {
        if (event instanceof HttpResponse) {
          const duration = (performance.now() - requestStartTime).toFixed(2);
          const status = event.status;
          const statusColor = status >= 400 ? '#e74c3c' : '#27ae60';

          console.log(
            `%c[${requestId}] 📥 RESPONSE ${status}`,
            `color: ${statusColor}; font-weight: bold;`,
            {
              duration: `${duration}ms`,
              url: req.urlWithParams,
              status: event.status,
              statusText: event.statusText,
              body: event.body
            }
          );
        }
      },
      error: (error) => {
        const duration = (performance.now() - requestStartTime).toFixed(2);
        console.error(
          `%c[${requestId}] ❌ ERROR`,
          'color: #e74c3c; font-weight: bold;',
          {
            duration: `${duration}ms`,
            method: req.method,
            url: req.urlWithParams,
            status: error.status,
            error: error.error || error.message
          }
        );
      }
    })
  );
};
```

#### Uso de Console Styling

```typescript
// Rojo para errores
console.error('%c[ERROR]', 'color: red; font-weight: bold;', mensaje);

// Verde para success
console.log('%c[SUCCESS]', 'color: green; font-weight: bold;', mensaje);

// Azul para info
console.log('%c[INFO]', 'color: blue; font-weight: bold;', mensaje);
```

#### Environment.ts (en desarrollo)

```typescript
// src/environments/environment.ts

export const environment = {
  production: false,  // Habilita logging
  apiUrl: 'http://localhost:8080/api'
};
```

#### Environment.prod.ts (en producción)

```typescript
// src/environments/environment.prod.ts

export const environment = {
  production: true,   // Desactiva logging
  apiUrl: 'https://api.orgmedi.com/api'
};
```

---

### Integración en app.config.ts

Los interceptores se registran en `provideHttpClient()` usando la función `withInterceptors()`. **El orden importa**: se ejecutan de arriba a abajo en requests y de abajo a arriba en responses.

#### Configuración Recomendada

```typescript
// src/app/app.config.ts

import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';

// Importar interceptores
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { loggingInterceptor } from './core/interceptors/logging.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([
        // Orden de ejecución en REQUEST:
        // 1. authInterceptor     → Añade token
        // 2. errorInterceptor    → Prepara manejo de errores
        // 3. loggingInterceptor  → Registra request modificado

        authInterceptor,      // 1️⃣ PRIMERO: Autenticación
        errorInterceptor,     // 2️⃣ SEGUNDO: Errores
        loggingInterceptor    // 3️⃣ TERCERO: Logging
      ])
    )
  ]
};
```

#### Orden de Ejecución

**En una petición GET a `/api/medicines`:**

```
REQUEST:
  authInterceptor
    ↓ (añade Authorization header)
  errorInterceptor
    ↓ (prepara manejo de errores)
  loggingInterceptor
    ↓ (registra petición final)
  HttpClient
    ↓
  API

RESPONSE:
  loggingInterceptor (registra respuesta)
    ↑
  errorInterceptor (captura errores)
    ↑
  authInterceptor (no hace nada en response)
    ↑
  Componente (recibe response procesada)
```

---

### Ejemplo Completo: Todos los Interceptores en ORGMedi

Flujo completo de una petición POST para crear un medicamento:

#### 1. Componente dispara petición

```typescript
// src/app/pages/create-medicine/create-medicine.ts

saveMedicine(): void {
  const medicineData: CreateMedicineDto = {
    name: 'Ibuprofen',
    dosage: '200mg',
    frequency: '3 veces al día',
    startDate: '2026-01-12'
  };

  this.medicineService.create(medicineData).subscribe({
    next: (medicine) => {
      console.log('Medicamento creado:', medicine);
      this.router.navigate(['/medicines', medicine.id]);
    },
    error: (err) => {
      console.error('Error en componente:', err.userMessage);
      // El error ya fue mostrado por el interceptor (toast)
    }
  });
}
```

#### 2. Servicio prepara request

```typescript
// src/app/data/medicine.service.ts

create(dto: CreateMedicineDto): Observable<Medicine> {
  return this.http.post<Medicine>('/api/medicines', dto);
  // POST sin header Authorization (será añadido por interceptor)
}
```

#### 3. authInterceptor (añade token)

```typescript
// Token en localStorage: "eyJhbGciOiJIUzI1NiIs..."

Request ANTES:
  POST /api/medicines
  Content-Type: application/json
  body: { name: 'Ibuprofen', ... }

Request DESPUÉS:
  POST /api/medicines
  Content-Type: application/json
  Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
  body: { name: 'Ibuprofen', ... }

Console: "[Auth Interceptor] Token añadido a petición: http://localhost:8080/api/medicines"
```

#### 4. errorInterceptor (prepara manejo)

```typescript
// Si la respuesta es un error, lo capturará y mostrará toast

✅ Si es 201 Created: Continúa normalmente
❌ Si es 400 Bad Request: Muestra toast "Los datos enviados son inválidos"
❌ Si es 409 Conflict: Muestra toast "Ya existe un medicamento con ese nombre"
```

#### 5. loggingInterceptor (registra)

```typescript
Console (en desarrollo):
[a1b2c3d] 📤 REQUEST
  method: "POST"
  url: "http://localhost:8080/api/medicines"
  body: { name: 'Ibuprofen', ... }

[a1b2c3d] 📥 RESPONSE 201
  duration: "145.32ms"
  status: 201
  body: { id: 'med-123', name: 'Ibuprofen', ... }
```

#### 6. API procesa y responde

```json
201 Created
{
  "id": "med-123",
  "name": "Ibuprofen",
  "dosage": "200mg",
  "frequency": "3 veces al día",
  "startDate": "2026-01-12",
  "createdAt": "2026-01-12T12:34:56Z"
}
```

#### 7. Componente recibe response

```typescript
next: (medicine) => {
  // medicine es el objeto completo con ID
  console.log('Medicamento creado:', medicine);
  // Navegar a /medicines/med-123
}
```

---

### Tabla Resumen: Responsabilidades por Interceptor

| Interceptor | Entrada | Salida | Propósito |
|-------------|---------|--------|-----------|
| **Auth** | Request sin token | Request con Authorization header | Autenticar peticiones |
| **Error** | Response con error | Error clasificado + toast | Gestionar errores globalmente |
| **Logging** | Request/Response | Console.log formateado | Debugging en desarrollo |

---

### Beneficios de Usar Interceptores

✅ **DRY**: No repetir lógica de auth en cada servicio
✅ **Mantenibilidad**: Cambiar token en un solo lugar
✅ **Consistencia**: Todos los errores se manejan igual
✅ **Debugging**: Logs centralizados con formato consistente
✅ **Escalabilidad**: Fácil añadir interceptores nuevos (CORS, rate-limit, etc.)
✅ **Seguridad**: Manejo de sesiones expiradas automático

---

---

## Tarea 7 — Documentación de API

Una documentación clara de la API que consume la aplicación es fundamental para onboarding de nuevos desarrolladores, mantenimiento y debugging. Esta tarea estructura la documentación en tres secciones:

1. **Catálogo de endpoints**
2. **Interfaces TypeScript**
3. **Estrategia de errores**

---

### Catálogo de Endpoints Consumidos

Esta tabla enumera todos los endpoints que consume ORGMedi, agrupados por dominio (Medicamentos, Usuarios, Autenticación).

#### Endpoints de Medicamentos

| Método | URL | Descripción | Servicio/Método | Auth | Params/Body |
|--------|-----|-------------|-----------------|------|-------------|
| **GET** | `/api/medicines` | Listar medicamentos | `MedicineService.getAll()` | ✅ | Query: page, pageSize, search, status, sortBy |
| **GET** | `/api/medicines/:id` | Obtener medicamento por ID | `MedicineService.getById(id)` | ✅ | Path: id |
| **GET** | `/api/medicines/active` | Listar medicamentos activos | `MedicineService.getActive()` | ✅ | Query: page, pageSize |
| **GET** | `/api/medicines/report` | Descargar reporte | `MedicineService.downloadReport(format, dates)` | ✅ | Query: format(pdf\|csv), startDate, endDate |
| **POST** | `/api/medicines` | Crear medicamento | `MedicineService.create(dto)` | ✅ | Body: CreateMedicineDto |
| **PUT** | `/api/medicines/:id` | Actualizar medicamento completo | `MedicineService.update(id, dto)` | ✅ | Path: id, Body: UpdateMedicineDto |
| **PATCH** | `/api/medicines/:id` | Actualizar campos específicos | `MedicineService.patch(id, fields)` | ✅ | Path: id, Body: Partial<UpdateMedicineDto> |
| **DELETE** | `/api/medicines/:id` | Eliminar medicamento | `MedicineService.delete(id)` | ✅ | Path: id |
| **POST** | `/api/medicines/upload-image` | Subir foto de medicamento | `MedicineService.uploadImage(id, file)` | ✅ | FormData: image, medicineId |

#### Endpoints de Autenticación

| Método | URL | Descripción | Servicio/Método | Auth | Params/Body |
|--------|-----|-------------|-----------------|------|-------------|
| **POST** | `/api/auth/login` | Login con email/contraseña | `AuthService.login(credentials)` | ❌ | Body: LoginRequest |
| **POST** | `/api/auth/register` | Registrar nuevo usuario | `AuthService.register(userData)` | ❌ | Body: RegisterRequest |
| **POST** | `/api/auth/refresh` | Refrescar token expirado | `AuthService.refreshToken()` | ✅ | Body: { refreshToken } |
| **POST** | `/api/auth/logout` | Cerrar sesión | `AuthService.logout()` | ✅ | - |
| **GET** | `/api/auth/me` | Datos del usuario actual | `AuthService.getProfile()` | ✅ | - |

#### Endpoints de Usuarios

| Método | URL | Descripción | Servicio/Método | Auth | Params/Body |
|--------|-----|-------------|-----------------|------|-------------|
| **GET** | `/api/users/profile` | Obtener perfil | `UserService.getProfile()` | ✅ | - |
| **PUT** | `/api/users/profile` | Actualizar perfil | `UserService.updateProfile(dto)` | ✅ | Body: UpdateProfileDto |
| **PUT** | `/api/users/password` | Cambiar contraseña | `UserService.changePassword(oldPwd, newPwd)` | ✅ | Body: ChangePasswordRequest |
| **DELETE** | `/api/users/account` | Eliminar cuenta | `UserService.deleteAccount()` | ✅ | - |

---

### Estructura de Datos: Interfaces TypeScript

#### Interfaces de Medicamentos

```typescript
// Modelo base desde API
export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  description?: string;
  startDate: string;
  endDate?: string;
  quantity?: number;
  remainingDays?: number;
  createdAt: string;
  updatedAt: string;
}

// DTO: Crear medicamento
export interface CreateMedicineDto {
  name: string;
  dosage: string;
  frequency: string;
  description?: string;
  startDate: string;
  endDate?: string;
  quantity?: number;
}

// DTO: Actualizar medicamento
export interface UpdateMedicineDto {
  name?: string;
  dosage?: string;
  frequency?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  quantity?: number;
}

// ViewModel: Para renderizar en UI
export interface MedicineViewModel extends Medicine {
  formattedStartDate?: string;
  formattedEndDate?: string;
  isActive: boolean;
  isExpired: boolean;
  daysUntilExpiration?: number;
  expirationStatus: 'active' | 'expiring-soon' | 'expired';
  displayName?: string;
}

// Respuesta paginada
export interface ApiListResponse<T> {
  items: T[];
  total: number;
  page?: number;
  pageSize?: number;
}

// Respuesta genérica
export interface ApiResponse<T> {
  data: T;
  message?: string;
  timestamp?: string;
}
```

#### Interfaces de Autenticación

```typescript
// Request de login
export interface LoginRequest {
  email: string;
  password: string;
}

// Response de login
export interface LoginResponse {
  token: string;
  refreshToken?: string;
  user: User;
  expiresIn: number;
}

// Request de registro
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
}

// Modelo de usuario
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string;
  updatedAt?: string;
}
```

#### Interfaces de Error

```typescript
// Respuesta de error API
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
}

// Error extendido (con clasificación)
export interface AppError extends Error {
  status: number;
  code: string;
  userMessage: string;
  timestamp: string;
}
```

---

### Estrategia de Manejo de Errores Completa

El manejo de errores en ORGMedi sigue un patrón en **3 capas**: interceptor global → servicio → componente.

#### Capa 1: Interceptor Global (errorInterceptor)

**Responsabilidad**: Clasificar errores HTTP y mostrar toast al usuario

```typescript
// src/app/core/interceptors/error.interceptor.ts

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let userMessage = 'Ocurrió un error inesperado';
      const status = error.status;

      // Clasificar por status code
      if (status === 0) {
        userMessage = '❌ No hay conexión. Verifica tu internet.';
      } else if (status === 400) {
        userMessage = '❌ Los datos enviados son inválidos.';
      } else if (status === 401) {
        userMessage = '⚠️ Sesión expirada. Por favor, inicia sesión de nuevo.';
        router.navigate(['/login']);
      } else if (status === 403) {
        userMessage = '🔒 No tienes permiso para acceder.';
      } else if (status === 404) {
        userMessage = '🔍 El recurso solicitado no fue encontrado.';
      } else if (status === 409) {
        userMessage = '⚠️ Ya existe un registro con esos datos.';
      } else if (status >= 500) {
        userMessage = '🔴 El servidor no está disponible. Intenta más tarde.';
      }

      // Mostrar notificación al usuario
      toastService.error(userMessage);

      // Relanzar error para que servicios puedan manejarlo específicamente
      return throwError(() => ({
        ...error,
        userMessage
      }));
    })
  );
};
```

**Flujo**:
1. Petición falla (cualquier código de error)
2. Interceptor captura y clasifica
3. Toast se muestra automáticamente
4. Error se relanza para servicios

#### Capa 2: Servicio de Dominio (Opcional)

**Responsabilidad**: Manejo específico de negocio (si es necesario)

```typescript
// src/app/data/medicine.service.ts

getById(id: string): Observable<Medicine> {
  return this.http.get<Medicine>(`/api/medicines/${id}`).pipe(
    // Opcional: manejo adicional específico del dominio
    catchError(error => {
      if (error.status === 404) {
        // Lógica específica: medicamento no existe
        console.error('Medicamento eliminado o no existe');
      }
      // Re-lanzar para que componente lo maneje
      return throwError(() => error);
    })
  );
}
```

#### Capa 3: Componente (UI)

**Responsabilidad**: Gestionar estados (loading, error, empty, content)

```typescript
// src/app/pages/medicines/medicines.ts

state = signal<{
  loading: boolean;
  error: string | null;
  data: Medicine[] | null;
}>({
  loading: false,
  error: null,
  data: null
});

loadMedicines(): void {
  this.state.update(s => ({ ...s, loading: true, error: null }));

  this.medicineService.getAll().subscribe({
    next: (medicines) => {
      this.state.update(s => ({
        ...s,
        loading: false,
        data: medicines,
        error: null
      }));
    },
    error: (err) => {
      // El error ya fue mostrado por el interceptor (toast)
      // Aquí solo actualizamos el estado local
      this.state.update(s => ({
        ...s,
        loading: false,
        error: err.userMessage || 'Error desconocido',
        data: null
      }));
    }
  });
}
```

#### Diagrama de Flujo Global

```
┌─────────────────────────────────────────────────────┐
│                  COMPONENTE                         │
│  - Dispara loadMedicines()                          │
│  - Gestiona state { loading, error, data }         │
└──────────────┬──────────────────────────────────────┘
               │
               ↓ this.medicineService.getAll()
┌─────────────────────────────────────────────────────┐
│                   SERVICIO                          │
│  - Llama HttpClient.get<T>()                        │
│  - Retorna Observable<Medicine[]>                   │
└──────────────┬──────────────────────────────────────┘
               │
               ↓ HttpClient request
┌─────────────────────────────────────────────────────┐
│         INTERCEPTOR: authInterceptor                │
│  - Añade token Authorization header                 │
└──────────────┬──────────────────────────────────────┘
               │
               ↓ HttpClient request (modificado)
┌─────────────────────────────────────────────────────┐
│         INTERCEPTOR: errorInterceptor               │
│  - Si error: catchError, mostrar toast, relanzar    │
│  - Si 401: redirigir a login                        │
└──────────────┬──────────────────────────────────────┘
               │
               ↓ HttpClient request (modificado)
┌─────────────────────────────────────────────────────┐
│         INTERCEPTOR: loggingInterceptor             │
│  - Registra request/response en console             │
└──────────────┬──────────────────────────────────────┘
               │
               ↓ GET /api/medicines
┌─────────────────────────────────────────────────────┐
│                  SERVIDOR API                       │
│  - Procesa GET /api/medicines                       │
│  - Devuelve 200 + JSON o error (4xx, 5xx)          │
└──────────────┬──────────────────────────────────────┘
               │
               ↓ Response (200 o error)
┌─────────────────────────────────────────────────────┐
│    INTERCEPTOR: loggingInterceptor (response)       │
│  - Registra response en console                     │
└──────────────┬──────────────────────────────────────┘
               │
               ↓ Si error (4xx, 5xx)
┌─────────────────────────────────────────────────────┐
│    INTERCEPTOR: errorInterceptor (catchError)       │
│  - Toast: "No hay conexión" / "Servidor indisponi" │
│  - Si 401: router.navigate(['/login'])             │
└──────────────┬──────────────────────────────────────┘
               │
               ↓ throwError (con userMessage)
┌─────────────────────────────────────────────────────┐
│        SERVICIO (catchError opcional)               │
│  - Lógica específica de dominio (si aplica)         │
└──────────────┬──────────────────────────────────────┘
               │
               ↓ next: medicines[] / error: AppError
┌─────────────────────────────────────────────────────┐
│           COMPONENTE (subscribe)                    │
│  - next: actualiza state.data                       │
│  - error: actualiza state.error                     │
└──────────────┬──────────────────────────────────────┘
               │
               ↓ Template reacciona a state
┌─────────────────────────────────────────────────────┐
│              VISTA (template)                       │
│  - Si state.loading: mostrar spinner                │
│  - Si state.error: mostrar alert error              │
│  - Si state.data: mostrar tabla de medicamentos     │
│  - Si state.data.length === 0: mostrar empty state  │
└─────────────────────────────────────────────────────┘
```

#### Tabla: Errores Mapeados en ORGMedi

| Status | Causa | Mensaje Usuario | Acción Automática |
|--------|-------|-----------------|-------------------|
| **0** | No hay conexión / CORS / Timeout | "❌ No hay conexión. Verifica tu internet." | Permitir reintentar |
| **400** | Validación fallida (datos inválidos) | "❌ Los datos enviados son inválidos." | Mostrar form errors |
| **401** | Token expirado / no autenticado | "⚠️ Sesión expirada. Inicia sesión de nuevo." | Redirigir a /login |
| **403** | Permisos insuficientes | "🔒 No tienes permiso para acceder." | Mostrar mensaje |
| **404** | Recurso no encontrado | "🔍 El recurso solicitado no fue encontrado." | Volver a lista |
| **409** | Conflicto (duplicado, etc.) | "⚠️ Ya existe un registro con esos datos." | Permitir editar existente |
| **5xx** | Error del servidor | "🔴 El servidor no está disponible. Intenta más tarde." | Permitir reintentar |

---

### Resumen: Documentación de API en ORGMedi

✅ **Catálogo**: 14 endpoints documentados con método, URL, descripción y servicio
✅ **Interfaces**: 13+ interfaces para medicamentos, auth, usuarios y errores
✅ **Errores**: 3 capas (interceptor → servicio → componente) + 7 status codes mapeados
✅ **Flujo visual**: Diagrama ASCII mostrando todo el pipeline de una petición

Esta documentación sirve como:
- 📖 **Referencia rápida** para desarrolladores
- 🔧 **Guía de integración** para APIs nuevas
- 🐛 **Debugging**: Entender dónde falla una petición
- ✅ **Testing**: Casos de prueba para cada endpoint y error

---

---

## Tarea 5 — Estados de Carga y Error

La gestión de estados de carga, error, datos vacíos y éxito es crucial para proporcionar una experiencia de usuario fluida. Este documento define el patrón unificado de estado que debe seguirse en todos los componentes de la aplicación.

### Patrón de Estado Unificado

En lugar de mantener múltiples propiedades booleanas (`isLoading`, `hasError`, `isEmpty`), usamos un **objeto de estado único** que centraliza:

- `loading`: boolean (petición en curso)
- `error`: string | null (mensaje de error)
- `data`: T | null (datos cargados, null = no cargado, [] = vacío)
- `success`: boolean (opcional, para feedback visual de operaciones)

#### Ventajas

| Ventaja | Descripción |
|---------|-------------|
| **Claridad** | Todos los estados están en un único lugar |
| **Mutabilidad** | Más fácil de actualizar con `signal.update()` |
| **Prevención de estados inválidos** | No puedes tener loading=true AND error=true simultáneamente |
| **Reutilización** | Patrón consistente en toda la aplicación |

#### Implementación con Signals

```typescript
// src/app/pages/medicines/medicines.ts

import { Component, inject, signal } from '@angular/core';
import { MedicineService } from '../../data/medicine.service';
import { MedicineViewModel } from '../../data/models/medicine.model';

@Component({
  selector: 'app-medicines-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './medicines.html',
  styleUrls: ['./medicines.scss']
})
export class MedicinesPage {
  private medicineService = inject(MedicineService);

  // Estado unificado
  state = signal<{
    loading: boolean;
    error: string | null;
    data: MedicineViewModel[] | null;
    success: boolean;
  }>({
    loading: false,
    error: null,
    data: null,
    success: false
  });

  constructor() {
    this.loadMedicines();
  }

  loadMedicines(): void {
    // Iniciar carga
    this.state.update(current => ({
      ...current,
      loading: true,
      error: null
    }));

    this.medicineService.getAll().subscribe({
      next: (medicines) => {
        // Éxito
        this.state.update(() => ({
          loading: false,
          error: null,
          data: medicines,
          success: true
        }));
      },
      error: (err) => {
        // Error
        this.state.update(() => ({
          loading: false,
          error: err.message || 'Error al cargar medicamentos',
          data: null,
          success: false
        }));
      }
    });
  }
}
```

---

### Loading State

El estado de carga (`loading: true`) se muestra mientras la petición está en curso.

#### En el Componente

```typescript
loadMedicines(): void {
  this.state.update(current => ({
    ...current,
    loading: true,
    error: null,
    success: false
  }));

  this.medicineService.getAll().subscribe({
    next: (medicines) => {
      this.state.update(current => ({
        ...current,
        loading: false,
        data: medicines
      }));
    },
    error: (err) => {
      this.state.update(current => ({
        ...current,
        loading: false,
        error: err.message
      }));
    }
  });
}
```

#### En la Plantilla

```html
<!-- Indicador de carga -->
<div *ngIf="state().loading" class="loading-container">
  <div class="spinner"></div>
  <p class="loading-text">Cargando medicamentos...</p>
</div>

<!-- Contenido principal (oculto durante carga) -->
<div *ngIf="!state().loading" class="medicines-content">
  <!-- Ver secciones de error, empty y data -->
</div>
```

#### CSS para el Spinner

```scss
// src/app/styles/components/_loading.scss

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  gap: 1rem;

  .spinner {
    width: 3rem;
    height: 3rem;
    border: 4px solid rgba(66, 103, 178, 0.2);
    border-top-color: $color-primary;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .loading-text {
    font-size: $font-size-md;
    color: $color-text-secondary;
    font-weight: $font-weight-medium;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
```

---

### Error State con Reintentos

Cuando ocurre un error (`error: string | null`), mostramos un mensaje claro con un botón para reintentar.

#### En el Componente

```typescript
retryLoad(): void {
  this.loadMedicines();  // Reiniciar la carga
}

clearError(): void {
  this.state.update(current => ({
    ...current,
    error: null
  }));
}
```

#### En la Plantilla

```html
<!-- Error State (mostrar solo si hay error y no está cargando) -->
<div 
  *ngIf="state().error && !state().loading" 
  class="error-container"
  role="alert"
>
  <div class="error-icon">⚠️</div>
  <div class="error-content">
    <h3 class="error-title">Error al cargar medicamentos</h3>
    <p class="error-message">{{ state().error }}</p>
  </div>
  <div class="error-actions">
    <button 
      (click)="retryLoad()" 
      class="btn btn--primary"
    >
      🔄 Reintentar
    </button>
    <button 
      (click)="clearError()" 
      class="btn btn--secondary"
    >
      Descartar
    </button>
  </div>
</div>
```

#### CSS para el Error

```scss
// src/app/styles/components/_error.scss

.error-container {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  margin: 1rem 0;
  background-color: $color-error-bg;
  border-left: 4px solid $color-error;
  border-radius: $border-radius-md;
  align-items: flex-start;

  .error-icon {
    font-size: 1.5rem;
    flex-shrink: 0;
  }

  .error-content {
    flex: 1;

    .error-title {
      margin: 0 0 0.5rem 0;
      color: $color-error;
      font-size: $font-size-lg;
      font-weight: $font-weight-bold;
    }

    .error-message {
      margin: 0;
      color: $color-text-secondary;
      font-size: $font-size-sm;
    }
  }

  .error-actions {
    display: flex;
    gap: 0.5rem;
    flex-shrink: 0;
  }
}
```

#### Diferenciación de Errores

Según el tipo de error, mostrar mensajes más específicos:

```typescript
private getErrorMessage(error: any): string {
  if (error.status === 401) {
    return 'No estás autenticado. Por favor, inicia sesión.';
  } else if (error.status === 403) {
    return 'No tienes permiso para acceder a estos datos.';
  } else if (error.status === 404) {
    return 'Los medicamentos no encontrados.';
  } else if (error.status === 500 || error.status === 503) {
    return 'El servidor no está disponible. Intenta más tarde.';
  } else if (error.message?.includes('timeout')) {
    return 'La petición tardó demasiado. Intenta de nuevo.';
  } else {
    return 'Ocurrió un error desconocido. Por favor, intenta de nuevo.';
  }
}

loadMedicines(): void {
  this.state.update(current => ({
    ...current,
    loading: true,
    error: null
  }));

  this.medicineService.getAll().subscribe({
    next: (medicines) => {
      this.state.update(current => ({
        ...current,
        loading: false,
        data: medicines,
        success: true
      }));
    },
    error: (err) => {
      const errorMessage = this.getErrorMessage(err);
      this.state.update(current => ({
        ...current,
        loading: false,
        error: errorMessage,
        success: false
      }));
    }
  });
}
```

---

### Empty State

Cuando la petición se completa pero devuelve datos vacíos (`data: []`), mostramos un estado vacío amigable.

#### Diferenciación: null vs []

```typescript
// null: No se ha cargado nada aún (o se está cargando)
state.data === null  // → No mostrar nada o mostrar skeleton

// []: Se cargó pero está vacío
state.data?.length === 0  // → Mostrar empty state con CTA
```

#### En la Plantilla

```html
<!-- Contenido cargado correctamente -->
<div *ngIf="!state().loading && !state().error && state().data as medicines">
  <!-- Si hay datos -->
  <div *ngIf="medicines.length > 0" class="medicines-grid">
    <div *ngFor="let medicine of medicines" class="medicine-card">
      <h3 class="medicine-card__title">{{ medicine.name }}</h3>
      <p class="medicine-card__dosage">{{ medicine.dosage }}</p>
      <p class="medicine-card__status">{{ medicine.expirationStatus }}</p>
      <button (click)="editMedicine(medicine.id)" class="btn btn--small">
        Editar
      </button>
    </div>
  </div>

  <!-- Si está vacío -->
  <div *ngIf="medicines.length === 0" class="empty-state">
    <div class="empty-state__icon">💊</div>
    <h3 class="empty-state__title">No hay medicamentos</h3>
    <p class="empty-state__message">
      Aún no has registrado ningún medicamento. Comienza agregando uno.
    </p>
    <button 
      (click)="createMedicine()" 
      class="btn btn--primary"
    >
      ➕ Agregar Medicamento
    </button>
  </div>
</div>
```

#### CSS para Empty State

```scss
// src/app/styles/components/_empty-state.scss

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  color: $color-text-secondary;
  background-color: $color-neutral-bg;
  border-radius: $border-radius-md;
  border: 2px dashed $color-border;

  .empty-state__icon {
    font-size: 4rem;
    margin-bottom: 1rem;
    opacity: 0.7;
  }

  .empty-state__title {
    margin: 0 0 0.5rem 0;
    font-size: $font-size-lg;
    font-weight: $font-weight-bold;
    color: $color-text-primary;
  }

  .empty-state__message {
    margin: 0 0 1.5rem 0;
    font-size: $font-size-sm;
    max-width: 300px;
  }

  button {
    margin-top: 1rem;
  }
}
```

---

### Success Feedback

Para operaciones de escritura (POST, PUT, DELETE), proporcionamos feedback visual de éxito.

#### Patrón para Crear/Editar

```typescript
// src/app/pages/create-medicine/create-medicine.ts

@Component({...})
export class CreateMedicinePage {
  private medicineService = inject(MedicineService);
  private router = inject(Router);
  private toastService = inject(ToastService);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    dosage: ['', Validators.required],
    frequency: ['', Validators.required],
    startDate: ['', Validators.required]
  });

  isSaving = signal(false);
  saveSuccess = signal(false);

  saveMedicine(): void {
    if (this.form.invalid) return;

    this.isSaving.set(true);
    this.saveSuccess.set(false);

    this.medicineService.create(this.form.value).subscribe({
      next: (createdMedicine) => {
        this.isSaving.set(false);
        this.saveSuccess.set(true);

        // Toast de éxito
        this.toastService.success(
          `Medicamento "${createdMedicine.name}" creado correctamente`
        );

        // Redirigir después de 2 segundos
        setTimeout(() => {
          this.router.navigate(['/medicines', createdMedicine.id]);
        }, 2000);
      },
      error: (err) => {
        this.isSaving.set(false);
        this.saveSuccess.set(false);

        // Toast de error
        this.toastService.error(
          err.message || 'No se pudo crear el medicamento'
        );
      }
    });
  }
}
```

#### En la Plantilla

```html
<form [formGroup]="form" (ngSubmit)="saveMedicine()" class="form">
  <!-- Campo nombre -->
  <div class="form-group">
    <label for="name">Nombre del Medicamento *</label>
    <input
      id="name"
      type="text"
      formControlName="name"
      placeholder="Ej: Ibuprofen 200mg"
      class="input"
    />
    <small class="form-error" *ngIf="form.get('name')?.errors?.['required']">
      Campo requerido
    </small>
  </div>

  <!-- Más campos... -->

  <!-- Mensaje de éxito -->
  <div *ngIf="saveSuccess()" class="success-message">
    ✅ Medicamento guardado. Redirigiendo...
  </div>

  <!-- Botón guardar -->
  <button
    type="submit"
    [disabled]="form.invalid || isSaving()"
    class="btn btn--primary btn--lg"
  >
    {{ isSaving() ? 'Guardando...' : 'Guardar Medicamento' }}
  </button>
</form>
```

#### CSS para Success Message

```scss
// src/app/styles/components/_success.scss

.success-message {
  padding: 1rem;
  margin: 1rem 0;
  background-color: $color-success-bg;
  border-left: 4px solid $color-success;
  border-radius: $border-radius-md;
  color: $color-success;
  font-weight: $font-weight-medium;
  animation: slideInUp 0.3s ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(1rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

#### Patrón para Eliminar

```typescript
deleteMedicine(medicine: MedicineViewModel): void {
  const confirmed = confirm(
    `¿Estás seguro de que quieres eliminar "${medicine.name}"?`
  );

  if (!confirmed) return;

  this.isDeleting.set(true);

  this.medicineService.delete(medicine.id).subscribe({
    next: () => {
      this.isDeleting.set(false);

      // Toast de éxito
      this.toastService.success(
        `Medicamento "${medicine.name}" eliminado correctamente`
      );

      // Recargar lista
      this.loadMedicines();
    },
    error: (err) => {
      this.isDeleting.set(false);

      // Toast de error
      this.toastService.error(
        'No se pudo eliminar el medicamento. Intenta de nuevo.'
      );

      console.error('Error al eliminar:', err);
    }
  });
}
```

---

### Resumen: Estados en ORGMedi

| Estado | Condición | Muestra |
|--------|-----------|---------|
| **Loading** | `state.loading === true` | Spinner + mensaje "Cargando..." |
| **Error** | `state.error !== null && !state.loading` | Alert con mensaje + botón reintentar |
| **Empty** | `state.data?.length === 0` | Empty state con CTA (ej: "Agregar medicamento") |
| **Content** | `state.data && state.data.length > 0` | Grid/tabla con datos |
| **Success** | Post/Put/Delete exitoso | Toast + navegación o recarga |

Esta estructura garantiza que:

✅ Todos los estados son manejados explícitamente
✅ No hay estados inválidos (loading + error simultáneamente)
✅ El usuario siempre ve algo (loading, error, empty, o content)
✅ Hay siempre una forma de recuperarse (reintentar, agregar, etc.)








