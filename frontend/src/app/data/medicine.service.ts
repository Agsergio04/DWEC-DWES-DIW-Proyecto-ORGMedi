import { Injectable, inject } from '@angular/core';
import { Observable, of, throwError, timer, Subject } from 'rxjs';
import { HttpErrorResponse, HttpParams } from '@angular/common/http';
import { 
  catchError, 
  map, 
  tap, 
  retryWhen, 
  delay, 
  scan,
  timeout,
  switchMap
} from 'rxjs/operators';
import { ApiService } from '../core/services/data';
import {
  Medicine,
  CreateMedicineDto,
  UpdateMedicineDto,
  ApiListResponse,
  MedicineViewModel,
  MedicineGrouped,
  ApiError,
  PaginatedResponse,
  MedicinesGroupedByDateDTO
} from './models/medicine.model';

/**
 * Servicio de medicamentos
 * Gestiona operaciones CRUD de medicamentos delegando en ApiService
 */
@Injectable({ providedIn: 'root' })
export class MedicineService {
  private api = inject(ApiService);
  
  /**
   * Subject para notificar cambios en medicamentos
   * Se emite cuando se actualiza un medicamento (frecuencia, horaInicio, fechaInicio, fechaFin)
   * Los suscriptores pueden recargar el calendario u otras vistas
   */
  medicineUpdated$ = new Subject<{ id: string | number; changedFields: any }>();

  /**
   * Obtiene la lista completa de medicamentos
   * GET /medicamentos
   * Con fallback selectivo según tipo de error
   * @returns Observable<MedicineViewModel[]>
   */
  getAll(): Observable<MedicineViewModel[]> {
    return this.api.get<Medicine[]>('medicamentos').pipe(
      // Reintentar 2 veces con delay de 500ms en fallos 5xx
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
      // Transformar respuesta a ViewModel
      map(items => this.transformMedicinesToViewModel(items || [])),
      // ========== FALLBACK SELECTIVO ==========
      catchError((error, caught) => {
        console.error('❌ Error al cargar medicamentos:', error);

        // 1️⃣ SIN INTERNET → Usar datos mock/caché
        if (!navigator.onLine) {
          console.warn('📵 Sin conexión → Usando datos en caché');
          return of(this.getMockMedicines());
        }

        // 2️⃣ SERVIDOR NO DISPONIBLE (503) → Reintentar
        if (error.status === 503) {
          console.warn('🔄 Servidor no disponible → Reintentando en 3 segundos');
          return timer(3000).pipe(switchMap(() => caught));
        }

        // 3️⃣ TIMEOUT → Usar datos mock
        if (error.name === 'TimeoutError') {
          console.warn('⏱️ Timeout → Usando datos de demostración');
          return of(this.getMockMedicines());
        }

        // 4️⃣ NO AUTORIZADO (401) → Propagar error
        if (error.status === 401) {
          console.error('🔐 No autorizado');
          return throwError(() => error);
        }

        // 5️⃣ OTROS ERRORES → Devolver lista vacía para no romper UI
        console.error('⚠️ Error inesperado:', error.status);
        return of([]);
      })
    );
  }

