import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MedicineService } from '../../data/medicine.service';
import { MedicineViewModel } from '../../data/models/medicine.model';
import { 
  createLoadingState, 
  executeWithState 
} from '../../shared/utils/loading-state.utils';
import { ToastService } from '../../shared/toast.service';

/**
 * Componente de ejemplo que demuestra el manejo de estados de carga
 * Muestra loading, error, empty y data states
 */
@Component({
  selector: 'app-medicines-list-with-states',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="medicines-container">
      <header>
        <h2>Lista de Medicamentos</h2>
        <button 
          type="button"
          (click)="loadMedicines()" 
          [disabled]="medicinesState.loading()"
          class="btn-reload">
          {{ medicinesState.loading() ? 'Cargando...' : 'Recargar' }}
        </button>
      </header>

      <!-- LOADING STATE -->
      <div *ngIf="medicinesState.loading()" class="loading-state">
        <div class="spinner"></div>
        <p>Cargando medicamentos...</p>
      </div>

      <!-- ERROR STATE -->
      <div *ngIf="medicinesState.hasError() && !medicinesState.loading()" class="error-state">
        <div class="error-icon">⚠️</div>
        <h3>Error al cargar medicamentos</h3>
        <p>{{ medicinesState.error() }}</p>
        <button type="button" (click)="loadMedicines()" class="btn-retry">
          Reintentar
        </button>
      </div>

      <!-- EMPTY STATE -->
      <div *ngIf="medicinesState.isEmpty()" class="empty-state">
        <div class="empty-icon">📦</div>
        <h3>No hay medicamentos</h3>
        <p>No se encontraron medicamentos en el sistema.</p>
        <button type="button" (click)="loadMedicines()" class="btn-reload">
          Recargar
        </button>
      </div>

      <!-- DATA STATE -->
      <ul *ngIf="medicinesState.hasData() && !medicinesState.loading()" class="medicines-list">
        <li *ngFor="let medicine of medicinesState.data(); trackBy: trackById" 
            class="medicine-item"
            [class.expired]="medicine.isExpired"
            [class.expiring-soon]="medicine.expirationStatus === 'expiring-soon'">
          <div class="medicine-info">
            <h4>{{ medicine.displayName }}</h4>
            <p class="frequency">{{ medicine.frequency }}</p>
            <p class="dates">
              Inicio: {{ medicine.formattedStartDate }}
              <span *ngIf="medicine.formattedEndDate">
                - Fin: {{ medicine.formattedEndDate }}
              </span>
            </p>
          </div>
          <div class="medicine-status">
            <span class="status-badge" [class]="medicine.expirationStatus">
              {{ getStatusLabel(medicine.expirationStatus) }}
            </span>
            <span *ngIf="medicine.daysUntilExpiration !== undefined" class="days-remaining">
              {{ medicine.daysUntilExpiration }} días
            </span>
          </div>
        </li>
      </ul>

      <!-- STATS -->
      <div *ngIf="medicinesState.hasData() && !medicinesState.loading()" class="stats">
        <p>Total: {{ medicinesState.data()?.length }} medicamentos</p>
      </div>
    </div>
  `,
  styles: [`
    .medicines-container {
      padding: 1rem;
      max-width: 800px;
      margin: 0 auto;
    }

    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .btn-reload, .btn-retry {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: background-color 0.2s;
    }

    .btn-reload {
      background-color: #007bff;
      color: white;
    }

    .btn-reload:hover:not(:disabled) {
      background-color: #0056b3;
    }

    .btn-reload:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-retry {
      background-color: #28a745;
      color: white;
    }

    /* Loading State */
    .loading-state {
      text-align: center;
      padding: 3rem;
    }

    .spinner {
      width: 40px;
      height: 40px;
      margin: 0 auto 1rem;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #007bff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Error State */
    .error-state {
      text-align: center;
      padding: 3rem;
      background-color: #fff3cd;
      border: 1px solid #ffc107;
      border-radius: 8px;
    }

    .error-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .error-state h3 {
      color: #856404;
      margin-bottom: 0.5rem;
    }

    .error-state p {
      color: #856404;
      margin-bottom: 1rem;
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 3rem;
      background-color: #f8f9fa;
      border: 2px dashed #dee2e6;
      border-radius: 8px;
    }

    .empty-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .empty-state h3 {
      color: #6c757d;
      margin-bottom: 0.5rem;
    }

    .empty-state p {
      color: #6c757d;
      margin-bottom: 1rem;
    }

    /* Data State */
    .medicines-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .medicine-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      margin-bottom: 0.5rem;
      background-color: #fff;
      border: 1px solid #dee2e6;
      border-radius: 8px;
      transition: box-shadow 0.2s;
    }

    .medicine-item:hover {
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .medicine-item.expired {
      opacity: 0.6;
      background-color: #f8d7da;
    }

    .medicine-item.expiring-soon {
      background-color: #fff3cd;
    }

    .medicine-info h4 {
      margin: 0 0 0.25rem 0;
      font-size: 1.1rem;
    }

    .medicine-info p {
      margin: 0.25rem 0;
      font-size: 0.9rem;
      color: #6c757d;
    }

    .medicine-status {
      text-align: right;
    }

    .status-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.85rem;
      font-weight: 600;
    }

    .status-badge.active {
      background-color: #d4edda;
      color: #155724;
    }

    .status-badge.expiring-soon {
      background-color: #fff3cd;
      color: #856404;
    }

    .status-badge.expired {
      background-color: #f8d7da;
      color: #721c24;
    }

    .days-remaining {
      display: block;
      margin-top: 0.25rem;
      font-size: 0.85rem;
      color: #6c757d;
    }

    .stats {
      margin-top: 1rem;
      padding: 0.5rem;
      text-align: center;
      color: #6c757d;
      font-size: 0.9rem;
    }
  `]
})
export class MedicinesListWithStatesComponent implements OnInit {
  private medicineService = inject(MedicineService);
  private toastService = inject(ToastService);

  // Estado de carga con utilidad
  medicinesState = createLoadingState<MedicineViewModel[]>([]);

  ngOnInit(): void {
    this.loadMedicines();
  }

  loadMedicines(): void {
    executeWithState(
      this.medicineService.getAll(),
      this.medicinesState
    );
  }

  /**
   * Función trackBy para optimizar el rendering de *ngFor
   * Usa el ID del medicamento como identificador único
   */
  trackById(index: number, medicine: MedicineViewModel): string {
    return medicine.id;
  }

  getStatusLabel(status: 'active' | 'expiring-soon' | 'expired'): string {
    const labels = {
      'active': 'Activo',
      'expiring-soon': 'Por vencer',
      'expired': 'Vencido'
    };
    return labels[status];
  }
}
