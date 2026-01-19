/**
 * Ejemplos de implementación de TAREA 5: Estados de Carga y Error
 * 
 * Este archivo contiene componentes ejemplo usando:
 * 1. ViewState<T> para manejar loading, error, data, success
 * 2. Signals para estado reactivo
 * 3. Spinners, empty states, error messages
 * 4. Success feedback
 * 
 * src/app/pages/medicines/medicines-tarea5-examples.component.ts
 */

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MedicineService } from '../../data/medicine.service';
import { ToastService } from '../../shared/toast.service';
import { MedicineViewModel, ApiError, CreateMedicineDto } from '../../data/models/medicine.model';

/**
 * Interfaz para el view model de estados
 */
export interface ViewState<T> {
  loading: boolean;
  error: string | null;
  data: T | null;
  success?: boolean;
}

/**
 * ============================================
 * EJEMPLO 1: Listar con Loading y Error
 * ============================================
 */
@Component({
  selector: 'app-medicines-list-tarea5',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="medicines-container">
      <div class="header">
        <h2>Medicamentos</h2>
        <button 
          (click)="loadMedicines()" 
          [disabled]="medicines().loading"
          class="btn-primary"
        >
          {{ medicines().loading ? 'Cargando...' : 'Recargar' }}
        </button>
      </div>

      <!-- LOADING STATE -->
      <div *ngIf="medicines().loading" class="loading-state">
        <div class="spinner"></div>
        <p>Cargando medicamentos...</p>
      </div>

      <!-- ERROR STATE -->
      <div *ngIf="medicines().error && !medicines().loading" class="error-state">
        <div class="error-box">
          <h3>Error al cargar</h3>
          <p>{{ medicines().error }}</p>
          <button (click)="loadMedicines()" class="btn-retry">
            Reintentar
          </button>
        </div>
      </div>

      <!-- SUCCESS STATE -->
      <div *ngIf="medicines().success" class="success-message">
        ✓ Medicamentos actualizado
      </div>

      <!-- DATA STATE -->
      <div *ngIf="!medicines().loading && !medicines().error && medicines().data as medicinesData">
        <!-- EMPTY -->
        <div *ngIf="medicinesData.length === 0" class="empty-state">
          <p>No hay medicamentos registrados</p>
        </div>

        <!-- POPULATED -->
        <div *ngIf="medicinesData.length > 0" class="list">
          <div *ngFor="let m of medicinesData" class="item">
            <h4>{{ m.displayName }}</h4>
            <p>{{ m.formattedStartDate }}</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .medicines-container { padding: 2rem; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }

    .loading-state { text-align: center; padding: 3rem; background: #f0f0f0; border-radius: 8px; }
    .spinner { width: 40px; height: 40px; margin: 0 auto 1rem; border: 4px solid #ddd; border-top-color: #007bff; border-radius: 50%; animation: spin 1s infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .error-state { padding: 2rem; }
    .error-box { background: #fee; border: 2px solid #f00; border-radius: 8px; padding: 1.5rem; color: #c00; }
    .btn-retry { background: #f00; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; margin-top: 1rem; }

    .success-message { background: #efe; border: 1px solid #0a0; color: #060; padding: 1rem; border-radius: 4px; margin-bottom: 1rem; text-align: center; font-weight: bold; }

    .empty-state { text-align: center; padding: 3rem; background: #f9f9f9; border-radius: 8px; color: #666; }

    .list { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1rem; }
    .item { border: 1px solid #ddd; padding: 1rem; border-radius: 4px; }

    .btn-primary { background: #007bff; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; }
    .btn-primary:disabled { background: #ccc; }
  `]
})
export class MedicinesListTarea5Component implements OnInit {
  private medicineService = inject(MedicineService);
  private toastService = inject(ToastService);

  medicines = signal<ViewState<MedicineViewModel[]>>({
    loading: false,
    error: null,
    data: null,
    success: false
  });

  ngOnInit() {
    this.loadMedicines();
  }

  loadMedicines() {
    this.setLoading(true);

    this.medicineService.getAll().subscribe({
      next: (medicines) => {
        this.setData(medicines);
        this.medicines.update(s => ({ ...s, success: true }));
        setTimeout(() => {
          this.medicines.update(s => ({ ...s, success: false }));
        }, 3000);
      },
      error: (err: ApiError) => {
        this.setError(err.message);
        this.toastService.error(err.message);
      }
    });
  }

  private setLoading(loading: boolean) {
    this.medicines.update(state => ({
      ...state,
      loading,
      error: loading ? null : state.error
    }));
  }

  private setError(error: string) {
    this.medicines.update(state => ({
      ...state,
      loading: false,
      error
    }));
  }

  private setData(data: MedicineViewModel[]) {
    this.medicines.update(state => ({
      ...state,
      loading: false,
      error: null,
      data
    }));
  }
}

/**
 * ============================================
 * EJEMPLO 2: Formulario con Saving State
 * ============================================
 */
@Component({
  selector: 'app-create-medicine-tarea5',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="form-container">
      <h2>Crear Medicamento</h2>

      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label>Nombre</label>
          <input type="text" formControlName="name" />
        </div>

        <div class="form-group">
          <label>Dosis</label>
          <input type="text" formControlName="dosage" />
        </div>

        <div class="form-group">
          <label>Frecuencia</label>
          <input type="text" formControlName="frequency" />
        </div>

        <div class="form-group">
          <label>Fecha de inicio</label>
          <input type="date" formControlName="startDate" />
        </div>

        <!-- Success inline -->
        <div *ngIf="saving().success && !saving().loading" class="success-inline">
          ✓ Medicamento guardado exitosamente
        </div>

        <!-- Error inline -->
        <div *ngIf="saving().error && !saving().loading" class="error-inline">
          <p>{{ saving().error }}</p>
          <button type="button" (click)="retrySubmit()">
            Reintentar
          </button>
        </div>

        <button 
          type="submit" 
          [disabled]="form.invalid || saving().loading"
          class="btn-submit"
        >
          {{ saving().loading ? 'Guardando...' : 'Guardar medicamento' }}
        </button>
      </form>
    </div>
  `,
  styles: [`
    .form-container { max-width: 500px; margin: 2rem auto; padding: 2rem; border: 1px solid #ddd; border-radius: 8px; }

    .form-group { margin-bottom: 1.5rem; }
    label { display: block; margin-bottom: 0.5rem; font-weight: bold; }
    input { width: 100%; padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; }
    input:focus { outline: none; border-color: #007bff; }

    .success-inline { background: #efe; border: 1px solid #0a0; color: #060; padding: 1rem; border-radius: 4px; margin-bottom: 1rem; text-align: center; font-weight: bold; }

    .error-inline { background: #fee; border: 1px solid #f00; color: #c00; padding: 1rem; border-radius: 4px; margin-bottom: 1rem; }
    .error-inline button { background: #f00; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; margin-top: 0.5rem; }

    .btn-submit { width: 100%; padding: 0.75rem; background: #007bff; color: white; border: none; border-radius: 4px; font-size: 1rem; cursor: pointer; font-weight: bold; }
    .btn-submit:hover:not(:disabled) { background: #0056b3; }
    .btn-submit:disabled { background: #ccc; cursor: not-allowed; }
  `]
})
export class CreateMedicineTarea5Component {
  private medicineService = inject(MedicineService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    dosage: ['', Validators.required],
    frequency: ['', Validators.required],
    startDate: ['', Validators.required],
    description: ['']
  });

  saving = signal<ViewState<null>>({
    loading: false,
    error: null,
    data: null,
    success: false
  });

  onSubmit() {
    if (this.form.invalid) {
      this.toastService.warning('Completa todos los campos');
      return;
    }

    this.setSavingLoading(true);
    const medicineData: CreateMedicineDto = this.form.value;

    this.medicineService.create(medicineData).subscribe({
      next: (createdMedicine) => {
        this.setSavingSuccess(true);
        this.toastService.success(`Medicamento "${createdMedicine.nombre}" creado`);
        
        setTimeout(() => {
          this.router.navigate(['/medicinas', createdMedicine.id]);
        }, 1000);
      },
      error: (err) => {
        this.setSavingError(err.message || 'Error al crear medicamento');
        this.toastService.error('No se pudo crear');
      }
    });
  }

  retrySubmit() {
    this.saving.update(state => ({ ...state, error: null }));
    this.onSubmit();
  }

  private setSavingLoading(loading: boolean) {
    this.saving.update(state => ({
      ...state,
      loading,
      error: loading ? null : state.error
    }));
  }

  private setSavingError(error: string) {
    this.saving.update(state => ({
      ...state,
      loading: false,
      error
    }));
  }

  private setSavingSuccess(success: boolean) {
    this.saving.update(state => ({
      ...state,
      loading: false,
      error: null,
      success
    }));
  }
}

/**
 * Exportar componentes de ejemplo
 */
export const TAREA5_EXAMPLES = [
  MedicinesListTarea5Component,
  CreateMedicineTarea5Component
];
