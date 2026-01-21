# Guía de Contribución

Gracias por tu interés en contribuir a este proyecto. Este documento proporciona instrucciones sobre cómo colaborar.

## 🙋 Antes de Empezar

1. Lee el [README](README.md)
2. Revisa la [Documentación Técnica](docs/DOCUMENTACION_TECNICA.md)
3. Asegúrate de comprender la arquitectura del proyecto

---

## 📋 Proceso de Contribución

### 1. Reportar Bugs

#### Antes de crear un issue:
- ✅ Busca en issues existentes
- ✅ Verifica que sea un bug real (no falta de documentación)
- ✅ Intenta reproducir el error

#### Crear Issue de Bug:
```markdown
**Descripción**
Explicación clara del bug.

**Pasos para reproducir**
1. Paso 1
2. Paso 2
3. Paso 3

**Comportamiento esperado**
Qué debería suceder

**Comportamiento actual**
Qué sucede realmente

**Información del sistema**
- OS: Windows/Mac/Linux
- Node: v20.x
- Angular: 21.x
- Browser: Chrome 130

**Logs o screenshots**
Si aplica, adjunta logs o screenshots
```

### 2. Sugerir Features

#### Crear Issue de Feature:
```markdown
**Descripción**
Descripción clara de la feature.

**Problema que resuelve**
Por qué es necesaria

**Solución propuesta**
Cómo debería implementarse

**Alternativas consideradas**
Otros enfoques

**Contexto adicional**
Información relevante
```

### 3. Crear Pull Request

#### Paso 1: Fork y Clone
```bash
git clone https://github.com/tu-usuario/proyecto.git
cd proyecto
npm install
```

#### Paso 2: Crear Rama Feature
```bash
# Actualizar main primero
git checkout main
git pull origin main

# Crear rama feature
git checkout -b feature/nombre-descriptivo
```

**Nombres de rama permitidos:**
- `feature/nueva-caracteristica`
- `fix/nombre-del-bug`
- `docs/actualizar-documentacion`
- `refactor/mejorar-componente`
- `test/agregar-tests`

#### Paso 3: Hacer Cambios

```bash
# Editar código
# Agregar tests si es necesario

# Verificar que funciona
npm start      # Dev server
npm test       # Tests
npm run build  # Build production
```

#### Paso 4: Commit

```bash
# Formato: type(scope): subject

git commit -m "feat(medicine): agregar filtro por categoría"
git commit -m "fix(user): corregir validación de email"
git commit -m "docs(readme): actualizar setup"
git commit -m "test(medicine): agregar tests para getById"
git commit -m "refactor(styles): reorganizar SCSS"
```

**Tipos válidos:**
- `feat` - Nueva feature
- `fix` - Bug fix
- `docs` - Cambios de documentación
- `style` - Formato (prettier, etc)
- `refactor` - Refactorización
- `perf` - Mejoras de performance
- `test` - Agregar/actualizar tests
- `chore` - Build, deps, etc

**Ejemplos con scope:**
```bash
git commit -m "feat(medicine-service): agregar method getById()"
git commit -m "fix(tooltip-directive): corregir z-index"
git commit -m "test(user-service): mejorar coverage"
git commit -m "refactor(medicine-component): simplificar template"
```

#### Paso 5: Push

```bash
git push origin feature/nombre-descriptivo
```

#### Paso 6: Pull Request

1. Ve a GitHub
2. Click "Compare & pull request"
3. Completa la descripción

**Template PR:**
```markdown
## Descripción
Explicación de los cambios.

## Tipo de Cambio
- [ ] Bug fix
- [ ] Nueva feature
- [ ] Breaking change
- [ ] Documentación

## Cómo ha sido testeado
Describe cómo verificaste que funciona.

## Screenshots (si aplica)
Adjunta screenshots.

## Checklist
- [ ] Mi código sigue el style guide
- [ ] He actualizado la documentación
- [ ] He agregado tests
- [ ] Los tests pasan localmente
- [ ] No hay breaking changes
```

---

## 📝 Estándares de Código

### TypeScript

```typescript
// ✅ Bien - Tipos explícitos
interface Medicine {
  id: number;
  name: string;
}

class MedicineService {
  constructor(private http: HttpClient) {}

  getMedicines(): Observable<Medicine[]> {
    return this.http.get<Medicine[]>('/api/medicines');
  }
}

// ❌ Mal - Sin tipos
let medicine = { id: 1, name: 'Paracetamol' };
getMedicines() {
  return this.http.get('/api/medicines');
}
```

### Componentes

```typescript
// ✅ Bien
@Component({
  selector: 'app-medicine-card',
  templateUrl: './medicine-card.component.html',
  styleUrls: ['./medicine-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MedicineCardComponent {
  @Input() medicine!: Medicine;
  @Output() selected = new EventEmitter<Medicine>();
}

// ❌ Mal
@Component({
  selector: 'medicine-card',
  template: '<div>...</div>',
  styles: [`div { color: red; }`]
})
export class MedicineCard {
  medicine: any;
}
```

### Servicios

```typescript
// ✅ Bien
@Injectable({ providedIn: 'root' })
export class MedicineService {
  private medicinesSubject = new BehaviorSubject<Medicine[]>([]);
  medicines$ = this.medicinesSubject.asObservable();

  constructor(private http: HttpClient) {}

  getMedicines(): Observable<Medicine[]> {
    return this.http.get<Medicine[]>('/api/medicines').pipe(
      tap(medicines => this.medicinesSubject.next(medicines)),
      catchError(error => this.handleError(error))
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Error:', error);
    return throwError(() => error);
  }
}
```

### Directives

