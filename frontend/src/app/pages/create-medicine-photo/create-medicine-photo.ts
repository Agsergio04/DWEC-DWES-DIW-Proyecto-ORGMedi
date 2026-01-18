import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PendingChangesComponent } from '../../core/services/guards';

@Component({
  selector: 'app-create-medicine-photo-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './create-medicine-photo.html',
  styleUrls: ['./create-medicine-photo.scss']
})
export class CreateMedicinePhotoPage implements PendingChangesComponent {
  private router = inject(Router);
  private fb = inject(FormBuilder);

  form: FormGroup;
  photoFile: File | null = null;
  photoPreview: string | null = null;
  isProcessing = false;

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
      name: ['', Validators.required],
      dosage: ['', Validators.required],
      frequency: ['', Validators.required],
      description: [''],
      startDate: ['', Validators.required],
      endDate: [''],
      quantity: [0, [Validators.required, Validators.min(1)]]
    });
  }

  onPhotoSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.photoFile = file;

      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.photoPreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);

      // Simular OCR/reconocimiento (esto sería una llamada API real)
      this.isProcessing = true;
      setTimeout(() => {
        this.extractDataFromPhoto();
        this.isProcessing = false;
      }, 1500);
    }
  }

  extractDataFromPhoto(): void {
    // Aquí iría la lógica real para extraer datos de la foto
    // Por ahora, simulamos un resultado
    this.form.patchValue({
      name: 'Medicamento detectado',
      dosage: 'Dosis detectada',
      description: 'Información extraída de la foto'
    });
    // Marcar como sucio para que el guard detecte cambios
    this.form.markAsDirty();
  }

  clearPhoto(): void {
    this.photoFile = null;
    this.photoPreview = null;
    this.form.reset();
    this.form.markAsPristine();
  }

  saveMedicine(): void {
    if (this.form.valid) {
      // Aquí iría la lógica para guardar el medicamento
      console.log('Medicamento guardado desde foto:', this.form.value);
      // Navegar a la página de medicamentos
      this.router.navigate(['/medicamentos']);
    }
  }

  cancelCreate(): void {
    // Navegar a la página de medicamentos
    this.router.navigate(['/medicamentos']);
  }

  isFormValid(): boolean {
    return this.form.valid && this.photoFile !== null;
  }
}

