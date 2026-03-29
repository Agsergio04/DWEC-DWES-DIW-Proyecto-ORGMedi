# EVALUACIÓN DE LA PRUEBA PRÁCTICA
## Alumno: Sergio Aragón García
## Fecha: 10 de Febrero de 2025
## Rama evaluada: prueba-practica

---

## GESTIÓN DEL REPOSITORIO

### Commits Realizados
- **Total de commits**: 14 commits ✅
- **Requisito mínimo**: 10 commits (CUMPLIDO)

### Análisis Temporal de Commits
Commits realizados entre las 08:14:37 y 14:12:04 (aproximadamente 6 horas):

1. 08:14:37 - Primer commit inicial
2. 08:43:14 - Creación documentos (28 min después)
3. 09:15:00 - Backend editado (31 min después)
4. 09:45:51 - Prueba local backend (30 min después)
5. 09:48:12 - Cambios para despliegue (2 min después)
6. 10:16:54 - Inicio routing (28 min después)
7. 10:29:32 - Creación página práctica (12 min después)
8. 10:42:51 - Creación componente hijo (13 min después)
9. 11:00:10 - Commit para merendar (17 min después)
10. 12:16:29 - Header y componentes (76 min después - DESCANSO)
11. 12:29:45 - Documentación cliente (13 min después)
12. 13:31:26 - Agregando parámetros (61 min después)
13. 13:44:04 - Componentes hijos (12 min después)
14. 14:12:04 - Subida SCSS final (28 min después)

**EVALUACIÓN**: ⚠️ Aunque hay 14 commits (más de 10), hay un gap de 76 minutos entre commit 9 y 10. Los demás commits están bien espaciados (promedio 20-30 minutos).

---

## BLOQUE 1: DESARROLLO EN ENTORNO SERVIDOR (DWES)

### 1. Funcionalidad (Endpoint)

#### Endpoint Creado
- **Ruta**: `GET /api/gestores/cantidad`
- **Método**: `cantidadMedicamentosConsumidos(Long id)`
- **Propósito**: Contar medicamentos en un GestorMedicamentos
- **Código**:
```java
@GetMapping("/cantidad")
public Integer MedicamentosConsumidos(Long id){
    return gestorMedicamentos.cantidadMedicamentosConsumidos(id);
}
```

**EVALUACIÓN**: ✅ Endpoint creado con propósito claro (contador de medicamentos)

#### Arquitectura: Controller → Service → Repository

**Controller** (`GestorMedicamentosController.java`):
```java
@GetMapping("/cantidad")
public Integer MedicamentosConsumidos(Long id){
    return gestorMedicamentos.cantidadMedicamentosConsumidos(id);
}
```

**Service** (`GestorMedicamentosService.java`):
```java
public GestorMedicamentos MedicamentosConsumidos(Long id){
    return gestorMedicamentosRepository.cantidadMedicamentosConsumidos(id);
}
```

**Repository** (`GestorMedicamentosRepository.java`):
```java
GestorMedicamentos cantidadMedicamentosConsumidos(Long usuarioId);
```

**Domain** (`GestorMedicamentos.java`):
```java
public Integer cantidadMedicamentosConsumidos(Long id){
    int cantidad = 0;
    for (Medicamento medicamento : this.medicamentos) {
        if(medicamento != null){
            cantidad++;
        }
    }
    return cantidad;
}
```

**PROBLEMAS DETECTADOS**:
1. ❌ **Violación de arquitectura**: La lógica está en el dominio (Entity), no en el Service
2. ❌ **Controller llama directamente al Entity**: `gestorMedicamentos.cantidadMedicamentosConsumidos(id)` salta el Service
3. ❌ **Inconsistencia**: Service y Repository están declarados pero no se usan
4. ⚠️ **Naming**: Métodos deberían empezar con minúscula (`medicamentosConsumidos` no `MedicamentosConsumidos`)

