import { 
  Component, 
  ChangeDetectionStrategy, 
  inject,
  DestroyRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { 
  debounceTime, 
  distinctUntilChanged, 
  switchMap,
  catchError,
  startWith,
  map
} from 'rxjs/operators';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MedicineService } from '../../data/medicine.service';
import { MedicineViewModel } from '../../data/models/medicine.model';
import { ToastService } from '../../shared/toast.service';

/**
 * Componente de demostración: Búsqueda remota con debounce
 * 
 * Características:
 * ✅ Búsqueda en servidor (llamadas HTTP reales)
 * ✅ debounceTime(300) + distinctUntilChanged()
 * ✅ switchMap() cancela búsquedas anteriores
 * ✅ Loading states durante la búsqueda
 * ✅ Manejo de errores con catchError
 * ✅ OnPush para rendimiento óptimo
 * ✅ trackBy para evitar flickering
 * ✅ takeUntilDestroyed para auto-unsubscribe
 * 
 * Diferencias con búsqueda local:
 * - Hace llamadas HTTP al backend
 * - switchMap cancela peticiones anteriores (evita race conditions)
 * - Muestra loading durante la búsqueda
 * - Ideal para datasets grandes o búsquedas complejas
 * - Permite búsqueda full-text en backend
 * 
 * Patrón de búsqueda remota:
 * searchControl.valueChanges.pipe(
 *   debounceTime(300),           // Esperar 300ms
 *   distinctUntilChanged(),      // Solo si cambió
 *   switchMap(term => {          // Cancelar búsquedas anteriores
 *     setLoading(true);
 *     return service.searchRemote(term).pipe(
 *       catchError(() => of([])), // Manejo de errores
 *       tap(() => setLoading(false))
 *     );
 *   })
 * )
 */
