import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface MedicineForm {
  name: string;
  dosage: string;
  frequency: string;
  description: string;
  startDate: string;
  endDate: string;
  quantity: number;
}

@Component({
  selector: 'app-create-medicine-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-medicine.html',
  styleUrls: ['./create-medicine.scss']
})
export class CreateMedicinePage {
  form: MedicineForm = {
    name: '',
    dosage: '',
    frequency: '',
    description: '',
    startDate: '',
    endDate: '',
    quantity: 0
  };

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

  saveMedicine(): void {
    if (this.isFormValid()) {
      // Aquí iría la lógica para guardar el medicamento
      console.log('Medicamento guardado:', this.form);
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