**EVALUACIÓN ARQUITECTURA**: ❌ NO respeta Controller → Service → Repository. La lógica está en Entity y Controller accede directamente.

### 2. Seguridad y Calidad

#### Seguridad del Endpoint

**Análisis del código**:
```java
@GetMapping("/cantidad")
public Integer MedicamentosConsumidos(Long id){
    return gestorMedicamentos.cantidadMedicamentosConsumidos(id);
}
```

**PROBLEMAS CRÍTICOS**:
1. ❌ **Sin autenticación**: No usa `SecurityUtil.getCurrentUser()`
2. ❌ **Sin validación de propiedad**: Cualquiera puede consultar cualquier gestor
3. ❌ **Sin protección JWT**: El endpoint es público
4. ❌ **Sin validación de roles**: No hay `@PreAuthorize` ni `@Secured`
5. ❌ **Parámetro `id` recibido pero nunca usado**: El método recibe `id` pero no lo utiliza

**EVALUACIÓN SEGURIDAD**: ❌❌ **CRÍTICO** - No hay ninguna implementación de seguridad

#### Pruebas

**Documentación**: El alumno menciona en PRUEBA-PRACTICA-DWES.md:
> "Capturas no he podido realizarlas pero voy dejando los siguientes enlaces permanentes al código"

**EVALUACIÓN PRUEBAS**: ❌ No hay evidencia de pruebas (sin capturas, sin comandos curl, sin logs)

### 3. Documentación DWES

**Archivo**: ✅ `PRUEBA-PRACTICA-DWES.md` existe en raíz del proyecto

**Contenido evaluado**:
- ✅ Nombre del alumno: Sergio Aragón García
- ✅ Explica qué endpoint creó y por qué
- ⚠️ Seguridad mal explicada: "asociada en si mismo a la hora de la autentificacion o creado del usuario por medio de su JWT" (pero no está implementada)
- ❌ Sin capturas ni comandos para probar
- ✅ Referencias a documentación utilizada

**EVALUACIÓN DOCUMENTACIÓN**: ⚠️ Documentación básica pero explica seguridad que NO está implementada

---

### PUNTUACIÓN BLOQUE DWES

| Criterio | Evaluación | Nivel |
|----------|-----------|-------|
| **RA5 - Separación de capas** | ❌ Lógica en Entity, no en Service | Nivel 1-2 |
| **RA6 - Seguridad** | ❌❌ Sin seguridad implementada | Nivel 1 |
| **RA7 - Servicios web** | ⚠️ Endpoint creado pero sin pruebas | Nivel 2 |

**NOTA ESTIMADA DWES**: **2.5 - 4.0 / 10**

**Justificación**:
- Endpoint creado pero arquitectura incorrecta
- Seguridad inexistente (crítico)
- Sin evidencia de pruebas
- Documentación básica con información incorrecta sobre seguridad

---

## BLOQUE 2: DESARROLLO EN ENTORNO CLIENTE (DWEC)

### 1. Routing y Navegación (RA7 + RA5.d)

#### Nueva Ruta Definida
**Archivo**: `frontend/src/app/app.routes.ts`

```typescript
{
  path: 'pagina-practica',
  loadComponent: () =>
    import('./pages/pagina-practica/pagina-practica').then(m => m.PaginaPracticaComponent),
  data: {
    chunkName: 'pagina-practica',
    breadcrumb: 'Pagina de la pracitca',
    description: 'Pagina de la practica realizada el 10 de Febrero de 2025'
  }
}
```

**EVALUACIÓN ROUTING**: ✅ Ruta correctamente definida con lazy loading

#### Integración en Header
**Archivo**: `frontend/src/app/components/layout/header/header.html`

```html
<!-- Pagina de la practica -->
<a
  routerLink="/pagina-practica"
  [attr.aria-current]="router.isActive('pagina-practica', true) ? 'pagina-practica' : null"
  aria-label="Ir a la pagina de la practica"
>
  <span class="app-header__menu-label">Pagina practica</span>
</a>
```

