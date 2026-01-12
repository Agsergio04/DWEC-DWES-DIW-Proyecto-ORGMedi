import { 
  Component, 
  ChangeDetectionStrategy, 
  inject,
  signal,
  computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MedicineStoreSignals } from '../../data/stores/medicine-signals.store';
import { MedicineViewModel } from '../../data/models/medicine.model';

/**
 * Componente de demostración: Búsqueda con Signals
 * 
 * Características:
 * ✅ Angular Signals (sin RxJS)
 * ✅ signal() para el término de búsqueda
 * ✅ computed() para resultados filtrados (se actualiza automáticamente)
 * ✅ OnPush con Signals (detección de cambios óptima)
 * ✅ Sin async pipe (acceso directo con ())
 * ✅ Sin subscriptions (no hay memory leaks)
 * ✅ trackBy para evitar flickering
 * ✅ Patrón moderno y más simple que RxJS
 * 
 * Ventajas de Signals vs Observables:
 * ✅ Más simple: No requiere async pipe, subscribe, unsubscribe
 * ✅ Mejor rendimiento: Actualizaciones más granulares
 * ✅ Código más limpio: Menos boilerplate
 * ✅ Type-safe: Errores en compile-time
 * ✅ Debugging más fácil: Valores síncronos
 * ✅ No hay memory leaks: Sin subscriptions que olvidar
 * 
 * Diferencias con búsqueda Observable:
 * - No usa FormControl, sino [(ngModel)] con signal
 * - No usa valueChanges.pipe(), sino computed()
 * - No usa async pipe, sino acceso directo con ()
 * - Actualización automática cuando searchTerm cambia
 * - Menos código, más declarativo
 * 
 * Patrón Signals:
 * const searchTerm = signal('');           // Señal mutable
 * const filtered = computed(() => {        // Señal computada (auto-update)
 *   return data.filter(item => 
 *     item.name.includes(searchTerm())
 *   );
 * });
 */
