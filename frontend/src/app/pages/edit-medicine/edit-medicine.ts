import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MedicineService } from '../../data/medicine.service';
import { ApiError } from '../../data/models/medicine.model';
import { MedicineFormComponent, MedicineFormData } from '../../components/shared/medicine-form/medicine-form';

@Component({
  selector: 'app-edit-medicine-page',
  standalone: true,
  imports: [CommonModule, MedicineFormComponent],
  templateUrl: './edit-medicine.html',
  styleUrls: ['./edit-medicine.scss']
})
export class EditMedicinePage implements OnInit {
  private medicineService = inject(MedicineService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  medicineId: string | null = null;
  medicine: any = null;
  saving = false;
  loading = false;
  error: ApiError | null = null;

  constructor() {}

  ngOnInit(): void {
    // Obtener el ID de la ruta
    this.medicineId = this.route.snapshot.paramMap.get('id');

    // Intentar leer datos del resolver primero (precargas)
    this.route.data.subscribe((data: any) => {
      const resolvedMedicine = data['medicine'];
      if (resolvedMedicine) {
        this.loadMedicineData(resolvedMedicine);
      } else if (this.medicineId) {
        // Si no hay data resuelta, cargar desde el servicio
        this.loadMedicine(this.medicineId);
      } else {
        this.error = {
          code: 'INVALID_ID',
          message: 'ID de medicamento inválido',
          timestamp: new Date().toISOString()
        };
      }
    });
  }

  /**
   * Carga los datos del medicamento
   */
  private loadMedicineData(medicine: any): void {
    this.loading = false;
    this.error = null;
    this.medicine = medicine;
  }

  /**
   * Carga el medicamento desde el servicio
   */
  loadMedicine(id: string): void {
    this.loading = true;
    this.error = null;

    this.medicineService.getById(id).subscribe({
      next: (medicine) => {
        this.loadMedicineData(medicine);
        this.loading = false;
      },
      error: (err: ApiError) => {
        console.error('Error al cargar medicamento:', err);
        this.error = err;
        this.loading = false;
      }
    });
  }

  /**
   * Maneja el envío del formulario
   */
  onFormSubmit(formData: MedicineFormData): void {
    if (!this.medicineId) {
      this.error = {
        code: 'VALIDATION_ERROR',
        message: 'ID de medicamento inválido',
        timestamp: new Date().toISOString()
      };
      return;
    }

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

    this.medicineService.update(this.medicineId, medicineData).subscribe({
      next: (medicine) => {
        console.log('Medicamento actualizado:', medicine);
        this.router.navigate(['/medicamentos']);
        this.saving = false;
      },
      error: (err: ApiError) => {
        console.error('Error al actualizar medicamento:', err);
        this.error = err;
        this.saving = false;
      }
    });
  }

  /**
   * Formatea la fecha al formato esperado por el backend (YYYY-MM-DD)
   */
  private formatDateForApi(date: string | Date): string {
    if (!date) return '';
    
    let dateObj: Date;
    if (typeof date === 'string') {
      dateObj = new Date(date);
    } else {
      dateObj = date;
    }
    
    // Asegurar que es una fecha válida
    if (isNaN(dateObj.getTime())) {
      return '';
    }
    
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }

  /**
   * Maneja la cancelación del formulario
   */
  onFormCancel(): void {
    this.router.navigate(['/medicamentos']);
  }
}