**EVALUACIÓN HEADER**: ✅ Correctamente integrado con routerLink

#### Integración en Footer
**Archivo**: `frontend/src/app/components/layout/footer/footer.html`

```html
<a routerLink="/pagina-practica" class="app-footer__link">Pagina de la practica</a>
```

**EVALUACIÓN FOOTER**: ✅ Correctamente integrado

#### Lazy Loading
✅ **IMPLEMENTADO**: Usa `loadComponent()` con import dinámico

**PUNTUACIÓN RA7**: **8.0 / 10** (Notable)

### 2. Arquitectura de Componentes (RA6 + RA4)

#### Componente Página (Container)
**Archivo**: `pagina-practica.ts`

```typescript
@Component({
  selector: 'pagina-practica',
  standalone: true,
  imports: [CommonModule, SegundoComponenteHijo, ComponenteHijo],
  templateUrl: './pagina-practica.html',
  styleUrls: ['./pagina-practica.scss']
})
export class PaginaPracticaComponent {}
```

**EVALUACIÓN**:
- ✅ Componente standalone
- ❌ Sin lógica de negocio (clase vacía)
- ❌ No inyecta servicios
- ❌ No gestiona control de flujo en vista

#### Componente Hijo 1 (componente-hijo)
**Archivo**: `componente-hijo.ts`

```typescript
@Component({
  selector: 'componente-hijo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './componente-hijo.html',
  styleUrls: ['./componente-hijo.scss']
})
export class ComponenteHijo {}
```

**HTML**:
```html
<main>
  <input class="Input_componente-hijo" />
</main>
```

**EVALUACIÓN**:
- ✅ Componente standalone
- ❌ Sin @Input
- ❌ Sin lógica (clase vacía)
- ❌ Sin tipado de datos
- ⚠️ Confusión: La documentación dice que este es el "padre" pero realmente es un hijo

#### Componente Hijo 2 (segundo-componente-hijo)
**Archivo**: `segundo-componente-hijo.ts`

```typescript
@Component({
  selector: 'app-segundo-componente-hijo',
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './segundo-componente-hijo.html',
  styleUrl: './segundo-componente-hijo.scss',
})
export class SegundoComponenteHijo {
  @ViewChild('container', { static: false }) container!: ComponenteHijo;
  
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() type: string = 'text';
  @Input() disabled = false;
  @Output() valueChange = new EventEmitter<string>();
  
  value: string = '';
  // ... más código
}
```

**EVALUACIÓN**:
- ✅ Tiene @Input decorators (4 inputs)
- ⚠️ NO es standalone (falta `standalone: true` en decorator)
- ⚠️ Tipado básico (usa `string`, pero sin interfaces custom)
- ✅ Implementa ControlValueAccessor (avanzado)
- ❌ No recibe datos del padre (los @Input no se usan en pagina-practica.html)

#### Jerarquía Real vs Documentada

**Documentación dice**:
- componente-hijo = padre/contenedor
- segundo-componente-hijo = hijo presentacional

**Realidad en código**:
- pagina-practica = contenedor real (pero vacío)
- componente-hijo = hijo simple (vacío)
- segundo-componente-hijo = hijo con lógica

**CONFUSIÓN**: ❌ La arquitectura no coincide con la documentación

#### Tipado con Interfaces

**Búsqueda de interfaces**:
- ❌ No se definieron interfaces custom
- ✅ Usa tipos primitivos (`string`, `boolean`)
- ❌ Prohibido usar `any` → No se detectó uso de `any` ✅

**PUNTUACIÓN RA4**: **4.0 / 10** (Básico-Mecánico)
**PUNTUACIÓN RA6**: **5.0 / 10** (Correcto bajo)

### 3. Documentación DWEC

**Archivo**: ✅ `PRUEBA-PRACTICA-DWEC.md` existe

