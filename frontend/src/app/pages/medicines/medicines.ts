import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MedicineCardComponent } from '../../components/shared/medicine-card/medicine-card';
import { Medicine } from '../../components/shared/medicine-card/medicine-card';

@Component({
  selector: 'app-medicines-page',
  standalone: true,
  imports: [CommonModule, MedicineCardComponent],
  templateUrl: './medicines.html',
  styleUrls: ['./medicines.scss']
})
export class MedicinesPage implements OnInit {
  medicines: Medicine[] = [];
  isLoading = false;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Obtener los medicamentos del resolver
    this.route.data.subscribe((data) => {
      if (data && data['medicines']) {
        this.medicines = data['medicines'];
      }
    });
  }

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