@Component({
  selector: 'app-medicines-search-signals',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="search-container">
      <!-- Header -->
      <header class="header">
        <div class="header-content">
          <div>
            <h2>Búsqueda con Signals 🚀</h2>
            <p class="subtitle">
              Patrón moderno de Angular sin RxJS ni async pipe
            </p>
          </div>
          <div class="signals-badge">
            <span class="badge-icon">⚡</span>
            <div>
              <strong>Angular Signals</strong>
              <small>v18+</small>
            </div>
          </div>
        </div>
      </header>

      <!-- Barra de búsqueda -->
      <div class="search-bar">
        <div class="search-input-wrapper">
          <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          
          <input 
            type="search" 
            [(ngModel)]="searchTerm"
            (ngModelChange)="onSearchChange($event)"
            placeholder="Buscar con signals..."
            class="search-input"
            autocomplete="off">
          
          @if (searchTerm()) {
            <button 
              (click)="clearSearch()" 
              class="clear-button"
              type="button"
              aria-label="Limpiar búsqueda">
              ✕
            </button>
          }
        </div>

        <!-- Info técnica -->
        <div class="search-info">
          <span class="info-badge badge-signals">
            <strong>⚡ Patrón:</strong> Signals (sin Observables)
          </span>
          <span class="info-badge">
            <strong>🎯 Tipo:</strong> Filtrado local reactivo
          </span>
          <span class="info-badge">
            <strong>🔄 Update:</strong> Automático (computed)
          </span>
          <span class="info-badge">
            <strong>💾 Memory:</strong> Sin leaks (sin subscriptions)
          </span>
        </div>
      </div>

      <!-- Resultados -->
      <div class="results-section">
        <!-- Info de resultados -->
        <div class="results-header">
          @if (searchTerm()) {
            <p class="results-count">
              <strong>{{ filteredMedicines().length }}</strong> 
              {{ filteredMedicines().length === 1 ? 'resultado encontrado' : 'resultados encontrados' }}
              para <em>"{{ searchTerm() }}"</em>
            </p>
          } @else {
            <p class="results-count">
              Mostrando todos los medicamentos (<strong>{{ filteredMedicines().length }}</strong>)
            </p>
          }

          <!-- Contador de updates -->
          <div class="update-counter">
            <span class="counter-badge">
              🔄 Actualizaciones: <strong>{{ updateCount() }}</strong>
            </span>
            <small>Cada vez que escribes, computed() se ejecuta automáticamente</small>
          </div>
        </div>

        <!-- Estado: Sin resultados -->
        @if (filteredMedicines().length === 0 && searchTerm()) {
          <div class="empty-state">
            <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <h3>No se encontraron medicamentos</h3>
            <p>Intenta con otros términos de búsqueda</p>
            <button (click)="clearSearch()" class="btn-clear">
              Limpiar búsqueda
            </button>
          </div>
        }

        <!-- Lista de resultados -->
        @else {
          <div class="medicines-grid">
            @for (medicine of filteredMedicines(); track medicine.id) {
              <article 
                class="medicine-card"
                [class.expired]="medicine.isExpired"
                [class.expiring]="medicine.expirationStatus === 'expiring-soon'">
                
                <!-- Header -->
                <div class="card-header">
                  <h3 class="medicine-name" [innerHTML]="highlightTerm(medicine.displayName || medicine.name)"></h3>
                  <span class="status-badge" [class]="'status-' + medicine.expirationStatus">
                    {{ getStatusLabel(medicine.expirationStatus) }}
                  </span>
                </div>

                <!-- Body -->
                <div class="card-body">
                  <div class="info-row">
                    <span class="info-label">Dosis:</span>
                    <span class="info-value" [innerHTML]="highlightTerm(medicine.dosage)"></span>
                  </div>
                  
                  <div class="info-row">
                    <span class="info-label">Frecuencia:</span>
                    <span class="info-value">{{ medicine.frequency }}</span>
                  </div>
                  
                  @if (medicine.description) {
                    <div class="info-row description">
                      <span class="info-label">Descripción:</span>
                      <p [innerHTML]="highlightTerm(medicine.description)"></p>
                    </div>
                  }

                  <div class="info-row">
                    <span class="info-label">Inicio:</span>
                    <span class="info-value">{{ medicine.formattedStartDate }}</span>
                  </div>
                </div>

                <!-- Footer -->
                <div class="card-footer">
                  <a [routerLink]="['/edit-medicine', medicine.id]" class="btn-card-action">
                    ✏️ Editar
                  </a>
                  <a [routerLink]="['/medicines', medicine.id]" class="btn-card-action">
                    👁️ Ver
                  </a>
                </div>
              </article>
            }
          </div>
        }
      </div>

      <!-- Explicación técnica -->
      <div class="tech-explanation">
        <h4>⚡ Signals: El futuro de la reactividad en Angular</h4>
        
        <div class="explanation-section">
          <h5>1️⃣ Implementación con Signals</h5>
          <div class="code-example">
            <pre><code>// Señal para el término de búsqueda
searchTerm = signal('');

// Señal computada (se actualiza automáticamente)
filteredMedicines = computed(() => {
  const term = this.searchTerm();      // Lee la señal
  const medicines = store.medicines(); // Lee otra señal
  
  if (!term) return medicines;
  
  return medicines.filter(m =>         // Filtra en base a ambas
    m.name.toLowerCase().includes(term.toLowerCase())
  );
});

// En el template (sin async pipe)
{{ filteredMedicines().length }}       // Acceso directo con ()
</code></pre>
          </div>
        </div>

        <div class="explanation-section">
          <h5>2️⃣ Ventajas sobre Observables (RxJS)</h5>
          <div class="comparison-grid">
            <div class="comparison-card advantage">
              <span class="card-icon">✅</span>
              <h6>Más Simple</h6>
              <ul>
                <li>No requiere async pipe</li>
                <li>No hay subscribe/unsubscribe</li>
                <li>Menos operadores complejos</li>
              </ul>
            </div>
            
            <div class="comparison-card advantage">
              <span class="card-icon">⚡</span>
              <h6>Mejor Rendimiento</h6>
              <ul>
                <li>Actualizaciones granulares</li>
                <li>Solo re-renderiza lo necesario</li>
                <li>Menos overhead de RxJS</li>
              </ul>
            </div>
            
            <div class="comparison-card advantage">
              <span class="card-icon">🛡️</span>
              <h6>Type-Safe</h6>
              <ul>
                <li>Tipos inferidos automáticamente</li>
                <li>Errores en compile-time</li>
                <li>Mejor IntelliSense</li>
              </ul>
            </div>
            
            <div class="comparison-card advantage">
              <span class="card-icon">🐛</span>
              <h6>Debugging Fácil</h6>
              <ul>
                <li>Valores síncronos</li>
                <li>console.log(signal()) funciona</li>
                <li>No hay streams complejos</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="explanation-section">
          <h5>3️⃣ Código comparativo: Observables vs Signals</h5>
          <div class="comparison-code">
            <div class="code-column">
              <h6>❌ Con Observables (RxJS)</h6>
              <div class="code-example">
                <pre><code>// Component
searchControl = new FormControl('');
medicines$: Observable<Medicine[]>;

ngOnInit() {
  this.medicines$ = searchControl
    .valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => 
        store.search(term)
      ),
      takeUntilDestroyed()  // ⚠️ Recordar!
    );
}

