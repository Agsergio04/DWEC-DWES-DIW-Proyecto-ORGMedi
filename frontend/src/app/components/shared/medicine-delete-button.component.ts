import { Component, inject, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MedicineService } from '../../data/medicine.service';
import { MedicineViewModel } from '../../data/models/medicine.model';
import { createOperationState } from '../../shared/utils/loading-state.utils';
import { ToastService } from '../../shared/toast.service';

/**
 * Componente de ejemplo que demuestra operaciones de eliminación
 * Muestra loading durante delete y mensajes de confirmación
 */
@Component({
  selector: 'app-medicine-delete-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="delete-container">
      <!-- Botón inicial -->
      <button 
        *ngIf="!showConfirm"
        type="button"
        class="btn-delete"
        (click)="showConfirm = true"
        [disabled]="deleteState.loading()">
        <span class="icon">🗑️</span>
        Eliminar
      </button>

      <!-- Confirmación -->
      <div *ngIf="showConfirm && !deleteState.loading()" class="confirm-dialog">
        <p>¿Estás seguro de eliminar "{{ medicine.name }}"?</p>
        <div class="confirm-actions">
          <button 
            type="button"
            class="btn-cancel"
            (click)="showConfirm = false">
            Cancelar
          </button>
          <button 
            type="button"
            class="btn-confirm"
            (click)="confirmDelete()">
            Confirmar
          </button>
        </div>
      </div>

      <!-- Loading durante eliminación -->
      <div *ngIf="deleteState.loading()" class="deleting-state">
        <span class="spinner-small"></span>
        <span>Eliminando...</span>
      </div>

      <!-- Error -->
      <div *ngIf="deleteState.error() && !deleteState.loading()" class="delete-error">
        <p>{{ deleteState.error() }}</p>
        <button 
          type="button"
          class="btn-retry"
          (click)="confirmDelete()">
          Reintentar
        </button>
      </div>
    </div>
  `,
  styles: [`
    .delete-container {
      position: relative;
    }

    .btn-delete {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background-color: #dc3545;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: background-color 0.2s;
    }

    .btn-delete:hover:not(:disabled) {
      background-color: #c82333;
    }

    .btn-delete:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .icon {
      font-size: 1rem;
    }

    .confirm-dialog {
      position: absolute;
      top: 100%;
      right: 0;
      margin-top: 0.5rem;
      padding: 1rem;
      background-color: white;
      border: 1px solid #dee2e6;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 1000;
      min-width: 300px;
    }

    .confirm-dialog p {
      margin: 0 0 1rem 0;
      color: #333;
      font-size: 0.9rem;
    }

    .confirm-actions {
      display: flex;
      gap: 0.5rem;
      justify-content: flex-end;
    }

    .btn-cancel,
    .btn-confirm,
    .btn-retry {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.85rem;
      transition: background-color 0.2s;
    }

    .btn-cancel {
      background-color: #6c757d;
      color: white;
    }

    .btn-cancel:hover {
      background-color: #5a6268;
    }

    .btn-confirm {
      background-color: #dc3545;
      color: white;
    }

    .btn-confirm:hover {
      background-color: #c82333;
    }

    .btn-retry {
      background-color: #007bff;
      color: white;
      margin-top: 0.5rem;
    }

    .btn-retry:hover {
      background-color: #0056b3;
    }

    .deleting-state {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background-color: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 4px;
      color: #6c757d;
      font-size: 0.9rem;
    }

    .spinner-small {
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 2px solid #dee2e6;
      border-top: 2px solid #007bff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .delete-error {
      position: absolute;
      top: 100%;
      right: 0;
      margin-top: 0.5rem;
      padding: 1rem;
      background-color: #f8d7da;
      border: 1px solid #f5c6cb;
      border-radius: 8px;
      color: #721c24;
      z-index: 1000;
      min-width: 300px;
    }

    .delete-error p {
      margin: 0 0 0.5rem 0;
      font-size: 0.9rem;
    }
  `]
})
export class MedicineDeleteButtonComponent {
  @Input({ required: true }) medicine!: MedicineViewModel;
  @Output() deleted = new EventEmitter<string>();

  private medicineService = inject(MedicineService);
  private toastService = inject(ToastService);

  // Estado de eliminación (solo loading/error/success, sin data)
  deleteState = createOperationState();
  showConfirm = false;

  confirmDelete(): void {
    this.deleteState.setLoading();

    this.medicineService.delete(this.medicine.id).subscribe({
      next: () => {
        this.deleteState.setSuccess();
        this.toastService.success(`"${this.medicine.name}" eliminado correctamente`);
        this.showConfirm = false;
        
        // Emitir evento para que el padre actualice la lista
        this.deleted.emit(this.medicine.id);
      },
      error: (err) => {
        this.deleteState.setError(err?.message || 'Error al eliminar medicamento');
        this.toastService.error(err?.message || 'Error al eliminar medicamento');
      }
    });
  }
}