**Contenido**:
```markdown
componente-hijo : controla tanto el flujo de vista como como es el 
responsable de que se vea e inyecta el servicio

segundo-componente-hijo : es un componente standalone ele cual es un 
input por el cual tiene interfaces de cifrado de informacion
```

**EVALUACIÓN**:
- ⚠️ Descripciones confusas y con errores ("ele cual", "cifrado de informacion")
- ❌ No explica jerarquía real padre-hijo
- ❌ No hay instrucciones de ejecución
- ❌ Información incorrecta: dice que componente-hijo inyecta servicio (no lo hace)

**PUNTUACIÓN DOCUMENTACIÓN**: **3.0 / 10**

---

### PUNTUACIÓN BLOQUE DWEC

| Criterio | Puntuación | Nivel |
|----------|-----------|-------|
| **RA4 - Estructuras definidas** | 4.0 / 10 | Nivel 2 (Mecánico) |
| **RA5 - Eventos** | 7.0 / 10 | Nivel 4 (Notable) |
| **RA6 - Componentes** | 5.0 / 10 | Nivel 3 (Correcto bajo) |
| **RA7 - Routing** | 8.0 / 10 | Nivel 4 (Notable) |

**NOTA ESTIMADA DWEC**: **6.0 / 10**

**Justificación**:
- ✅ Routing bien implementado con lazy loading
- ✅ Navegación correcta en header/footer
- ⚠️ Componentes creados pero sin relación padre-hijo real
- ❌ Sin lógica de negocio en contenedor
- ❌ Sin consumo de servicios/datos
- ❌ Documentación confusa

---

## BLOQUE 3: DISEÑO DE INTERFACES WEB (DIW)

### 1. Arquitectura de Estilos y Preprocesadores (RA2)

#### Evolución Cromática
**Colores definidos en PRUEBA-PRACTICA-DIW.md**:
- Primer color: `#FDFFFF`
- Segundo color: `#9F37FF`

**Implementación en `00-settings/_variables.scss`**:
```scss
$color-aniadido-primero: #FDFFFF;
$color-aniadido-segundo: #9F37FF;
```

**EVALUACIÓN**:
- ✅ 2 colores nuevos definidos
- ✅ Variables colocadas en capa Settings (líneas 191-192)
- ❌ **CRÍTICO**: Variables definidas pero **NUNCA USADAS** en el código
- ❌ No se usan en ningún componente ni estilo

#### Integración ITCSS

**Estructura encontrada**:
```
styles/
  00-settings/
    _variables.scss  ← Variables añadidas aquí ✅
    _css-variables.scss
  01-tools/
    _responsive.scss
    _mixins.scss
  02-generic/
    _reset.scss
  03-elements/
    _base.scss
  04-layout/
    _layout.scss
```

**EVALUACIÓN**:
- ✅ Estructura ITCSS existente
- ✅ Variables en capa correcta (Settings)
- ❌ No se crearon archivos parciales para componentes nuevos
- ❌ Los estilos de los componentes están en archivos locales (componente-hijo.scss, segundo-componente-hijo.scss)

#### Uso de Variables

**En segundo-componente-hijo.scss**:
```scss
@use '../../../../styles/00-settings/variables' as *;
@use '../../../../styles/01-tools/responsive' as *;

.data-input__input{
  gap: $espaciado-12;  ← Usa variables existentes ✅
  padding: $espaciado-10 $espaciado-12;
  background-color: var(--color-secundario-primary);  ← Variables existentes ✅
  border-radius: $radius-md;
  // ... pero NO usa $color-aniadido-primero ni $color-aniadido-segundo ❌
}
```

**EVALUACIÓN**:
- ✅ Importa correctamente variables con `@use`
- ✅ Usa variables existentes del sistema
- ❌ **NO usa las 2 variables nuevas** que se definieron para el examen

#### Estilos en Componentes Angular

**componente-hijo.scss**: Vacío ✅ (no usa CSS en TS)
**segundo-componente-hijo.scss**: Tiene estilos ✅
**pagina-practica.scss**: Vacío ❌ (debería tener estilos)

