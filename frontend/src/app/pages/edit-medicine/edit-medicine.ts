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
  selector: 'app-edit-medicine-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-medicine.html',
  styleUrls: ['./edit-medicine.scss']
})
export class EditMedicinePage {
  form: MedicineForm = {
    name: 'Amoxicilina',
    dosage: '500mg',
    frequency: '3 veces al día',
    description: 'Tomar con agua',
    startDate: '2026-01-01',
    endDate: '2026-02-01',
    quantity: 21
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
      // Aquí iría la lógica para actualizar el medicamento
      console.log('Medicamento actualizado:', this.form);
      // Navegar a la página de medicamentos
    }
  }

  cancelEdit(): void {
    // Aquí iría la navegación hacia atrás
  }

  deleteMedicine(): void {
    if (confirm('¿Estás seguro de que deseas eliminar este medicamento?')) {
      // Aquí iría la lógica para eliminar el medicamento
      console.log('Medicamento eliminado');
      // Navegar a la página de medicamentos
    }
  }

  isFormValid(): boolean {
    return !!(this.form.name && this.form.dosage && this.form.frequency && this.form.startDate);
  }
}

