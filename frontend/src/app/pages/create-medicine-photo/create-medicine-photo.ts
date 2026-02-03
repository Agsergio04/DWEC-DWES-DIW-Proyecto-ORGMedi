import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PendingChangesComponent } from '../../core/services/guards';
import { CrearMedicamentoFotoComponent } from '../../components/shared/crear-medicamento-foto/crear-medicamento-foto';
import { MedicineFormComponent, MedicineFormData } from '../../components/shared/medicine-form/medicine-form';
import { OcrDataService, OcrMedicineData } from '../../core/services/ocr/ocr-data.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-create-medicine-photo-page',
  standalone: true,
  imports: [CommonModule, CrearMedicamentoFotoComponent, MedicineFormComponent],
  templateUrl: './create-medicine-photo.html',
  styleUrls: ['./create-medicine-photo.scss']
})
export class CreateMedicinePhotoPage implements PendingChangesComponent, OnInit, OnDestroy {
  private router = inject(Router);
  private ocrDataService = inject(OcrDataService);
  private destroy$ = new Subject<void>();

  photoFile: File | null = null;
  isProcessing = false;
  isSubmitting = false;
  photoStep = true;  // true: captura foto, false: completa formulario
  
  medicineFormData: MedicineFormData | null = null;

  constructor() {}


  ngOnInit(): void {
    // Suscribirse a los datos del OCR
    this.ocrDataService.ocrData$
      .pipe(takeUntil(this.destroy$))
      .subscribe(ocrData => {
        if (ocrData) {
          console.log('[CreateMedicinePhotoPage] Datos OCR recibidos:', ocrData);
          this.prepareMedicineFormData(ocrData);
          this.photoStep = false;  // Mostrar formulario
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Comprueba si hay cambios pendientes de guardar
   */
  hasPendingChanges(): boolean {
    return !this.photoStep; // Hay cambios pendientes si estamos en el paso de formulario
  }

  /**
   * Prepara los datos del OCR para el formulario de medicamento
   */
  prepareMedicineFormData(ocrData: OcrMedicineData): void {
    this.medicineFormData = {
      nombre: ocrData.nombre || '',
      cantidadMg: Number(ocrData.cantidad) || 0,
      horaInicio: ocrData.horaInicio || '',
      fechaInicio: ocrData.fechaInicio || '',
      fechaFin: ocrData.fechaFin || '',
      frecuencia: this.mapFrequencyToOption(ocrData.frecuencia || ''),
      color: 'variante-primera' // Color por defecto
    };
  }

  /**
   * Mapea la frecuencia del OCR a las opciones disponibles
   */
  private mapFrequencyToOption(frequency: string | number): number {
    // Mapeo básico de frecuencias comunes
    const frequencyMap: { [key: string]: number } = {
      'cada 1 hora': 1,
      'cada 2 horas': 2,
      'cada 3 horas': 3,
      'cada 4 horas': 4,
      'cada 6 horas': 6,
      'cada 12 horas': 12,
      'una vez al día': 24,
      '2 veces al día': 12,
      '3 veces al día': 8
    };

    if (typeof frequency === 'number') {
      return frequency;
    }

    const key = String(frequency).toLowerCase();
    return frequencyMap[key] || 6; // Default a cada 6 horas
  }

  /**
   * Guarda el medicamento creado desde la foto
   */
  onMedicineFormSubmit(formData: MedicineFormData): void {
    this.isSubmitting = true;
    console.log('[CreateMedicinePhotoPage] Medicamento guardado desde foto:', formData);
    
    // TODO: Aquí iría la lógica real para guardar el medicamento en la API
    // Por ahora solo navegamos de vuelta
    
    // Limpiar datos del OCR después de guardar
    this.ocrDataService.clearOcrData();
    
    // Navegar a la página de medicamentos
    this.router.navigate(['/medicamentos']);
  }

  /**
   * Cancela la creación del medicamento
   */
  onMedicineFormCancel(): void {
    // Volver al paso de foto
    this.photoStep = true;
    this.medicineFormData = null;
    
    // Limpiar datos del OCR al cancelar
    this.ocrDataService.clearOcrData();
  }

  /**
   * Maneja la selección de foto
   */
  onPhotoSelected(file: File): void {
    this.photoFile = file;
    // Los datos del OCR se cargarán mediante el servicio
  }

  /**
   * Maneja la cancelación de foto
   */
  onPhotoCancelled(): void {
    // Navegar de vuelta
    this.router.navigate(['/medicamentos']);
  }
}

