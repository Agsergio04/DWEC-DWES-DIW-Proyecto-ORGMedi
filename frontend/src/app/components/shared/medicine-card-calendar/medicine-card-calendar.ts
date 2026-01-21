import { Component, Input, Output, EventEmitter, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MedicineViewModel } from '../../../data/models/medicine.model';
import { MedicineService } from '../../../data/medicine.service';

@Component({
  selector: 'app-medicine-card-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './medicine-card-calendar.html',
  styleUrl: './medicine-card-calendar.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MedicineCardCalendarComponent {
  private medicineService = inject(MedicineService);

  @Input() medicine!: MedicineViewModel;
  @Input() displayTime: string = '00:00'; // Nueva prop para mostrar la hora
  @Input() isExpired: boolean = false;
  @Input() isExpiring: boolean = false;
  
  @Output() medicineEdit = new EventEmitter<number>();
  @Output() medicineDelete = new EventEmitter<number>();
  @Output() medicineSelected = new EventEmitter<number>();

  saving = false;

  // Mapeo de variantes a colores hex
  private colorMap: { [key: string]: string } = {
    'variante-primera': '#00BCD4',   // Azul Cian
    'variante-segunda': '#FFC107',   // Amarillo
    'variante-tercera': '#E91E63',   // Rosa Magenta
    'variante-cuarta': '#FF9800',    // Naranja
    'variante-quinta': '#9C27B0'     // Magenta
  };

  /**
   * Convierte una variante de color a su equivalente hex
   */
  getColorHex(color: string | undefined): string {
    if (!color) return '#5dd3e0'; // Color por defecto
    
    // Si ya es un color hex, devolverlo directamente
    if (color.startsWith('#')) {
      return color;
    }
    
    // Si es una variante, convertir a hex
    return this.colorMap[color] || '#5dd3e0';
  }

  onEdit(): void {
    this.medicineEdit.emit(this.medicine.id);
  }

  onDelete(): void {
    this.medicineDelete.emit(this.medicine.id);
  }

  toggleConsumption(): void {
    if (this.saving) return;
    
    this.saving = true;
    const updatedMedicine = {
      ...this.medicine,
      consumed: !this.medicine.consumed
    };

    // Actualizar el estado localmente de inmediato
    this.medicine.consumed = !this.medicine.consumed;

    // Guardar en la base de datos
    this.medicineService.update(this.medicine.id, updatedMedicine).subscribe({
      next: () => {
        console.log('Estado de consumo actualizado:', updatedMedicine);
        this.saving = false;
        this.medicineSelected.emit(this.medicine.id);
      },
      error: (err) => {
        console.error('Error al actualizar consumo:', err);
        // Revertir el cambio local si falla
        this.medicine.consumed = !this.medicine.consumed;
        this.saving = false;
      }
    });
  }
}

  