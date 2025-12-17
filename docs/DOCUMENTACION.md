# DOCUMENTACION - Diseño y Sistema de UI

## 3 - Sistema de componentes UI (Fase 3)

Entrega: 18 de diciembre

Esta sección documenta el sistema de componentes UI creado en la Fase 3: botones, cards, elementos de formulario, navegación responsive y elementos de feedback. Incluye la nomenclatura BEM utilizada, ejemplos de uso y capturas de la página de Style Guide.

### 3.1 Componentes implementados

- app-button
  - Propósito: componente de botón reutilizable con variantes y tamaños.
  - Variantes: `--primary`, `--secondary`, `--ghost`, `--danger`.
  - Tamaños: `--sm`, `--md`, `--lg`.
  - Estados: hover, focus, active, disabled.
  - Ejemplo de uso:

```html
<app-button variant="primary" size="md">Enviar</app-button>
```

- app-card
  - Propósito: tarjeta de contenido con imagen, título, descripción y acciones.
  - Variantes: básica, horizontal (imagen a la izquierda).
  - Estados: hover (elevación / sombra).
  - Ejemplo:

```html
<app-card title="Título" description="Descripción corta." image="/assets/foo.jpg">
  <div class="card-actions">
    <app-button variant="primary">Acción</app-button>
  </div>
</app-card>
```

- app-form-textarea
  - Propósito: campo textarea con label.
  - Variantes: n/a
  - Ejemplo:

```html
<app-form-textarea label="Mensaje" placeholder="Escribe..."></app-form-textarea>
```

- app-form-select
  - Propósito: select con label y opciones.
  - Ejemplo:

```html
<app-form-select label="Opciones" [options]="[{value:1,label:'Uno'},{value:2,label:'Dos'}]"></app-form-select>
```

- app-alert
  - Propósito: alert / mensaje de feedback con variantes por tipo.
  - Variantes: `--success`, `--error`, `--warning`, `--info`.
  - Puede cerrarse con el botón X.
  - Ejemplo:

```html
<app-alert type="success">Operación completada.</app-alert>
```

### 3.2 Nomenclatura y metodología (BEM)

Se usa BEM para las clases de los componentes:
- Block: `.app-button`, `.app-card`, `.app-alert`.
- Elementos: `.app-card__image`, `.app-card__content`, `.app-card__title`.
- Modificadores: `.app-button--primary`, `.app-button--sm`, `.alert--success`.

Estrategia:
- Usar modificadores (`--`) para variantes visuales y tamaños.
- Evitar clases utilitarias en los componentes; exponer inputs/props al componente para cambiar su comportamiento.

### 3.3 Style Guide

Se creó una página accesible en `/style-guide` que muestra todos los componentes y sus variantes. Añade capturas de pantalla aquí cuando las tengas.

Incluir capturas:
- docs/style-guide-1.png — vista de colores y tipografías.
- docs/style-guide-2.png — botones y estados.

Para generar las capturas: abre http://localhost:4200/style-guide y realiza screenshots de la página completa y de secciones.

---

Si quieres que complete esta documentación con capturas automáticas o con ejemplos de código más detallados, dime y lo añado.

