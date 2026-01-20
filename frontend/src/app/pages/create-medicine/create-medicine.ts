import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MedicineService } from '../../data/medicine.service';
import { ApiError } from '../../data/models/medicine.model';
import { MedicineFormComponent, MedicineFormData } from '../../components/shared/medicine-form/medicine-form';

@Component({
  selector: 'app-create-medicine-page',
  standalone: true,
  imports: [CommonModule, MedicineFormComponent],
  templateUrl: './create-medicine.html',
  styleUrls: ['./create-medicine.scss']
})
export class CreateMedicinePage implements OnInit {
  private medicineService = inject(MedicineService);
  private router = inject(Router);

  saving = false;
  error: ApiError | null = null;

  // Mapeo de variantes a colores hex
  private colorMap: { [key: string]: string } = {
    'variante-primera': '#00BCD4',   // Azul Cian
    'variante-segunda': '#FFC107',   // Amarillo
    'variante-tercera': '#E91E63',   // Rosa Magenta
    'variante-cuarta': '#FF9800',    // Naranja
    'variante-quinta': '#9C27B0'     // Magenta
  };

  constructor() {}

  /**
   * Verifica que el usuario esté autenticado
   */
  ngOnInit(): void {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      this.router.navigate(['/iniciar-sesion']);
    }
  }

  /**
   * Maneja el envío del formulario
   */
  onFormSubmit(formData: MedicineFormData): void {
    console.log('[CreateMedicinePage] onFormSubmit called with:', formData);
    this.saving = true;
    this.error = null;

    // Mapear correctamente los datos del formulario al DTO esperado por el backend
    const medicineData = {
      nombre: formData.nombre,
      cantidadMg: formData.cantidadMg,
      frecuencia: formData.frecuencia,
      horaInicio: formData.horaInicio,
      fechaInicio: this.formatDateForApi(formData.fechaInicio),
      fechaFin: this.formatDateForApi(formData.fechaFin),
      color: this.getColorHex(formData.color)  // Convertir variante a hex
    };

    console.log('[CreateMedicinePage] Mapped medicine data:', medicineData);
    this.medicineService.create(medicineData).subscribe({
      next: (medicine) => {
        console.log('[CreateMedicinePage] Medicamento creado:', medicine);
        this.router.navigate(['/medicamentos']);
        this.saving = false;
      },
      error: (err: ApiError) => {
        console.error('[CreateMedicinePage] Error al crear medicamento:', err);
        this.error = err;
        this.saving = false;
      }
    });
  }

  /**
   * Convierte una variante de color a su equivalente hex
   * @param color Variante de color o hex directo
   * @returns Color en formato hex
   */
  private getColorHex(color: string | undefined): string {
    if (!color) return '#5dd3e0'; // Color por defecto
    
    // Si ya es un color hex, devolverlo directamente
    if (color.startsWith('#')) {
      return color;
    }
    
    // Si es una variante, convertir a hex
    return this.colorMap[color] || '#5dd3e0';
  }

  /**
   * Formatea la fecha al formato esperado por el backend (YYYY-MM-DD)
   * Maneja strings en formato ISO o Date objects
   */
  private formatDateForApi(date: string | Date | null | undefined): string {
    if (!date) return '';
    
    let dateObj: Date;
    
    if (typeof date === 'string') {
      // Si es string en formato YYYY-MM-DD, extraerlo directamente
      if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return date;
      }
      // Si es un string ISO o similar, crear Date
      dateObj = new Date(date);
    } else {
      dateObj = date;
    }
    
    // Validar que es una fecha válida
    if (isNaN(dateObj.getTime())) {
      console.error('Fecha inválida:', date);
      return '';
    }
    
    // Usar el timezone local para evitar problemas de offset
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    
    const formatted = `${year}-${month}-${day}`;
    console.log(`[formatDateForApi] Entrada: ${date} → Salida: ${formatted}`);
    return formatted;
  }

  /**
   * Maneja la cancelación del formulario
   */
  onFormCancel(): void {
    this.router.navigate(['/medicamentos']);
  }
}
