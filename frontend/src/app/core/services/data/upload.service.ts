import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';

/**
 * Respuesta de subida de archivo
 */
export interface UploadResponse {
  id: string;
  filename: string;
  url: string;
  size: number;
  mimetype: string;
  uploadedAt: string;
}

/**
 * Progreso de subida
 */
export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

/**
 * Servicio de subida de archivos
 * Gestiona upload de imágenes, documentos y otros archivos usando FormData
 */
@Injectable({ providedIn: 'root' })
export class UploadService {
  private api = inject(ApiService);

  /**
   * Sube una imagen de medicamento
   * POST /medicines/:id/image
   * @param medicineId ID del medicamento
   * @param file Archivo de imagen
   * @returns Observable<UploadResponse>
   */
  uploadMedicineImage(medicineId: string, file: File): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('medicineId', medicineId);
    
    return this.api.postFormData<UploadResponse>(`medicines/${medicineId}/image`, formData).pipe(
      tap(response => console.log('Imagen de medicamento subida:', response)),
      catchError(err => {
        console.error('Error al subir imagen de medicamento:', err);
        throw err;
      })
    );
  }

  /**
   * Sube una foto de perfil de usuario
   * POST /users/:id/profile-image
   * @param userId ID del usuario
   * @param file Archivo de imagen
   * @returns Observable<UploadResponse>
   */
  uploadUserProfileImage(userId: string, file: File): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('profileImage', file);
    formData.append('userId', userId);
    
    return this.api.postFormData<UploadResponse>(`users/${userId}/profile-image`, formData).pipe(
      tap(response => console.log('Imagen de perfil subida:', response)),
      catchError(err => {
        console.error('Error al subir imagen de perfil:', err);
        throw err;
      })
    );
  }

  /**
   * Sube un documento genérico
   * POST /documents/upload
   * @param file Archivo documento
   * @param category Categoría del documento
   * @param metadata Metadata adicional
   * @returns Observable<UploadResponse>
   */
  uploadDocument(
    file: File, 
    category: 'prescription' | 'medical-report' | 'other',
    metadata?: Record<string, string>
  ): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('category', category);
    
    // Agregar metadata si existe
    if (metadata) {
      Object.entries(metadata).forEach(([key, value]) => {
        formData.append(`metadata[${key}]`, value);
      });
    }
    
    return this.api.postFormData<UploadResponse>('documents/upload', formData).pipe(
      tap(response => console.log('Documento subido:', response)),
      catchError(err => {
        console.error('Error al subir documento:', err);
        throw err;
      })
    );
  }

  /**
   * Sube múltiples archivos a la vez
   * POST /uploads/batch
   * @param files Array de archivos
   * @param category Categoría común
   * @returns Observable<UploadResponse[]>
   */
  uploadMultipleFiles(
    files: File[], 
    category: string
  ): Observable<UploadResponse[]> {
    const formData = new FormData();
    
    files.forEach((file, index) => {
      formData.append(`files[${index}]`, file);
    });
    formData.append('category', category);
    
    return this.api.postFormData<{ items: UploadResponse[] }>('uploads/batch', formData).pipe(
      map(response => response.items),
      tap(responses => console.log(`${responses.length} archivos subidos`)),
      catchError(err => {
        console.error('Error al subir archivos múltiples:', err);
        throw err;
      })
    );
  }

  /**
   * Valida un archivo antes de subirlo
   * Verifica tamaño, tipo MIME, etc.
   */
  validateFile(
    file: File, 
    options: {
      maxSize?: number;          // Tamaño máximo en bytes (default: 5MB)
      allowedTypes?: string[];   // Tipos MIME permitidos
      allowedExtensions?: string[]; // Extensiones permitidas
    } = {}
  ): { valid: boolean; error?: string } {
    const maxSize = options.maxSize || 5 * 1024 * 1024; // 5MB por defecto
    const allowedTypes = options.allowedTypes || ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const allowedExtensions = options.allowedExtensions || ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

    // Validar tamaño
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `El archivo es demasiado grande. Tamaño máximo: ${this.formatBytes(maxSize)}`
      };
    }

    // Validar tipo MIME
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `Tipo de archivo no permitido. Tipos permitidos: ${allowedTypes.join(', ')}`
      };
    }

    // Validar extensión
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      return {
        valid: false,
        error: `Extensión no permitida. Extensiones permitidas: ${allowedExtensions.join(', ')}`
      };
    }

    return { valid: true };
  }

  /**
   * Formatea bytes a tamaño legible
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Crea una preview de imagen antes de subirla
   * Devuelve una URL temporal del archivo
   */
  createImagePreview(file: File): Observable<string> {
    return new Observable(observer => {
      const reader = new FileReader();
      
      reader.onload = (e: ProgressEvent<FileReader>) => {
        observer.next(e.target?.result as string);
        observer.complete();
      };
      
      reader.onerror = (error) => {
        observer.error(error);
      };
      
      reader.readAsDataURL(file);
    });
  }
}
