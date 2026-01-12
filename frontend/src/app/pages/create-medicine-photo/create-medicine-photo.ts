import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface MedicineFromPhoto {
  name: string;
  dosage: string;
  frequency: string;
  description: string;
  startDate: string;
  endDate: string;
  quantity: number;
  photoUrl?: string;
}

@Component({
  selector: 'app-create-medicine-photo-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-medicine-photo.html',
  styleUrls: ['./create-medicine-photo.scss']
})
export class CreateMedicinePhotoPage {
  form: MedicineFromPhoto = {
    name: '',
    dosage: '',
    frequency: '',
    description: '',
    startDate: '',
    endDate: '',
    quantity: 0,
    photoUrl: undefined
  };

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
    this.form = {
      ...this.form,
      name: 'Medicamento detectado',
      dosage: 'Dosis detectada',
      description: 'Información extraída de la foto'
    };
  }

  clearPhoto(): void {
    this.photoFile = null;
    this.photoPreview = null;
    this.form = {
      name: '',
      dosage: '',
      frequency: '',
      description: '',
      startDate: '',
      endDate: '',
      quantity: 0
    };
  }

  saveMedicine(): void {
    if (this.isFormValid()) {
      // Aquí iría la lógica para guardar el medicamento
      console.log('Medicamento guardado desde foto:', this.form);
      // Navegar a la página de medicamentos
    }
  }

  cancelCreate(): void {
    // Aquí iría la navegación hacia atrás
  }

  isFormValid(): boolean {
    return !!(this.form.name && this.form.dosage && this.form.frequency && this.form.startDate);
  }
}

