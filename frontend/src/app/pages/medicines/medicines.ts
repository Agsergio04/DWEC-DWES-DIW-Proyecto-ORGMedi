import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MedicineCardComponent } from '../../components/shared/medicine-card/medicine-card';
import { MedicineService } from '../../data/medicine.service';
import { MedicineViewModel, ApiError } from '../../data/models/medicine.model';

@Component({
  selector: 'app-medicines-page',
  standalone: true,
  imports: [CommonModule, MedicineCardComponent],
  templateUrl: './medicines.html',
  styleUrls: ['./medicines.scss']
})
export class MedicinesPage implements OnInit {
  private medicineService = inject(MedicineService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  medicines: MedicineViewModel[] = [];
  medicines$ = this.medicineService.getAll();
  isLoading = false;
  error: ApiError | null = null;

  ngOnInit(): void {
    // Intentar leer datos del resolver primero (precargas)
    this.route.data.subscribe((data) => {
      const resolvedMedicines = data['medicines'];
      if (resolvedMedicines && resolvedMedicines.length > 0) {
        this.medicines = resolvedMedicines;
        this.isLoading = false;
        this.error = null;
      } else {
        // Si no hay data resuelta o está vacía, cargar desde el servicio
        this.loadMedicines();
      }
    });
  }

  /**
   * Carga la lista de medicamentos desde el servicio
   */
  loadMedicines(): void {
    this.isLoading = true;
    this.error = null;

    this.medicineService.getAll().subscribe({
      next: (data) => {
        this.medicines = data;
        this.isLoading = false;
      },
      error: (err: ApiError) => {
        console.error('Error al cargar medicamentos:', err);
        this.error = err;
        this.isLoading = false;
      }
    });
  }


  get activeMedicines(): MedicineViewModel[] {
    return this.medicines.filter(m => m.isActive);
  }

  get expiredMedicines(): MedicineViewModel[] {
    return this.medicines.filter(m => m.isExpired);
  }

  /**
   * Navega a la página de crear medicamento
   */
  navigateToCreate(): void {
    this.router.navigate(['/crear-medicamento']);
  }

  /**
   * Navega a la página de crear medicamento desde foto
   */
  navigateToCreateFromPhoto(): void {
    this.router.navigate(['/crear-medicamento-foto']);
  }

  /**
   * Navega a la página de editar medicamento
   * @param medicineId ID del medicamento a editar
   */
  editMedicine(medicineId: string): void {
    this.router.navigate(['/editar-medicamento', medicineId]);
  }

  /**
   * Elimina un medicamento con confirmación
   * @param medicine Medicamento a eliminar
   */
  deleteMedicine(medicine: MedicineViewModel): void {
    if (!confirm(`¿Está seguro de que desea eliminar "${medicine.name}"?`)) {
      return;
    }

    this.isLoading = true;
    this.medicineService.delete(medicine.id).subscribe({
      next: () => {
        console.log('Medicamento eliminado:', medicine.name);
        // Recargar la lista
        this.loadMedicines();
      },
      error: (err: ApiError) => {
        console.error('Error al eliminar medicamento:', err);
        this.error = err;
        this.isLoading = false;
      }
    });
  }
}

