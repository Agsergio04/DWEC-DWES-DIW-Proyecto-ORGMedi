import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MedicineService } from '../../data/medicine.service';
import { CreateMedicineDto } from '../../data/models/medicine.model';
import { 
  createLoadingStateWithSuccess,
  executeWithSuccessState 
} from '../../shared/utils/loading-state.utils';
import { ToastService } from '../../shared/toast.service';

/**
 * Componente de ejemplo que demuestra operaciones de escritura con success feedback
 * Muestra loading durante guardado y mensajes de éxito/error
 */
@Component({
  selector: 'app-create-medicine-with-states',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="create-medicine-container">
      <header>
        <h2>Crear Nuevo Medicamento</h2>
      </header>

      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <!-- Name -->
        <div class="form-group">
          <label for="name">Nombre *</label>
          <input 
            id="name"
            type="text" 
            formControlName="name"
            [class.invalid]="form.get('name')?.invalid && form.get('name')?.touched"
            placeholder="Ej: Ibuprofeno">
          <div class="error-message" *ngIf="form.get('name')?.invalid && form.get('name')?.touched">
            El nombre es requerido
          </div>
        </div>

        <!-- Dosage -->
        <div class="form-group">
          <label for="dosage">Dosis *</label>
          <input 
            id="dosage"
            type="text" 
            formControlName="dosage"
            [class.invalid]="form.get('dosage')?.invalid && form.get('dosage')?.touched"
            placeholder="Ej: 400mg">
          <div class="error-message" *ngIf="form.get('dosage')?.invalid && form.get('dosage')?.touched">
            La dosis es requerida
          </div>
        </div>

        <!-- Frequency -->
        <div class="form-group">
          <label for="frequency">Frecuencia *</label>
          <input 
            id="frequency"
            type="text" 
            formControlName="frequency"
            [class.invalid]="form.get('frequency')?.invalid && form.get('frequency')?.touched"
            placeholder="Ej: Cada 8 horas">
          <div class="error-message" *ngIf="form.get('frequency')?.invalid && form.get('frequency')?.touched">
            La frecuencia es requerida
          </div>
        </div>

        <!-- Description -->
        <div class="form-group">
          <label for="description">Descripción</label>
          <textarea 
            id="description"
            formControlName="description"
            rows="3"
            placeholder="Información adicional (opcional)"></textarea>
        </div>

        <!-- Start Date -->
        <div class="form-group">
          <label for="startDate">Fecha de inicio *</label>
          <input 
            id="startDate"
            type="date" 
            formControlName="startDate"
            [class.invalid]="form.get('startDate')?.invalid && form.get('startDate')?.touched">
          <div class="error-message" *ngIf="form.get('startDate')?.invalid && form.get('startDate')?.touched">
            La fecha de inicio es requerida
          </div>
        </div>

        <!-- End Date -->
        <div class="form-group">
          <label for="endDate">Fecha de fin</label>
          <input 
            id="endDate"
            type="date" 
            formControlName="endDate">
        </div>

        <!-- Quantity -->
        <div class="form-group">
          <label for="quantity">Cantidad</label>
          <input 
            id="quantity"
            type="number" 
            formControlName="quantity"
            min="1"
            placeholder="Número de pastillas/dosis">
        </div>

        <!-- Error message from server -->
        <div *ngIf="saveState.hasError() && !saveState.loading()" class="form-error">
          <div class="error-icon">⚠️</div>
          <p>{{ saveState.error() }}</p>
        </div>

        <!-- Success message -->
        <div *ngIf="saveState.success() && !saveState.loading()" class="form-success">
          <div class="success-icon">✓</div>
          <p>Medicamento creado correctamente</p>
        </div>

        <!-- Actions -->
        <div class="form-actions">
          <button 
            type="button" 
            class="btn-cancel"
            (click)="onCancel()"
            [disabled]="saveState.loading()">
            Cancelar
          </button>
          <button 
            type="submit" 
            class="btn-submit"
            [disabled]="form.invalid || saveState.loading()">
            <span *ngIf="!saveState.loading()">Guardar</span>
            <span *ngIf="saveState.loading()">
              <span class="spinner-small"></span>
              Guardando...
            </span>
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .create-medicine-container {
      max-width: 600px;
      margin: 0 auto;
      padding: 2rem;
    }

    header h2 {
      margin-bottom: 1.5rem;
      color: #333;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: #555;
    }

    .form-group input,
    .form-group textarea {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
      transition: border-color 0.2s;
    }

    .form-group input:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: #007bff;
    }

    .form-group input.invalid,
    .form-group textarea.invalid {
      border-color: #dc3545;
    }

    .error-message {
      margin-top: 0.25rem;
      color: #dc3545;
      font-size: 0.85rem;
    }

    .form-error {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem;
      margin-bottom: 1rem;
      background-color: #f8d7da;
      border: 1px solid #f5c6cb;
      border-radius: 4px;
      color: #721c24;
    }

    .error-icon {
      font-size: 1.5rem;
    }

    .form-error p {
      margin: 0;
      flex: 1;
    }

    .form-success {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem;
      margin-bottom: 1rem;
      background-color: #d4edda;
      border: 1px solid #c3e6cb;
      border-radius: 4px;
      color: #155724;
    }

    .success-icon {
      font-size: 1.5rem;
      font-weight: bold;
    }

    .form-success p {
      margin: 0;
      flex: 1;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 2rem;
    }

    .btn-cancel,
    .btn-submit {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .btn-cancel {
      background-color: #6c757d;
      color: white;
    }

    .btn-cancel:hover:not(:disabled) {
      background-color: #5a6268;
    }

    .btn-submit {
      background-color: #007bff;
      color: white;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-submit:hover:not(:disabled) {
      background-color: #0056b3;
    }

    .btn-cancel:disabled,
    .btn-submit:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .spinner-small {
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 2px solid #ffffff40;
      border-top: 2px solid #ffffff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class CreateMedicineWithStatesComponent {
  private fb = inject(FormBuilder);
  private medicineService = inject(MedicineService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  // Estado de guardado con success flag
  saveState = createLoadingStateWithSuccess<any>();

  // Formulario
  form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    dosage: ['', Validators.required],
    frequency: ['', Validators.required],
    description: [''],
    startDate: ['', Validators.required],
    endDate: [''],
    quantity: [null]
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formData: CreateMedicineDto = this.form.value;

    executeWithSuccessState(
      this.medicineService.create(formData),
      this.saveState,
      (medicine) => {
        // Callback de éxito
        this.toastService.success('Medicamento creado correctamente');
        
        // Limpiar el success flag después de 3 segundos
        setTimeout(() => {
          this.saveState.clearSuccess();
          // Opcional: navegar a otra página
          // this.router.navigate(['/medicines']);
        }, 3000);
      },
      (error) => {
        // Callback de error
        this.toastService.error(error);
      }
    );
  }

  onCancel(): void {
    this.router.navigate(['/medicines']);
  }
}
