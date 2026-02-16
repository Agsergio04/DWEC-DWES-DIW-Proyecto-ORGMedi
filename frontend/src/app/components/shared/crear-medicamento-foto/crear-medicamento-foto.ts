import { Component, Output, EventEmitter, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonComponent } from '../button/button';
import { ApiService } from '../../../core/services/data/api.service';
import { OcrDataService } from '../../../core/services/ocr/ocr-data.service';

/**
 * Componente para capturar o seleccionar foto del medicamento
 * Emite un evento cuando la foto está lista y realiza OCR
 */
@Component({
  selector: 'app-crear-medicamento-foto',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './crear-medicamento-foto.html',
  styleUrls: ['./crear-medicamento-foto.scss']
})
export class CrearMedicamentoFotoComponent {
  @Output() photoSelected = new EventEmitter<File>();
  @Output() cancelled = new EventEmitter<void>();
  @Input() isProcessing = false;

  photoPreview: string | null = null;
  photoFile: File | null = null;
  showCamera = false;
  videoElement: HTMLVideoElement | null = null;
  stream: MediaStream | null = null;
  isProcessingOcr = false;

  private apiService = inject(ApiService);
  private ocrDataService = inject(OcrDataService);
  private router = inject(Router);

  /**
   * Abre el diálogo de selección de archivo
   */
  onFileInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectPhoto(input.files[0]);
    }
  }

  /**
   * Procesa la foto seleccionada
   */
  selectPhoto(file: File): void {
    this.photoFile = file;

    // Crear preview
    const reader = new FileReader();
    reader.onload = (e) => {
      this.photoPreview = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  /**
   * Inicia la cámara
   */
  async startCamera(): Promise<void> {
    try {
      this.showCamera = true;
      setTimeout(() => {
        this.videoElement = document.querySelector('#cameraVideo') as HTMLVideoElement;
        if (this.videoElement && navigator.mediaDevices) {
          navigator.mediaDevices
            .getUserMedia({ video: { facingMode: 'environment' } })
            .then((stream) => {
              this.stream = stream;
              if (this.videoElement) {
                this.videoElement.srcObject = stream;
              }
            })
            .catch((err) => {
              console.error('Error al acceder a la cámara:', err);
              this.showCamera = false;
            });
        }
      }, 0);
    } catch (error) {
      console.error('Error al iniciar cámara:', error);
    }
  }

  /**
   * Captura una foto de la cámara
   */
  capturePhoto(): void {
    if (!this.videoElement) return;

    const canvas = document.createElement('canvas');
    canvas.width = this.videoElement.videoWidth;
    canvas.height = this.videoElement.videoHeight;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.drawImage(this.videoElement, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `medicamento-${Date.now()}.jpg`, {
            type: 'image/jpeg'
          });
          this.selectPhoto(file);
          this.stopCamera();
        }
      }, 'image/jpeg');
    }
  }

  /**
   * Detiene la cámara
   */
  stopCamera(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    this.showCamera = false;
  }

  /**
   * Limpia la foto seleccionada
   */
  clearPhoto(): void {
    this.photoPreview = null;
    this.photoFile = null;
    this.stopCamera();
  }

  /**
   * Confirma la selección de foto
   */
  confirmPhoto(): void {
    if (this.photoFile) {
      this.isProcessingOcr = true;
      
      // Hacer llamada OCR al backend
      const formData = new FormData();
      formData.append('image', this.photoFile);
      
      this.apiService.extractOcr(formData).subscribe({
        next: (response: any) => {
          // Guardar datos del OCR en el servicio
          this.ocrDataService.setOcrData(response);
          // Redirigir a la página de crear medicamento
          this.router.navigate(['/medicamentos/crear-medicamento']);
        },
        error: (error: any) => {
          console.error('[CrearMedicamentoFotoComponent] Error en OCR:', error);
          this.isProcessingOcr = false;
          alert('Error al procesar la imagen. Por favor intenta de nuevo.');
        }
      });
    }
  }

  /**
   * Cancela la operación
   */
  onCancel(): void {
    this.clearPhoto();
    this.cancelled.emit();
  }
}