```typescript
// ✅ Bien
@Directive({
  selector: '[appTooltip]',
  standalone: true
})
export class TooltipDirective {
  @Input('appTooltip') text = '';
  @Input() tooltipDelay = 300;

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) {}

  @HostListener('mouseenter')
  onMouseEnter() {
    this.show();
  }
}
```

### HTML Templates

```html
<!-- ✅ Bien -->
<div class="medicine-card" [attr.aria-label]="medicine.name">
  <h2>{{ medicine.name }}</h2>
  <p>{{ medicine.description }}</p>
  <button 
    (click)="onSelect()"
    [disabled]="isLoading"
    class="btn btn-primary"
  >
    Seleccionar
  </button>
</div>

<!-- ❌ Mal -->
<div>
  <h2 onclick="select()">{{ medicine.name }}</h2>
  <p innerHTML="{{ medicine.description }}"></p>
  <button style="color: red; padding: 10px;">Click</button>
</div>
```

### SCSS

```scss
// ✅ Bien
.medicine-card {
  display: grid;
  gap: $spacing-md;
  padding: $spacing-lg;
  background: $color-surface;
  border-radius: $border-radius-md;

  &__title {
    @include heading-2;
    margin: 0;
  }

  &__description {
    color: $color-text-secondary;
    line-height: $line-height-relaxed;
  }

  &:hover {
    box-shadow: $shadow-md;
  }
}

// ❌ Mal
.medicineCard {
  display: grid;
  padding: 16px;
  background: white;
  border-radius: 4px;
}

.medicineCard h2 {
  margin: 0;
  font-size: 20px;
}
```

---

## 🧪 Testing

### Requisitos

- ✅ Tests para nuevas features
- ✅ Mínimo 80% coverage en nuevos archivos
- ✅ Tests deben pasar localmente

### Escribir Tests

```typescript
describe('MedicineService', () => {
  let service: MedicineService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [MedicineService]
    });

    service = TestBed.inject(MedicineService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getMedicines()', () => {
    it('should fetch medicines from API', () => {
      const mockMedicines: Medicine[] = [
        { id: 1, name: 'Paracetamol', dose: '500mg' }
      ];

      service.getMedicines().subscribe(medicines => {
        expect(medicines).toEqual(mockMedicines);
      });

      const req = httpMock.expectOne('/api/medicines');
      expect(req.request.method).toBe('GET');
      req.flush(mockMedicines);
    });

    it('should handle errors', () => {
      const errorMessage = 'Error loading medicines';

      service.getMedicines().subscribe(
        () => fail('should have failed'),
        (error: HttpErrorResponse) => {
          expect(error.status).toBe(500);
        }
      );

      const req = httpMock.expectOne('/api/medicines');
      req.error(new ErrorEvent('error'), {
        status: 500,
        statusText: 'Server error'
      });
    });
  });

  it('should emit medicines via observable', (done) => {
    const mockMedicines: Medicine[] = [
      { id: 1, name: 'Paracetamol', dose: '500mg' }
    ];

    service.getMedicines().subscribe(medicines => {
      expect(medicines.length).toBe(1);
      done();
    });

    const req = httpMock.expectOne('/api/medicines');
    req.flush(mockMedicines);
  });
});
```

### Ejecutar Tests

```bash
# Tests unitarios
npm test

# Con coverage
npm run test:coverage

# Watch mode
npm run test:watch

# CI mode
npm run test:ci

# Tests específicos
npm test -- --include='**/medicine.service.spec.ts'
```

---

## 📚 Documentación

### Actualizar Documentación

Si cambias funcionalidad, actualiza:
- `README.md` - Si aplica
- Archivos en `/docs` - Documentación técnica
- JSDoc en código - Comentarios en funciones

### JSDoc Example

```typescript
/**
 * Obtiene todos los medicamentos disponibles
 * 
 * @example
 * this.medicineService.getAll().subscribe(medicines => {
 *   console.log('Medicinas:', medicines);
 * });
 * 
 * @returns Observable<Medicine[]> - Lista de medicamentos
 * @throws HttpErrorResponse - Si la API retorna error
 */
getAll(): Observable<Medicine[]> {
  return this.http.get<Medicine[]>('/api/medicines');
}
```

---

## 🔄 Review Process

### Validación Automática

Cuando subes PR:
1. ✅ Tests deben pasar
2. ✅ Coverage > 50%
3. ✅ Build debe compilar sin errores
4. ✅ No debe haber conflictos

### Revisión Manual

Al menos 1 revisor debe:
- [ ] Revisar código
- [ ] Verificar cambios
- [ ] Sugerir mejoras si es necesario
- [ ] Aprobar o solicitar cambios

### Cambios Solicitados

Si hay comentarios:
1. Lee los comentarios
2. Haz los cambios
3. Responde con explicación o pregunta
4. Marca como resuelto

---

## ✅ Checklist Pre-Submit

Antes de hacer submit del PR:

- [ ] Rama actualizada con `main`
- [ ] Tests pasan: `npm run test:ci`
- [ ] Build compila: `npm run build`
- [ ] Coverage > 50%
- [ ] Sin console.log() o console.warn()
- [ ] Código sigue el style guide
- [ ] Documentación actualizada
- [ ] Commits bien formateados
- [ ] PR description es clara

---

## 🚀 Después de Merge

Una vez que tu PR es mergeado:

1. Tu rama se eliminará automáticamente
2. Los cambios estarán en `main`
3. Tu nombre aparecerá en contribuidores

---

## 📞 Contacto

¿Preguntas o sugerencias?
- Abre una issue en GitHub
- Revisa documentación en `/docs`
- Busca en issues similares

---

## 📜 Licencia

Al contribuir, aceptas que tu código será licenciado bajo MIT.

---

**¡Gracias por contribuir! 🙏**
