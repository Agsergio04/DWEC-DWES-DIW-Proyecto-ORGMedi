import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MedicineCardComponent } from '../../components/shared/medicine-card/medicine-card';
import { Medicine } from '../../components/shared/medicine-card/medicine-card';

@Component({
  selector: 'app-medicines-page',
  standalone: true,
  imports: [CommonModule, MedicineCardComponent],
  templateUrl: './medicines.html',
  styleUrls: ['./medicines.scss']
})
export class MedicinesPage {
  medicines: Medicine[] = [
    {
      id: '1',
      name: 'Amoxicilina',
      dosage: '500mg',
      frequency: '3 veces al día',
      description: 'Tomar con agua',
      startDate: '2026-01-01',
      endDate: '2026-02-01',
      quantity: 21,
      remainingDays: 22
    },
    {
      id: '2',
      name: 'Ibuprofeno',
      dosage: '400mg',
      frequency: 'Cada 6-8 horas',
      description: 'Tomar con alimentos',
      startDate: '2025-12-15',
      endDate: '2026-01-15',
      quantity: 30,
      remainingDays: 6
    },
    {
      id: '3',
      name: 'Paracetamol',
      dosage: '500mg',
      frequency: 'Cada 4-6 horas',
      startDate: '2025-11-01',
      endDate: '2025-12-31',
      quantity: 0,
      remainingDays: 0
    },
    {
      id: '4',
      name: 'Omeprazol',
      dosage: '20mg',
      frequency: '1 vez al día',
      description: 'Tomar en ayunas',
      startDate: '2026-01-05',
      endDate: '2026-04-05',
      quantity: 90,
      remainingDays: 85
    }
  ];

  get activeMedicines(): Medicine[] {
    return this.medicines.filter(m => !m.remainingDays || m.remainingDays > 0);
  }

  get expiredMedicines(): Medicine[] {
    return this.medicines.filter(m => m.remainingDays === 0);
  }

  navigateToCreate(): void {
    // Aquí iría la navegación a la página de crear medicamento
  }

  navigateToCreateFromPhoto(): void {
    // Aquí iría la navegación a la página de crear desde foto
  }

  editMedicine(medicineId: string): void {
    // Aquí iría la navegación a la página de editar medicamento
  }

  deleteMedicine(medicineId: string): void {
    this.medicines = this.medicines.filter(m => m.id !== medicineId);
  }
}

