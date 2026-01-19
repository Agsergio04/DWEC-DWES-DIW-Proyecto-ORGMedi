import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CalendarComponent } from '../../components/shared/calendar/calendar';
import { MedicineCardCalendarComponent } from '../../components/shared/medicine-card-calendar/medicine-card-calendar';
import { MedicineService } from '../../data/medicine.service';
import { MedicineViewModel } from '../../data/models/medicine.model';

@Component({
  selector: 'app-calendar-page',
  standalone: true,
  imports: [CommonModule, CalendarComponent, MedicineCardCalendarComponent],
  templateUrl: './calendar.html',
  styleUrls: ['./calendar.scss']
})
export class CalendarPage implements OnInit {
  private medicineService = inject(MedicineService);
  private router = inject(Router);

  currentDate = new Date();
  selectedDay: number | null = null;
  medicines: MedicineViewModel[] = [];
  loading = false;
  error: any = null;

  ngOnInit(): void {
    // Delay para asegurar que localStorage esté actualizado después del registro
    // y que el interceptor pueda leer el token correctamente
    setTimeout(() => {
      this.loadMedicines();
    }, 300);
  }

  /**
   * Carga los medicamentos desde el servicio
   */
  private loadMedicines(): void {
    // Verificar si hay token de autenticación
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.warn('[CalendarPage] No token found, redirecting to login');
      this.router.navigate(['/iniciar-sesion']);
      return;
    }

    console.log('[CalendarPage] Loading medicines, token in storage:', !!token);
    this.loading = true;
    this.error = null;

    this.medicineService.getAll().subscribe({
      next: (medicines) => {
        console.log('[CalendarPage] Medicines loaded successfully:', medicines.length);
        this.medicines = medicines;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar medicamentos:', err);
        this.error = err;
        this.loading = false;
      }
    });
  }

  /**
   * Verifica si un medicamento ha expirado
   */
  isExpired(medicine: MedicineViewModel): boolean {
    if (!medicine.fechaFin) return false;
    const endDate = new Date(medicine.fechaFin);
    const today = new Date();
    return endDate < today;
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
   * Edita un medicamento
   */
  editMedicine(id: number): void {
    this.router.navigate(['/medicamento', id, 'editar-medicamento']);
  }

  /**
   * Elimina un medicamento
   */
  deleteMedicine(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar este medicamento?')) {
      this.medicineService.delete(id).subscribe({
        next: () => {
          this.medicines = this.medicines.filter(m => m.id !== id);
        },
        error: (err) => {
          console.error('Error al eliminar medicamento:', err);
          this.error = err;
        }
      });
    }
  }

  get currentMonth(): string {
    return this.currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  }

  get daysInMonth(): number[] {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: number[] = [];

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(i);
    }
    return days;
  }

  get firstDayOfWeek(): number {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    return firstDay.getDay();
  }

  previousMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1);
  }

  nextMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1);
  }

  isToday(day: number): boolean {
    const today = new Date();
    return day === today.getDate() &&
           this.currentDate.getMonth() === today.getMonth() &&
           this.currentDate.getFullYear() === today.getFullYear();
  }

  onDaySelected(day: number): void {
    this.selectedDay = day;
  }

  onMedicineSelected(medicineId: number): void {
    this.toggleConsumption(medicineId);
  }

  getWeekDays(): number[] {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    const dayOfWeek = firstDay.getDay();
    const daysFromPreviousMonth = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startDate.setDate(startDate.getDate() - daysFromPreviousMonth);

    const weekDays: number[] = [];
    for (let i = 0; i < 7; i++) {
      weekDays.push(startDate.getDate());
      startDate.setDate(startDate.getDate() + 1);
    }
    return weekDays;
  }
}

