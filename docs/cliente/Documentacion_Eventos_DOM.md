# Documentación de Eventos y Manipulación del DOM en ORGMedi

## Tabla de Contenidos
1. [Arquitectura de Eventos](#arquitectura-de-eventos)
2. [Manipulación del DOM](#manipulación-del-dom)
3. [Componentes Interactivos](#componentes-interactivos)
4. [Theme Switcher](#theme-switcher)
5. [Diagrama de Flujo](#diagrama-de-flujo)
6. [Compatibilidad de Navegadores](#compatibilidad-de-navegadores)
7. [Buenas Prácticas](#buenas-prácticas)

---

## Arquitectura de Eventos

### 1. Sistema de Eventos en Angular

La arquitectura de eventos en ORGMedi sigue el **patrón unidireccional de datos** de Angular, utilizando event binding nativo del DOM adaptado a componentes standalone.

#### Características Principales:

- **Event Binding**: Sintaxis `(eventName)="handler($event)"` en templates
- **$event**: Objeto nativo del evento (MouseEvent, KeyboardEvent, etc.)
- **Zone.js**: Detección automática de cambios sin necesidad de @NgZone
- **Pseudoeventos**: `(keyup.enter)`, `(click.alt)`, etc. para filtrar eventos específicos

#### Ejemplo Básico:

```typescript
// Componente TypeScript
export class MedicineCardComponent {
  onDeleteMedicine(medicineId: string) {
    console.log('Eliminar medicamento:', medicineId);
  }
}
```

```html
<!-- Template HTML -->
<button (click)="onDeleteMedicine(medicine.id)">
  Eliminar
</button>
```

### 2. Tipos de Eventos Soportados

#### Eventos de Teclado:
```html
<input 
  (keydown)="onKeyDown($event)"
  (keyup)="onKeyUp($event)"
  (keyup.enter)="onEnter()"
  (keyup.escape)="onEscape()"
/>
```

#### Eventos de Mouse:
```html
<div
  (click)="onClick($event)"
  (dblclick)="onDoubleClick($event)"
  (mouseenter)="onMouseEnter()"
  (mouseleave)="onMouseLeave()"
/>
```

#### Eventos de Focus/Blur:
```html
<input
  (focus)="onFocus()"
  (blur)="onBlur()"
/>
```

#### Eventos de Formulario:
```html
<form (submit)="onSubmit($event)">
  <input (change)="onChange($event)">
</form>
```

### 3. Prevenir Comportamientos por Defecto

```typescript
export class FormComponent {
  onSubmit(event: Event) {
    event.preventDefault(); // Previene recarga de página
    console.log('Formulario enviado sin recarga');
  }

  onContextMenu(event: MouseEvent) {
    event.preventDefault(); // Previene menú contextual
  }
}
```

### 4. Propagar o Detener Propagación

```typescript
export class MenuComponent {
  onClick(event: MouseEvent) {
    // Detiene que el evento llegue a elementos padres
    event.stopPropagation();
    console.log('Click manejado sin burbuja');
  }

  onNestedClick(event: MouseEvent) {
    // Previene tanto la acción por defecto como la propagación
    event.preventDefault();
    event.stopPropagation();
  }
}
```

---

## Manipulación del DOM

### 1. Acceder a Elementos con ViewChild y ElementRef

```typescript
import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-example',
  template: `<div #myDiv>Contenido inicial</div>`
})
export class ExampleComponent implements AfterViewInit {
  @ViewChild('myDiv', { static: false }) myDiv!: ElementRef<HTMLDivElement>;

  ngAfterViewInit() {
    // Acceder al elemento nativo del DOM
    const element = this.myDiv.nativeElement;
    console.log(element.textContent);
  }
}
```

**Puntos Clave:**
- `@ViewChild`: Accede al elemento referenciado con `#`
- `ElementRef`: Envuelve la referencia nativa del DOM
- `AfterViewInit`: Hook que se ejecuta después de renderizar el template
- `{ static: false }`: El elemento no está disponible en `OnInit`

### 2. Modificar Propiedades y Estilos con Renderer2

```typescript
import { Component, ViewChild, ElementRef, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-example',
  template: `
    <div #myDiv>Contenido</div>
    <button (click)="changeStyle()">Cambiar</button>
  `
})
export class ExampleComponent {
  @ViewChild('myDiv', { static: false }) myDiv!: ElementRef;

  constructor(private renderer: Renderer2) {}

  changeStyle() {
    // Cambiar estilos - Forma SEGURA y compatible
    this.renderer.setStyle(this.myDiv.nativeElement, 'color', 'red');
    this.renderer.setStyle(this.myDiv.nativeElement, 'fontSize', '20px');
  }

  changeProperty() {
    // Cambiar propiedades HTML
    this.renderer.setProperty(this.myDiv.nativeElement, 'textContent', 'Texto modificado');
  }

  toggleClass() {
    // Agregar/remover clases
    this.renderer.addClass(this.myDiv.nativeElement, 'active');
    this.renderer.removeClass(this.myDiv.nativeElement, 'inactive');
  }
}
```

**Métodos principales de Renderer2:**
- `setStyle(element, property, value)`: Modifica estilos CSS
- `setProperty(element, property, value)`: Modifica propiedades HTML
- `addClass(element, className)`: Agrega una clase
- `removeClass(element, className)`: Remueve una clase
- `setAttribute(element, attribute, value)`: Establece atributos
- `removeAttribute(element, attribute)`: Remueve atributos

### 3. Crear y Eliminar Elementos Dinámicamente

```typescript
import { Component, ViewChild, ElementRef, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-dynamic-list',
  template: `
    <div #container></div>
    <button (click)="addItem()">Agregar</button>
    <button (click)="removeItem()">Eliminar</button>
  `
})
export class DynamicListComponent {
  @ViewChild('container', { static: false }) container!: ElementRef;
  private itemCount = 0;

  constructor(private renderer: Renderer2) {}

  addItem() {
    this.itemCount++;
    const newDiv = this.renderer.createElement('div');
    this.renderer.setProperty(newDiv, 'textContent', `Item ${this.itemCount}`);
    this.renderer.setStyle(newDiv, 'padding', '10px');
    this.renderer.setStyle(newDiv, 'marginBottom', '5px');
    this.renderer.setStyle(newDiv, 'backgroundColor', '#f0f0f0');
    
    this.renderer.appendChild(this.container.nativeElement, newDiv);
  }

  removeItem() {
    const lastChild = this.container.nativeElement.lastChild;
    if (lastChild) {
      this.renderer.removeChild(this.container.nativeElement, lastChild);
      this.itemCount--;
    }
  }

  clearAll() {
    const element = this.container.nativeElement;
    while (element.firstChild) {
      this.renderer.removeChild(element, element.firstChild);
    }
    this.itemCount = 0;
  }
}
```

**Métodos para manipulación dinámica:**
- `createElement(tagName)`: Crea un elemento HTML
- `appendChild(parent, child)`: Inserta un elemento como hijo
- `removeChild(parent, child)`: Elimina un elemento hijo
- `insertBefore(parent, newNode, referenceNode)`: Inserta antes de un elemento
- `createText(text)`: Crea un nodo de texto

---

## Componentes Interactivos

### 1. Menú Hamburguesa

**Archivo:** `header.component.ts`

```typescript
export class Header implements OnInit, OnDestroy {
  isOpen = false;

  @ViewChild('menuButton') menuButton?: ElementRef<HTMLButtonElement>;
  @ViewChild('navMenu') navMenu?: ElementRef<HTMLElement>;

  toggleMenu() {
    this.isOpen = !this.isOpen;
    // Focus en el primer elemento del menú cuando se abre
    if (this.isOpen && this.navMenu) {
      setTimeout(() => {
        const firstItem = this.navMenu?.nativeElement.querySelector('.app-header__pill');
        (firstItem as HTMLElement)?.focus();
      }, 100);
    }
  }

  closeMenu() {
    this.isOpen = false;
    // Return focus al botón del menú
    if (this.menuButton) {
      this.menuButton.nativeElement.focus();
    }
  }

  // Cierra el menú al hacer click fuera
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    const clickedInside = this.elementRef.nativeElement.contains(target);
    if (!clickedInside && this.isOpen) {
      this.closeMenu();
    }
  }

  // Cierra el menú con la tecla ESC
  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: Event) {
    if (this.isOpen) {
      (event as KeyboardEvent).preventDefault();
      this.closeMenu();
    }
  }
}
```

**HTML:**
```html
<button 
  (click)="toggleMenu()"
  [attr.aria-expanded]="isOpen"
  [attr.aria-controls]="'nav-menu'"
  #menuButton
>
  ≡
</button>

<nav 
  [class.is-open]="isOpen"
  #navMenu
  id="nav-menu"
>
  <a href="/medicamentos" class="app-header__pill">Medicamentos</a>
  <a href="/perfil" class="app-header__pill">Perfil</a>
  <a href="/calendario" class="app-header__pill">Calendario</a>
</nav>
```

### 2. Modal (Diálogo Interactivo)

**Archivo:** `modal.component.ts`

```typescript
export class ModalComponent {
  @Input() isOpen = false;
  @Input() title = '';
  @Input() closable = true;
  @Output() close = new EventEmitter<void>();

  @ViewChild('modalContent') modalContent?: ElementRef;

  closeModal() {
    this.isOpen = false;
    this.close.emit();
  }

  // Cierra al hacer click en el fondo oscuro
  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget && this.closable) {
      this.closeModal();
    }
  }

  // Cierra con ESC
  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: KeyboardEvent) {
    if (this.isOpen && this.closable) {
      event.preventDefault();
      this.closeModal();
    }
  }

  // Previene que clicks dentro del modal lo cierren
  onModalClick(event: MouseEvent) {
    event.stopPropagation();
  }
}
```

### 3. Tabs (Pestañas)

**Archivo:** `tabs.component.ts`

```typescript
export class TabsComponent {
  @Input() tabs: Tab[] = [];
  @Input() activeTabId: string = '';
  @Output() tabChange = new EventEmitter<string>();

  selectTab(tabId: string) {
    const tab = this.tabs.find(t => t.id === tabId);
    if (tab && !tab.disabled) {
      this.activeTabId = tabId;
      this.tabChange.emit(tabId);
    }
  }

  isActive(tabId: string): boolean {
    return this.activeTabId === tabId;
  }
}
```

**HTML:**
```html
<div class="tabs">
  <div class="tabs__header" role="tablist">
    <button
      *ngFor="let tab of tabs"
      [class.tabs__tab--active]="isActive(tab.id)"
      [disabled]="tab.disabled"
      [attr.aria-selected]="isActive(tab.id)"
      role="tab"
      (click)="selectTab(tab.id)"
    >
      {{ tab.label }}
    </button>
  </div>
  <div class="tabs__content">
    <ng-content></ng-content>
  </div>
</div>
```

### 4. Tooltips

**Archivo:** `tooltip.component.ts`

```typescript
export class TooltipComponent {
  @Input() text = '';
  @Input() position: 'top' | 'bottom' | 'left' | 'right' = 'top';
  
  showTooltip = false;

  @HostListener('mouseenter')
  onMouseEnter() {
    this.showTooltip = true;
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    this.showTooltip = false;
  }

  @HostListener('focus')
  onFocus() {
    this.showTooltip = true;
  }

  @HostListener('blur')
  onBlur() {
    this.showTooltip = false;
  }
}
```

### 5. Acordeón

**Archivo:** `accordion.component.ts`

```typescript
export class AccordionComponent {
  @Input() items: AccordionItem[] = [];
  @Input() allowMultiple = false;

  expandedItems: Set<string> = new Set();

  toggleItem(itemId: string) {
    if (!this.allowMultiple) {
      this.expandedItems.clear();
    }

    if (this.expandedItems.has(itemId)) {
      this.expandedItems.delete(itemId);
    } else {
      this.expandedItems.add(itemId);
    }
  }

  isExpanded(itemId: string): boolean {
    return this.expandedItems.has(itemId);
  }
}
```

---

## Theme Switcher

### 1. Servicio de Tema

**Archivo:** `theme.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private themeSubject = new BehaviorSubject<'light' | 'dark'>(this.getInitialTheme());
  public theme$ = this.themeSubject.asObservable();

  constructor() {
    this.applyTheme(this.themeSubject.value);
  }

  private getInitialTheme(): 'light' | 'dark' {
    // 1. Leer preferencia guardada
    const saved = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (saved) return saved;

    // 2. Si no hay preferencia, usar la del sistema
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  }

  toggleTheme() {
    const newTheme = this.themeSubject.value === 'light' ? 'dark' : 'light';
    this.themeSubject.next(newTheme);
    this.applyTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  }

  private applyTheme(theme: 'light' | 'dark') {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
  }

  getCurrentTheme(): 'light' | 'dark' {
    return this.themeSubject.value;
  }
}
```

### 2. Theme Switcher en el Header

```typescript
export class Header {
  isDarkMode = false;

  constructor(private themeService: ThemeService) {}

  ngOnInit() {
    this.themeService.theme$.subscribe(theme => {
      this.isDarkMode = theme === 'dark';
    });
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }
}
```

### 3. Detectar Cambios de Preferencia del Sistema

```typescript
constructor() {
  // Detectar cambios en la preferencia del sistema
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      const theme = e.matches ? 'dark' : 'light';
      this.themeSubject.next(theme);
      this.applyTheme(theme);
    }
  });
}
```

---

## Diagrama de Flujo

### Flujo General de Eventos

```
Usuario (Interacción)
    ↓
DOM Event (click, keydown, focus, etc.)
    ↓
Template Binding (event)="handler($event)"
    ↓
Component Handler (método del componente)
    ↓
Service/State Update (RxJS, Signals)
    ↓
View Re-render (Change Detection)
```

### Ejemplo Completo: Eliminar Medicamento

```
Usuario hace click en botón "Eliminar"
    ↓
(click)="deleteMedicine(id)" se dispara
    ↓
deleteMedicine(id) en el componente
    ↓
Service.removeMedicine(id) - Llamada a la API
    ↓
Actualizar lista local de medicamentos
    ↓
Angular detecta cambios y re-renderiza
    ↓
UI actualizada sin medicamento
```

### Menú Hamburguesa - Flujo de Cierre

```
Usuario hace click fuera del menú
    ↓
@HostListener('document:click', ['$event']) se dispara
    ↓
Verificar si el click fue fuera del header
    ↓
Si es fuera: closeMenu()
    ↓
isOpen = false
    ↓
Template actualiza [class.is-open]="isOpen"
    ↓
Menú se cierra con animación
```

---

## Compatibilidad de Navegadores

### Tabla de Compatibilidad

| Evento | Chrome | Firefox | Safari | Edge | IE11 |
|--------|--------|---------|--------|------|------|
| click | ✅ | ✅ | ✅ | ✅ | ✅ |
| keydown | ✅ | ✅ | ✅ | ✅ | ✅ |
| keyup | ✅ | ✅ | ✅ | ✅ | ✅ |
| focus | ✅ | ✅ | ✅ | ✅ | ✅ |
| blur | ✅ | ✅ | ✅ | ✅ | ✅ |
| mouseenter | ✅ | ✅ | ✅ | ✅ | ⚠️ |
| mouseleave | ✅ | ✅ | ✅ | ✅ | ⚠️ |
| submit | ✅ | ✅ | ✅ | ✅ | ✅ |
| change | ✅ | ✅ | ✅ | ✅ | ✅ |
| input | ✅ | ✅ | ✅ | ✅ | ⚠️ |
| @HostListener | ✅ | ✅ | ✅ | ✅ | ✅ |
| Renderer2 | ✅ | ✅ | ✅ | ✅ | ✅ |
| ViewChild | ✅ | ✅ | ✅ | ✅ | ✅ |
| matchMedia | ✅ | ✅ | ✅ | ✅ | ⚠️ |
| localStorage | ✅ | ✅ | ✅ | ✅ | ⚠️ |

**Leyenda:**
- ✅ Totalmente soportado
- ⚠️ Soportado con limitaciones
- ❌ No soportado

---

## Buenas Prácticas

### 1. Siempre Usar Renderer2 para Modificaciones del DOM

❌ **INCORRECTO** - Acceso directo (no recomendado):
```typescript
this.myDiv.nativeElement.style.color = 'red';
this.myDiv.nativeElement.innerHTML = '<div>Contenido</div>';
```

✅ **CORRECTO** - Usar Renderer2:
```typescript
this.renderer.setStyle(this.myDiv.nativeElement, 'color', 'red');
this.renderer.setProperty(this.myDiv.nativeElement, 'textContent', 'Contenido');
```

### 2. Prevenir Memory Leaks

```typescript
export class MyComponent implements OnDestroy {
  private subscription?: Subscription;

  ngOnInit() {
    this.subscription = this.someService.subscribe(value => {
      // ...
    });
  }

  ngOnDestroy() {
    // Desuscribirse para evitar memory leaks
    this.subscription?.unsubscribe();
  }
}
```

### 3. Usar @HostListener para Eventos Globales

```typescript
@Component({
  selector: 'app-modal'
})
export class ModalComponent {
  // Escucha eventos a nivel de documento
  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: KeyboardEvent) {
    event.preventDefault();
    this.closeModal();
  }
}
```

### 4. Detener Propagación de Eventos Cuando sea Necesario

```typescript
// Evita que el click en el botón cierre el menú padre
onClick(event: MouseEvent) {
  event.stopPropagation();
  // lógica del botón...
}
```

### 5. Usar Pseudoeventos para Simplificar

```html
<!-- Pseudoeventos hacen el código más limpio -->
<input (keyup.enter)="onSubmit()" />
<button (click.alt)="onAltClick($event)" />
<input (keydown.ctrl.z)="onUndo()" />
```

### 6. Accesibilidad (a11y)

```html
<!-- Usar atributos ARIA para eventos importantes -->
<button
  [attr.aria-expanded]="isOpen"
  [attr.aria-controls]="'menu-id'"
  (click)="toggleMenu()"
>
  Menú
</button>

<nav id="menu-id" [hidden]="!isOpen">
  <!-- Contenido del menú -->
</nav>
```

### 7. Debouncing en Búsquedas

```typescript
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

export class SearchComponent implements OnInit {
  private searchSubject = new Subject<string>();

  ngOnInit() {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.performSearch(searchTerm);
    });
  }

  onSearchInput(event: Event) {
    const term = (event.target as HTMLInputElement).value;
    this.searchSubject.next(term);
  }
}
```

---

## Resumen de Componentes Interactivos

| Componente | Funcionalidad | Archivo |
|-----------|---------------|---------|
| **Header** | Menú hamburguesa, theme toggle | `header.component.ts` |
| **Modal** | Diálogo modal con ESC close | `modal.component.ts` |
| **Tabs** | Pestañas con navegación | `tabs.component.ts` |
| **Tooltip** | Información emergente | `tooltip.component.ts` |
| **Accordion** | Acordeón expandible | `accordion.component.ts` |
| **Medicine Card** | Card de medicamentos | `medicine-card.component.ts` |

Todos implementan:
- ✅ Event binding
- ✅ Manipulación segura del DOM con Renderer2
- ✅ Accesibilidad (ARIA)
- ✅ Tema claro/oscuro
- ✅ Responsive design
- ✅ Animaciones suaves


