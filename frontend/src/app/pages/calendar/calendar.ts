import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarButtonComponent } from '../../components/shared/calendar-button/calendar-button';
import { MedicineCardCalendarComponent } from '../../components/shared/medicine-card-calendar/medicine-card-calendar';

interface Medicine {
  id: number;
  name: string;
  icon: string;
  color: string;
  consumed: boolean;
}

@Component({
  selector: 'app-calendar-page',
  standalone: true,
  imports: [CommonModule, CalendarButtonComponent, MedicineCardCalendarComponent],
  templateUrl: './calendar.html',
  styleUrls: ['./calendar.scss']
})
export class CalendarPage {
  currentDate = new Date();
  selectedDay: number | null = null;
  medicines: Medicine[] = [
    {
      id: 1,
      name: 'Amoxicilina',
      icon: '💊',
      color: '#d97bbf',
      consumed: false
    },
    {
      id: 2,
      name: 'Omeprazol',
      icon: '💊',
      color: '#ffc107',
      consumed: true
    },
    {
      id: 3,
      name: 'Ozempic',
      icon: '💊',
      color: '#00bcd4',
      consumed: false
    }
  ];

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

  onMedicineConsumed(medicineId: number): void {
    const medicine = this.medicines.find(m => m.id === medicineId);
    if (medicine) {
      medicine.consumed = true;
    }
  }

  onMedicineNotConsumed(medicineId: number): void {
    const medicine = this.medicines.find(m => m.id === medicineId);
    if (medicine) {
      medicine.consumed = false;
    }
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

