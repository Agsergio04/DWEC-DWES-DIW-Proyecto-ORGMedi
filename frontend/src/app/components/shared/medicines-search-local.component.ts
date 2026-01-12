import { 
  Component, 
  ChangeDetectionStrategy, 
  inject, 
  OnInit 
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged, startWith } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { MedicineStore } from '../../data/stores/medicine.store';
import { MedicineViewModel } from '../../data/models/medicine.model';

/**
 * Componente de demostración: Búsqueda local con debounce
 * 
 * Características:
 * ✅ Input reactivo con FormControl
 * ✅ debounceTime(300) - espera 300ms después del último keypress
 * ✅ distinctUntilChanged() - solo emite si el valor cambió
 * ✅ Filtrado LOCAL (sin llamadas HTTP)
 * ✅ OnPush para rendimiento óptimo
 * ✅ trackBy para evitar flickering
 * ✅ Muestra estados: buscando, sin resultados, con resultados
 * 
 * Patrón:
 * 1. Usuario escribe en el input
 * 2. debounceTime espera 300ms sin más cambios
 * 3. distinctUntilChanged verifica que el valor sea diferente
 * 4. Se filtra la lista en memoria (LOCAL)
 * 5. UI se actualiza automáticamente con async pipe
 * 
 * Ventajas del filtrado local:
 * - Instantáneo (no hay latencia de red)
 * - No consume ancho de banda
 * - Ideal para datasets pequeños (<1000 elementos)
 * - Funciona offline
 */
@Component({
  selector: 'app-medicines-search-local',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="search-container">
      <!-- Header -->
      <header class="header">
        <h2>Búsqueda Local de Medicamentos</h2>
        <p class="subtitle">Filtrado en tiempo real con debounce (sin llamadas API)</p>
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
            placeholder="Buscar por nombre, dosis o descripción..."
            class="search-input"
            autocomplete="off">
          
          @if (searchControl.value) {
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
          <span class="info-badge">
            <strong>Debounce:</strong> 300ms
          </span>
          <span class="info-badge">
            <strong>Tipo:</strong> Filtrado local (en memoria)
          </span>
          <span class="info-badge">
            <strong>Campos:</strong> Nombre, dosis, descripción
          </span>
        </div>
      </div>

      <!-- Resultados -->
      <div class="results-section">
        @if (filteredMedicines$ | async; as medicines) {
          <!-- Info de resultados -->
          <div class="results-header">
            @if (searchControl.value) {
              <p class="results-count">
                <strong>{{ medicines.length }}</strong> 
                {{ medicines.length === 1 ? 'resultado encontrado' : 'resultados encontrados' }}
                para <em>"{{ searchControl.value }}"</em>
              </p>
            } @else {
              <p class="results-count">
                Mostrando todos los medicamentos (<strong>{{ medicines.length }}</strong>)
              </p>
            }
          </div>

          <!-- Estado: Sin resultados -->
          @if (medicines.length === 0 && searchControl.value) {
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
              @for (medicine of medicines; track medicine.id) {
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
        }
      </div>

      <!-- Footer con explicación técnica -->
      <div class="tech-explanation">
        <h4>💡 Cómo funciona la búsqueda local</h4>
        <ol>
          <li><strong>Input reactivo:</strong> FormControl con valueChanges observable</li>
          <li><strong>debounceTime(300):</strong> Espera 300ms después del último cambio antes de buscar</li>
          <li><strong>distinctUntilChanged():</strong> Solo emite si el valor realmente cambió</li>
          <li><strong>Filtrado local:</strong> Busca en la lista cargada en memoria (sin HTTP)</li>
          <li><strong>Resaltado:</strong> Términos encontrados se marcan en amarillo</li>
          <li><strong>trackBy:</strong> Usa medicine.id para evitar re-renderizado innecesario</li>
        </ol>

        <div class="code-example">
          <pre><code>searchControl.valueChanges.pipe(
  debounceTime(300),
  distinctUntilChanged(),
  switchMap(term => store.search(term))
)</code></pre>
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

    .info-badge strong {
      color: var(--color-text-primary, #1a202c);
      margin-right: 0.25rem;
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

    /* Resaltado de términos */
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
      border-left: 4px solid var(--color-primary, #3b82f6);
    }

    .tech-explanation h4 {
      margin: 0 0 1rem;
      font-size: 1.1rem;
      color: var(--color-text-primary, #1a202c);
    }

    .tech-explanation ol {
      margin: 0 0 1.5rem;
      padding-left: 1.5rem;
      line-height: 1.8;
    }

    .tech-explanation li {
      color: var(--color-text-secondary, #718096);
      margin-bottom: 0.5rem;
    }

    .tech-explanation strong {
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
      font-size: 0.9rem;
      line-height: 1.6;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .medicines-grid {
        grid-template-columns: 1fr;
      }

      .search-info {
        flex-direction: column;
      }
    }
  `]
})
export class MedicinesSearchLocalComponent implements OnInit {
  private store = inject(MedicineStore);

  // FormControl para el input de búsqueda
  searchControl = new FormControl('');

  // Observable de medicamentos filtrados
  filteredMedicines$!: Observable<MedicineViewModel[]>;

  ngOnInit() {
    // Cargar medicamentos al iniciar
    this.store.refresh();

    // Configurar búsqueda reactiva con debounce
    const search$ = this.searchControl.valueChanges.pipe(
      startWith(''),                    // Emitir valor inicial vacío
      debounceTime(300),                // Esperar 300ms después del último cambio
      distinctUntilChanged(),           // Solo emitir si el valor cambió
      map((value: string | null) => value || '')         // Convertir null a string vacío
    );

    // Conectar búsqueda al store
    this.filteredMedicines$ = this.store.connectSearch(search$);
  }

  /**
   * Limpia el input de búsqueda
   */
  clearSearch(): void {
    this.searchControl.setValue('');
  }

  /**
   * Resalta el término de búsqueda en el texto
   */
  highlightTerm(text: string): string {
    const term = this.searchControl.value?.trim();
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