// Template
&lt;div *ngIf="medicines$ | async as m"&gt;
  {{ m.length }}
&lt;/div&gt;</code></pre>
              </div>
            </div>

            <div class="code-column">
              <h6>✅ Con Signals (Moderno)</h6>
              <div class="code-example">
                <pre><code>// Component
searchTerm = signal('');

filtered = computed(() => 
  store.filterBySearch(
    this.searchTerm
  )
);

// ✅ No hay ngOnInit
// ✅ No hay subscriptions
// ✅ No hay memory leaks







// Template
&lt;div&gt;
  {{ filtered().length }}
&lt;/div&gt;</code></pre>
              </div>
            </div>
          </div>
        </div>

        <div class="explanation-section">
          <h5>4️⃣ Cuándo usar cada patrón</h5>
          <table class="when-to-use-table">
            <thead>
              <tr>
                <th>Escenario</th>
                <th>Usa Signals</th>
                <th>Usa Observables</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Estado local del componente</strong></td>
                <td>✅ Ideal</td>
                <td>❌ Overkill</td>
              </tr>
              <tr>
                <td><strong>Búsquedas/filtros simples</strong></td>
                <td>✅ Más simple</td>
                <td>⚠️ Funciona pero verboso</td>
              </tr>
              <tr>
                <td><strong>HTTP requests</strong></td>
                <td>⚠️ Requiere convertir</td>
                <td>✅ Nativo</td>
              </tr>
              <tr>
                <td><strong>Múltiples operadores async</strong></td>
                <td>❌ Limitado</td>
                <td>✅ Mejor opción</td>
              </tr>
              <tr>
                <td><strong>Valores derivados</strong></td>
                <td>✅ computed() perfecto</td>
                <td>⚠️ combineLatest verboso</td>
              </tr>
              <tr>
                <td><strong>Eventos del usuario</strong></td>
                <td>✅ Directo con (click)</td>
                <td>⚠️ fromEvent necesario</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="best-practices">
          <h5>💡 Best Practices con Signals</h5>
          <ul>
            <li>✅ Usa <code>signal()</code> para estado mutable</li>
            <li>✅ Usa <code>computed()</code> para valores derivados (nunca manual)</li>
            <li>✅ Usa <code>effect()</code> solo para side-effects (logging, DOM, etc)</li>
            <li>⚠️ No llames a <code>set()</code> o <code>update()</code> dentro de <code>computed()</code></li>
            <li>⚠️ No uses <code>effect()</code> para actualizar otras señales</li>
            <li>✅ Prefiere Signals sobre Observables para estado de UI</li>
            <li>✅ Combina Signals + Observables cuando sea necesario (toSignal, toObservable)</li>
          </ul>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .search-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem;
    }

    /* Header */
    .header {
      margin-bottom: 2rem;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 2rem;
    }

    .header h2 {
      margin: 0 0 0.5rem;
      font-size: 1.75rem;
      color: var(--color-text-primary, #1a202c);
    }

    .subtitle {
      margin: 0;
      color: var(--color-text-secondary, #718096);
      font-size: 0.95rem;
    }

    .signals-badge {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 1.5rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 0.75rem;
      color: white;
      box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);
    }

    .badge-icon {
      font-size: 2rem;
    }

    .signals-badge strong {
      display: block;
      font-size: 1rem;
      margin-bottom: 0.25rem;
    }

    .signals-badge small {
      display: block;
      font-size: 0.75rem;
      opacity: 0.9;
    }

    /* Barra de búsqueda */
    .search-bar {
      margin-bottom: 2rem;
    }

    .search-input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      background: white;
      border: 2px solid var(--color-border, #e2e8f0);
      border-radius: 0.75rem;
      padding: 0.75rem 1rem;
      transition: all 0.2s;
    }

    .search-input-wrapper:focus-within {
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .search-icon {
      width: 1.5rem;
      height: 1.5rem;
      color: var(--color-text-tertiary, #a0aec0);
      margin-right: 0.75rem;
      flex-shrink: 0;
    }

    .search-input {
      flex: 1;
      border: none;
      outline: none;
      font-size: 1rem;
      color: var(--color-text-primary, #1a202c);
      background: transparent;
    }

    .search-input::placeholder {
      color: var(--color-text-tertiary, #a0aec0);
    }

    .clear-button {
      width: 2rem;
      height: 2rem;
      border: none;
      background: var(--color-bg-secondary, #f7fafc);
      border-radius: 50%;
      color: var(--color-text-secondary, #718096);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      transition: all 0.2s;
      flex-shrink: 0;
    }

    .clear-button:hover {
      background: var(--color-bg-tertiary, #e2e8f0);
      color: var(--color-text-primary, #1a202c);
    }

    /* Info de búsqueda */
    .search-info {
      display: flex;
      gap: 0.75rem;
      margin-top: 1rem;
      flex-wrap: wrap;
    }

    .info-badge {
      display: inline-block;
      padding: 0.375rem 0.75rem;
      background: var(--color-bg-secondary, #f7fafc);
      border: 1px solid var(--color-border, #e2e8f0);
      border-radius: 9999px;
      font-size: 0.8rem;
      color: var(--color-text-secondary, #718096);
    }

    .info-badge.badge-signals {
      background: #ede9fe;
      border-color: #8b5cf6;
      color: #5b21b6;
    }

    .info-badge strong {
      color: var(--color-text-primary, #1a202c);
      margin-right: 0.25rem;
    }

    /* Contador de updates */
    .update-counter {
      margin-top: 1rem;
      padding: 0.75rem 1rem;
      background: #fef3c7;
      border-left: 3px solid #f59e0b;
      border-radius: 0.375rem;
    }

    .counter-badge {
      display: inline-block;
      font-size: 0.9rem;
      color: #92400e;
      margin-bottom: 0.25rem;
    }

    .counter-badge strong {
      font-size: 1.1rem;
    }

    .update-counter small {
      display: block;
      font-size: 0.8rem;
      color: #b45309;
    }

    /* Resultados */
    .results-header {
      margin-bottom: 1.5rem;
    }

    .results-count {
      margin: 0 0 1rem;
      font-size: 0.95rem;
      color: var(--color-text-secondary, #718096);
    }

    .results-count strong {
      color: #8b5cf6;
      font-size: 1.1rem;
    }

    .results-count em {
      color: var(--color-text-primary, #1a202c);
      font-style: normal;
      font-weight: 600;
    }

    /* Estado vacío */
    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      background: var(--color-bg-secondary, #f7fafc);
      border-radius: 0.75rem;
    }

    .empty-icon {
      width: 4rem;
      height: 4rem;
      margin: 0 auto 1rem;
      color: var(--color-text-tertiary, #a0aec0);
    }

    .empty-state h3 {
      margin: 0 0 0.5rem;
      font-size: 1.25rem;
      color: var(--color-text-primary, #1a202c);
    }

    .empty-state p {
      margin: 0 0 1.5rem;
      color: var(--color-text-secondary, #718096);
    }

    .btn-clear {
      padding: 0.75rem 1.5rem;
      background: #8b5cf6;
      color: white;
      border: none;
      border-radius: 0.5rem;
      font-size: 0.95rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-clear:hover {
      background: #7c3aed;
      transform: translateY(-1px);
    }

    /* Grid de medicamentos */
    .medicines-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.5rem;
    }

    /* Tarjeta de medicamento */
    .medicine-card {
      background: white;
      border-radius: 0.75rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      transition: all 0.3s;
      display: flex;
      flex-direction: column;
    }

    .medicine-card:hover {
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
    }

    .medicine-card.expired {
      border-left: 4px solid #ef4444;
    }

    .medicine-card.expiring {
      border-left: 4px solid #f59e0b;
    }

    .card-header {
      padding: 1.25rem;
      border-bottom: 1px solid var(--color-border, #e2e8f0);
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1rem;
    }

    .medicine-name {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--color-text-primary, #1a202c);
      flex: 1;
    }

    .status-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
      white-space: nowrap;
    }

    .status-active {
      background: #d1fae5;
      color: #065f46;
    }

    .status-expiring-soon {
      background: #fef3c7;
      color: #92400e;
    }

    .status-expired {
      background: #fee2e2;
      color: #991b1b;
    }

    .card-body {
      padding: 1.25rem;
      flex: 1;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.75rem;
      font-size: 0.9rem;
    }

    .info-row.description {
      flex-direction: column;
      margin-top: 1rem;
    }

    .info-row.description p {
      margin: 0.5rem 0 0;
      color: var(--color-text-secondary, #718096);
      font-size: 0.85rem;
      line-height: 1.5;
    }

    .info-label {
      font-weight: 600;
      color: var(--color-text-secondary, #718096);
    }

    .info-value {
      color: var(--color-text-primary, #1a202c);
    }

    .card-footer {
      padding: 1rem 1.25rem;
      background: var(--color-bg-secondary, #f7fafc);
      border-top: 1px solid var(--color-border, #e2e8f0);
      display: flex;
      gap: 0.75rem;
    }

    .btn-card-action {
      flex: 1;
      padding: 0.625rem 1rem;
      background: white;
      border: 1px solid var(--color-border, #e2e8f0);
      border-radius: 0.375rem;
      font-size: 0.85rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      text-align: center;
      text-decoration: none;
      color: var(--color-text-primary, #1a202c);
    }

    .btn-card-action:hover {
      background: var(--color-bg-secondary, #f7fafc);
      border-color: #8b5cf6;
      color: #8b5cf6;
    }

    /* Resaltado */
    :host ::ng-deep .highlight {
      background: #fef3c7;
      color: #92400e;
      padding: 0 0.25rem;
      border-radius: 0.25rem;
      font-weight: 600;
    }

    /* Explicación técnica */
    .tech-explanation {
      margin-top: 3rem;
      padding: 2rem;
      background: var(--color-bg-secondary, #f7fafc);
      border-radius: 0.75rem;
      border-left: 4px solid #8b5cf6;
    }

    .tech-explanation h4 {
      margin: 0 0 2rem;
      font-size: 1.25rem;
      color: var(--color-text-primary, #1a202c);
    }

    .explanation-section {
      margin-bottom: 2.5rem;
    }

    .explanation-section:last-child {
      margin-bottom: 0;
    }

    .explanation-section h5 {
      margin: 0 0 1rem;
      font-size: 1.05rem;
      color: var(--color-text-primary, #1a202c);
    }

    .code-example {
      background: #1a202c;
      padding: 1.5rem;
      border-radius: 0.5rem;
      overflow-x: auto;
    }

    .code-example code {
      color: #e2e8f0;
      font-family: 'Monaco', 'Courier New', monospace;
      font-size: 0.85rem;
      line-height: 1.7;
    }

    /* Comparison grid */
    .comparison-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.25rem;
      margin-top: 1rem;
    }

    .comparison-card {
      padding: 1.5rem;
      background: white;
      border-radius: 0.5rem;
      border: 2px solid var(--color-border, #e2e8f0);
    }

    .comparison-card.advantage {
      border-color: #10b981;
    }

    .card-icon {
      display: block;
      font-size: 2rem;
      margin-bottom: 0.75rem;
    }

    .comparison-card h6 {
      margin: 0 0 0.75rem;
      font-size: 1rem;
      color: var(--color-text-primary, #1a202c);
    }

    .comparison-card ul {
      margin: 0;
      padding-left: 1.25rem;
      list-style: disc;
    }

    .comparison-card li {
      font-size: 0.85rem;
      color: var(--color-text-secondary, #718096);
      margin-bottom: 0.375rem;
    }

    /* Comparison code */
    .comparison-code {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      margin-top: 1rem;
    }

    .code-column h6 {
      margin: 0 0 0.75rem;
      font-size: 0.95rem;
      color: var(--color-text-primary, #1a202c);
    }

    /* Tabla when-to-use */
    .when-to-use-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 1rem;
      background: white;
      border-radius: 0.5rem;
      overflow: hidden;
    }

    .when-to-use-table thead {
      background: #8b5cf6;
      color: white;
    }

    .when-to-use-table th,
    .when-to-use-table td {
      padding: 0.875rem 1rem;
      text-align: left;
      border-bottom: 1px solid var(--color-border, #e2e8f0);
    }

    .when-to-use-table th {
      font-weight: 600;
      font-size: 0.9rem;
    }

    .when-to-use-table td {
      font-size: 0.85rem;
      color: var(--color-text-secondary, #718096);
    }

    .when-to-use-table tbody tr:hover {
      background: var(--color-bg-secondary, #f7fafc);
    }

    .when-to-use-table tbody tr:last-child td {
      border-bottom: none;
    }

    /* Best practices */
    .best-practices {
      padding: 1.5rem;
      background: white;
      border-radius: 0.5rem;
      border: 2px solid #10b981;
    }

    .best-practices h5 {
      margin: 0 0 1rem;
      font-size: 1.05rem;
      color: var(--color-text-primary, #1a202c);
    }

    .best-practices ul {
      margin: 0;
      padding-left: 1.5rem;
      line-height: 1.8;
    }

    .best-practices li {
      color: var(--color-text-secondary, #718096);
      margin-bottom: 0.5rem;
    }

    .best-practices code {
      background: #f1f5f9;
      padding: 0.125rem 0.375rem;
      border-radius: 0.25rem;
      font-family: 'Monaco', 'Courier New', monospace;
      font-size: 0.85rem;
      color: #8b5cf6;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        align-items: flex-start;
      }

      .medicines-grid {
        grid-template-columns: 1fr;
      }

      .comparison-grid,
      .comparison-code {
        grid-template-columns: 1fr;
      }

      .when-to-use-table {
        font-size: 0.8rem;
      }
    }
  `]
})
export class MedicinesSearchSignalsComponent {
  private store = inject(MedicineStoreSignals);

  // Signal para el término de búsqueda (mutable)
  searchTerm = signal('');

  // Signal computada para los medicamentos filtrados (auto-update)
  filteredMedicines = computed(() => {
    // Incrementar contador de updates
    this.updateCount.update(count => count + 1);
    
    // Usar el método del store que devuelve una signal computada
    return this.store.filterBySearch(this.searchTerm)();
  });

  // Contador de actualizaciones para demostración
  updateCount = signal(0);

  constructor() {
    // Cargar medicamentos al iniciar
    this.store.load();
  }

  /**
   * Handler cuando cambia el término de búsqueda
   */
  onSearchChange(value: string): void {
    this.searchTerm.set(value);
  }

  /**
   * Limpia el input de búsqueda
   */
  clearSearch(): void {
    this.searchTerm.set('');
  }

  /**
   * Resalta el término de búsqueda en el texto
   */
  highlightTerm(text: string): string {
    const term = this.searchTerm()?.trim();
    if (!term || !text) {
      return text;
    }

    const regex = new RegExp(`(${term})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
  }

  /**
   * Obtiene el label del estado
   */
  getStatusLabel(status: 'active' | 'expiring-soon' | 'expired'): string {
    const labels = {
      'active': 'Activo',
      'expiring-soon': 'Por vencer',
      'expired': 'Vencido'
    };
    return labels[status];
  }
}
