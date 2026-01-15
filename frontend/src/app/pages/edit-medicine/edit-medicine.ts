import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MedicineService } from '../../data/medicine.service';
import { Medicine as ResolverMedicine } from '../../core/services/medicines.resolver';
import { Medicine, CreateMedicineDto } from '../../data/models/medicine.model';
import { PendingChangesComponent } from '../../core/services/pending-changes.guard';
import { MedicineFormComponent, MedicineFormData } from '../../components/shared/medicine-form/medicine-form';

@Component({
  selector: 'app-edit-medicine-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MedicineFormComponent],
  templateUrl: './edit-medicine.html',
  styleUrls: ['./edit-medicine.scss']
})
export class EditMedicinePage implements OnInit, PendingChangesComponent {
  private medicineService = inject(MedicineService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  medicineId: string | null = null;
  form: FormGroup = new FormGroup({});
  isDirty = false;
  saving = false;
  loading = false;
  error: string | null = null;
  originalMedicine: Medicine | null = null;

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

  constructor(fb: FormBuilder) {
    this.form = fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      dosage: ['', Validators.required],
      frequency: ['', Validators.required],
      description: [''],
      startDate: ['', Validators.required],
      endDate: [''],
      quantity: [0, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    // Obtener el ID de la ruta
    this.medicineId = this.route.snapshot.paramMap.get('id');

    // Intentar leer datos del resolver primero (precargas)
    this.route.data.subscribe((data: any) => {
      const resolvedMedicine: ResolverMedicine | null = data['medicine'];
      if (resolvedMedicine) {
        this.loadMedicineFromResolved(resolvedMedicine);
      } else if (this.medicineId) {
        // Si no hay data resuelta, cargar desde el servicio
        this.loadMedicine(this.medicineId);
      } else {
        this.error = 'ID de medicamento inválido';
      }
    });

    // Escuchar cambios en el formulario
    this.form.valueChanges.subscribe(() => {
      this.isDirty = this.form.dirty;
    });
  }

  /**
   * Carga el medicamento desde los datos precargados del resolver
   */
  private loadMedicineFromResolved(medicine: ResolverMedicine): void {
    this.loading = false;
    this.error = null;
    
    // Llenar el formulario con los datos precargados
    this.form.patchValue({
      name: medicine.name,
      dosage: medicine.dosage,
      frequency: medicine.frequency,
      description: medicine.description || '',
      startDate: medicine.startDate,
      endDate: medicine.endDate || '',
      quantity: medicine.quantity || 0
    });
    // Marcar como no modificado después de cargar los datos
    this.form.markAsPristine();
  }

  /**
   * Carga el medicamento desde el servicio (fallback)
   */
  loadMedicine(id: string): void {
    this.loading = true;
    this.error = null;

    this.medicineService.getById(id).subscribe({
      next: (medicine) => {
        this.originalMedicine = medicine;
        // Llenar el formulario con los datos del medicamento
        this.form.patchValue({
          name: medicine.name,
          dosage: medicine.dosage,
          frequency: medicine.frequency,
          description: medicine.description || '',
          startDate: medicine.startDate,
          endDate: medicine.endDate || '',
          quantity: medicine.quantity || 0
        });
        // Marcar como no modificado después de cargar los datos
        this.form.markAsPristine();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar medicamento:', err);
        this.error = err.message || 'Error al cargar el medicamento. Intenta nuevamente.';
        this.loading = false;
      }
    });
  }

  /**
   * Actualiza el medicamento
   */
  saveMedicine(): void {
    if (this.form.invalid || !this.medicineId) {
      this.error = 'Por favor completa todos los campos requeridos';
      return;
    }

    this.saving = true;
    this.error = null;

    const formData: Omit<Medicine, 'id'> = this.form.value;

    this.medicineService.update(this.medicineId, formData).subscribe({
      next: (medicine) => {
        console.log('Medicamento actualizado:', medicine);
        this.form.markAsPristine();
        this.router.navigate(['/medicamentos']);
        this.saving = false;
      },
      error: (err) => {
        console.error('Error al actualizar medicamento:', err);
        this.error = err.message || 'Error al actualizar el medicamento. Intenta nuevamente.';
        this.saving = false;
      }
    });
  }

  /**
   * Cancela la edición
   */
  cancelEdit(): void {
    if (this.isDirty) {
      const confirmCancel = confirm('¿Descartar cambios y volver?');
      if (!confirmCancel) {
        return;
      }
    }
    this.router.navigate(['/medicamentos']);
  }

  /**
   * Elimina el medicamento con confirmación
   */
  deleteMedicine(): void {
    if (!confirm('¿Estás seguro de que deseas eliminar este medicamento?')) {
      return;
    }

    if (!this.medicineId) {
      this.error = 'ID de medicamento inválido';
      return;
    }

    this.saving = true;
    this.error = null;

    this.medicineService.delete(this.medicineId).subscribe({
      next: () => {
        console.log('Medicamento eliminado');
        this.router.navigate(['/medicamentos']);
        this.saving = false;
      },
      error: (err) => {
        console.error('Error al eliminar medicamento:', err);
        this.error = err.message || 'Error al eliminar el medicamento. Intenta nuevamente.';
        this.saving = false;
      }
    });
  }

  /**
   * Resetea el formulario a los valores originales
   */
  reset(): void {
    if (this.originalMedicine) {
      this.form.reset(this.originalMedicine);
      this.form.markAsPristine();
    }
  }

  /**
   * Obtiene el error de un control del formulario
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

  /**
   * Obtiene los datos del medicamento para el formulario
   */
  getMedicineFormData(): MedicineFormData | null {
    if (!this.originalMedicine) {
      return null;
    }
    return {
      name: this.originalMedicine.name,
      dosage: this.originalMedicine.dosage,
      description: this.originalMedicine.description || '',
      startDate: this.originalMedicine.startDate,
      endDate: this.originalMedicine.endDate || '',
      quantity: this.originalMedicine.quantity || 0,
      frequency: this.originalMedicine.frequency
    };
  }

  /**
   * Maneja el envío del formulario desde el componente medicine-form
   */
  onFormSubmit(formData: MedicineFormData): void {
    if (!this.medicineId) {
      this.error = 'ID de medicamento inválido';
      return;
    }

    this.saving = true;
    this.error = null;

    const medicineDto: CreateMedicineDto = {
      name: formData.name,
      dosage: formData.dosage,
      frequency: formData.frequency,
      description: formData.description,
      startDate: formData.startDate,
      endDate: formData.endDate,
      quantity: formData.quantity
    };

    this.medicineService.update(this.medicineId, medicineDto as Omit<Medicine, 'id'>).subscribe({
      next: () => {
        console.log('Medicamento actualizado');
        this.form.markAsPristine();
        this.router.navigate(['/medicamentos']);
        this.saving = false;
      },
      error: (err) => {
        console.error('Error al actualizar medicamento:', err);
        this.error = err.message || 'Error al guardar el medicamento. Intenta nuevamente.';
        this.saving = false;
      }
    });
  }
}
