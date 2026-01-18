import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Medicine {
  id: number;
  name: string;
  icon: string;
  color?: string;
  consumed?: boolean;
  dosage?: string;
  frequency?: string;
  startDate?: string;
  endDate?: string;
}

@Component({
  selector: 'app-medicine-card-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './medicine-card-calendar.html',
  styleUrl: './medicine-card-calendar.css'
})
export class MedicineCardCalendarComponent {
  @Input() medicine!: Medicine;
  @Input() isExpired: boolean = false;
  @Input() isExpiring: boolean = false;
  
  @Output() medicineEdit = new EventEmitter<number>();
  @Output() medicineDelete = new EventEmitter<number>();
  @Output() medicineSelected = new EventEmitter<number>();

  onEdit(): void {
    this.medicineEdit.emit(this.medicine.id);
  }

  onDelete(): void {
    this.medicineDelete.emit(this.medicine.id);
  }

  toggleConsumption(): void {
    this.medicineSelected.emit(this.medicine.id);
  }
}
  