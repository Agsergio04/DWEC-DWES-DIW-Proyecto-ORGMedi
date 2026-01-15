import { Component, Input, Output, EventEmitter } from '@angular/core';

interface Medicine {
  id: number;
  name: string;
  icon: string;
  color: string;
  consumed: boolean;
}

@Component({
  selector: 'app-medicine-card-calendar',
  standalone: true,
  templateUrl: './medicine-card-calendar.html',
  styleUrl: './medicine-card-calendar.css'
})
export class MedicineCardCalendarComponent {
  @Input() medicine!: Medicine;
  
  @Output() markAsConsumed = new EventEmitter<number>();
  @Output() markAsNotConsumed = new EventEmitter<number>();

  onCheck(): void {
    this.markAsConsumed.emit(this.medicine.id);
  }

  onClose(): void {
    this.markAsNotConsumed.emit(this.medicine.id);
  }
}
