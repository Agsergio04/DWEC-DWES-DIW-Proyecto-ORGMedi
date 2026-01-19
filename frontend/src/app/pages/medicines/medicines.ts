import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MedicineCardCalendarComponent } from '../../components/shared/medicine-card-calendar/medicine-card-calendar';
import { MedicineService } from '../../data/medicine.service';
import { MedicineViewModel, ApiError } from '../../data/models/medicine.model';

@Component({
  selector: 'app-medicines-page',
  standalone: true,
  imports: [CommonModule, MedicineCardCalendarComponent],
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
    // Verificar si hay token de autenticación
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.warn('[MedicinesPage] No token found, redirecting to login');
      this.router.navigate(['/iniciar-sesion']);
      return;
    }

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
   * Verifica si un medicamento ha vencido
   */
  isExpired(medicine: MedicineViewModel): boolean {
    return medicine.isExpired || false;
  }

  /**
   * Verifica si un medicamento está por vencer (dentro de 7 días)
   */
  isExpiring(medicine: MedicineViewModel): boolean {
    if (!medicine.fechaFin) return false;
    const endDate = new Date(medicine.fechaFin);
    const today = new Date();
    const daysUntilExpiry = (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  }

  /**
   * Toggle consumo del medicamento
   */
  toggleConsumption(id: number): void {
    console.log('Toggle consumo para medicamento:', id);
    // TODO: Implementar toggle de consumo
  }

  /**
   * Navega a la página de crear medicamento
   */
  navigateToCreate(): void {
    this.router.navigate(['/medicamentos/crear-medicamento']);
  }

  /**
   * Navega a la página de crear medicamento desde foto
   */
  navigateToCreateFromPhoto(): void {
    this.router.navigate(['/medicamentos/crear-foto']);
  }

  /**
   * Navega a la página de editar medicamento
   * @param medicineId ID del medicamento a editar
   */
  editMedicine(medicineId: string | number): void {
    this.router.navigate(['/medicamento', medicineId, 'editar-medicamento']);
  }

  /**
   * Elimina un medicamento con confirmación
   * @param medicineId ID del medicamento a eliminar
   */
  deleteMedicine(medicineId: string | number): void {
    const medicine = this.medicines.find(m => m.id === medicineId);
    if (!medicine) return;

    if (!confirm(`¿Está seguro de que desea eliminar "${medicine.nombre}"?`)) {
      return;
    }

    this.isLoading = true;
    this.medicineService.delete(medicineId).subscribe({
      next: () => {
        console.log('Medicamento eliminado:', medicine.nombre);
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

