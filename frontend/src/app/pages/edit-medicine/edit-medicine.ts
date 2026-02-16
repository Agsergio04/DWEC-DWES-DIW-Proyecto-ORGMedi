import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MedicineService } from '../../data/medicine.service';
import { ApiError, MedicineViewModel, UpdateMedicineDto } from '../../data/models/medicine.model';
import { MedicineFormComponent, MedicineFormData } from '../../components/shared/medicine-form/medicine-form';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-edit-medicine-page',
  standalone: true,
  imports: [CommonModule, MedicineFormComponent],
  templateUrl: './edit-medicine.html',
  styleUrls: ['./edit-medicine.scss']
})
export class EditMedicinePage implements OnInit, OnDestroy {
  private medicineService = inject(MedicineService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  medicineId: string | null = null;
  medicine: MedicineViewModel | null = null;
  originalMedicine: MedicineViewModel | null = null; // Guardar los datos originales para detectar cambios
  saving = false;
  loading = false;
  error: ApiError | null = null;

  constructor() {}

  /**
   * Convierte MedicineViewModel a MedicineFormData para el formulario
   */
  get medicineFormData(): MedicineFormData | null {
    if (!this.medicine) return null;
    return {
      nombre: this.medicine.nombre,
      cantidadMg: this.medicine.cantidadMg,
      horaInicio: this.medicine.horaInicio,
      fechaInicio: this.medicine.fechaInicio instanceof Date 
        ? this.medicine.fechaInicio.toISOString().split('T')[0]
        : typeof this.medicine.fechaInicio === 'string'
        ? this.medicine.fechaInicio
        : '',
      fechaFin: this.medicine.fechaFin instanceof Date
        ? this.medicine.fechaFin.toISOString().split('T')[0]
        : typeof this.medicine.fechaFin === 'string'
        ? this.medicine.fechaFin
        : '',
      frecuencia: this.medicine.frecuencia,
      color: this.medicine.color
    };
  }

  ngOnInit(): void {
    // Obtener el ID de la ruta
    this.medicineId = this.route.snapshot.paramMap.get('id');

    // Intentar leer datos del resolver primero (precargas)
    this.route.data
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: Record<string, MedicineViewModel | undefined>) => {
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Carga los datos del medicamento
   */
  private loadMedicineData(medicine: MedicineViewModel): void {
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

    this.medicineService.getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
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
    const allMedicineData: UpdateMedicineDto = {
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
    // Si no hay cambios, simplemente navegar sin guardar
    if (Object.keys(changedFields).length === 0) {
      this.router.navigate(['/calendario']);
      this.saving = false;
      return;
    }

    // Usar PATCH para actualizar solo los campos que cambiaron
    this.medicineService.patch(this.medicineId, changedFields)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (medicine: MedicineViewModel) => {
        // Marcar que hay cambios pendientes para que el calendario se refresque automáticamente
        sessionStorage.setItem('medicinesUpdated', 'true');
        // Navegar al calendario en lugar de a medicamentos para ver los cambios inmediatamente
        this.router.navigate(['/calendario']);
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
  private detectChanges(newData: UpdateMedicineDto): Partial<UpdateMedicineDto> {
    const changes: Partial<UpdateMedicineDto> = {};

    // Comparar cada campo
    for (const key in newData) {
      if (newData.hasOwnProperty(key)) {
        const originalValue = this.originalMedicine?.[key as keyof MedicineViewModel];
        const newValue = newData[key as keyof UpdateMedicineDto];

        // Comparar valores (teniendo en cuenta null/undefined)
        if (JSON.stringify(originalValue) !== JSON.stringify(newValue)) {
          (changes as Record<string, unknown>)[key] = newValue;
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
    return formatted;
  }

  /**
   * Maneja la cancelación del formulario
   */
  onFormCancel(): void {
    this.router.navigate(['/calendario']);
  }
}