**EVALUACIÓN**: ✅ No hay CSS en componentes TS, pero estilos en SCSS

**PUNTUACIÓN ARQUITECTURA ITCSS**: **4.0 / 10** (Nivel 2 - Mecánico)

**Justificación**:
- Variables creadas pero no usadas
- No se crearon componentes en capa correcta de ITCSS
- Estructura desordenada

### 2. Metodología BEM y Naming (RA2)

#### Análisis de Naming

**En componente-hijo.html**:
```html
<input class="Input_componente-hijo" />
```
❌ **INCORRECTO**: Usa guión bajo pero no sigue BEM
- Debería ser: `componente-hijo__input` (bloque__elemento)
- Usa mayúscula inicial (`Input_`) → no es estándar
- Usa guión bajo entre palabras → no es BEM

**En segundo-componente-hijo.html**:
```html
<input class="data-input__input" />
```
✅ **CORRECTO**: Sigue BEM
- `data-input` = bloque
- `__input` = elemento
- Sintaxis correcta con doble guión bajo

**En segundo-componente-hijo.scss**:
```scss
.data-input__input {
  // estilos
  
  &:focus-within {  ← Pseudo-clase (estado) ✅
    box-shadow: ...;
  }
  
  &:hover {  ← Pseudo-clase (estado) ✅
    box-shadow: ...;
  }
}
```

**EVALUACIÓN**:
- ⚠️ BEM aplicado en 1 componente (segundo-componente-hijo)
- ❌ BEM NO aplicado en otro componente (componente-hijo)
- ✅ Estados interactivos definidos (hover, focus)
- ⚠️ Naming inconsistente entre componentes

**PUNTUACIÓN BEM**: **5.0 / 10** (Nivel 3 - Correcto)

### 3. Layout y Responsive Design (RA2)

#### CSS Grid

**Búsqueda de Grid**:
```bash
grep -r "display: grid" frontend/src/app/pages/pagina-practica/
grep -r "grid-template" frontend/src/app/pages/pagina-practica/
```

**Resultado**: ❌ **NO se implementó CSS Grid** en ningún componente de la práctica

#### Flexbox

**En segundo-componente-hijo.scss**:
```scss
.data-input__input {
  display: flex;  ← ✅ Usa Flexbox
  align-items: center;
  gap: $espaciado-12;
  // ...
}
```

**EVALUACIÓN**:
- ✅ Flexbox implementado básicamente
- ❌ No se manipula eje principal (no hay `flex-direction`)
- ❌ No hay adaptación móvil vs desktop

#### Responsive Design

**En segundo-componente-hijo.scss**:
```scss
@include md {  ← Uso de mixin responsive ✅
  padding: $espaciado-12 $espaciado-16;
  min-height: 48px;
}
```

**EVALUACIÓN**:
- ✅ Usa mixin responsive
- ❌ Solo 1 breakpoint (no hay móvil, tablet, escritorio)
- ❌ No implementa sistema 1-2-3 columnas requerido

**PUNTUACIÓN LAYOUT**: **3.0 / 10** (Nivel 2 - Parcial)

**Justificación**:
- ❌ No implementa Grid (requisito del examen)
- ⚠️ Flexbox básico sin manipulación de ejes
- ❌ No implementa diseño 1-2-3 columnas
- ❌ No hay visualización de datos del endpoint

### 4. Semántica HTML (RA2)

#### Análisis HTML

**pagina-practica.html**:
```html
<main>  ← Etiqueta semántica ✅
  <h1>Pagina para la practica del examen</h1>  ← Jerarquía ✅
  <section>  ← Etiqueta semántica ✅
    <h2>Componente padre</h2>  ← Jerarquía correcta ✅
    <componente-hijo></componente-hijo>
  </section>
  <section>  ← Etiqueta semántica ✅
    <h2>Componente hijo</h2>
    <app-segundo-componente-hijo></app-segundo-componente-hijo>
  </section>
</main>
```

