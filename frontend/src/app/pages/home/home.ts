import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MedicineCardComponent } from '../../components/shared/medicine-card/medicine-card';
import { Medicine } from '../../components/shared/medicine-card/medicine-card';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, MedicineCardComponent],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class HomePage {
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
      icon: undefined
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
      icon: undefined
    },
    {
      id: '3',
      name: 'Paracetamol',
      dosage: '500mg',
      frequency: 'Cada 4-6 horas',
      startDate: '2025-11-01',
      endDate: '2025-12-31',
      quantity: 0,
      icon: undefined
    }
  ];
}
