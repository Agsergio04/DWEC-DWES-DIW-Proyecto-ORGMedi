import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CalendarComponent } from '../../components/shared/calendar/calendar';
import { MedicineCardCalendarComponent } from '../../components/shared/medicine-card-calendar/medicine-card-calendar';
import { MedicineService } from '../../data/medicine.service';
import { MedicineViewModel } from '../../data/models/medicine.model';

export interface MedicineWithTime extends MedicineViewModel {
  displayTime: string; // HH:mm
}

export interface MedicineTimeGroup {
  time: string;
  medicines: MedicineWithTime[];
}

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
  medicinesToShow: MedicineWithTime[] = []; // Medicamentos expandidos con horas
  medicineGroups: MedicineTimeGroup[] = []; // Grupos de medicamentos por hora
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
        // Seleccionar el día actual por defecto
        const today = new Date();
        this.selectedDay = today.getDate();
        console.log('[CalendarPage] Selected day:', this.selectedDay);
        this.updateMedicinesToShow();
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
   * Calcula las horas de aparición de un medicamento basándose en su frecuencia
   * Incluye horas que se extiendan al siguiente día si el medicamento es válido para ese día
   * @param medicine Medicamento a analizar
   * @param date Fecha para la que se calculan las horas
   * @returns Array de horas en formato HH:mm
   */
  private calculateMedicineTimes(medicine: MedicineViewModel, date: Date): string[] {
    const times: string[] = [];
    
    // Verificar que el medicamento es válido para esta fecha
    if (!this.isMedicineValidForDate(medicine, date)) {
      return times;
    }

    // Obtener la hora de inicio
    const [startHour, startMinute] = medicine.horaInicio.split(':').map(Number);
    let currentHour = startHour;
    const frequency = medicine.frecuencia || 1;

    // Generar todas las horas dentro del día actual
    while (currentHour < 24) {
      times.push(`${String(currentHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}`);
      currentHour += frequency;
    }

    // Si hay una toma que se extiende al siguiente día, verificar si el medicamento es válido para mañana
    if (currentHour >= 24) {
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      
      if (this.isMedicineValidForDate(medicine, nextDay)) {
        // Calcular la hora en el siguiente día (restar 24)
        const nextDayHour = currentHour - 24;
        times.push(`${String(nextDayHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}`);
      }
    }

    return times;
  }

  /**
   * Verifica si un medicamento es válido para una fecha específica
   * (respeta las fechas de inicio y fin)
   */
  private isMedicineValidForDate(medicine: MedicineViewModel, date: Date): boolean {
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    // Verificar fecha de inicio
    if (medicine.fechaInicio) {
      const startDate = new Date(medicine.fechaInicio);
      const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
      if (dateOnly < startDateOnly) {
        return false;
      }
    }

    // Verificar fecha de fin
    if (medicine.fechaFin) {
      const endDate = new Date(medicine.fechaFin);
      const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
      if (dateOnly > endDateOnly) {
        return false;
      }
    }

    return true;
  }

  /**
   * Actualiza la lista de medicamentos a mostrar basándose en el día seleccionado
   */
  private updateMedicinesToShow(): void {
    const displayDate = this.selectedDay 
      ? new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), this.selectedDay)
      : new Date();

    console.log('[updateMedicinesToShow] Display date:', displayDate);
    console.log('[updateMedicinesToShow] Medicines to process:', this.medicines.length);

    this.medicinesToShow = [];
    const timeMap = new Map<string, MedicineWithTime[]>();

    // Para cada medicamento, calcular sus horas de aparición en la fecha seleccionada
    for (const medicine of this.medicines) {
      const isValid = this.isMedicineValidForDate(medicine, displayDate);
      console.log(`[updateMedicinesToShow] Medicine "${medicine.nombre}": valid=${isValid}, horaInicio=${medicine.horaInicio}, frecuencia=${medicine.frecuencia}`);
      
      const times = this.calculateMedicineTimes(medicine, displayDate);
      console.log(`[updateMedicinesToShow] Medicine "${medicine.nombre}" times:`, times);
      
      // Crear una instancia del medicamento por cada hora de aparición
      for (const time of times) {
        const medicineWithTime = {
          ...medicine,
          displayTime: time
        } as MedicineWithTime;
        
        this.medicinesToShow.push(medicineWithTime);
        
        // Agrupar por hora
        if (!timeMap.has(time)) {
          timeMap.set(time, []);
        }
        timeMap.get(time)!.push(medicineWithTime);
      }
    }

    // Construir grupos ordenados por hora
    this.medicineGroups = Array.from(timeMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([time, medicines]) => ({
        time,
        medicines
      }));

    // Ordenar medicinesToShow por hora
    this.medicinesToShow.sort((a, b) => a.displayTime.localeCompare(b.displayTime));
    console.log('[updateMedicinesToShow] Final medicines to show:', this.medicinesToShow.length);
    console.log('[updateMedicinesToShow] Medicine groups:', this.medicineGroups.length);
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
    this.updateMedicinesToShow();
  }

  nextMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1);
    this.updateMedicinesToShow();
  }

  isToday(day: number): boolean {
    const today = new Date();
    return day === today.getDate() &&
           this.currentDate.getMonth() === today.getMonth() &&
           this.currentDate.getFullYear() === today.getFullYear();
  }

  /**
   * Manejador para cuando se selecciona un día desde el calendario
   * Verifica medicamentos que cumplan con la fecha seleccionada
   */
  onCalendarDaySelected(selectedDate: Date): void {
    console.log('[onCalendarDaySelected] Date selected:', selectedDate.toLocaleDateString('es-ES'));
    
    // Actualizar la fecha actual y el día seleccionado
    this.currentDate = new Date(selectedDate);
    this.selectedDay = selectedDate.getDate();
    
    // Actualizar medicamentos a mostrar basándose en la nueva fecha
    this.updateMedicinesToShow();
  }

  onDaySelected(day: number): void {
    this.selectedDay = day;
    this.updateMedicinesToShow(); // Actualizar lista al cambiar día
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

