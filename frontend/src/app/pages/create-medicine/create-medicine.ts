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
      color: formData.color
    };

    this.medicineService.create(medicineData).subscribe({
      next: (medicine) => {
        console.log('Medicamento creado:', medicine);
        this.router.navigate(['/medicamentos']);
        this.saving = false;
      },
      error: (err: ApiError) => {
        console.error('Error al crear medicamento:', err);
        this.error = err;
        this.saving = false;
      }
    });
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