**EVALUACIÓN**:
- ✅ Usa `<main>` (contenido principal)
- ✅ Usa `<section>` (secciones lógicas)
- ✅ Jerarquía de encabezados correcta (h1 → h2)
- ✅ No hay divitis

**componente-hijo.html**:
```html
<main>
  <input class="Input_componente-hijo" />
</main>
```

**EVALUACIÓN**:
- ⚠️ Usa `<main>` pero no debería (es un componente, no página completa)
- ❌ Input sin `<label>` (accesibilidad)

**segundo-componente-hijo.html**:
```html
<main>
  <input
    class="data-input__input"
    [type]="type"
    [placeholder]="label || placeholder"
    [disabled]="disabled"
    [value]="value"
    [attr.aria-label]="label || placeholder"  ← ARIA label ✅
    (input)="onInputChange($event)"
    (blur)="onBlur()"
  />Introduce lo que quieras
</main>
```

**EVALUACIÓN**:
- ✅ Usa atributos ARIA (accesibilidad)
- ⚠️ Usa `<main>` incorrectamente
- ❌ Input sin `<label>` visual

**PUNTUACIÓN SEMÁNTICA**: **6.0 / 10** (Nivel 3 - Correcto)

### 5. Justificación de Decisiones

**Archivo PRUEBA-PRACTICA-DIW.md**:

#### Pregunta 1: Arquitectura
> "Lo he hecho asi para una mayor separacion por capas. Lo que ocurriria 
> es que a a la hora de cambiar las variables de color estas no se 
> aplicarian correctamente junto a una mayor lentitud del programa"

**EVALUACIÓN**:
- ⚠️ Respuesta básica y genérica
- ⚠️ "Mayor lentitud" es incorrecto (SCSS compila, no hay lentitud en runtime)
- ✅ Menciona separación de capas (concepto correcto)
- ❌ No explica cascada ni especificidad con precisión

#### Pregunta 2: BEM
> "Una ventaja real que aporta la aplicacion dde BEM es la escabilidad 
> que aporta los estilos a la hora de las decisiones de aplicacion de 
> estilo dado que este como es una estructura modular basada en padre-hijo 
> esta se puede repitir o escalar en funcion de las necesidades."

**EVALUACIÓN**:
- ✅ Menciona escalabilidad (concepto correcto)
- ✅ Menciona modularidad
- ❌ No explica ventaja frente a selectores anidados específicamente
- ⚠️ Respuesta genérica, no técnica

**PUNTUACIÓN JUSTIFICACIÓN**: **5.0 / 10** (Nivel 3 - Correcto básico)

---

### PUNTUACIÓN BLOQUE DIW

| Criterio | Puntuación | Nivel | Justificación |
|----------|-----------|-------|---------------|
| **1. Arquitectura ITCSS** | 4.0 / 10 | Nivel 2 | Variables definidas pero no usadas, estructura desordenada |
| **2. Metodología BEM** | 5.0 / 10 | Nivel 3 | BEM en 1 componente, inconsistente |
| **3. Layout Responsive** | 3.0 / 10 | Nivel 2 | Sin Grid, Flexbox básico, sin sistema columnas |
| **4. Semántica HTML** | 6.0 / 10 | Nivel 3 | Etiquetas correctas, jerarquía válida |
| **5. Justificación** | 5.0 / 10 | Nivel 3 | Respuestas básicas y genéricas |

**NOTA ESTIMADA DIW**: **4.6 / 10**

---

## RESUMEN GENERAL

### Notas por Bloque

| Bloque | Nota | Observaciones |
|--------|------|---------------|
| **DWES** | 3.0 / 10 | ❌ Arquitectura incorrecta, sin seguridad |
| **DWEC** | 6.0 / 10 | ⚠️ Routing correcto, componentes básicos |
| **DIW** | 4.6 / 10 | ⚠️ Estructura básica, requisitos incompletos |

