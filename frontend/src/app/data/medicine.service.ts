import { Injectable, inject } from '@angular/core';
import { Observable, throwError, of } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { 
  catchError, 
  map, 
  retry, 
  tap, 
  retryWhen, 
  delay, 
  scan,
  timeout
} from 'rxjs/operators';
import {
  Medicine,
  CreateMedicineDto,
  UpdateMedicineDto,
  ApiListResponse,
  ApiResponse,
  MedicineViewModel,
  MedicineGrouped,
  ApiError
} from './models/medicine.model';

@Injectable({ providedIn: 'root' })
export class MedicineService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/medicines';

  /**
   * Obtiene la lista completa de medicamentos
   * GET /api/medicines
   * Con retry automático y transformación a ViewModel
   * @returns Observable<MedicineViewModel[]>
   */
  getAll(): Observable<MedicineViewModel[]> {
    return this.http.get<ApiListResponse<Medicine>>(this.apiUrl).pipe(
      // Reintentar 2 veces con delay de 500ms en fallos 5xx
      retryWhen(errors =>
        errors.pipe(
          scan((acc, error: any) => {
            if (acc >= 2 || (error.status && error.status < 500)) {
              throw error; // No reintentar si no es 5xx o ya reintentó 2 veces
            }
            return acc + 1;
          }, 0),
          delay(500)
        )
      ),
      // Transformar respuesta a ViewModel
      map(response => this.transformMedicinesToViewModel(response.items)),
      // Manejo de errores
      catchError(err => this.handleError(err, 'al cargar medicamentos'))
    );
  }

  /**
   * Obtiene un medicamento específico por ID
   * GET /api/medicines/:id
   * @param id ID del medicamento
   * @returns Observable<MedicineViewModel>
   */
  getById(id: string): Observable<MedicineViewModel> {
    return this.http.get<Medicine>(`${this.apiUrl}/${id}`).pipe(
      // Timeout de 10 segundos
      timeout(10000),
      // Transformar a ViewModel
      map(medicine => this.transformMedicineToViewModel(medicine)),
      // Manejo de errores
      catchError(err => this.handleError(err, `al cargar medicamento ${id}`))
    );
  }

  /**
   * Obtiene medicamentos activos (no vencidos)
   * GET /api/medicines?status=active
   * @returns Observable<MedicineViewModel[]>
   */
  getActive(): Observable<MedicineViewModel[]> {
    return this.http.get<ApiListResponse<Medicine>>(`${this.apiUrl}?status=active`).pipe(
      // Reintentar 2 veces
      retryWhen(errors =>
        errors.pipe(
          scan((acc, error: any) => {
            if (acc >= 2 || (error.status && error.status < 500)) {
              throw error;
            }
            return acc + 1;
          }, 0),
          delay(500)
        )
      ),
      // Transformar y filtrar
      map(response => 
        this.transformMedicinesToViewModel(response.items).filter(m => m.isActive)
      ),
      // Manejo de errores - devolver lista vacía para no romper el flujo
      catchError(() => {
        console.warn('Error al cargar medicamentos activos, devolviendo lista vacía');
        return of([]);
      })
    );
  }

  /**
   * Crea un nuevo medicamento
   * POST /api/medicines
   * @param medicine Datos del medicamento a crear
   * @returns Observable<MedicineViewModel>
   */
  create(medicine: CreateMedicineDto): Observable<MedicineViewModel> {
    return this.http.post<Medicine>(this.apiUrl, medicine).pipe(
      // Log del éxito
      tap(result => console.log('Medicamento creado:', result)),
      // Transformar a ViewModel
      map(result => this.transformMedicineToViewModel(result)),
      // Manejo de errores
      catchError(err => this.handleError(err, 'al crear medicamento'))
    );
  }

  /**
   * Actualiza un medicamento completamente (PUT)
   * PUT /api/medicines/:id
   * @param id ID del medicamento
   * @param medicine Datos completos actualizados
   * @returns Observable<MedicineViewModel>
   */
  update(id: string, medicine: Omit<Medicine, 'id'>): Observable<MedicineViewModel> {
    return this.http.put<Medicine>(`${this.apiUrl}/${id}`, medicine).pipe(
      // Log del éxito
      tap(result => console.log('Medicamento actualizado:', result)),
      // Transformar a ViewModel
      map(result => this.transformMedicineToViewModel(result)),
      // Manejo de errores
      catchError(err => this.handleError(err, `al actualizar medicamento ${id}`))
    );
  }

  /**
   * Actualiza parcialmente un medicamento (PATCH)
   * PATCH /api/medicines/:id
   * @param id ID del medicamento
   * @param partial Campos a actualizar
   * @returns Observable<MedicineViewModel>
   */
  patch(id: string, partial: Partial<UpdateMedicineDto>): Observable<MedicineViewModel> {
    return this.http.patch<Medicine>(`${this.apiUrl}/${id}`, partial).pipe(
      // Log del éxito
      tap(result => console.log('Medicamento actualizado (parcial):', result)),
      // Transformar a ViewModel
      map(result => this.transformMedicineToViewModel(result)),
      // Manejo de errores
      catchError(err => this.handleError(err, `al actualizar medicamento ${id}`))
    );
  }

  /**
   * Elimina un medicamento
   * DELETE /api/medicines/:id
   * @param id ID del medicamento a eliminar
   * @returns Observable<void>
   */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      // Log del éxito
      tap(() => console.log(`Medicamento ${id} eliminado`)),
      // Manejo de errores
      catchError(err => this.handleError(err, `al eliminar medicamento ${id}`))
    );
  }

  /**
   * Obtiene medicamentos agrupados por categoría
   * Combina datos transformados en un solo Observable
   * @returns Observable<MedicineGrouped[]>
   */
  getGroupedMedicines(): Observable<MedicineGrouped[]> {
    return this.getAll().pipe(
      map(medicines => this.groupMedicinesByStatus(medicines))
    );
  }

  /**
   * ============ MÉTODOS PRIVADOS ============
   */

  /**
   * Transforma un medicamento a ViewModel
   * Agrega campos calculados para la UI
   */
  private transformMedicineToViewModel(medicine: Medicine): MedicineViewModel {
    const startDate = new Date(medicine.startDate);
    const endDate = medicine.endDate ? new Date(medicine.endDate) : null;
    const today = new Date();

    // Calcular días hasta vencimiento
    const daysUntilExpiration = endDate
      ? Math.floor((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    // Determinar estado
    let expirationStatus: 'active' | 'expiring-soon' | 'expired';
    if (!endDate || endDate > today) {
      expirationStatus = daysUntilExpiration && daysUntilExpiration <= 7 ? 'expiring-soon' : 'active';
    } else {
      expirationStatus = 'expired';
    }

    return {
      ...medicine,
      formattedStartDate: this.formatDate(startDate),
      formattedEndDate: endDate ? this.formatDate(endDate) : undefined,
      isActive: !endDate || endDate > today,
      isExpired: endDate ? endDate <= today : false,
      daysUntilExpiration: daysUntilExpiration || undefined,
      expirationStatus,
      displayName: `${medicine.name} - ${medicine.dosage}`
    };
  }

  /**
   * Transforma un array de medicamentos a ViewModel
   */
  private transformMedicinesToViewModel(medicines: Medicine[]): MedicineViewModel[] {
    return medicines.map(m => this.transformMedicineToViewModel(m));
  }

  /**
   * Agrupa medicamentos por estado de expiración
   */
  private groupMedicinesByStatus(medicines: MedicineViewModel[]): MedicineGrouped[] {
    const groups: Record<string, MedicineViewModel[]> = {
      'active': [],
      'expiring-soon': [],
      'expired': []
    };

    medicines.forEach(medicine => {
      groups[medicine.expirationStatus].push(medicine);
    });

    return [
      { category: 'active' as const, medicines: groups['active'], count: groups['active'].length },
      { category: 'expiring-soon' as const, medicines: groups['expiring-soon'], count: groups['expiring-soon'].length },
      { category: 'expired' as const, medicines: groups['expired'], count: groups['expired'].length }
    ].filter(group => group.count > 0) as MedicineGrouped[];
  }

  /**
   * Formatea una fecha a string legible
   */
  private formatDate(date: Date): string {
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Manejo centralizado de errores HTTP
   * @param error Objeto de error HTTP
   * @param context Contexto de la operación (para mensaje de error)
   */
  private handleError(error: any, context: string): Observable<never> {
    let apiError: ApiError = {
      code: 'UNKNOWN_ERROR',
      message: `Error desconocido ${context}`,
      timestamp: new Date().toISOString()
    };

    if (error instanceof HttpErrorResponse) {
      const status = error.status;

      // Extraer información de error de la respuesta
      if (error.error && typeof error.error === 'object') {
        apiError = {
          code: error.error.code || `HTTP_${status}`,
          message: error.error.message || this.getErrorMessage(status, context),
          details: error.error.details,
          timestamp: error.error.timestamp || new Date().toISOString()
        };
      } else {
        apiError.code = `HTTP_${status}`;
        apiError.message = this.getErrorMessage(status, context);
      }

      // Log del error
      console.error(`[API Error ${apiError.code}] ${apiError.message}`, {
        status,
        error: error.error,
        context
      });
    } else if (error.name === 'TimeoutError') {
      apiError = {
        code: 'TIMEOUT_ERROR',
        message: `La petición tardó demasiado ${context}`,
        timestamp: new Date().toISOString()
      };
      console.error('[Timeout Error]', context);
    } else {
      console.error('[Unknown Error]', error);
    }

    return throwError(() => apiError);
  }

  /**
   * Obtiene mensaje de error según el código HTTP
   */
  private getErrorMessage(status: number, context: string): string {
    const messages: Record<number, string> = {
      400: `Solicitud inválida ${context}`,
      401: `No autorizado. Inicia sesión nuevamente`,
      403: `No tienes permiso para acceder a este recurso`,
      404: `Recurso no encontrado ${context}`,
      409: `Conflicto en el servidor`,
      500: `Error interno del servidor`,
      502: `Servidor no disponible (Bad Gateway)`,
      503: `Servicio no disponible`,
      504: `Tiempo de espera agotado`
    };

    return messages[status] || `Error ${status} ${context}`;
  }
}
