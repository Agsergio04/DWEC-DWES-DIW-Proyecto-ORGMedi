import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  description?: string;
  image?: string;
  startDate: string;
  endDate?: string;
  remainingDays?: number;
  quantity?: number;
  icon?: string;
}

@Component({
  selector: 'app-medicine-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './medicine-card.html',
  styleUrls: ['./medicine-card.scss']
})
export class MedicineCardComponent {
  @Input() medicine!: Medicine;
  @Input() variant: 'basic' | 'detailed' = 'basic';
  @Output() edit = new EventEmitter<Medicine>();
  @Output() delete = new EventEmitter<string>();

  get daysRemaining(): number {
    if (!this.medicine.remainingDays) {
      if (this.medicine.endDate) {
        const endDate = new Date(this.medicine.endDate);
        const today = new Date();
        const diffTime = endDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.max(0, diffDays);
      }
      return 0;
    }
    return this.medicine.remainingDays;
  }

  get isExpiring(): boolean {
    return this.daysRemaining <= 7 && this.daysRemaining > 0;
  }

  get isExpired(): boolean {
    return this.daysRemaining <= 0;
  }

  onEdit(): void {
    this.edit.emit(this.medicine);
  }

  onDelete(): void {
    this.delete.emit(this.medicine.id);
  }
}

