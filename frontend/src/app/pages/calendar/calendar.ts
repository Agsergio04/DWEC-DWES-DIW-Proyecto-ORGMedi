import { Component, OnInit, inject, ChangeDetectionStrategy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CalendarComponent } from '../../components/shared/calendar/calendar';
import { MedicineCardCalendarComponent } from '../../components/shared/medicine-card-calendar/medicine-card-calendar';
import { MedicineStoreSignals } from '../../data/stores/medicine-signals.store';
import { MedicineViewModel } from '../../data/models/medicine.model';
import { MedicineService } from '../../data/medicine.service';

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
  styleUrls: ['./calendar.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CalendarPage implements OnInit {
  private medicineStore = inject(MedicineStoreSignals);
  private medicineService = inject(MedicineService);
  private router = inject(Router);

  // Signals del store (readonly)
  loading = this.medicineStore.loading;
  error = this.medicineStore.error;
  stats = this.medicineStore.stats;

  currentDate = new Date();
  selectedDay: number | null = null;
  medicinesToShow: MedicineWithTime[] = []; // Medicamentos expandidos con horas
  medicineGroups: MedicineTimeGroup[] = []; // Grupos de medicamentos por hora

  constructor() {
    // Effect: Reaccionar a cambios en el store de medicamentos
    // IMPORTANTE: El effect debe crearse en el constructor para estar en el contexto de inyección correcto
    effect(() => {
      const medicines = this.medicineStore.medicines();
      console.log('[CalendarPage Effect] Medicamentos actualizados en el store:', medicines.length);
      // Actualizar vista cuando cambia el store
      this.updateMedicinesToShow();
    });
  }

  ngOnInit(): void {
    // Verificar si hay token de autenticación
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.warn('[CalendarPage] No token found, redirecting to login');
      this.router.navigate(['/iniciar-sesion']);
      return;
    }

    // Actualizar vista cuando cambian los medicamentos en el store
    // Usar effect para reactividad con signals
    this.updateMedicinesToShowInitial();
  }

  private updateMedicinesToShowInitial(): void {
    // Seleccionar el día actual por defecto
    const today = new Date();
    this.selectedDay = today.getDate();
    this.updateMedicinesToShow();
  }

  /**
   * TrackBy para optimizar *ngFor de grupos de medicamentos
   */
  trackByTime(index: number, group: MedicineTimeGroup): string {
    return group.time;
  }

  /**
   * TrackBy para optimizar *ngFor de medicamentos individuales
   */
  trackById(index: number, medicine: MedicineWithTime): string | number {
    return medicine.id + medicine.displayTime; // Única combinación de id + hora
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
    
    const medicines = this.medicineStore.medicines();
    console.log('[updateMedicinesToShow] Medicines to process:', medicines.length);

    this.medicinesToShow = [];
    const timeMap = new Map<string, MedicineWithTime[]>();

    // Para cada medicamento, calcular sus horas de aparición en la fecha seleccionada
    for (const medicine of medicines) {
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
   * Maneja el toggle de consumo del medicamento
   */
  onMedicineSelected(id: number): void {
    console.log('[CalendarPage] Toggle consumo para medicamento:', id);
    const current = this.medicineStore.getById(id)();
    if (!current) {
      console.warn('[CalendarPage] Medicamento no encontrado:', id);
      return;
    }

    const newValue = !current.consumed;
    console.log(`[CalendarPage] Cambiando consumo de ${current.nombre}: ${current.consumed} → ${newValue}`);
    
    // Optimistic update local store
    this.medicineStore.update({ ...current, consumed: newValue });

    // Actualizar solo los medicamentos que corresponden a este ID en medicinesToShow
    this.medicinesToShow = this.medicinesToShow.map(med => 
      med.id === id ? { ...med, consumed: newValue } : med
    );

    // Persistir en backend (PATCH parcial)
    this.medicineService.patch(id as any, { consumed: newValue }).subscribe({
      next: (updated) => {
        console.log('[CalendarPage] Consumo actualizado en servidor:', updated);
        // Actualizar store con respuesta del servidor
        this.medicineStore.update(updated as any);
        // Actualizar medicinesToShow con datos del servidor
        this.medicinesToShow = this.medicinesToShow.map(med =>
          med.id === id ? { ...med, ...(updated as any) } : med
        );
      },
      error: (err) => {
        console.error('[CalendarPage] Error al persistir consumo:', err);
        // Revertir cambio local
        this.medicineStore.update(current);
        this.medicinesToShow = this.medicinesToShow.map(med =>
          med.id === id ? { ...med, consumed: current.consumed } : med
        );
      }
    });
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
      this.medicineStore.remove(id);
      this.updateMedicinesToShow();
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


