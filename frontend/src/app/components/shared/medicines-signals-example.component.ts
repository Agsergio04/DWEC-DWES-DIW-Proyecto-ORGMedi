import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MedicineStoreSignals } from '../../data/stores/medicine-signals.store';
import { MedicineViewModel } from '../../data/models/medicine.model';
import { ToastService } from '../../shared/toast.service';

/**
 * Componente de ejemplo usando Signals para gestión de estado
 * 
 * Ventajas sobre BehaviorSubject/Observable:
 * ✅ NO requiere async pipe (medicines() en lugar de medicines$ | async)
 * ✅ Código más limpio y legible
 * ✅ Menos boilerplate
 * ✅ Change detection más eficiente (granular)
 * ✅ No hay riesgo de fugas de memoria
 * ✅ Computed signals se recalculan automáticamente
 * 
 * Comparación:
 * - Con Observables: <div *ngIf="loading$ | async">...</div>
 * - Con Signals:     <div *ngIf="loading()">...</div>
 * 
 * - Con Observables: <li *ngFor="let m of (medicines$ | async)">
 * - Con Signals:     <li *ngFor="let m of medicines()">
 * 
 * ✅ OPTIMIZACIÓN: OnPush ChangeDetectionStrategy
 * - Con Signals, el change detection es aún más eficiente
 * - Solo se actualizan los componentes que dependen de signals modificados
 * - Combina lo mejor de OnPush con la reactividad de Signals
 */
