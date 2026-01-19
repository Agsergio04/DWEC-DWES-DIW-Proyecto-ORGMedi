import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Medicine } from '../../../data/models/medicine.model';
import { MedicineDose, calculateMedicineDoses, parseFrequencyToHours } from '../../../shared/utils/medicine-schedule.util';

interface CalendarDay {
  date: Date;
  dayNumber: number;
  dayName: string;
  isToday: boolean;
  isCurrentMonth: boolean;
  doses?: MedicineDose[];
}

/**
 * Componente de Calendario
 * Muestra una semana con navegación de semanas anteriores/siguientes
 * Permite seleccionar días y navegar por el calendario
 * Muestra dosis de medicamentos si están disponibles
 */
@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar.html',
  styleUrls: ['./calendar.scss'],
})
export class CalendarComponent implements OnInit {
  // Semana actual
  weekDays: CalendarDay[] = [];

  // Fecha actual
  currentDate: Date = new Date();

  // Fecha seleccionada
  selectedDate: Date | null = null;

  // Medicamentos (input opcional)
  @Input() medicines: Medicine[] = [];

  // Dosis calculadas
  allDoses: MedicineDose[] = [];

  // Nombres de días de la semana
  dayNames: string[] = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sab'];

  ngOnInit() {
    this.calculateDoses();
    this.loadWeek(this.currentDate);
  }

  /**
   * Calcula todas las dosis de los medicamentos
   */
  calculateDoses() {
    this.allDoses = [];
    
    if (!this.medicines || this.medicines.length === 0) {
      return;
    }

    for (const medicine of this.medicines) {
      // Extraer hora de inicio del campo horaInicio (ej: "04:33")
      const startTime = medicine.horaInicio || '08:00';

      // Parsear frecuencia
      const frequencyHours = parseFrequencyToHours(medicine.frecuencia);

      // Calcular dosis
      const doses = calculateMedicineDoses(
        medicine.nombre,
        medicine.id,
        medicine.fechaInicio,
        medicine.fechaFin,
        startTime,
        frequencyHours
      );

      this.allDoses.push(...doses);
    }
  }

  /**
   * Carga la semana para una fecha específica
   */
  loadWeek(date: Date) {
    this.currentDate = date;
    this.weekDays = [];

    // Obtener el lunes de la semana actual
    const startOfWeek = this.getMonday(date);

    // Generar los 7 días de la semana
    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(startOfWeek);
      dayDate.setDate(dayDate.getDate() + i);

      const isToday = this.isToday(dayDate);
      const isCurrentMonth = dayDate.getMonth() === date.getMonth();

      // Obtener dosis para este día
      const dayDoses = this.getDosesForDate(dayDate);

      this.weekDays.push({
        date: dayDate,
        dayNumber: dayDate.getDate(),
        dayName: this.dayNames[dayDate.getDay()],
        isToday,
        isCurrentMonth,
        doses: dayDoses,
      });
    }
  }

  /**
   * Obtiene todas las dosis de un día específico
   */
  private getDosesForDate(date: Date): MedicineDose[] {
    return this.allDoses.filter(dose => {
      return (
        dose.date.getFullYear() === date.getFullYear() &&
        dose.date.getMonth() === date.getMonth() &&
        dose.date.getDate() === date.getDate()
      );
    });
  }

  /**
   * Obtiene el lunes de la semana actual
   */
  private getMonday(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Ajuste cuando sea domingo
    return new Date(d.setDate(diff));
  }

  /**
   * Verifica si una fecha es hoy
   */
  private isToday(date: Date): boolean {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  /**
   * Navega a la semana anterior
   */
  previousWeek() {
    const newDate = new Date(this.currentDate);
    newDate.setDate(newDate.getDate() - 7);
    this.loadWeek(newDate);
  }

  /**
   * Navega a la semana siguiente
   */
  nextWeek() {
    const newDate = new Date(this.currentDate);
    newDate.setDate(newDate.getDate() + 7);
    this.loadWeek(newDate);
  }

  /**
   * Selecciona un día
   */
  selectDay(day: CalendarDay) {
    this.selectedDate = day.date;
    this.currentDate = day.date;
    console.log('Día seleccionado:', day.date.toLocaleDateString('es-ES'));
  }

  /**
   * Obtiene la fecha actual formateada
   */
  getCurrentDateFormatted(): string {
    const day = String(this.currentDate.getDate()).padStart(2, '0');
    const month = String(this.currentDate.getMonth() + 1).padStart(2, '0');
    const year = this.currentDate.getFullYear();
    return `${day}/${month}/${year}`;
  }

  /**
   * Obtiene la clase CSS para un día específico
   */
  getDayClass(day: CalendarDay): string {
    let classes = 'calendar__day';

    if (day.isToday) {
      classes += ' calendar__day--today';
    }

    if (this.selectedDate && day.date.getTime() === this.selectedDate.getTime()) {
      classes += ' calendar__day--selected';
    }

    if (!day.isCurrentMonth) {
      classes += ' calendar__day--other-month';
    }

    return classes;
  }
}
