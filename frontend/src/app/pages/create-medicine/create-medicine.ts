import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MedicineService } from '../../data/medicine.service';
import { CreateMedicineDto, ApiError } from '../../data/models/medicine.model';
import { PendingChangesComponent } from '../../core/services/pending-changes.guard';

@Component({
  selector: 'app-create-medicine-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './create-medicine.html',
  styleUrls: ['./create-medicine.scss']
})
export class CreateMedicinePage implements PendingChangesComponent {
  private medicineService = inject(MedicineService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  form: FormGroup;
  saving = false;
  error: ApiError | null = null;

  frequencies = [
    'Una vez al día',
    '2 veces al día',
    '3 veces al día',
    'Cada 4-6 horas',
    'Cada 6-8 horas',
    'Cada 8 horas',
    'Cada 12 horas',
    'Según sea necesario'
  ];

  constructor() {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      dosage: ['', Validators.required],
      frequency: ['', Validators.required],
      description: [''],
      startDate: ['', Validators.required],
      endDate: [''],
      quantity: [0, [Validators.required, Validators.min(1)]]
    });
  }

  isFormValid(): boolean {
    return this.form.valid;
  }

  /**
   * Guarda el medicamento usando el servicio
   */
  saveMedicine(): void {
    if (this.form.invalid) {
      this.error = {
        code: 'VALIDATION_ERROR',
        message: 'Por favor completa todos los campos requeridos',
        timestamp: new Date().toISOString()
      };
      return;
    }

    this.saving = true;
    this.error = null;

    const formData: CreateMedicineDto = this.form.value;

    this.medicineService.create(formData).subscribe({
      next: (medicine) => {
        console.log('Medicamento creado:', medicine);
        this.router.navigate(['/medicamentos']);
        this.saving = false;
      },
      error: (err: ApiError) => {
        console.error('Error al crear medicamento:', err);
        this.error = err;
        this.saving = false;
      }
    });
  }

  /**
   * Cancela la creación y navega atrás
   */
  cancelCreate(): void {
    this.router.navigate(['/medicamentos']);
  }

  /**
   * Obtiene el error de un control del formulario
   * @param controlName Nombre del control
   */
  getFieldError(controlName: string): string | null {
    const control = this.form.get(controlName);
    if (!control || !control.errors || !control.touched) {
      return null;
    }

    if (control.errors['required']) {
      return `${controlName} es requerido`;
    }
    if (control.errors['minlength']) {
      return `${controlName} debe tener al menos ${control.errors['minlength'].requiredLength} caracteres`;
    }
    if (control.errors['min']) {
      return `${controlName} debe ser mayor que 0`;
    }

    return null;
  }
}