@Component({
  selector: 'app-medicines-signals-example',
  standalone: true,
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="signals-container">
      <!-- Header con título -->
      <header class="header">
        <h2>Medicamentos (Signals Pattern)</h2>
        <p class="subtitle">Gestión de estado moderna con Angular Signals</p>
      </header>

      <!-- Estadísticas en tiempo real (computed signals) -->
      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-value">{{ store.totalCount() }}</span>
          <span class="stat-label">Total</span>
        </div>
        
        <div class="stat-card stat-active">
          <span class="stat-value">{{ store.activeCount() }}</span>
          <span class="stat-label">Activos</span>
        </div>
        
        <div class="stat-card stat-expiring">
          <span class="stat-value">{{ store.expiringSoonCount() }}</span>
          <span class="stat-label">Por expirar</span>
        </div>
        
        <div class="stat-card stat-expired">
          <span class="stat-value">{{ store.expiredCount() }}</span>
          <span class="stat-label">Expirados</span>
        </div>
      </div>

      <!-- Acciones -->
      <div class="actions">
        <button 
          (click)="refresh()" 
          [disabled]="store.loading()"
          class="btn-refresh">
          @if (store.loading()) {
            <span class="spinner"></span>
          }
          Actualizar
        </button>
        
        <a routerLink="/create-medicine" class="btn-create">
          + Nuevo medicamento
        </a>
      </div>

      <!-- Estado: Cargando -->
      @if (store.loading()) {
        <div class="loading-state">
          <div class="spinner-large"></div>
          <p>Cargando medicamentos...</p>
        </div>
      }

      <!-- Estado: Error -->
      @else if (store.error(); as error) {
        <div class="error-state">
          <svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
          <p>{{ error }}</p>
          <button (click)="retry()" class="btn-retry">Reintentar</button>
        </div>
      }

      <!-- Estado: Vacío -->
      @else if (store.stats().isEmpty) {
        <div class="empty-state">
          <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          <h3>No hay medicamentos</h3>
          <p>Empieza agregando tu primer medicamento</p>
          <a routerLink="/create-medicine" class="btn-create-first">Crear medicamento</a>
        </div>
      }

      <!-- Lista de medicamentos -->
      @else {
        <div class="medicines-grid">
          @for (medicine of store.medicines(); track medicine.id) {
            <article 
              class="medicine-card"
              [class.expired]="medicine.isExpired"
              [class.expiring-soon]="medicine.expirationStatus === 'expiring-soon'">
              
              <div class="card-header">
                <h3>{{ medicine.displayName }}</h3>
                <span 
                  class="badge"
                  [class.active]="medicine.isActive"
                  [class.expired]="medicine.isExpired"
                  [class.expiring]="medicine.expirationStatus === 'expiring-soon'">
                  {{ getStatusLabel(medicine) }}
                </span>
              </div>

              <div class="card-body">
                <p><strong>Frecuencia:</strong> {{ medicine.frequency }}</p>
                @if (medicine.description) {
                  <p class="description">{{ medicine.description }}</p>
                }
                <div class="dates">
                  <p><strong>Inicio:</strong> {{ medicine.formattedStartDate }}</p>
                  @if (medicine.formattedEndDate) {
                    <p><strong>Fin:</strong> {{ medicine.formattedEndDate }}</p>
                  }
                </div>
                @if (medicine.daysUntilExpiration !== undefined && !medicine.isExpired) {
                  <p class="days-warning">
                    ⏰ {{ medicine.daysUntilExpiration }} días restantes
                  </p>
                }
              </div>

              <div class="card-actions">
                <a [routerLink]="['/edit-medicine', medicine.id]" class="btn-edit">
                  ✏️ Editar
                </a>
                <button (click)="deleteMedicine(medicine)" class="btn-delete">
                  🗑️ Eliminar
                </button>
              </div>
            </article>
          }
        </div>
      }

      <!-- Información técnica sobre Signals -->
      <div class="tech-info">
        <h4>🔧 Detalles técnicos del patrón Signals</h4>
        <ul>
          <li><strong>store.medicines()</strong> → Signal de solo lectura, no requiere async pipe</li>
          <li><strong>store.stats()</strong> → Computed signal, se recalcula automáticamente</li>
          <li><strong>store.add()</strong> → Usa update() para mutaciones inmutables</li>
          <li><strong>No subscribe manual</strong> → Sin riesgo de fugas de memoria</li>
          <li><strong>Change detection granular</strong> → Solo se actualiza lo necesario</li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .signals-container {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .header {
      margin-bottom: 2rem;
    }

    .header h2 {
      font-size: 2rem;
      font-weight: bold;
      color: #1f2937;
      margin-bottom: 0.5rem;
    }

    .subtitle {
      color: #6b7280;
      font-size: 1rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 0.75rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      text-align: center;
      border-left: 4px solid #3b82f6;
      transition: transform 0.2s;
    }

    .stat-card:hover {
      transform: translateY(-2px);
    }

    .stat-card.stat-active { border-left-color: #10b981; }
    .stat-card.stat-expiring { border-left-color: #f59e0b; }
    .stat-card.stat-expired { border-left-color: #ef4444; }

    .stat-value {
      display: block;
      font-size: 2.5rem;
      font-weight: bold;
      color: #1f2937;
      line-height: 1;
    }

    .stat-label {
      display: block;
      font-size: 0.875rem;
      color: #6b7280;
      margin-top: 0.5rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .actions {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .btn-refresh, .btn-create {
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.95rem;
    }

    .btn-refresh {
      background: white;
      color: #3b82f6;
      border: 2px solid #3b82f6;
    }

    .btn-refresh:hover:not(:disabled) {
      background: #3b82f6;
      color: white;
    }

    .btn-refresh:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-create {
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: white;
      border: none;
    }

    .btn-create:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
    }

    .loading-state, .error-state, .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      background: white;
      border-radius: 0.75rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .spinner, .spinner-large {
      display: inline-block;
      width: 1.5rem;
      height: 1.5rem;
      border: 2px solid #e5e7eb;
      border-top-color: #3b82f6;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    .spinner-large {
      width: 3.5rem;
      height: 3.5rem;
      border-width: 3px;
      margin-bottom: 1.5rem;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .error-icon, .empty-icon {
      width: 5rem;
      height: 5rem;
      color: #9ca3af;
      margin-bottom: 1.5rem;
    }

    .error-icon {
      color: #ef4444;
    }

    .btn-create-first, .btn-retry {
      display: inline-block;
      margin-top: 1.5rem;
      padding: 0.875rem 2rem;
      background: #3b82f6;
      color: white;
      border-radius: 0.5rem;
      text-decoration: none;
      font-weight: 600;
      border: none;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-create-first:hover, .btn-retry:hover {
      background: #2563eb;
      transform: translateY(-1px);
    }

    .medicines-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .medicine-card {
      background: white;
      padding: 1.5rem;
      border-radius: 0.75rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      border-left: 4px solid #10b981;
      transition: all 0.3s;
    }

    .medicine-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0,0,0,0.15);
    }

    .medicine-card.expiring-soon {
      border-left-color: #f59e0b;
    }

    .medicine-card.expired {
      border-left-color: #ef4444;
      opacity: 0.8;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
      gap: 1rem;
    }

    .card-header h3 {
      font-size: 1.125rem;
      font-weight: 700;
      color: #1f2937;
      margin: 0;
    }

    .badge {
      padding: 0.375rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      white-space: nowrap;
    }

    .badge.active {
      background: #d1fae5;
      color: #065f46;
    }

    .badge.expiring {
      background: #fef3c7;
      color: #92400e;
    }

    .badge.expired {
      background: #fee2e2;
      color: #991b1b;
    }

    .card-body {
      color: #4b5563;
      margin-bottom: 1rem;
    }

    .card-body p {
      margin: 0.5rem 0;
      font-size: 0.9rem;
    }

    .description {
      font-style: italic;
      color: #6b7280;
    }

    .dates {
      margin: 0.75rem 0;
      padding: 0.75rem;
      background: #f9fafb;
      border-radius: 0.375rem;
    }

    .days-warning {
      color: #f59e0b;
      font-weight: 600;
      padding: 0.5rem;
      background: #fffbeb;
      border-radius: 0.375rem;
      text-align: center;
    }

    .card-actions {
      display: flex;
      gap: 0.75rem;
      padding-top: 1rem;
      border-top: 1px solid #e5e7eb;
    }

    .btn-edit, .btn-delete {
      flex: 1;
      padding: 0.625rem 1rem;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
      text-align: center;
    }

    .btn-edit {
      background: #eff6ff;
      color: #3b82f6;
      text-decoration: none;
    }

    .btn-edit:hover {
      background: #dbeafe;
    }

    .btn-delete {
      background: #fee2e2;
      color: #dc2626;
    }

    .btn-delete:hover {
      background: #fecaca;
    }

    .tech-info {
      margin-top: 3rem;
      padding: 1.5rem;
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
      border-radius: 0.75rem;
      border-left: 4px solid #0ea5e9;
    }

    .tech-info h4 {
      color: #0c4a6e;
      margin-bottom: 1rem;
      font-size: 1.125rem;
    }

    .tech-info ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .tech-info li {
      color: #0c4a6e;
      margin: 0.5rem 0;
      padding-left: 1.5rem;
      position: relative;
    }

    .tech-info li::before {
      content: "▸";
      position: absolute;
      left: 0;
      color: #0ea5e9;
      font-weight: bold;
    }

    .tech-info strong {
      color: #075985;
      font-family: 'Courier New', monospace;
      background: white;
      padding: 0.125rem 0.375rem;
      border-radius: 0.25rem;
    }
  `]
})
export class MedicinesSignalsExampleComponent {
  store = inject(MedicineStoreSignals);
  private toast = inject(ToastService);

  refresh() {
    this.store.load();
  }

  retry() {
    this.store.clearError();
    this.store.load();
  }

  deleteMedicine(medicine: MedicineViewModel) {
    if (!confirm(`¿Eliminar "${medicine.displayName}"?`)) {
      return;
    }

    // TODO: Llamar al servicio para eliminar en backend
    // medicineService.delete(medicine.id).subscribe(() => {
    //   this.store.remove(medicine.id);
    //   this.toast.show('Medicamento eliminado', 'success');
    // });
    
    this.store.remove(medicine.id);
    this.toast.show('Medicamento eliminado correctamente', 'success');
  }

  getStatusLabel(medicine: MedicineViewModel): string {
    if (medicine.isExpired) return 'Expirado';
    if (medicine.expirationStatus === 'expiring-soon') return 'Por expirar';
    return 'Activo';
  }
}
