import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MedicineStore } from '../../data/stores/medicine.store';
import { MedicineViewModel } from '../../data/models/medicine.model';
import { ToastService } from '../../shared/toast.service';

/**
 * Componente de ejemplo: Lista reactiva de medicamentos
 * 
 * Demuestra actualización dinámica sin recargas usando MedicineStore:
 * - Lista reactiva con BehaviorSubject
 * - Contadores en tiempo real
 * - trackBy para optimización del rendering
 * - Preservación del scroll durante actualizaciones
 * 
 * Características:
 * - Se suscribe a medicines$ del store
 * - Cualquier CRUD en otro componente actualiza automáticamente esta lista
 * - Los contadores se recalculan automáticamente
 * - El scroll se mantiene al actualizar elementos
 * 
 * ✅ OPTIMIZACIÓN: OnPush ChangeDetectionStrategy
 * - Solo se actualiza cuando cambian los observables con async pipe
 * - Reduce el número de ciclos de change detection
 * - Mejor rendimiento en listas grandes
 */
@Component({
  selector: 'app-medicines-list-reactive',
  standalone: true,
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="reactive-list-container">
      <!-- Header con contadores en tiempo real -->
      <header class="list-header">
        <h2>Medicamentos</h2>
        
        <div class="stats-cards">
          <div class="stat-card">
            <span class="stat-value">{{ (store.totalCount$ | async) || 0 }}</span>
            <span class="stat-label">Total</span>
          </div>
          
          <div class="stat-card stat-active">
            <span class="stat-value">{{ (store.activeCount$ | async) || 0 }}</span>
            <span class="stat-label">Activos</span>
          </div>
          
          <div class="stat-card stat-expiring">
            <span class="stat-value">{{ (store.expiringSoonCount$ | async) || 0 }}</span>
            <span class="stat-label">Por expirar</span>
          </div>
          
          <div class="stat-card stat-expired">
            <span class="stat-value">{{ (store.expiredCount$ | async) || 0 }}</span>
            <span class="stat-label">Expirados</span>
          </div>
        </div>

        <div class="actions">
          <button 
            (click)="refresh()" 
            [disabled]="(store.loading$ | async) || false"
            class="btn-refresh">
            @if (store.loading$ | async) {
              <span class="spinner"></span>
            }
            Actualizar
          </button>
          
          <a routerLink="/create-medicine" class="btn-create">
            + Nuevo medicamento
          </a>
        </div>
      </header>

      <!-- Estado: Cargando -->
      @if (store.loading$ | async) {
        <div class="loading-state">
          <div class="spinner-large"></div>
          <p>Cargando medicamentos...</p>
        </div>
      }

      <!-- Estado: Error -->
      @else if (store.error$ | async; as error) {
        <div class="error-state">
          <p>{{ error }}</p>
          <button (click)="retry()" class="btn-retry">Reintentar</button>
        </div>
      }

      <!-- Estado: Lista vacía -->
      @else if ((store.totalCount$ | async) === 0) {
        <div class="empty-state">
          <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          <h3>No hay medicamentos registrados</h3>
          <p>Comienza agregando tu primer medicamento</p>
          <a routerLink="/create-medicine" class="btn-create-first">Crear primer medicamento</a>
        </div>
      }

      <!-- Lista de medicamentos con trackBy -->
      @else {
        <div class="medicines-list" #listContainer>
          @for (medicine of (store.medicines$ | async); track trackById($index, medicine)) {
            <div 
              class="medicine-card"
              [class.expired]="medicine.isExpired"
              [class.expiring-soon]="medicine.expirationStatus === 'expiring-soon'">
              
              <div class="medicine-header">
                <h3>{{ medicine.displayName }}</h3>
                <span 
                  class="status-badge"
                  [class.active]="medicine.isActive"
                  [class.expired]="medicine.isExpired"
                  [class.expiring]="medicine.expirationStatus === 'expiring-soon'">
                  {{ getStatusLabel(medicine) }}
                </span>
              </div>

              <div class="medicine-details">
                <p><strong>Frecuencia:</strong> {{ medicine.frequency }}</p>
                @if (medicine.description) {
                  <p><strong>Descripción:</strong> {{ medicine.description }}</p>
                }
                <p><strong>Inicio:</strong> {{ medicine.formattedStartDate }}</p>
                @if (medicine.formattedEndDate) {
                  <p><strong>Fin:</strong> {{ medicine.formattedEndDate }}</p>
                }
                @if (medicine.daysUntilExpiration !== undefined && !medicine.isExpired) {
                  <p class="days-remaining">
                    {{ medicine.daysUntilExpiration }} días restantes
                  </p>
                }
              </div>

              <div class="medicine-actions">
                <a [routerLink]="['/edit-medicine', medicine.id]" class="btn-edit">
                  Editar
                </a>
                <button (click)="deleteMedicine(medicine)" class="btn-delete">
                  Eliminar
                </button>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .reactive-list-container {
      padding: 1.5rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .list-header {
      margin-bottom: 2rem;
    }

    .list-header h2 {
      font-size: 1.875rem;
      font-weight: bold;
      margin-bottom: 1.5rem;
    }

    .stats-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .stat-card {
      background: white;
      padding: 1.25rem;
      border-radius: 0.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      text-align: center;
      border-left: 4px solid #3b82f6;
    }

    .stat-card.stat-active {
      border-left-color: #10b981;
    }

    .stat-card.stat-expiring {
      border-left-color: #f59e0b;
    }

    .stat-card.stat-expired {
      border-left-color: #ef4444;
    }

    .stat-value {
      display: block;
      font-size: 2rem;
      font-weight: bold;
      color: #1f2937;
    }

    .stat-label {
      display: block;
      font-size: 0.875rem;
      color: #6b7280;
      margin-top: 0.25rem;
    }

    .actions {
      display: flex;
      gap: 1rem;
    }

    .btn-refresh, .btn-create {
      padding: 0.625rem 1.25rem;
      border-radius: 0.375rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-refresh {
      background: white;
      color: #3b82f6;
      border: 1px solid #3b82f6;
    }

    .btn-refresh:hover:not(:disabled) {
      background: #eff6ff;
    }

    .btn-refresh:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-create {
      background: #3b82f6;
      color: white;
      border: none;
    }

    .btn-create:hover {
      background: #2563eb;
    }

    .loading-state, .error-state, .empty-state {
      text-align: center;
      padding: 3rem 1.5rem;
    }

    .spinner, .spinner-large {
      display: inline-block;
      width: 1.25rem;
      height: 1.25rem;
      border: 2px solid #e5e7eb;
      border-top-color: #3b82f6;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    .spinner-large {
      width: 3rem;
      height: 3rem;
      border-width: 3px;
      margin-bottom: 1rem;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .empty-icon {
      width: 4rem;
      height: 4rem;
      color: #9ca3af;
      margin-bottom: 1rem;
    }

    .btn-create-first {
      display: inline-block;
      margin-top: 1rem;
      padding: 0.75rem 1.5rem;
      background: #3b82f6;
      color: white;
      border-radius: 0.375rem;
      text-decoration: none;
      font-weight: 500;
    }

    .medicines-list {
      display: grid;
      gap: 1rem;
    }

    .medicine-card {
      background: white;
      padding: 1.5rem;
      border-radius: 0.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      border-left: 4px solid #10b981;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .medicine-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 6px rgba(0,0,0,0.15);
    }

    .medicine-card.expiring-soon {
      border-left-color: #f59e0b;
    }

    .medicine-card.expired {
      border-left-color: #ef4444;
      opacity: 0.7;
    }

    .medicine-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .medicine-header h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1f2937;
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .status-badge.active {
      background: #d1fae5;
      color: #065f46;
    }

    .status-badge.expiring {
      background: #fef3c7;
      color: #92400e;
    }

    .status-badge.expired {
      background: #fee2e2;
      color: #991b1b;
    }

    .medicine-details {
      color: #4b5563;
      margin-bottom: 1rem;
    }

    .medicine-details p {
      margin: 0.5rem 0;
    }

    .days-remaining {
      color: #f59e0b;
      font-weight: 500;
    }

    .medicine-actions {
      display: flex;
      gap: 0.75rem;
      padding-top: 1rem;
      border-top: 1px solid #e5e7eb;
    }

    .btn-edit, .btn-delete, .btn-retry {
      padding: 0.5rem 1rem;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
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

    .btn-retry {
      background: #3b82f6;
      color: white;
    }

    .btn-retry:hover {
      background: #2563eb;
    }
  `]
})
export class MedicinesListReactiveComponent implements OnInit {
  store = inject(MedicineStore);
  private toast = inject(ToastService);

  ngOnInit() {
    // No es necesario cargar aquí, el store ya carga automáticamente en su constructor
    // Pero puedes refrescar si quieres asegurar datos actuales
  }

  /**
   * Refresca los datos desde la API
   * Todos los componentes suscritos se actualizarán automáticamente
   */
  refresh() {
    this.store.refresh();
  }

  /**
   * Reintenta cargar datos después de un error
   */
  retry() {
    this.store.clearError();
    this.store.refresh();
  }

  /**
   * Elimina un medicamento
   * La lista se actualiza automáticamente sin recargar la página
   */
  deleteMedicine(medicine: MedicineViewModel) {
    if (!confirm(`¿Estás seguro de eliminar "${medicine.displayName}"?`)) {
      return;
    }

    // TODO: Llamar al servicio para eliminar en backend
    // medicineService.delete(medicine.id).subscribe(() => {
    //   this.store.remove(medicine.id);
    //   this.toast.show('Medicamento eliminado', 'success');
    // });
    
    // Por ahora solo removemos del store
    this.store.remove(medicine.id);
    this.toast.show('Medicamento eliminado', 'success');
  }

  /**
   * Función trackBy para optimizar el rendering de *ngFor
   * Angular solo re-renderiza elementos cuyo ID cambió
   */
  trackById(index: number, medicine: MedicineViewModel): string {
    return medicine.id;
  }

  /**
   * Obtiene la etiqueta del estado del medicamento
   */
  getStatusLabel(medicine: MedicineViewModel): string {
    if (medicine.isExpired) return 'Expirado';
    if (medicine.expirationStatus === 'expiring-soon') return 'Por expirar';
    return 'Activo';
  }
}
