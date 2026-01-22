import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Interfaz para los datos extraídos por OCR
 */
export interface OcrMedicineData {
  nombre?: string;
  dosage?: string;
  frecuencia?: string;
  horaInicio?: string;
  cantidad?: number;
  descripcion?: string;
  fechaInicio?: string;
  fechaFin?: string;
}

/**
 * Servicio para almacenar datos temporales del OCR
 * Permite pasar datos entre componentes sin perder el estado
 */
@Injectable({
  providedIn: 'root'
})
export class OcrDataService {
  private ocrDataSubject = new BehaviorSubject<OcrMedicineData | null>(null);
  public ocrData$ = this.ocrDataSubject.asObservable();

  constructor() {}

  /**
   * Establece los datos extraídos del OCR
   */
  setOcrData(data: OcrMedicineData): void {
    console.log('[OcrDataService] Datos OCR establecidos:', data);
    this.ocrDataSubject.next(data);
  }

  /**
   * Obtiene los datos actuales del OCR
   */
  getOcrData(): OcrMedicineData | null {
    return this.ocrDataSubject.value;
  }

  /**
   * Limpia los datos del OCR
   */
  clearOcrData(): void {
    console.log('[OcrDataService] Datos OCR limpiados');
    this.ocrDataSubject.next(null);
  }
}
