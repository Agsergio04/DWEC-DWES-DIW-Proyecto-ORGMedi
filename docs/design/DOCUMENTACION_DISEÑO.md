# Proyecto Angular + Spring Boot: Documentación de Diseño



## Índice

- [Sección 1 : Arquitectura CSS y Comunicación Visual](#arquitectura-css-y-comunicación-visual)
  - [1.1 Principios de Comunicación Visual](#11-principios-de-comunicación-visual)
  - [1.2 Metodología CSS: BEM (Block Element Modifier)](#12-metodología-css-bem-block-element-modifier)
  - [1.3 Organización de Archivos: ITCSS](#13-organización-de-archivos-itcss)
  - [1.4 Sistema de Design Tokens](#14-sistema-de-design-tokens)
  - [1.5 Mixins y Funciones](#15-mixins-y-funciones)
  - [1.6 ViewEncapsulation en Angular](#16-viewencapsulation-en-angular)
  - [1.7 Sistema de Grid y Layout](#17-sistema-de-grid-y-layout)

- [Sección 2 : HTML semántico y estructura](#sección-2--html-semántico-y-estructura)
  - [2.1 Elementos semánticos utilizados](#21-elementos-semánticos-utilizados)
  - [2.2 Jerarquía de headings](#22-jerarquía-de-headings)
  - [2.3 Estructura de formularios](#23-estructura-de-formularios)

- [Sección 3 : Sistema de componentes UI (Fase 3)](#3---sistema-de-componentes-ui-fase-3)
  - [3.1 Componentes implementados](#31-componentes-implementados)
  - [3.2 Nomenclatura y metodología (BEM)](#32-nomenclatura-y-metodología-bem)
  - [3.3 Style Guide](#33-style-guide)

---

### Sección 1 :  Arquitectura CSS y Comunicación Visual

### 1.1 Principios de Comunicación Visual

La comunicación visual en ORGMedi se fundamenta en cinco principios clave que trabajan en conjunto para crear una interfaz intuitiva, accesible y coherente. Estos principios no son solo conceptos teóricos, sino decisiones prácticas implementadas en cada componente del sistema de diseño.

#### 1.1.1 Jerarquía

La **jerarquía visual** en ORGMedi se establece mediante la combinación estratégica de **tamaño, peso tipográfico y espaciado** para guiar la atención del usuario hacia los elementos más importantes.

**Aplicación en el proyecto:**

- **Tamaño tipográfico escalonado:** El sistema utiliza una escala tipográfica modular (escala 1.25):
  - Títulos principales (h1): `$font-size-4xl: 3.05rem` con font-weight bold
  - Subtítulos (h2): `$font-size-3xl: 2.44rem`
  - Etiquetas de campos (h4): `$font-size-xl: 1.56rem`
  - Texto body: `$font-size-md: 1rem`

- **Peso tipográfico progresivo:** Los encabezados usan `$font-weight-bold: 700` para enfatizar, mientras que el texto regular usa `400` o `500`.

- **Espaciado jerárquico:** Los elementos importantes tienen mayor espaciado alrededor (márgenes y padding), creando "respiro visual":
  - Secciones principales: `$espaciado-48: 3rem`
  - Elementos intermedios: `$espaciado-24: 1.5rem`
  - Elementos menores: `$espaciado-12: 0.75rem`

**Ejemplo visual en las pantallas de ORGMedi:**
- En la pantalla de **creación de pastilla**, el título "Introduce el nombre del medicamento" es más pequeño que el h1 global, pero más grande que el placeholder del input, creando una clara distinción de importancia.
- Los botones "Crear" y "Volver" tienen mayor peso visual (padding de `$espaciado-12 $espaciado-24`) que los inputs, indicando que son acciones principales.

#### 1.1.2 Contraste

El **contraste** en ORGMedi se crea mediante tres dimensiones: **color, tamaño y peso**, permitiendo diferenciar claramente elementos interactivos, estados activos e información crítica.

**Aplicación en el proyecto:**

- **Contraste cromático:** Se utilizan colores primarios y secundarios bien definidos:
  - **Color primario (Rosa):** `$color-primario-primary: #E177B5` para acciones principales
  - **Color secundario (Morado oscuro):** `$color-secundario-primary: #99397C` para títulos y énfasis
  - **Color terciario (Verde claro):** `$color-terciario-primary: #F4F8DF` como fondo principal
  - **Colores de variante:** Cian, amarillo, magenta, naranja y púrpura para diferenciar pastillas

- **Estados diferenciados mediante color:**
  - Hover: Tonos más claros de los colores (e.g., `$color-primario-hover: #F08EC7`)
  - Disabled: Versiones desaturadas (e.g., `$color-primario-disabled: #F6D5E8`)
  - Confirmación (verde): `$color-afirmacion-primary: #22FF00`
  - Negación (rojo): `$color-negacion-primary: #FF0202`

- **Contraste de tamaño:** Los botones de acción son visiblemente más grandes que los botones secundarios, con `$font-size-lg: 1.25rem` vs `$font-size-md: 1rem`.

**Ejemplo visual en las pantallas de ORGMedi:**
- En el **listado de pastillas**, cada pastilla tiene un color de fondo diferente (cian, amarillo, magenta, etc.) que indica su categoría o tipo de medicamento, creando contraste cromático inmediato.
- El botón "Editar" en cada pastilla usa `$color-primario-primary` (rosa) mientras que el fondo de la pastilla varía, creando contraste que guía al usuario.
- Los iconos de confirmación (✓ verde) y negación (✗ rojo) crean contraste emocional claramente diferenciado.

#### 1.1.3 Alineación

La **alineación** en ORGMedi sigue una estrategia **centrada con estructura grid**, proporcionando estabilidad visual y facilidad de escaneo. La aplicación utiliza dos enfoques complementarios:

**Aplicación en el proyecto:**

- **Alineación centrada:** Los formularios de creación de pastillas utilizan alineación central (`justify-content: center`) para crear una estructura simétrica y equilibrada.

- **Alineación de grid:** Los listados de pastillas utilizan un grid flexible (`grid-template-columns: repeat(auto-fit, minmax(240px, 1fr))`) que distribuye elementos equitativamente.

- **Alineación de flex:** Los elementos dentro de cápsulas usan flex con `align-items: center` y `justify-content: space-between` para mantener contenido alineado uniformemente.

**Estrategia SCSS utilizada:**

```scss
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  width: 100%;
}

.flex-row {
  display: flex;
  flex-direction: row;
  gap: 1.5rem;
}

.flex-col {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
```

**Ejemplo visual en las pantallas de ORGMedi:**
- En la **pantalla de home**, las pastillas programadas se alinean en un grid de una sola fila (horizontal) en modo mobile, mostrando claramente qué medicamentos se deben tomar en cada horario.
- Los inputs del formulario de creación se apilan verticalmente (`flex-col`), con alineación centrada en el contenedor padre.
- La barra de navegación superior con los días de la semana mantiene una alineación horizontal centrada con espacio uniforme entre elementos.

#### 1.1.4 Proximidad

La **proximidad** en ORGMedi agrupa elementos relacionados mediante **espaciado estratégico**, indicando qué elementos pertenecen juntos y cuáles son independientes.

**Aplicación en el proyecto:**

- **Agrupación de inputs relacionados:** Los campos de un formulario (nombre, cantidad, hora) están separados por `$espaciado-16` entre ellos, indicando que pertenecen al mismo grupo lógico.

- **Separación de secciones:** Las diferentes secciones de un formulario están separadas por `$espaciado-24` o `$espaciado-32`, indicando límites claros de funcionalidad.

- **Proximidad en listados:** Las pastillas dentro de un horario específico están agrupadas juntas (gap pequeño: `$espaciado-12`), mientras que diferentes horarios están más separados (gap mayor: `$espaciado-24`).

- **Cápsulas de medicamento:** La información del medicamento (nombre) y la acción (botón Editar) están próximos en la misma cápsula, indicando relación directa.

**Ejemplo visual en las pantallas de ORGMedi:**

- En la pantalla de **creación de pastilla**, hay un espaciado consistente entre inputs consecutivos (`$espaciado-16`), pero mayor espaciado (`$espaciado-24`) entre grupos lógicos como "Información básica" y "Configuración de horarios".

- En el **calendario de la pantalla home**, los días de la semana están próximos entre sí (gap pequeño), pero el título de la fecha está más distante, indicando que es un encabezado separado.

- En el **listado de medicamentos**, cada medicamento está en su propia "tarjeta" con espacio generoso alrededor (`gap: 1.5rem`), mejorando legibilidad y evitando confusión entre elementos.

#### 1.1.5 Repetición

La **repetición** en ORGMedi crea **coherencia visual y patrones reconocibles** mediante la reutilización consistente de componentes, colores, tipografías y estilos en toda la aplicación.

**Aplicación en el proyecto:**

- **Componentes reutilizables:** El sistema de design tokens asegura que botones, inputs, cápsulas y tarjetas mantengan estilos consistentes en toda la aplicación.

- **Colores repetidos:** El color primario rosa (`#E177B5`) se repite en botones principales, enlaces y elementos interactivos, creando una marca visual coherente.

- **Patrón de pastilla:** Cada medicamento, independientemente de dónde aparezca, siempre tiene la misma estructura: nombre + color + botón de acción.

- **Repetición tipográfica:** Los headers siempre usan `$font-secondary: 'Poltawski Nowy'`, mientras que el body text usa `$font-primary: 'Poppins'`, creando distinción clara y consistente.

- **Repetición de espaciado:** El gap de `$espaciado-16` se repite en múltiples contextos, creando armonía visual.

**Ejemplo visual en las pantallas de ORGMedi:**

- Cada **pastilla en el listado** repite la misma estructura: una cápsula con nombre de medicamento en blanco/texto oscuro, un color de fondo único, y un botón "Editar" en rosa. Esta repetición hace que la interfaz sea predecible y fácil de entender.

- Los **botones "Crear" y "Volver"** aparecen consistentemente en todos los formularios con el mismo estilo, tamaño y espaciado, reforzando el patrón.

- El **color verde de confirmación** (`#22FF00`) y **rojo de negación** (`#FF0202`) aparecen repetidamente en iconos de estado, creando un patrón reconocible que el usuario aprende rápidamente.

- La **barra de navegación superior** repite el mismo color terciario (`#F4F8DF`) en todas las pantallas, creando coherencia visual de navegación.

---

### 1.2 Metodología CSS: BEM (Block Element Modifier)

ORGMedi implementa **BEM (Block Element Modifier)** como metodología de nomenclatura CSS. BEM proporciona una estructura clara, escalable y mantenible para organizar estilos.

#### 1.2.1 Justificación de la elección de BEM

**BEM fue elegida por las siguientes razones:**

1. **Claridad estructural:** La notación `.block__element--modifier` explícitamente comunica la relación jerárquica entre componentes, facilitando el entendimiento rápido del código.

2. **Evita conflictos de nombres:** Al prefixar con el nombre del bloque, se eliminan colisiones de clases entre componentes diferentes.

3. **Reutilización:** La separación de bloques independientes permite crear componentes altamente reutilizables que no interfieren entre sí.

4. **Mantenibilidad en equipo:** En un proyecto colaborativo (como lo será una vez finalizado), BEM facilita que múltiples desarrolladores escriban CSS coherente sin conflictos.

5. **Compatibilidad con ITCSS:** BEM se complementa perfectamente con ITCSS, permitiendo escalabilidad a nivel de especificidad CSS.

#### 1.2.2 Estructura de nomenclatura en ORGMedi

El proyecto utiliza BEM de la siguiente manera:

**Bloques (Block):** Componentes independientes y reutilizables

```scss
.pastilla { /* Cápsula de medicamento */
  background-color: $color-primario-primary;
  border-radius: $radius-lg;
  padding: $espaciado-12 $espaciado-24;
}

.formulario-medicamento { /* Formulario de creación/edición */
  display: flex;
  flex-direction: column;
  gap: $espaciado-16;
}

.calendario { /* Selector de fechas */
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: $espaciado-8;
}
```

**Elementos (Element):** Partes del bloque que tienen significado solo dentro del contexto del bloque

```scss
.pastilla__nombre { /* Nombre dentro de la pastilla */
  font-size: $font-size-lg;
  font-weight: $font-weight-semibold;
  color: $color-texto_borde_cajas;
}

.pastilla__boton { /* Botón dentro de la pastilla */
  background-color: $color-primario-primary;
  border: none;
  cursor: pointer;
}

.formulario-medicamento__input { /* Input dentro del formulario */
  border: $border-thin solid $color-bordes_marco_botones;
  border-radius: $radius-md;
  padding: $espaciado-12;
}

.calendario__dia { /* Día individual dentro del calendario */
  background-color: $color-primario-primary;
  text-align: center;
  padding: $espaciado-8;
}
```

**Modificadores (Modifier):** Variaciones del bloque o elemento

```scss
.pastilla--featured { /* Pastilla destacada */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: scale(1.05);
}

.pastilla--completada { /* Pastilla marcada como completada */
  opacity: 0.6;
  text-decoration: line-through;
}

.pastilla__boton--eliminar { /* Botón de eliminar dentro de pastilla */
  background-color: $color-negacion-primary;
  
  &:hover {
    background-color: $color-negacion-hover;
  }
}

.formulario-medicamento--modo-oscuro { /* Formulario en tema oscuro */
  background-color: $color-secundario-dark;
  color: $color-texto_borde_cajas-dark;
}

.calendario__dia--activo { /* Día seleccionado */
  background-color: $color-secundario-primary;
  font-weight: $font-weight-bold;
}

.calendario__dia--deshabilitado { /* Día no disponible */
  opacity: 0.5;
  cursor: not-allowed;
}
```

#### 1.2.3 Ejemplos prácticos en archivos SCSS del proyecto

**Archivo de componente pastilla (hipotético):**

```scss
/* _pastilla.scss - Componente de cápsula de medicamento */

.pastilla {
  @include capsula-pastilla($color-primario-primary);
  position: relative;
  transition: all $transition-normal;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  }

  &__nombre {
    flex: 1;
    font-size: $font-size-lg;
    font-weight: $font-weight-semibold;
    color: $color-texto_borde_cajas;
  }

  &__boton {
    @include button-form(
      $bg: $color-primario-primary,
      $bg-hover: $color-primario-hover,
      $padding-x: $espaciado-16,
      $padding-y: $espaciado-8
    );
    margin-left: $espaciado-12;
    font-size: $font-size-md;
  }

  &--cian {
    @include capsula-pastilla($color-variante-primera);
  }

  &--amarillo {
    @include capsula-pastilla($color-variante-segunda);
  }

  &--magenta {
    @include capsula-pastilla($color-variante-tercera);
  }

  &--naranja {
    @include capsula-pastilla($color-variante-cuarta);
  }

  &--purpura {
    @include capsula-pastilla($color-variante-quinta);
  }

  &--completada {
    opacity: 0.7;
    
    &__nombre {
      text-decoration: line-through;
    }
  }
}
```

---

### 1.3 Organización de Archivos: ITCSS

ORGMedi implementa **ITCSS (Inverted Triangle CSS)**, una metodología que organiza archivos SCSS de **menor a mayor especificidad**, permitiendo una cascada controlada y predecible.

#### 1.3.1 Justificación de ITCSS

ITCSS fue elegida porque:

1. **Especificidad predecible:** Al organizar por especificidad ascendente, evitamos problemas de cascada CSS incontrolable.

2. **Fácil de mantener:** Saber dónde buscar cada tipo de estilo (variables, resets, componentes) ahorra tiempo de debugging.

3. **Escala sin conflictos:** Proyectos grandes pueden crecer sin que nuevos estilos rompan componentes existentes.

4. **Complementa BEM:** ITCSS + BEM es una combinación probada en proyectos empresariales.

#### 1.3.2 Estructura ITCSS completa en ORGMedi

```
src/
├── styles/
│   ├── 00-settings/
│   │   └── variables.scss          # Configuración: variables, colores, tipografía, breakpoints
│   │
│   ├── 01-tools/
│   │   └── mixins.scss             # Herramientas: mixins y funciones reutilizables
│   │
│   ├── 02-generic/
│   │   ├── reset.scss              # Normalize.css adaptado
│   │   └── elements.scss           # Helpers genéricos
│   │
│   ├── 03-elements/
│   │   └── base.scss               # Estilos base para elementos HTML (body, h1, p, a, etc.)
│   │
│   ├── 04-layout/
│   │   └── layout.scss             # Sistemas de grid y flex, contenedores principales
│   │
│   ├── 05-components/              # (Futuro)
│   │   ├── _pastilla.scss
│   │   ├── _boton.scss
│   │   ├── _formulario.scss
│   │   └── _calendario.scss
│   │
│   ├── 06-trumps/                  # (Futuro)
│   │   └── utilities.scss          # Utilidades y overrides necesarios (¡usarlas con moderación!)
│   │
│   └── styles.scss                 # Main entry point (importa todo en orden ITCSS)
```

#### 1.3.3 Explicación de cada nivel ITCSS

**Nivel 1: Settings (00-settings/)**
- **Responsabilidad:** Almacenar configuración global: variables, colores, tipografía, espaciado, breakpoints, transiciones.
- **Especificidad:** Ninguna (solo declaración de variables)
- **Impacto:** Afecta todo el proyecto; cambios aquí se propagan globalmente

**Nivel 2: Tools (01-tools/)**
- **Responsabilidad:** Mixins, funciones y helpers reutilizables que NO generan CSS por sí solos.
- **Especificidad:** Ninguna (se ejecutan cuando se incluyen)
- **Impacto:** Facilita consistencia y reduce duplicación de código

**Nivel 3: Generic (02-generic/)**
- **Responsabilidad:** Resets CSS, normalize, elementos sin clase específica.
- **Especificidad:** Baja (selectores de elemento tipo `*`, `html`, `body`)
- **Impacto:** Establece la base, resetea comportamientos del navegador

**Nivel 4: Elements (03-elements/)**
- **Responsabilidad:** Estilos base para elementos HTML puros (h1-h6, p, a, img, input, button)
- **Especificidad:** Baja (selectores de elemento)
- **Impacto:** Define cómo lucen los elementos sin clases

**Nivel 5: Layout (04-layout/)**
- **Responsabilidad:** Sistemas de grid, flex containers, layouts principales (.grid, .flex-row, .flex-col)
- **Especificidad:** Media (selectores de clase simple)
- **Impacto:** Estructura principal de la página

**Nivel 6: Components (05-components/) - Por implementar**
- **Responsabilidad:** Estilos de componentes reutilizables (pastilla, botón, formulario, calendario)
- **Especificidad:** Media (selectores BEM con clases)
- **Impacto:** Reutilizables en múltiples ubicaciones

**Nivel 7: Trumps (06-trumps/) - Por implementar**
- **Responsabilidad:** Utilidades y overrides cuando es absolutamente necesario (.text-center, !important overrides)
- **Especificidad:** Alta (puede incluir !important)
- **Impacto:** Excepciones controladas; usarlas solo cuando sea imprescindible

#### 1.3.4 Importación en orden ITCSS

El archivo `styles.scss` importa en orden ITCSS, garantizando que la cascada funcione correctamente:

```scss
/* styles.scss - Entry point principal */

/* Variables globales: colores, tipografías, breakpoints, etc. */
@use '00-settings/variables'; 

/* Mixins y funciones reutilizables de Sass */
@use '01-tools/mixins';    

/* Estilos genéricos y resets (normalize, helpers) */
@use '02-generic/reset'; 

/* Estilos para elementos HTML puros (body, h1, a, etc.) */
@use '03-elements/base';     

/* Estructuras de layout: grids, contenedores, etc. */
@use '04-layout/layout';

/* Componentes reutilizables (en construcción) */
/* @use '05-components/pastilla';
   @use '05-components/boton';
   @use '05-components/formulario';
   @use '05-components/calendario'; */

/* Utilidades y overrides finales (usar con moderación) */
/* @use '06-trumps/utilities'; */
```

---

### 1.4 Sistema de Design Tokens

Los Design Tokens en ORGMedi son variables SCSS predefinidas que centralizan todas las decisiones de diseño. Permiten cambiar estilos globalmente sin tocar componentes individuales.

#### 1.4.1 Tokens de Color

**Modo Claro (Light Mode):**

Los colores se organizan en categorías de uso:

**Primarios (Rosa - Acciones principales y énfasis):**
- `$color-primario-primary: #E177B5` - Color principal en botones, enlaces
- `$color-primario-hover: #F08EC7` - Estado hover, más claro
- `$color-primario-disabled: #F6D5E8` - Estado deshabilitado, muy claro

**Decisión de diseño:** Se eligió el rosa porque es un color que genera confianza y es accesible (contrasta bien con fondo claro). La escala de variaciones permite estados visuales claros.

**Secundarios (Morado - Títulos y énfasis secundario):**
- `$color-secundario-primary: #99397C` - Color para títulos h1-h6
- `$color-secundario-hover: #CB5FAA` - Hover más claro
- `$color-secundario-disabled: #CCB9C7` - Deshabilitado

**Decisión de diseño:** Complementa el rosa, creando jerarquía visual. Utilizado en headers para crear distinción clara.

**Terciarios (Verde claro - Fondos principales):**
- `$color-terciario-primary: #F4F8DF` - Color de fondo principal de la aplicación
- `$color-terciario-hover: #DCDFC9` - Hover para componentes sobre este fondo
- `$color-terciario-disabled: #FCFDF5` - Estado deshabilitado

**Decisión de diseño:** Verde muy claro, casi blanco, que no fatiga la vista. Proporciona contraste suficiente para texto oscuro pero mantiene legibilidad.

**Cuaternarios y Quintarios (Verdes - Énfasis y contexto):**
- `$color-cuaternario-primary: #B6E98F` - Verde manzana para énfasis
- `$color-quintario-primary: #A6CC88` - Verde más oscuro para variación

**Decisión de diseño:** Comunica "seguridad" y "naturaleza", apropiado para una app de medicamentos/salud.

**Estados semánticos:**
- `$color-afirmacion-primary: #22FF00` - Verde brillante para confirmaciones (✓)
- `$color-negacion-primary: #FF0202` - Rojo para negaciones/errores (✗)

**Decisión de diseño:** Colores de alto contraste que comunican intención inmediatamente (semáforo emocional).

**Variantes de pastilla (5 colores diferenciadores):**
- `$color-variante-primera: #00FFFB` - Cian (Ozempic)
- `$color-variante-segunda: #F2FF00` - Amarillo (Omeprazol)
- `$color-variante-tercera: #FF00C3` - Magenta (Amoxicilina)
- `$color-variante-cuarta: #FFAA00` - Naranja (Ibuprofeno)
- `$color-variante-quinta: #C200FD` - Púrpura (Paracetamol)

**Decisión de diseño:** Cada medicamento puede tener un color único, facilitando identificación rápida. Los colores son saturados y diferenciados entre sí.

**Modo Oscuro (Dark Mode):**

Los colores se invierten manteniendo la lógica de designación:

- Primarios dark: `$color-primario-dark: #A95988` (rosa desaturado para no cansar)
- Secundarios dark: `$color-secundario-dark: #441638` (morado muy oscuro)
- Terciarios dark: `$color-terciario-dark: #384F28` (verde oscuro como fondo)
- Variantes dark más saturadas para legibilidad

**Decisión de diseño:** El tema oscuro sigue la misma estructura lógica pero con valores invertidos, permitiendo que la lógica de uso sea idéntica.

**Colores estructurales:**
- `$color-bordes_marco_botones: #1F0A1A` (light) / `#EBA4CD` (dark) - Borde de elementos interactivos
- `$color-texto_borde_cajas: #3A4730` (light) / `#A4D281` (dark) - Texto en cajas y bordes

#### 1.4.2 Tokens Tipográficos

**Familias tipográficas elegidas:**

```scss
$font-primary: 'Poppins', sans-serif;         // Body text, clara y moderna
$font-secondary: 'Poltawski Nowy', serif;    // Títulos, elegante y diferenciada
```

**Decisión de diseño:** 
- `Poppins` es una sans-serif moderna, muy legible en pantallas, perfecta para aplicaciones médicas donde la claridad es crítica.
- `Poltawski Nowy` es una serif elegante que diferencia títulos del body, creando jerarquía tipográfica clara.

**Escala tipográfica (proporción 1.25 - Major Third):**

```scss
$font-size-xs:   0.64rem   (10.24px)
$font-size-sm:   0.8rem    (12.8px)
$font-size-md:   1rem      (16px)      // Base
$font-size-lg:   1.25rem   (20px)
$font-size-xl:   1.56rem   (24.96px)
$font-size-2xl:  1.95rem   (31.2px)
$font-size-3xl:  2.44rem   (39.04px)
$font-size-4xl:  3.05rem   (48.8px)
$font-size-5xl:  3.81rem   (60.96px)
```

**Decisión de diseño:** La escala 1.25 (Major Third) es armónica y crea jerarquía clara sin saltos abruptos. Comienza en `1rem` (16px) porque es legible en móvil.

**Pesos tipográficos:**

```scss
$font-weight-light:      300
$font-weight-regular:    400   // Default
$font-weight-medium:     500
$font-weight-semibold:   600   // Botones, énfasis
$font-weight-bold:       700   // Títulos
```

**Decisión de diseño:** 
- 700 (bold) en títulos para jerarquía clara
- 500-600 en botones para indicar accionabilidad
- 400 en body para máxima legibilidad

**Altura de línea:**

```scss
$line-height-tight:      1.1   // Títulos
$line-height-normal:     1.5   // Body, accesible
$line-height-relaxed:    1.75  // Párrafos largos
```

**Decisión de diseño:** 1.5 para body cumple estándares WCAG de accesibilidad. 1.1 en títulos evita espacio excesivo.

#### 1.4.3 Tokens de Espaciado

**Sistema base 8px (Múltiplos de 0.5rem):**

```scss
$espaciado-8:   0.5rem    (8px)
$espaciado-12:  0.75rem   (12px)
$espaciado-16:  1rem      (16px)
$espaciado-20:  1.25rem   (20px)
$espaciado-24:  1.5rem    (24px)
$espaciado-32:  2rem      (32px)
$espaciado-48:  3rem      (48px)
$espaciado-64:  4rem      (64px)
// ... hasta $espaciado-96: 6rem
```

**Decisión de diseño:** 
- Base 8px es estándar en diseño moderno (Material Design, iOS HIG)
- Múltiplos de 8 crean ritmo visual consistente
- Proporciona suficientes opciones sin ser abrumador

#### 1.4.4 Tokens de Breakpoints

**Para responsive design:**

```scss
$breakpoint-pequeño:      640px       // Móviles grandes
$breakpoint-medio:        768px       // Tablets
$breakpoint-grande:       1024px      // Desktops pequeños
$breakpoint-extra-grande: 1280px      // Desktops grandes
```

**Decisión de diseño:**
- 640px: Punto donde layouts 1-columna pasan a 2-columnas
- 768px: iPad en portrait
- 1024px: iPad en landscape, desktops pequeños
- 1280px: Desktops modernos

**Uso en mixins (ejemplo):**

```scss
@media (min-width: $breakpoint-grande) {
  .grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

#### 1.4.5 Tokens de Bordes y Radios

**Espesores de borde:**

```scss
$border-thin:    1px
$border-medium:  2px
$border-thick:   4px
```

**Radios de esquina:**

```scss
$radius-sm:      2px
$radius-md:      6px      // Estándar para componentes
$radius-lg:      12px     // Botones, tarjetas
$radius-xl:      24px     // Elementos grandes
$radius-full:    9999px   // Circular
```

**Decisión de diseño:** 
- 6px es el radio "estándar" que funciona para la mayoría de componentes
- 12px para botones da apariencia más amigable
- Escala permite flexibilidad sin exceso

#### 1.4.6 Tokens de Transiciones

**Velocidades de animación:**

```scss
$transition-rapida:  0.15s ease-in-out   // Feedback inmediato (hover)
$transition-normal:  0.3s ease-in-out    // Transiciones estándar
$transition-lenta:   0.5s ease-in-out    // Animaciones enfatizadas
```

**Decisión de diseño:**
- 150ms-300ms es el rango donde el usuario percibe feedback como "instantáneo"
- 500ms para animaciones que se deben notarse sin ser molestas
- `ease-in-out` proporciona naturalidad vs lineal

---

### 1.5 Mixins y Funciones

Los mixins en ORGMedi reutilizan patrones CSS comunes, reduciendo duplicación y manteniendo consistencia.

#### 1.5.1 Mixin: `button-form`

**Propósito:** Aplicar estilos consistentes a botones de formularios (Crear, Editar, Volver)

**Parámetros:**

```scss
@mixin button-form(
  $bg: $color-primario-primary,           // Color de fondo
  $bg-hover: $color-primario-hover,       // Color hover
  $color: $color-texto_borde_cajas,       // Color del texto
  $radius: $radius-md,                    // Radio de esquina
  $padding-x: $espaciado-24,              // Padding horizontal
  $padding-y: $espaciado-12               // Padding vertical
)
```

**Implementación:**

```scss
@mixin button-form(
  $bg: $color-primario-primary,
  $bg-hover: $color-primario-hover,
  $color: $color-texto_borde_cajas,
  $radius: $radius-md,
  $padding-x: $espaciado-24,
  $padding-y: $espaciado-12
) {
  background-color: $bg;
  color: $color;
  border: none;
  border-radius: $radius;
  padding: $padding-y $padding-x;
  font-family: $font-primary;
  font-size: $font-size-lg;
  font-weight: $font-weight-medium;
  cursor: pointer;
  transition: background-color $transition-normal;

  &:hover,
  &:focus {
    background-color: $bg-hover;
  }
}
```

**Ejemplos de uso:**

```scss
// Botón primario (rosa)
.boton-crear {
  @include button-form();
}

// Botón secundario (morado) - tamaño pequeño
.boton-editar {
  @include button-form(
    $bg: $color-secundario-primary,
    $bg-hover: $color-secundario-hover,
    $padding-x: $espaciado-16,
    $padding-y: $espaciado-8,
    $radius: $radius-lg
  );
}

// Botón de eliminar (rojo)
.boton-eliminar {
  @include button-form(
    $bg: $color-negacion-primary,
    $bg-hover: $color-negacion-hover,
    $padding-x: $espaciado-20,
    $padding-y: $espaciado-12
  );
}
```

#### 1.5.2 Mixin: `flex-layout`

**Propósito:** Crear contenedores flexibles rápidamente sin repetir `display: flex` múltiples veces

**Parámetros:**

```scss
@mixin flex-layout(
  $direction: row,          // Dirección: row o column
  $justify: flex-start,     // Justificación: flex-start, center, space-between, etc.
  $align: center,           // Alineación: center, flex-start, stretch, etc.
  $gap: 0                   // Espaciado entre elementos
)
```

**Implementación:**

```scss
@mixin flex-layout(
  $direction: row,
  $justify: flex-start,
  $align: center,
  $gap: 0
) {
  display: flex;
  flex-direction: $direction;
  justify-content: $justify;
  align-items: $align;
  gap: $gap;
}
```

**Ejemplos de uso:**

```scss
// Fila centrada horizontalmente
.nav {
  @include flex-layout(row, center, center, $espaciado-16);
}

// Columna centrada con espaciado
.formulario {
  @include flex-layout(column, flex-start, stretch, $espaciado-16);
}

// Fila con espacio distribuido
.encabezado {
  @include flex-layout(row, space-between, center, $espaciado-24);
}
```

#### 1.5.3 Mixin: `capsula-pastilla`

**Propósito:** Estilizar cápsulas de medicamento con color personalizado

**Parámetros:**

```scss
@mixin capsula-pastilla(
  $bg,                                  // Color de fondo (obligatorio)
  $color: $color-texto_borde_cajas,     // Color del texto
  $radius: $radius-md,                  // Radio de esquina
  $padding-x: $espaciado-16,            // Padding horizontal
  $padding-y: $espaciado-8              // Padding vertical
)
```

**Implementación:**

```scss
@mixin capsula-pastilla(
  $bg,
  $color: $color-texto_borde_cajas,
  $radius: $radius-md,
  $padding-x: $espaciado-16,
  $padding-y: $espaciado-8
) {
  background-color: $bg;
  color: $color;
  border-radius: $radius;
  padding: $padding-y $padding-x;
  font-family: $font-primary;
  font-size: $font-size-lg;
  font-weight: $font-weight-medium;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
```

**Ejemplos de uso:**

```scss
// Pastilla color cian
.pastilla-ozempic {
  @include capsula-pastilla($color-variante-primera);
}

// Pastilla color amarillo
.pastilla-omeprazol {
  @include capsula-pastilla(
    $bg: $color-variante-segunda,
    $color: #000,  // Texto oscuro sobre amarillo
    $radius: $radius-lg
  );
}

// Pastilla color magenta
.pastilla-amoxicilina {
  @include capsula-pastilla(
    $bg: $color-variante-tercera,
    $padding-x: $espaciado-24
  );
}
```

---

### 1.6 ViewEncapsulation en Angular

En Angular, **ViewEncapsulation** controla cómo se aplicen los estilos de un componente:

#### 1.6.1 Estrategias de ViewEncapsulation

**Emulated (Predeterminado):**
- Los estilos del componente se aplican SOLO a ese componente mediante atributos generados (`_ngcontent-ng-c123456`)
- Los estilos globales SÍ afectan al componente
- Los estilos del componente NO afectan componentes hermanos

```typescript
import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-pastilla',
  template: `<div class="pastilla">...</div>`,
  styles: [`
    .pastilla { background: #E177B5; }
  `],
  encapsulation: ViewEncapsulation.Emulated  // Predeterminado
})
export class PastillaComponent {}
```

**None:**
- Los estilos del componente se aplican GLOBALMENTE
- Los estilos globales afectan al componente
- Los estilos del componente afectan toda la aplicación (requiere BEM para evitar conflictos)

```typescript
@Component({
  selector: 'app-pastilla',
  template: `<div class="pastilla">...</div>`,
  styles: [`
    .pastilla { background: #E177B5; }
  `],
  encapsulation: ViewEncapsulation.None  // Estilos globales
})
export class PastillaComponent {}
```

**ShadowDom:**
- Los estilos se encapsulan usando Shadow DOM nativo del navegador
- Los estilos globales NO afectan al componente (excepto herencia)
- No soportado en navegadores viejos

```typescript
@Component({
  selector: 'app-pastilla',
  template: `<div class="pastilla">...</div>`,
  styles: [`
    .pastilla { background: #E177B5; }
  `],
  encapsulation: ViewEncapsulation.ShadowDom
})
export class PastillaComponent {}
```

#### 1.6.2 Estrategia elegida para ORGMedi: ViewEncapsulation.None + BEM

**Decisión: Usar ViewEncapsulation.None con metodología BEM**

**Justificación:**

1. **Consistencia global:** Al tener estilos globales, aseguramos que todos los componentes (botones, inputs, layouts) se ven uniformes en toda la aplicación, incluso entre componentes.

2. **Temas (Light/Dark):** Es más fácil implementar cambio de tema global si todos los componentes comparten el mismo scope de estilos. Con Emulated, cambiar un color requiere actualizar múltiples componentes.

3. **Performance:** ViewEncapsulation.None es más rápido porque Angular no necesita generar atributos como `_ngcontent-ng-c123456` en cada elemento.

4. **BEM previene conflictos:** Con una nomenclatura consistente (.pastilla, .pastilla__nombre, .pastilla--completada), no hay colisiones de clases entre componentes.

5. **Mantenimiento ITCSS:** El sistema ITCSS que hemos estructurado (settings → tools → generic → elements → layout → components) funciona mejor con estilos globales que con encapsulación.

6. **Futuro Tailwind:** Si en el futuro se migra a Tailwind CSS (utility-first), ViewEncapsulation.None es el enfoque natural.

#### 1.6.3 Estructura de componentes en ORGMedi

**Enfoque recomendado:**

```typescript
// pastilla.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-pastilla',
  templateUrl: './pastilla.component.html',
  styleUrls: ['./pastilla.component.scss'],  // Estilos reutilizados globalmente
  encapsulation: NgOption.ViewEncapsulation.None  // No encapsular
})
export class PastillaComponent {
  @Input() medicamento: string;
  @Input() color: string;
}
```

```scss
// pastilla.component.scss - Estilos globales con BEM
.pastilla {
  @include capsula-pastilla($color-primario-primary);

  &__nombre {
    flex: 1;
    font-size: $font-size-lg;
    font-weight: $font-weight-semibold;
    color: $color-texto_borde_cajas;
  }

  &__boton {
    @include button-form();
  }

  &--cian { @include capsula-pastilla($color-variante-primera); }
  &--amarillo { @include capsula-pastilla($color-variante-segunda); }
}
```

```html
<!-- pastilla.component.html -->
<div [class]="'pastilla pastilla--' + color">
  <span class="pastilla__nombre">{{ medicamento }}</span>
  <button class="pastilla__boton">Editar</button>
</div>
```

#### 1.6.4 Beneficios prácticos en ORGMedi

**Cambio de tema (Light ↔ Dark):**

```typescript
// app.component.ts
export class AppComponent {
  isDarkMode = false;

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('dark-mode');
  }
}
```

```scss
// styles.scss - Estilos base para light mode
body {
  background: $color-terciario-primary;
  color: $color-texto_borde_cajas;
}

// Estilos para dark mode
body.dark-mode {
  background: $color-terciario-dark;
  color: $color-texto_borde_cajas-dark;
}

.pastilla {
  background: $color-primario-primary;

  body.dark-mode & {
    background: $color-primario-dark;
  }
}
```

Con ViewEncapsulation.None, el toggle de tema afecta toda la aplicación de una vez.

**Con ViewEncapsulation.Emulated (NO recomendado):**

Cada componente necesitaría su propio logic de tema:

```typescript
// Esto sería necesario en CADA componente
@Component({
  selector: 'app-pastilla',
  template: `
    <div [class]="isDarkMode ? 'pastilla-dark' : 'pastilla'">
      ...
    </div>
  `,
  styles: [`
    .pastilla { ... }
    .pastilla-dark { ... }
  `]
})
export class PastillaComponent {
  @Input() isDarkMode: boolean;
}
```

---



### 1.7 Sistema de Grid y Layout

ORGMedi utiliza un sistema de grid y layout basado en CSS Grid y Flexbox, facilitando diseños responsivos y estructurados.

#### 1.7.1 Justificación del sistema de grid

Se eligió CSS Grid por su potencia y flexibilidad para crear layouts complejos. Flexbox se usa para componentes más simples o alineaciones dentro de los items del grid.

**Ventajas de CSS Grid:**

1. **Control bidimensional:** A diferencia de Flexbox, Grid maneja filas y columnas simultáneamente, ideal para diseños de dashboard.
2. **Áreas de grid nombradas:** Permite nombrar áreas del layout, haciendo el código más legible.
3. **Soporte a fracciones (`fr`):** Facilita distribuir espacio disponible entre columnas/filas.
4. **Responsive fácil:** Cambiar el número de columnas o filas en breakpoints es sencillo.

#### 1.7.2 Estructura de un layout típico

```html
<div class="grid-container">
  <header class="header">Header</header>
  <nav class="nav">Nav</nav>
  <main class="main">
    <article class="card">...</article>
    <article class="card">...</article>
  </main>
  <aside class="aside">Aside</aside>
  <footer class="footer">Footer</footer>
</div>
```

```scss
.grid-container {
  display: grid;
  grid-template-areas: 
    "header header"
    "nav main"
    "footer footer";
  grid-template-columns: 1fr 3fr;
  grid-template-rows: auto 1fr auto;
  height: 100vh;
}

.header { grid-area: header; }
.nav { grid-area: nav; }
.main { grid-area: main; }
.aside { grid-area: aside; }
.footer { grid-area: footer; }
```

#### 1.7.3 Ejemplo de página: Home

```html
<div class="grid-container">
  <header class="header">ORGMedi - Tu gestor de medicamentos</header>
  <nav class="nav">
    <ul>
      <li><a href="#seccion1">Inicio</a></li>
      <li><a href="#seccion2">Acerca de</a></li>
      <li><a href="#seccion3">Contacto</a></li>
    </ul>
  </nav>
  <main class="main">
    <section id="seccion1">
      <h2>Bienvenido a ORGMedi</h2>
      <p>Gestiona tus medicamentos de manera fácil y efectiva.</p>
    </section>
    <section id="seccion2">
      <h2>Acerca de ORGMedi</h2>
      <p>ORGMedi es una aplicación diseñada para ayudar a los pacientes a gestionar su medicación.</p>
    </section>
  </main>
  <aside class="aside">
    <h2>Información adicional</h2>
    <p>Consulta a tu médico antes de hacer cambios en tu medicación.</p>
  </aside>
  <footer class="footer">
    <p>© 2025 ORGMedi. Todos los derechos reservados.</p>
  </footer>
</div>
```

```scss
.grid-container {
  display: grid;
  grid-template-areas: 
    "header header"
    "nav main"
    "footer footer";
  grid-template-columns: 1fr 3fr;
  grid-template-rows: auto 1fr auto;
  height: 100vh;
}

.header { 
  grid-area: header; 
  background-color: $color-primario-primary;
  color: white;
  padding: $espaciado-24;
  text-align: center;
}

.nav { 
  grid-area: nav; 
  background-color: $color-secundario-primary;
  padding: $espaciado-24;
}

.main { 
  grid-area: main; 
  padding: $espaciado-24;
}

.aside { 
  grid-area: aside; 
  background-color: $color-terciario-primary;
  padding: $espaciado-24;
}

.footer { 
  grid-area: footer; 
  background-color: $color-primario-primary;
  color: white;
  padding: $espaciado-24;
}
```

---

## Conclusión de la Sección 1

La arquitectura CSS de ORGMedi se fundamenta en **principios de diseño visuales** (jerarquía, contraste, alineación, proximidad, repetición) que se implementan mediante:

1. **BEM** para nomenclatura clara y sin conflictos
2. **ITCSS** para organización escalable de archivos
3. **Design Tokens** para consistencia global de valores
4. **Mixins reutilizables** para reducir duplicación
5. **ViewEncapsulation.None + BEM** en Angular para temas globales y mantenimiento centralizado

Esta combinación crea una arquitectura CSS robusta, mantenible y escalable que facilitará el crecimiento del proyecto y el onboarding de nuevos desarrolladores.

## Sección 2 : HTML semántico y estructura

Esta sección describe las convenciones de estructura y semántica HTML utilizadas a lo largo del proyecto: elementos semánticos, jerarquía de headings y estructura de formularios accesibles.

### 2.1 Elementos semánticos utilizados

Se favorecen siempre los elementos HTML5 semánticos para mejorar accesibilidad, SEO y la mantenibilidad del DOM. A continuación se describen los elementos y cuándo utilizarlos en ORGMedi:

- `header` — Cabecera de la página o de una sección. Contiene logo, título, navegación primaria y controles globales (p. ej. switch de tema).

```html
<header class="app-header">
  <a class="app-header__logo" href="/">Logo</a>
  <nav class="app-header__nav" aria-label="Navegación principal">...</nav>
  <button class="app-header__theme-toggle">Tema</button>
</header>
```

- `nav` — Contenedor para navegación (principal o secundaria). Añadir `aria-label` si hay más de un `nav` en la página.

```html
<nav aria-label="Navegación principal">
  <ul>
    <li><a href="/">Inicio</a></li>
    <li><a href="/recetas">Recetas</a></li>
  </ul>
</nav>
```

- `main` — Contenedor principal del contenido único de la página; debe aparecer solo una vez por documento.

```html
<main>
  <article>...</article>
</main>
```

- `article` — Contenido autocontenido (card, post, receta) con sentido por sí mismo; puede ser distribuido fuera del contexto.

```html
<article class="app-card"> ... </article>
```

- `section` — Agrupa contenido temático dentro del `main` o `article`. Normalmente lleva su propio heading (`h2`, `h3`, ...).

```html
<section id="cards">
  <h2>Cards</h2>
  <!-- tarjetas -->
</section>
```

- `aside` — Contenido tangencial o complementario (barra lateral, widgets, recomendaciones).

```html
<aside aria-label="Filtros">
  <!-- controles de filtrado -->
</aside>
```

- `footer` — Pie de página de la aplicación o de un `article` (metadatos, enlaces secundarios, copyright).

```html
<footer>
  <p>© 2025 ORGMedi</p>
</footer>
```

---

### 2.2 Jerarquía de headings

Se sigue una estrategia de headings estructurada para mantener orden semántico y accesible.

Reglas:
- Solo un `h1` por página que representa el título principal.
- `h2` para secciones principales dentro del `main`.
- `h3` para subsecciones; `h4` para sub-subsecciones; y así sucesivamente.
- NUNCA saltar niveles (no usar `h3` directamente después de `h1` sin `h2`).
- Usar headings para estructura, no para estilo (usar CSS para apariencia visual).

Ejemplo de jerarquía (diagrama):

- h1: Style Guide
  - h2: Paleta de colores
    - h3: Light tokens
    - h3: Dark tokens
  - h2: Tipografía
    - h3: Jerarquía de títulos
  - h2: Componentes
    - h3: Botones
    - h3: Cards

Pseudomarkdown:

```text
h1: Style Guide
  h2: Paleta de colores
    h3: Light tokens
    h3: Dark tokens
  h2: Tipografía
    h3: Jerarquía de títulos
  h2: Componentes
    h3: Botones
    h3: Cards
```

---

### 2.3 Estructura de formularios

Los formularios siguen pautas de accesibilidad: uso de `fieldset`/`legend`, asociación `label`↔`input` y uso de `aria-describedby` para ayudas y errores.

Principios:
- Agrupar controles relacionados con `<fieldset>` y describir el grupo con `<legend>`.
- Asociar `label` con `input` mediante `for` (id del input). Si el componente genera su propio id, exponer una prop `inputId` o usar `aria-labelledby`.
- `aria-describedby` enlaza el control con textos de ayuda o errores.
- Mostrar errores en un elemento con `id` y referenciarlo desde `aria-describedby`.

Ejemplo de formulario:

```html
<form>
  <fieldset>
    <legend>Información de la cuenta</legend>

    <label for="email">Email</label>
    <input id="email" name="email" type="email" />

    <label for="password">Contraseña</label>
    <input id="password" name="password" type="password" />
  </fieldset>
</form>
```

Ejemplo:  marcado del componente `app-form-input` (extraído de `frontend/src/app/components/shared/form-input/form-input.html`):

```html
<div class="form-input">
  <label [attr.for]="inputId" class="form-input__label">
    {{ label }}
    <span *ngIf="required" class="form-input__asterisk">*</span>
  </label>
  <input
    [id]="inputId"
    [type]="type"
    [name]="name"
    [placeholder]="placeholder"
    [required]="required"
    class="form-input__field"
    [attr.aria-describedby]="helpText ? inputId + '-help' : null"
    [ngModel]="value"
    (ngModelChange)="valueChange.emit($event)"
  />
  <div *ngIf="helpText" [id]="inputId + '-help'" class="form-input__help">{{ helpText }}</div>
  <div *ngIf="error" class="form-input__error">{{ error }}</div>
</div>
```

Notas sobre accesibilidad en este ejemplo:
- `label` y `input` comparten el mismo `inputId` permitiendo a tecnologías asistivas leer correctamente la relación.
- `aria-describedby` sólo se añade si existe `helpText`, evitando referencias vacías.
- Para errores críticos se recomienda añadir `aria-invalid="true"` y referenciar el `id` del mensaje de error desde `aria-describedby`.

Buenas prácticas para formularios:
- Validación en cliente y servidor; mensajes claros y referenciados con `aria-describedby`.
- Evitar autofocus indiscriminado; gestionar foco al abrir diálogos/modales.
- Todo control visible debe tener un `label` (si no, usar `aria-label` o `aria-labelledby`).

---

## Sección 3 : Sistema de componentes UI (Fase 3)

Esta sección documenta los componentes de interfaz de usuario implementados en ORGMedi, su nomenclatura y la guía de estilos.

### 3.1 Componentes implementados

A continuación se listan TODOS los componentes creados en `frontend/src/app/components` (shared + layout). Para cada uno indico: nombre, propósito, variantes, tamaños, estados y ejemplo de uso (snippet HTML).

- **app-button**
  - Propósito: botón reutilizable con variantes visuales y tamaños.
  - Variantes: `primary`, `secondary`, `ghost`, `danger`.
  - Tamaños: `sm`, `md`, `lg`.
  - Estados: normal, hover, focus, active, disabled, fullWidth.


- **app-card**
  - Propósito: tarjeta de contenido con imagen, título, descripción y slot para acciones.
  - Variantes: `basic` (vertical), `horizontal`, `featured`.
  - Tamaños: responsive (no prop explícita de tamaño).
  - Estados: hover (elevación), foco, seleccionado (si aplica).

- **app-alert**
  - Propósito: mostrar mensajes de feedback (success / error / warning / info), opcionalmente dismissible.
  - Variantes: `success`, `error`, `warning`, `info`.
  - Estados: abierto/cerrado; emite `(closed)` cuando se cierra.

- **app-form-input**
  - Propósito: input con label, ayuda, control de errores y binding (`valueChange`).
  - Variantes: por `type` (text, email, password...).
  - Estados: normal, requerido, error, disabled.
  - Ejemplo:

```html
<app-form-input label="Email" type="email" name="email" placeholder="ejemplo@correo.com" (valueChange)="email = $event"></app-form-input>
```

- **app-form-select**
  - Propósito: select con label y listado de opciones.
  - Variantes: n/a (acepta array de options `{ value, label }`).
  - Estados: normal, error, disabled.


- **app-form-textarea**
  - Propósito: textarea con label, placeholder y contador opcional.
  - Estados: normal, required, disabled.


- **app-theme-switcher**
  - Propósito: alternar tema light/dark; emite `(themeChange)`.
  - Ejemplo:

```html
<app-theme-switcher (themeChange)="onThemeChange($event)"></app-theme-switcher>
```

- **app-calendar**
  - Propósito: mini calendario con selección de días y navegación por semanas.
  - Ejemplo:

```html
<app-calendar></app-calendar>
```

- **app-dom-demo**
  - Propósito: componente de demostración para operaciones DOM (Renderer2) usado en documentación interna.
  - Ejemplo:

```html
<app-dom-demo></app-dom-demo>
```

- **app-register-form**
  - Propósito: formulario compuesto de registro (usa `app-form-input`).
  - Ejemplo:

```html
<app-register-form></app-register-form>
```

- **app-login-form**
  - Propósito: formulario de login con validación básica.
  - Ejemplo:

```html
<app-login-form></app-login-form>
```

- **app-header**
  - Propósito: cabecera principal (logo, navegación, toggle tema, menú responsive).
  - Estados: `isOpen` (menú), `isDarkMode`.
  - Ejemplo:

```html
<app-header></app-header>
```

- **app-footer**
  - Propósito: pie de página con enlaces y metadatos.
  - Ejemplo:

```html
<app-footer></app-footer>
```

- **app-main**
  - Propósito: wrapper/layout principal para páginas.
  - Ejemplo:

```html
<app-main>...</app-main>
```


---

### 3.2 Nomenclatura y metodología (BEM)

Explicación breve y ejemplos reales extraídos de los componentes del proyecto.

- Block (bloque): componente independiente, p. ej. `app-card`, `app-button`, `form-input`.
- Element (elemento): parte del bloque `block__element`, p. ej. `app-card__image`, `app-card__content`.
- Modifier (modificador): `block--modifier` para variantes visuales/estructurales, p. ej. `app-card--horizontal`, `button--primary`.
- Estados: clases `is-*` o `has-*` para estados runtime (transitorios), p. ej. `is-active`, `is-open`.

Estrategia — reglas prácticas

- Usa modifiers (`--`) para variantes permanentes o semánticas (colores, tamaños, layout).
  - Ejemplo: `.app-card--horizontal` cambia estructura e imagen flotante.
- Usa clases de estado (`is-*`) para comportamientos temporales manejados por JS (abrir/cerrar, activo, seleccionado).
  - Ejemplo: `.is-active` para indicar elemento seleccionado.
- Mantén los elements (`__`) internos y no los reutilices fuera del block.
- Prefija bloques con `app-` cuando sean componentes del sistema para evitar colisiones.

Ejemplos reales en el código

- `app-card` (markup simplificado):

```html
<article class="app-card app-card--horizontal">
  <img class="app-card__image" src="..." alt="..." />
  <div class="app-card__content">
    <h3 class="app-card__title">Título</h3>
    <p class="app-card__desc">Descripción</p>
  </div>
</article>
```

- `app-button` (clases generadas dinámicamente):

```html
<button class="button" [ngClass]="['button--' + variant, 'button--' + size, fullWidth ? 'button--fullwidth' : '']">
  <span class="button__label">Texto</span>
</button>
```

- `app-alert`:

```html
<div class="alert alert--success">
  <div class="alert__content">Mensaje</div>
  <button class="alert__close">×</button>
</div>
```

Reglas resumidas (para el equipo)

1. Block: nombre semántico y único (usar `app-` para componentes compartidos).
2. Element: `block__element`, sólo dentro del bloque.
3. Modifier: `block--modifier` para variantes visuales/estructurales.
4. Estado: `is-*` o `has-*` para estados runtime.
5. Mantener especificidad baja y evitar selectores muy anidados.

---

### 3.3 Style Guide

La aplicación incluye una página de Style Guide en `http://localhost:4200/style-guide` (`frontend/src/app/pages/style-guide/style-guide.html`) que sirve como fuente visual de verdad para diseñadores y desarrolladores.

Qué contiene la Style Guide

- Paleta de colores (tokens light/dark y swatches).
- Escala tipográfica y ejemplos de títulos y body.
- Componentes: botones, cards, formularios, alerts, badges, modal, tabs, paginación.
- Utilidades: espaciado, sombras, radios de borde.
- Sección de Nomenclatura (BEM) con ejemplos visuales.

Para qué sirve

- Documentación visual: ver componentes en contexto (variantes/estados) para diseñadores y desarrolladores.
- Testing manual/visual: sirve para revisar estados, contrastes y accesibilidad antes de integrar en pantallas reales.
- Referencia rápida: snippets de uso y rutas a los componentes para copiar/pegar en implementaciones.


Ejemplo de inclusión en Markdown:

```markdown
![Style Guide - Paleta y Tipografía](docs/style-guide-1.png)

![Style Guide - Botones](docs/style-guide-2.png)
```
