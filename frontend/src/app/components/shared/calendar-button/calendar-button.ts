import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-calendar-button',
  standalone: true,
  templateUrl: './calendar-button.html',
  styleUrl: './calendar-button.css'
})
export class CalendarButtonComponent {
  @Input() day!: number;
  @Input() isToday: boolean = false;
  @Input() isSelected: boolean = false;
  
  @Output() daySelected = new EventEmitter<number>();

  onClick() {
    this.daySelected.emit(this.day);
  }
}
