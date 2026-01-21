import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MedicineViewModel } from '../../../data/models/medicine.model';

@Component({
  selector: 'app-medicine-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './medicine-card.html',
  styleUrls: ['./medicine-card.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MedicineCardComponent implements OnInit {
  @Input() medicine!: MedicineViewModel;
  @Output() edit = new EventEmitter<number>();
  @Output() delete = new EventEmitter<number>();

  isExpired = false;
  isExpiring = false;

  // Mapeo de variantes a colores hex
  private colorMap: { [key: string]: string } = {
    'variante-primera': '#00BCD4',   // Azul Cian
    'variante-segunda': '#FFC107',   // Amarillo
    'variante-tercera': '#E91E63',   // Rosa Magenta
    'variante-cuarta': '#FF9800',    // Naranja
    'variante-quinta': '#9C27B0'     // Magenta
  };

  ngOnInit() {
    this.checkExpiration();
  }

  checkExpiration() {
    if (this.medicine && this.medicine.fechaFin) {
      const today = new Date();
      const endDate = new Date(this.medicine.fechaFin);
      const daysUntilExpiry = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      this.isExpired = daysUntilExpiry < 0;
      this.isExpiring = daysUntilExpiry >= 0 && daysUntilExpiry <= 7;
    }
  }

  onEdit() {
    this.edit.emit(this.medicine.id);
  }

  onDelete() {
    if (confirm(`¿Estás seguro de que deseas eliminar "${this.medicine.nombre}"?`)) {
      this.delete.emit(this.medicine.id);
    }
  }

  getDaysUntilExpiry(): string {
    if (!this.medicine || !this.medicine.fechaFin) {
      return 'N/A';
    }
    
    const today = new Date();
    const endDate = new Date(this.medicine.fechaFin);
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
    return this.medicine?.frecuencia ? `cada ${this.medicine.frecuencia} horas` : 'No especificada';
  }

  getDosageLabel(): string {
    return this.medicine?.cantidadMg ? `${this.medicine.cantidadMg} Mg` : 'No especificada';
  }

  /**
   * Obtiene el color de la pastilla basado en el valor guardado en BD
   * Convierte la variante a color hex
   */
  getPillColor(): string {
    if (!this.medicine?.color) {
      return '#5dd3e0'; // Color por defecto si no existe
    }
    return this.colorMap[this.medicine.color] || this.medicine.color || '#5dd3e0';
  }


}