  /**
   * Obtiene un medicamento específico por ID
   * GET /medicamentos/:id
   * @param id ID del medicamento
   * @returns Observable<MedicineViewModel>
   */
  getById(id: string): Observable<MedicineViewModel> {
    return this.api.get<Medicine>(`medicamentos/${id}`).pipe(
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
   * GET /medicamentos?status=active
   * @returns Observable<MedicineViewModel[]>
   */
  getActive(): Observable<MedicineViewModel[]> {
    return this.api.get<Medicine[]>('medicamentos?status=active').pipe(
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
      map(items => 
        this.transformMedicinesToViewModel(items || []).filter(m => m.isActive)
      ),
      // Manejo de errores - devolver lista vacía para no romper el flujo
      catchError(() => {
        console.warn('Error al cargar medicamentos activos, devolviendo lista vacía');
        return of([]);
      })
    );
  }

  /**
   * Obtiene medicamentos agrupados por hora para una fecha específica
   * GET /medicamentos/por-fecha?fecha=yyyy-MM-dd
   * 
   * @param fecha Fecha en formato yyyy-MM-dd (ejemplo: 2024-12-25)
   * @returns Observable<MedicinesGroupedByDateDTO>
   */
  getMedicinesByDate(fecha: string): Observable<MedicinesGroupedByDateDTO> {
    return this.api.get<MedicinesGroupedByDateDTO>(
      `medicamentos/por-fecha?fecha=${fecha}`
    ).pipe(
      timeout(10000),
      tap(result => console.log('[MedicineService] Medicamentos por fecha obtenidos:', result)),
      catchError(err => {
        console.error('[MedicineService] Error al obtener medicamentos por fecha:', err);
        return throwError(() => err);
      })
    );
  }

  /**
   * Crea un nuevo medicamento
   * POST /medicamentos
   * @param medicine Datos del medicamento a crear
   * @returns Observable<MedicineViewModel>
   */
  create(medicine: CreateMedicineDto): Observable<MedicineViewModel> {
    return this.api.post<Medicine>('medicamentos', medicine).pipe(
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
   * PUT /medicamentos/:id
   * @param id ID del medicamento
   * @param medicine Datos completos actualizados
   * @returns Observable<MedicineViewModel>
   */
  update(id: string | number, medicine: Omit<Medicine, 'id'>): Observable<MedicineViewModel> {
    return this.api.put<Medicine>(`medicamentos/${id}`, medicine).pipe(
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
   * PATCH /medicamentos/:id
   * @param id ID del medicamento
   * @param partial Datos parciales a actualizar
   * @returns Observable<MedicineViewModel>
   */
  patch(id: string, partial: Partial<UpdateMedicineDto>): Observable<MedicineViewModel> {
    return this.api.patch<Medicine>(`medicamentos/${id}`, partial).pipe(
      // Log del éxito
      tap(result => {
        console.log('Medicamento actualizado parcialmente:', result);
        
        // Si cambiaron campos que afectan al horario en el calendario, notificar
        const fieldsAffectingSchedule = ['frecuencia', 'horaInicio', 'fechaInicio', 'fechaFin'];
        const changedScheduleFields = Object.keys(partial).filter(key => 
          fieldsAffectingSchedule.includes(key)
        );
        
        if (changedScheduleFields.length > 0) {
          console.log(`[MedicineService] Notificando actualización de medicamento ${id} - campos: ${changedScheduleFields.join(', ')}`);
          this.medicineUpdated$.next({ 
            id, 
            changedFields: changedScheduleFields 
          });
        }
      }),
      // Transformar a ViewModel
      map(result => this.transformMedicineToViewModel(result)),
      // Manejo de errores
      catchError(err => this.handleError(err, `al actualizar medicamento ${id}`))
    );
  }

  /**
   * Elimina un medicamento
   * DELETE /medicamentos/:id
   * @param id ID del medicamento a eliminar
   * @returns Observable<void>
   */
  delete(id: string | number): Observable<void> {
    return this.api.delete<void>(`medicamentos/${id}`).pipe(
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
   * Obtiene una página de medicamentos con paginación
   * GET /medicines?page={page}&pageSize={pageSize}
   * 
   * @param page Número de página (base 1)
   * @param pageSize Tamaño de la página
   * @returns Observable<PaginatedResponse<MedicineViewModel>>
   * 
   * Ejemplo de uso:
   * ```typescript
   * this.medicineService.getPage(1, 10).subscribe(response => {
   *   console.log(response.items); // MedicineViewModel[]
   *   console.log(response.total); // Total de registros
   *   console.log(response.hasMore); // ¿Hay más páginas?
   * });
   * ```
   */
  getPage(page: number, pageSize: number): Observable<PaginatedResponse<MedicineViewModel>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    // SIMULACIÓN: En producción, la API devolvería datos paginados reales
    // Por ahora, simulamos paginación en el cliente obteniendo todos los datos
    return this.getAll().pipe(
      map(allMedicines => {
        // Calcular índices de paginación
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        
        // Obtener items de la página actual
        const items = allMedicines.slice(startIndex, endIndex);
        
        // Calcular metadatos de paginación
        const total = allMedicines.length;
        const totalPages = Math.ceil(total / pageSize);
        const hasMore = page < totalPages;

        return {
          items,
          total,
          page,
          pageSize,
          totalPages,
          hasMore
        };
      }),
      catchError(err => this.handleError(err, 'al cargar página de medicamentos'))
    );
  }

  /**
   * Busca medicamentos por término
   * Busca en nombre, dosis y descripción del medicamento
   * 
   * @param term Término de búsqueda
   * @param pageSize Límite de resultados (default: 20)
   * @returns Observable<MedicineViewModel[]>
   */
  search(term: string, pageSize: number = 20): Observable<MedicineViewModel[]> {
    if (!term || term.trim().length === 0) {
      return of([]);
    }

    return this.getAll().pipe(
      map(allMedicines => {
        const searchTerm = term.toLowerCase().trim();
        
        const results = allMedicines.filter(medicine =>
          medicine.nombre.toLowerCase().includes(searchTerm) ||
          medicine.cantidadMg.toString().includes(searchTerm) ||
          (medicine.displayName && medicine.displayName.toLowerCase().includes(searchTerm))
        );

        return results.slice(0, pageSize);
      }),
      timeout(5000),
      catchError(err => {
        console.error('Error en búsqueda:', err);
        return of([]);
      })
    );
  }

  /**
   * ============ MÉTODOS PRIVADOS ============
   */

  /**
   * Transforma un medicamento a ViewModel
   * Agrega campos calculados para la UI
   * Compatible con campos del backend: nombre, cantidadMg, fechaInicio, fechaFin, etc.
   */
  private transformMedicineToViewModel(medicine: Medicine): MedicineViewModel {
    // Soportar tanto fechaInicio como startDate
    const startDateStr = (typeof medicine.fechaInicio === 'string' ? medicine.fechaInicio : medicine.fechaInicio?.toString()) || '';
    const endDateStr = (typeof medicine.fechaFin === 'string' ? medicine.fechaFin : medicine.fechaFin?.toString()) || '';
    
    const startDate = new Date(startDateStr);
    const endDate = endDateStr ? new Date(endDateStr) : null;
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

    // Nombre para mostrar
    const nombre = medicine.nombre || 'Medicamento sin nombre';
    const cantidad = medicine.cantidadMg || 0;
    
    return {
      ...medicine,
      nombre: nombre,
      cantidadMg: cantidad,
      fechaInicio: startDateStr,
      fechaFin: endDateStr,
      formattedStartDate: this.formatDate(startDate),
      formattedEndDate: endDate ? this.formatDate(endDate) : undefined,
      isActive: !endDate || endDate > today,
      isExpired: endDate ? endDate <= today : false,
      daysUntilExpiration: daysUntilExpiration || undefined,
      expirationStatus,
      displayName: `${nombre} - ${cantidad}mg`
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

  /**
   * Medicamentos de demostración para fallback
   * Se usan cuando el servidor no está disponible
   */
  private getMockMedicines(): MedicineViewModel[] {
    return [
      {
        id: 1,
        nombre: 'Paracetamol',
        cantidadMg: 500,
        horaInicio: '08:00',
        fechaInicio: new Date(),
        fechaFin: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        color: '#3b82f6',
        frecuencia: 6,
        displayName: 'Paracetamol 500mg',
        isActive: true,
        isExpired: false,
        daysUntilExpiration: 180,
        expirationStatus: 'active'
      },
      {
        id: 2,
        nombre: 'Ibuprofeno',
        cantidadMg: 400,
        horaInicio: '08:00',
        fechaInicio: new Date(),
        fechaFin: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        color: '#ef4444',
        frecuencia: 8,
        displayName: 'Ibuprofeno 400mg',
        isActive: true,
        isExpired: false,
        daysUntilExpiration: 365,
        expirationStatus: 'active'
      },
      {
        id: 3,
        nombre: 'Amoxicilina',
        cantidadMg: 500,
        horaInicio: '08:00',
        fechaInicio: new Date(),
        fechaFin: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        color: '#f59e0b',
        frecuencia: 8,
        displayName: 'Amoxicilina 500mg',
        isActive: true,
        isExpired: false,
        daysUntilExpiration: 90,
        expirationStatus: 'expiring-soon'
      },
      {
        id: 4,
        nombre: 'Vitamina C',
        cantidadMg: 1000,
        horaInicio: '08:00',
        fechaInicio: new Date(),
        fechaFin: new Date(Date.now() + 540 * 24 * 60 * 60 * 1000),
        color: '#10b981',
        frecuencia: 24,
        displayName: 'Vitamina C 1000mg',
        isActive: true,
        isExpired: false,
        daysUntilExpiration: 540,
        expirationStatus: 'active'
      }
    ];
  }

  /**
   * Registra el consumo de un medicamento en una fecha y hora específica
   * POST /medicamentos/{id}/consumo?fecha=yyyy-MM-dd&hora=HH:mm&consumido=true
   * @param id ID del medicamento
   * @param fecha Fecha en formato yyyy-MM-dd
   * @param hora Hora en formato HH:mm
   * @param consumido Estado del consumo
   * @returns Observable de la respuesta del consumo registrado
   */
  registrarConsumo(id: number, fecha: string, hora: string, consumido: boolean): Observable<any> {
    // Construir parámetros de query explícitamente
    let params = new HttpParams();
    params = params.set('fecha', fecha);
    params = params.set('hora', hora);
    params = params.set('consumido', consumido.toString());
    
    const fullUrl = `medicamentos/${id}/consumo`;
    console.log(`[MedicineService] registrarConsumo - Enviando POST a ${fullUrl}?${params.toString()}`);
    
    return this.api.post<any>(
      fullUrl,
      null,
      { params: params }
    ).pipe(
      tap(response => {
        console.log(`[MedicineService] Consumo registrado para ${id} en ${fecha} ${hora}:`, response);
      }),
      catchError(error => {
        console.error(`[MedicineService] Error al registrar consumo:`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtiene los consumos registrados para una fecha específica
   * GET /medicamentos/consumos?fecha=yyyy-MM-dd
   * @param fecha Fecha en formato yyyy-MM-dd
   * @returns Observable con lista de consumos registrados
   */
  obtenerConsumosDelDia(fecha: string): Observable<any[]> {
    return this.api.getWithParams<any[]>(
      `medicamentos/consumos`,
      { fecha }
    ).pipe(
      tap(response => {
        console.log(`[MedicineService] Consumos obtenidos para ${fecha}:`, response);
      }),
      catchError(error => {
        console.error(`[MedicineService] Error al obtener consumos:`, error);
        return of([]);
      })
    );
  }

  /**
   * Obtiene el estado de consumo para una instancia específica
   * GET /medicamentos/{id}/consumo?fecha=yyyy-MM-dd&hora=HH:mm
   * @param id ID del medicamento
   * @param fecha Fecha en formato yyyy-MM-dd
   * @param hora Hora en formato HH:mm
   * @returns Observable con el estado del consumo
   */
  obtenerConsumo(id: number, fecha: string, hora: string): Observable<any> {
    return this.api.getWithParams<any>(
      `medicamentos/${id}/consumo`,
      { fecha, hora }
    ).pipe(
      tap(response => {
        console.log(`[MedicineService] Consumo obtenido para ${id} en ${fecha} ${hora}:`, response);
      }),
      catchError(error => {
        console.warn(`[MedicineService] No hay registro de consumo:`, error);
        return of(null);
      })
    );
  }
}
