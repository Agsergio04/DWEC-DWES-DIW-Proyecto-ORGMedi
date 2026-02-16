import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * INTERFAZ: OcrMedicineData
 * 
 * Define la estructura de datos que extrae el OCR de una imagen de medicamento.
 * Contiene todos los campos que pueden ser detectados:
 * - nombre: Nombre del medicamento
 * - dosage: Dosis (ej: 500mg)
 * - frecuencia: Cada cuánto tomar (ej: cada 8 horas)
 * - horaInicio: Hora de inicio del tratamiento
 * - cantidad: Cantidad de píldoras/dosis
 * - descripcion: Descripción adicional
 * - fechaInicio: Fecha de inicio del tratamiento
 * - fechaFin: Fecha final del tratamiento
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
 * SERVICIO: OcrDataService
 * 
 * ¿QUÉ HACE?
 * Almacena temporalmente los datos extraídos por OCR (Optical Character Recognition).
 * Permite compartir datos entre componentes sin perder el estado.
 * 
 * ¿POR QUÉ ES NECESARIO?
 * Cuando extraes datos de una imagen con OCR (nombre, dosis, fechas, etc),
 * necesitas guardarlos temporalmente para editarlos o visualizarlos en otro componente.
 * Este servicio actúa como intermediario.
 * 
 * FLUJO TÍPICO:
 * 1. Usuario toma foto de medicamento
 * 2. OCR extrae datos (nombre, dosis, etc)
 * 3. setOcrData() guarda datos en el servicio
 * 4. Componente de edición obtiene datos con getOcrData()
 * 5. Usuario edita y guarda
 * 6. clearOcrData() limpia para próximo uso
 */
@Injectable({
  providedIn: 'root'
})
export class OcrDataService {
  
  // BehaviorSubject guarda datos y notifica a componentes que se suscriben
  // Empieza con null (sin datos)
  private ocrDataSubject = new BehaviorSubject<OcrMedicineData | null>(null);
  
  // Observable público que componentes pueden escuchar
  // Se actualiza cada vez que hay cambios en los datos
  public ocrData$ = this.ocrDataSubject.asObservable();

  constructor() {}

  /**
   * Establece los datos extraídos del OCR
   * Parámetro: data - Objeto con datos OCR
   * Notifica a todos los componentes suscritos que hay datos nuevos
   */
  setOcrData(data: OcrMedicineData): void {
    // Emite el nuevo valor a todos los suscriptores
    this.ocrDataSubject.next(data);
  }

  /**
   * Obtiene los datos actuales del OCR
   * Retorna: Los datos almacenados o null si no hay
   */
  getOcrData(): OcrMedicineData | null {
    return this.ocrDataSubject.value;
  }

  /**
   * Limpia todos los datos del OCR
   * Establece los datos a null (vacía el almacenamiento)
   * Útil después de guardar los datos en base de datos
   */
  clearOcrData(): void {
    // Emite null para indicar que no hay datos
    this.ocrDataSubject.next(null);
  }
}
