import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MedicineViewModel } from '../../../data/models/medicine.model';

@Component({
  selector: 'app-medicine-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './medicine-card.html',
  styleUrls: ['./medicine-card.scss']
})
export class MedicineCardComponent implements OnInit {
  @Input() medicine!: MedicineViewModel;
  @Output() edit = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string>();

  isExpired = false;
  isExpiring = false;

  ngOnInit() {
    this.checkExpiration();
  }

  checkExpiration() {
    if (this.medicine && this.medicine.endDate) {
      const today = new Date();
      const endDate = new Date(this.medicine.endDate);
      const daysUntilExpiry = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      this.isExpired = daysUntilExpiry < 0;
      this.isExpiring = daysUntilExpiry >= 0 && daysUntilExpiry <= 7;
    }
  }

  onEdit() {
    this.edit.emit(this.medicine.id);
  }

  onDelete() {
    if (confirm(`¿Estás seguro de que deseas eliminar "${this.medicine.name}"?`)) {
      this.delete.emit(this.medicine.id);
    }
  }

  getDaysUntilExpiry(): string {
    if (!this.medicine || !this.medicine.endDate) {
      return 'N/A';
    }
    
    const today = new Date();
    const endDate = new Date(this.medicine.endDate);
    const daysUntilExpiry = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) {
      return 'Expirado';
    } else if (daysUntilExpiry === 0) {
      return 'Hoy';
    } else if (daysUntilExpiry === 1) {
      return 'Mañana';
    } else {
      return `En ${daysUntilExpiry} días`;
    }
  }

  getFrequencyLabel(): string {
    return this.medicine?.frequency || 'No especificada';
  }

  getDosageLabel(): string {
    return this.medicine?.dosage || 'No especificada';
  }
}