@Component({
  selector: 'app-medicines-search-remote',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="search-container">
      <!-- Header -->
      <header class="header">
        <h2>Búsqueda Remota de Medicamentos</h2>
        <p class="subtitle">
          Búsqueda en servidor con debounce y cancelación automática
        </p>
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
            [formControl]="searchControl" 
            placeholder="Buscar en el servidor..."
            class="search-input"
            autocomplete="off"
            [disabled]="(isLoading$ | async) || false">
          
          <!-- Spinner de carga -->
          @if (isLoading$ | async) {
            <div class="spinner"></div>
          }
          
          <!-- Botón limpiar -->
          @if (searchControl.value && !(isLoading$ | async)) {
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
          <span class="info-badge badge-remote">
            <strong>🌐 Tipo:</strong> Búsqueda remota (HTTP)
          </span>
          <span class="info-badge">
            <strong>⚡ Debounce:</strong> 300ms
          </span>
          <span class="info-badge">
            <strong>🚫 Cancelación:</strong> switchMap()
          </span>
          <span class="info-badge">
            <strong>📦 Timeout:</strong> 5 segundos
          </span>
        </div>

        <!-- Advertencia de estado de loading -->
        @if (isLoading$ | async) {
          <div class="loading-banner">
            <svg class="loading-icon" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/>
              <path d="M12 2 A10 10 0 0 1 22 12" stroke="currentColor" stroke-width="2" fill="none"/>
            </svg>
            Buscando en el servidor...
          </div>
        }
      </div>

      <!-- Resultados -->
      <div class="results-section">
        @if (searchResults$ | async; as medicines) {
          <!-- Info de resultados -->
          <div class="results-header">
            @if (searchControl.value) {
              <p class="results-count">
                <strong>{{ medicines.length }}</strong> 
                {{ medicines.length === 1 ? 'resultado encontrado' : 'resultados encontrados' }}
                en el servidor para <em>"{{ searchControl.value }}"</em>
              </p>
            } @else {
              <p class="results-count">
                Ingresa un término para buscar en el servidor
              </p>
            }
          </div>

          <!-- Estado: Sin resultados -->
          @if (medicines.length === 0 && searchControl.value && !(isLoading$ | async)) {
            <div class="empty-state">
              <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
                <line x1="8" y1="11" x2="14" y2="11"/>
              </svg>
              <h3>No se encontraron medicamentos</h3>
              <p>El servidor no encontró coincidencias para tu búsqueda</p>
              <button (click)="clearSearch()" class="btn-clear">
                Limpiar búsqueda
              </button>
            </div>
          }

          <!-- Lista de resultados -->
          @else if (medicines.length > 0) {
            <div class="medicines-grid">
              @for (medicine of medicines; track medicine.id) {
                <article 
                  class="medicine-card"
                  [class.expired]="medicine.isExpired"
                  [class.expiring]="medicine.expirationStatus === 'expiring-soon'">
                  
                  <!-- Header -->
                  <div class="card-header">
                    <h3 class="medicine-name">{{ medicine.displayName || medicine.name }}</h3>
                    <span class="status-badge" [class]="'status-' + medicine.expirationStatus">
                      {{ getStatusLabel(medicine.expirationStatus) }}
                    </span>
                  </div>

                  <!-- Body -->
                  <div class="card-body">
                    <div class="info-row">
                      <span class="info-label">Dosis:</span>
                      <span class="info-value">{{ medicine.dosage }}</span>
                    </div>
                    
                    <div class="info-row">
                      <span class="info-label">Frecuencia:</span>
                      <span class="info-value">{{ medicine.frequency }}</span>
                    </div>
                    
                    @if (medicine.description) {
                      <div class="info-row description">
                        <span class="info-label">Descripción:</span>
                        <p>{{ medicine.description }}</p>
                      </div>
                    }

                    <div class="info-row">
                      <span class="info-label">Inicio:</span>
                      <span class="info-value">{{ medicine.formattedStartDate }}</span>
                    </div>

                    <div class="info-row">
                      <span class="info-label">Vencimiento:</span>
                      <span class="info-value" [class.text-danger]="medicine.isExpired">
                        {{ medicine.formattedEndDate }}
                      </span>
                    </div>
                  </div>

                  <!-- Footer -->
                  <div class="card-footer">
                    <a [routerLink]="['/edit-medicine', medicine.id]" class="btn-card-action">
                      ✏️ Editar
                    </a>
                    <a [routerLink]="['/medicines', medicine.id]" class="btn-card-action">
                      👁️ Ver detalles
                    </a>
                  </div>
                </article>
              }
            </div>
          }
        }
      </div>

      <!-- Explicación técnica -->
      <div class="tech-explanation">
        <h4>🔧 Implementación técnica - Búsqueda remota</h4>
        
        <div class="explanation-section">
          <h5>1️⃣ Flujo de búsqueda con switchMap</h5>
          <div class="code-example">
            <pre><code>searchControl.valueChanges.pipe(
  debounceTime(300),              // ⏱️ Espera 300ms sin cambios
  distinctUntilChanged(),         // 🔄 Solo si el valor cambió
  switchMap(term => {             // 🚫 Cancela búsquedas anteriores
    this.setLoading(true);
    return service.searchRemote(term).pipe(
      catchError(error => {       // ❌ Manejo de errores
        toast.error('Error en búsqueda');
        return of([]);            // Devuelve array vacío
      }),
      map(results => {            // ✅ Procesa resultados
        this.setLoading(false);
        return results;
      })
    );
  })
)</code></pre>
          </div>
        </div>

        <div class="explanation-section">
          <h5>2️⃣ ¿Por qué switchMap en lugar de mergeMap?</h5>
          <ul>
            <li><strong>switchMap:</strong> Cancela peticiones anteriores (ideal para búsquedas)</li>
            <li><strong>mergeMap:</strong> Permite múltiples peticiones paralelas (puede causar race conditions)</li>
            <li><strong>concatMap:</strong> Espera a que termine la anterior (muy lento para búsquedas)</li>
            <li><strong>exhaustMap:</strong> Ignora nuevas peticiones si hay una en curso (no recomendado aquí)</li>
          </ul>
        </div>

        <div class="explanation-section">
          <h5>3️⃣ Estados de la búsqueda</h5>
          <div class="states-grid">
            <div class="state-card">
              <span class="state-icon">⏳</span>
              <strong>Loading</strong>
              <p>BehaviorSubject controla el estado de carga</p>
            </div>
            <div class="state-card">
              <span class="state-icon">✅</span>
              <strong>Success</strong>
              <p>Resultados se muestran en grid</p>
            </div>
            <div class="state-card">
              <span class="state-icon">❌</span>
              <strong>Error</strong>
              <p>catchError maneja fallos, muestra toast</p>
            </div>
            <div class="state-card">
              <span class="state-icon">🔍</span>
              <strong>Empty</strong>
              <p>Sin resultados: mensaje específico</p>
            </div>
          </div>
        </div>

        <div class="comparison-section">
          <h5>📊 Comparación: Local vs Remota</h5>
          <table class="comparison-table">
            <thead>
              <tr>
                <th>Característica</th>
                <th>Búsqueda Local</th>
                <th>Búsqueda Remota</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Latencia</strong></td>
                <td>✅ Instantánea (0ms)</td>
                <td>⚠️ Variable (50-500ms)</td>
              </tr>
              <tr>
                <td><strong>Dataset size</strong></td>
                <td>⚠️ Limitado (<1000)</td>
                <td>✅ Ilimitado</td>
              </tr>
              <tr>
                <td><strong>Consumo de datos</strong></td>
                <td>✅ Ninguno</td>
                <td>⚠️ Por búsqueda</td>
              </tr>
              <tr>
                <td><strong>Búsqueda compleja</strong></td>
                <td>❌ Solo strings simples</td>
                <td>✅ Full-text, fuzzy, etc</td>
              </tr>
              <tr>
                <td><strong>Offline</strong></td>
                <td>✅ Funciona</td>
                <td>❌ Requiere conexión</td>
              </tr>
              <tr>
                <td><strong>Cancelación</strong></td>
                <td>❌ No necesaria</td>
                <td>✅ switchMap cancela</td>
              </tr>
            </tbody>
          </table>
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

    .header {
      margin-bottom: 2rem;
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
      border-color: var(--color-primary, #3b82f6);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
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

    .search-input:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .search-input::placeholder {
      color: var(--color-text-tertiary, #a0aec0);
    }

    /* Spinner de carga */
    .spinner {
      width: 1.5rem;
      height: 1.5rem;
      border: 2px solid var(--color-border, #e2e8f0);
      border-top-color: var(--color-primary, #3b82f6);
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
      margin-right: 0.5rem;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
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

    .info-badge.badge-remote {
      background: #dbeafe;
      border-color: #3b82f6;
      color: #1e40af;
    }

    .info-badge strong {
      color: var(--color-text-primary, #1a202c);
      margin-right: 0.25rem;
    }

    /* Banner de loading */
    .loading-banner {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-top: 1rem;
      padding: 0.75rem 1rem;
      background: #dbeafe;
      border: 1px solid #3b82f6;
      border-radius: 0.5rem;
      color: #1e40af;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .loading-icon {
      width: 1.25rem;
      height: 1.25rem;
      animation: spin 1s linear infinite;
    }

    /* Resultados */
    .results-header {
      margin-bottom: 1.5rem;
    }

    .results-count {
      margin: 0;
      font-size: 0.95rem;
      color: var(--color-text-secondary, #718096);
    }

    .results-count strong {
      color: var(--color-primary, #3b82f6);
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
      background: var(--color-primary, #3b82f6);
      color: white;
      border: none;
      border-radius: 0.5rem;
      font-size: 0.95rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-clear:hover {
      background: var(--color-primary-dark, #2563eb);
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

    .text-danger {
      color: #ef4444 !important;
      font-weight: 600;
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
      border-color: var(--color-primary, #3b82f6);
      color: var(--color-primary, #3b82f6);
    }

    /* Explicación técnica */
    .tech-explanation {
      margin-top: 3rem;
      padding: 2rem;
      background: var(--color-bg-secondary, #f7fafc);
      border-radius: 0.75rem;
      border-left: 4px solid #3b82f6;
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

    .explanation-section ul {
      margin: 0;
      padding-left: 1.5rem;
      line-height: 2;
    }

    .explanation-section li {
      color: var(--color-text-secondary, #718096);
      margin-bottom: 0.5rem;
    }

    .explanation-section strong {
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

    /* Estados grid */
    .states-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-top: 1rem;
    }

    .state-card {
      padding: 1.25rem;
      background: white;
      border: 1px solid var(--color-border, #e2e8f0);
      border-radius: 0.5rem;
      text-align: center;
    }

    .state-icon {
      display: block;
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }

    .state-card strong {
      display: block;
      margin-bottom: 0.5rem;
      color: var(--color-text-primary, #1a202c);
    }

    .state-card p {
      margin: 0;
      font-size: 0.85rem;
      color: var(--color-text-secondary, #718096);
    }

    /* Tabla comparativa */
    .comparison-section {
      margin-top: 2.5rem;
    }

    .comparison-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 1rem;
      background: white;
      border-radius: 0.5rem;
      overflow: hidden;
    }

    .comparison-table thead {
      background: var(--color-primary, #3b82f6);
      color: white;
    }

    .comparison-table th,
    .comparison-table td {
      padding: 0.875rem 1rem;
      text-align: left;
      border-bottom: 1px solid var(--color-border, #e2e8f0);
    }

    .comparison-table th {
      font-weight: 600;
      font-size: 0.9rem;
    }

    .comparison-table td {
      font-size: 0.85rem;
      color: var(--color-text-secondary, #718096);
    }

    .comparison-table tbody tr:hover {
      background: var(--color-bg-secondary, #f7fafc);
    }

    .comparison-table tbody tr:last-child td {
      border-bottom: none;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .medicines-grid {
        grid-template-columns: 1fr;
      }

      .search-info {
        flex-direction: column;
      }

      .states-grid {
        grid-template-columns: 1fr;
      }

      .comparison-table {
        font-size: 0.8rem;
      }

      .comparison-table th,
      .comparison-table td {
        padding: 0.625rem;
      }
    }
  `]
})
export class MedicinesSearchRemoteComponent {
  private medicineService = inject(MedicineService);
  private toastService = inject(ToastService);
  private destroyRef = inject(DestroyRef);

  // FormControl para el input de búsqueda
  searchControl = new FormControl('');

  // BehaviorSubject para el estado de loading
  private loadingSubject = new BehaviorSubject<boolean>(false);
  isLoading$ = this.loadingSubject.asObservable();

  // Observable de resultados de búsqueda
  searchResults$: Observable<MedicineViewModel[]>;

  constructor() {
    // Configurar búsqueda remota con debounce y switchMap
    this.searchResults$ = this.searchControl.valueChanges.pipe(
      startWith(''),                    // Emitir valor inicial
      debounceTime(300),                // Esperar 300ms
      distinctUntilChanged(),           // Solo si cambió
      switchMap(term => {
        // Si no hay término, devolver array vacío sin hacer petición
        if (!term || term.trim().length === 0) {
          this.setLoading(false);
          return of([]);
        }

        // Activar loading
        this.setLoading(true);

        // Hacer búsqueda remota
        return this.medicineService.searchRemote(term).pipe(
          map(results => {
            this.setLoading(false);
            return results;
          }),
          catchError(error => {
            console.error('Error en búsqueda remota:', error);
            this.toastService.error('Error al buscar medicamentos en el servidor');
            this.setLoading(false);
            return of([]);              // Devolver array vacío en caso de error
          })
        );
      }),
      takeUntilDestroyed(this.destroyRef) // Auto-unsubscribe
    );
  }

  /**
   * Limpia el input de búsqueda
   */
  clearSearch(): void {
    this.searchControl.setValue('');
  }

  /**
   * Establece el estado de loading
   */
  private setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
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
