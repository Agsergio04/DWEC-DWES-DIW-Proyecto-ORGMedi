import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface CalendarDay {
  date: Date;
  dayNumber: number;
  dayName: string;
  isToday: boolean;
  isCurrentMonth: boolean;
}

/**
 * Componente de Calendario
 * Muestra una semana con navegación de semanas anteriores/siguientes
 * Permite seleccionar días y navegar por el calendario
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

  // Nombres de días de la semana
  dayNames: string[] = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sab'];

  ngOnInit() {
    this.loadWeek(this.currentDate);
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

      this.weekDays.push({
        date: dayDate,
        dayNumber: dayDate.getDate(),
        dayName: this.dayNames[dayDate.getDay()],
        isToday,
        isCurrentMonth,
      });
    }
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
    console.log('Día seleccionado:', day.date.toLocaleDateString('es-ES'));
  }

  /**
   * Obtiene la fecha actual formateada
   */
  getCurrentDateFormatted(): string {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    };
    return this.currentDate.toLocaleDateString('es-ES', options);
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