### NOTA MEDIA GLOBAL: **4.5 / 10** (SUSPENSO)

---

## PUNTOS FUERTES ✅

1. **Commits**: 14 commits (más de 10 requeridos)
2. **Documentación**: Los 3 archivos MD creados
3. **Routing Angular**: Implementación correcta con lazy loading
4. **Navegación**: Header y footer correctamente modificados
5. **Semántica HTML**: Uso apropiado de etiquetas HTML5
6. **SCSS**: Uso de preprocesador y mixins

---

## PUNTOS DÉBILES ❌

### CRÍTICOS (Afectan gravemente la nota):

1. **❌❌ SEGURIDAD BACKEND**: NO implementada (requisito obligatorio)
   - Sin JWT validation
   - Sin ownership check
   - Endpoint público sin protección

2. **❌ ARQUITECTURA BACKEND**: Violación de capas
   - Lógica en Entity en vez de Service
   - Controller llama directamente a Entity

3. **❌ CSS GRID**: No implementado (requisito explícito del examen)

4. **❌ VARIABLES SCSS**: Definidas pero nunca usadas

5. **❌ RELACIÓN PADRE-HIJO**: No hay comunicación real entre componentes

### IMPORTANTES:

6. **❌ Sin pruebas Backend**: No hay evidencia de testing
7. **❌ Sin consumo de datos**: Frontend no consume el endpoint creado
8. **❌ Responsive limitado**: No implementa sistema 1-2-3 columnas
9. **❌ BEM inconsistente**: Aplicado solo en 1 componente
10. **❌ Documentación confusa**: Información incorrecta sobre implementación

---

## RECOMENDACIONES PARA MEJORA

### Backend (DWES):
1. Mover lógica de `cantidadMedicamentosConsumidos` del Entity al Service
2. Implementar seguridad JWT:
```java
@GetMapping("/cantidad")
public Integer medicamentosConsumidos() {
    Usuario usuario = SecurityUtil.getCurrentUser(usuarioRepository);
    return gestorMedicamentosService.contarMedicamentos(usuario.getId());
}
```
3. Agregar capturas de Postman/Insomnia con JWT en headers

### Frontend (DWEC):
1. Crear servicio para consumir `/api/gestores/cantidad`
2. Inyectar servicio en `PaginaPracticaComponent`
3. Pasar datos reales a componentes hijos con `@Input`
4. Crear interfaces TypeScript para tipar datos

### Diseño (DIW):
1. Usar las variables creadas:
```scss
.componente-hijo {
  background-color: $color-aniadido-primero;
  border: 2px solid $color-aniadido-segundo;
}
```
2. Implementar Grid:
```scss
.lista-medicamentos {
  display: grid;
  grid-template-columns: 1fr; // móvil
  @include md {
    grid-template-columns: repeat(2, 1fr); // tablet
  }
  @include lg {
    grid-template-columns: repeat(3, 1fr); // escritorio
  }
}
```
3. Aplicar BEM consistentemente en todos los componentes

---

## CONCLUSIÓN

El alumno Sergio Aragón García ha demostrado:

**Conocimientos básicos** en:
- Routing y navegación Angular
- Estructura de componentes
- Uso de SCSS y preprocesadores
- Semántica HTML5

**Deficiencias graves** en:
- Seguridad backend (crítico)
- Arquitectura de capas
- CSS Grid y diseño responsive completo
- Uso efectivo de variables SCSS
- Comunicación entre componentes

**Calificación Final**: **SUSPENSO (4.5/10)**

Para aprobar, es **IMPRESCINDIBLE** implementar la seguridad del endpoint backend y completar los requisitos de diseño (Grid, variables SCSS utilizadas, sistema responsive completo).

---

**Evaluador**: Sistema Automático de Evaluación  
**Fecha de evaluación**: 10 de Febrero de 2025  
**Rama evaluada**: `prueba-practica`  
**Commits analizados**: 14 (del 1e18ed2 al bad4009)
