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
  originalMedicine: any = null; // Guardar los datos originales para detectar cambios
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
    // Guardar una copia profunda de los datos originales para detectar cambios
    this.originalMedicine = JSON.parse(JSON.stringify(medicine));
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
   * Detecta qué campos han cambiado y solo envía los que cambiaron (PATCH)
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

    // Crear objeto con todos los datos formateados
    const allMedicineData = {
      nombre: formData.nombre,
      cantidadMg: formData.cantidadMg,
      frecuencia: formData.frecuencia,
      horaInicio: formData.horaInicio,
      fechaInicio: this.formatDateForApi(formData.fechaInicio),
      fechaFin: this.formatDateForApi(formData.fechaFin),
      color: formData.color
    };

    // Detectar qué campos han cambiado
    const changedFields = this.detectChanges(allMedicineData);

    console.log('[EditMedicinePage] Campos originales:', this.originalMedicine);
    console.log('[EditMedicinePage] Campos nuevos:', allMedicineData);
    console.log('[EditMedicinePage] Campos que cambiaron:', changedFields);

    // Si no hay cambios, simplemente navegar sin guardar
    if (Object.keys(changedFields).length === 0) {
      console.log('[EditMedicinePage] Sin cambios, navegando...');
      this.router.navigate(['/medicamentos']);
      this.saving = false;
      return;
    }

    // Usar PATCH para actualizar solo los campos que cambiaron
    this.medicineService.patch(this.medicineId, changedFields).subscribe({
      next: (medicine) => {
        console.log('Medicamento actualizado (parcial):', medicine);
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
   * Detecta qué campos han cambiado comparando con los datos originales
   */
  private detectChanges(newData: any): any {
    const changes: any = {};

    // Comparar cada campo
    for (const key in newData) {
      if (newData.hasOwnProperty(key)) {
        const originalValue = this.originalMedicine?.[key];
        const newValue = newData[key];

        // Comparar valores (teniendo en cuenta null/undefined)
        if (JSON.stringify(originalValue) !== JSON.stringify(newValue)) {
          changes[key] = newValue;
          console.log(`[detectChanges] Campo "${key}" cambió: "${originalValue}" → "${newValue}"`);
        }
      }
    }

    return changes;
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
