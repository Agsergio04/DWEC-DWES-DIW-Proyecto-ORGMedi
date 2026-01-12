import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-calendar-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar.html',
  styleUrls: ['./calendar.scss']
})
export class CalendarPage {
  currentDate = new Date();

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
}

