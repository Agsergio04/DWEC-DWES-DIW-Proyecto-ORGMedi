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
 * SERVICIO DE MEDICAMENTOS
 * 
 * QUE HACE:
 * Gestiona todas las operaciones con medicamentos en la aplicacion.
 * Realiza llamadas a la API para obtener, crear, actualizar y eliminar medicamentos.
 * Transforma datos de la API a formato ViewModel para usar en templates.
 * Maneja errores inteligentemente con fallbacks y reintentos.
 * Proporciona busqueda, paginacion y agrupacion de medicamentos.
 * Registra consumos de medicamentos (tomas diarias).
 * 
 * ESTRUCTURA:
 * - Metodos publicos: Para usar desde componentes
 * - Metodos privados: Utilidades internas (transformacion, formatting, etc)
 * 
 * CARACTERISTICAS:
 * 1. REINTENTOS AUTOMATICOS: Si falla peticion 5xx, reintenta 2 veces
 * 2. FALLBACK INTELIGENTE: Si sin internet o timeout, devuelve datos mock
 * 3. TRANSFORMACION DE DATOS: Convierte Medicine a MedicineViewModel
 * 4. NOTIFICACIONES: Emite cambios via medicineUpdated$ Subject
 * 5. MANEJO DE ERRORES: Centralizado con mensajes personalizados
 * 6. PAGINACION: Simula paginacion en cliente obteniendo todos los datos
 * 
 * COMO USAR:
 * ```
 * export class MiComponente {
 *   medicineService = inject(MedicineService);
 *   
 *   ngOnInit() {
 *     // Obtener todos
 *     this.medicineService.getAll().subscribe(medicines => {
 *       console.log(medicines);
 *     });
 *     
 *     // Buscar
 *     this.medicineService.search('paracetamol').subscribe(results => {
 *       this.results = results;
 *     });
 *     
 *     // Escuchar cambios
 *     this.medicineService.medicineUpdated$.subscribe(change => {
 *       console.log('Medicamento actualizado:', change.id);
 *     });
 *   }
 * }
 * ```
 */
@Injectable({ providedIn: 'root' })
export class MedicineService {
  // Inyectar ApiService para hacer peticiones HTTP
  private api = inject(ApiService);
  
  /**
   * medicineUpdated$ - Subject para notificar cambios de medicamentos
   * 
   * QUE EMITE:
   * Cuando se actualiza un medicamento (PATCH) con campos que afecten el calendario.
   * Solo se emite si cambaron: frecuencia, horaInicio, fechaInicio, o fechaFin.
   * 
   * EMISOR: El metodo patch() lo emite
   * RECEPTORES: Componentes que necesitan recargar calendario u horarios
   * 
   * ESTRUCTURA: { id: medicineId, changedFields: ['frecuencia', 'horaInicio'] }
   */
  medicineUpdated$ = new Subject<{ id: string | number; changedFields: any }>();

  /**
   * getAll() - Obtiene todos los medicamentos
   * 
   * QUE HACE:
   * - Peticion GET a API en ruta /medicamentos
   * - Reintenta 2 veces si error 5xx
   * - Transforma datos a MedicineViewModel (formato UI)
   * - Fallback inteligente si falla: sin internet -> mock, timeout -> mock, etc
   * 
   * REINTENTOS:
   * - Si error 5xx (500, 502, 503, etc): 2 reintentos con delay 500ms
   * - Si error 4xx (400, 401, etc): no reintenta, propaga error
   * 
   * FALLBACKS:
   * 1. Sin internet (offline): devuelve datos mock
   * 2. Servidor no disponible (503): espera 3s y reintenta TODO
   * 3. Timeout: devuelve datos mock
   * 4. No autorizado (401): no devuelve nada, propaga error
   * 5. Otros errores: devuelve array vacio para no romper UI
   * 
   * RETORNA: Observable con array de medicamentos transformados
   */
  getAll(): Observable<MedicineViewModel[]> {
    return this.api.get<Medicine[]>('medicamentos').pipe(
      // REINTENTOS: Automáticos para errores de servidor (5xx)
      // No reintenta errores de cliente (4xx)
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
      // TRANSFORMACION: Convierte Medicine a MedicineViewModel
      // Agrega campos calculados como isActive, daysUntilExpiration, etc
      map(items => this.transformMedicinesToViewModel(items || [])),
      // FALLBACK INTELIGENTE: Segun tipo de error decide qué devolver
      catchError((error, caught) => {
        console.error('Error al cargar medicamentos:', error);

        // FALLBACK 1: Sin internet -> devolver datos mock para que funcione offline
        if (!navigator.onLine) {
          console.warn('Sin conexion -> Usando datos en cache');
          return of(this.getMockMedicines());
        }

        // FALLBACK 2: Servidor no disponible (503) -> espera 3 segundos y reintenta TODO
        if (error.status === 503) {
          console.warn('Servidor no disponible -> Reintentando en 3 segundos');
          return timer(3000).pipe(switchMap(() => caught));
        }

        // FALLBACK 3: Timeout (peticion muy lenta) -> devolver mock
        if (error.name === 'TimeoutError') {
          console.warn('Timeout -> Usando datos de demostracion');
          return of(this.getMockMedicines());
        }

        // FALLBACK 4: No autorizado (401) -> no devolver nada, propagar error
        // El componente debe manejar este error (ej: redirigir a login)
        if (error.status === 401) {
          console.error('No autorizado');
          return throwError(() => error);
        }

        // FALLBACK 5: Otros errores 4xx, 5xx -> devolver array vacio
        // Mejor vacio que quebrar UI con excepcion
        console.error(' Error inesperado:', error.status);
        return of([]);
      })
    );
  }

  /**
   * getById(id) - Obtiene un medicamento especifico por ID
   * 
   * QUE HACE:
   * - Peticion GET a /medicamentos/:id
   * - Timeout de 10 segundos (si tarda mas, falla)
   * - Transforma resultado a MedicineViewModel
   * - Manejo de errores centralizado
   * 
   * PARAMETROS: id - el ID del medicamento (string o numero)
   * RETORNA: Observable con el medicamento transformado
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
   * getActive() - Obtiene medicamentos activos (no vencidos)
   * 
   * QUE HACE:
   * - Peticion GET a /medicamentos?status=active
   * - Reintenta 2 veces si error 5xx
   * - Transforma resultados
   * - Filtra solo los que no han vencido (isActive = true)
   * - Si error, devuelve array vacio (no rompe el flujo)
   * 
   * RETORNA: Observable con lista de medicamentos activos
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
   * getMedicinesByDate(fecha) - Obtiene medicamentos agrupados por hora en una fecha
   * 
   * QUE HACE:
   * - Peticion GET a /medicamentos/por-fecha?fecha=yyyy-MM-dd
   * - Retorna medicamentos organizados por horarios para ese dia
   * - Timeout de 10 segundos
   * - Perfecto para el calendario/horario del dia
   * 
   * PARAMETROS: fecha - formato yyyy-MM-dd (ej: 2024-12-25)
   * RETORNA: Observable con objeto MedicinesGroupedByDateDTO
   *          que contiene horarios con medicamentos para ese dia
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
   * create(medicine) - Crea un nuovo medicamento
   * 
   * QUE HACE:
   * - Peticion POST a /medicamentos con los datos
   * - Transforma respuesta a MedicineViewModel
   * - Log de exito
   * - Manejo de errores
   * 
   * PARAMETROS: medicine - CreateMedicineDto (datos para crear)
   * RETORNA: Observable con el medicamento creado transformado
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
   * update(id, medicine) - Actualiza un medicamento completamente (PUT)
   * 
   * QUE HACE:
   * - Peticion PUT a /medicamentos/:id
   * - PUT = reemplaza TODO el registro (no parcialmente)
   * - Si necesitas actualizar solo algunos campos, usa patch() en su lugar
   * - Transforma respuesta a MedicineViewModel
   * - Log y manejo de errores
   * 
   * PARAMETROS:
   * - id: ID del medicamento a actualizar
   * - medicine: Datos completos (todos los campos)
   * RETORNA: Observable con medicamento actualizado
   * 
   * DIFERENCIA PUT vs PATCH:
   * - PUT: Reemplaza TODO. Envias todos los campos.
   * - PATCH: Actualiza parcialmente. Solo envias campos que cambian.
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
   * patch(id, partial) - Actualiza parcialmente un medicamento (PATCH)
   * 
   * QUE HACE:
   * - Peticion PATCH a /medicamentos/:id
   * - PATCH = actualiza SOLO los campos que envias
   * - Por ejemplo, si envias {nombre: 'nuevo'}, solo cambia nombre
   * - Transforma respuesta a MedicineViewModel
   * - EMITE NOTIFICACION si cambian campos que afectan horarios
   * - Log y manejo de errores
   * 
   * CAMPOS QUE DISPARAN NOTIFICACION (medicineUpdated$):
   * - frecuencia: cada cuantas horas tomar
   * - horaInicio: a que hora comienza el tratamiento
   * - fechaInicio: cuando comienza
   * - fechaFin: cuando termina
   * Si cambias otros campos {nombre, cantidadMg, etc}, no emite notificacion.
   * 
   * USO COMUN:
   * - Cambiar solo frecuencia: patch(id, {frecuencia: 8})
   * - Cambiar solo nombre: patch(id, {nombre: 'Nuevo nombre'})
   * 
   * PARAMETROS:
   * - id: ID del medicamento
   * - partial: Objeto con solo los campos a cambiar
   * RETORNA: Observable con medicamento actualizado
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
   * delete(id) - Elimina un medicamento
   * 
   * QUE HACE:
   * - Peticion DELETE a /medicamentos/:id
   * - Log de exito
   * - Manejo de errores
   * - No devuelve datos, solo confirmacion
   * 
   * PARAMETROS: id - el ID del medicamento a eliminar
   * RETORNA: Observable<void> (sin datos de retorno)
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
   * getGroupedMedicines() - Obtiene medicamentos agrupados por estado de expiracion
   * 
   * QUE HACE:
   * - Obtiene TODOS los medicamentos (llamando getAll())
   * - Los agrupa por estado: activos | proximos a vencer | vencidos
   * - Devuelve array de grupos solo con grupos que tienen medicamentos
   * - Perfecto para mostrar listas separadas en UI
   * 
   * ESTRUCTURA DE RETORNO:
   * [
   *   { category: 'active', medicines: [...], count: 5 },
   *   { category: 'expiring-soon', medicines: [...], count: 2 },
   *   { category: 'expired', medicines: [...], count: 1 }
   * ]
   * (solo incluye grupos con count > 0)
   * 
   * RETORNA: Observable con array de grupos de medicamentos
   */
  getGroupedMedicines(): Observable<MedicineGrouped[]> {
    return this.getAll().pipe(
      map(medicines => this.groupMedicinesByStatus(medicines))
    );
  }

  /**
   * getPage(page, pageSize) - Obtiene una pagina de medicamentos
   * 
   * QUE HACE:
   * - Obtiene TODOS los medicamentos de la API
   * - Los divide en paginas en el cliente (no en el servidor)
   * - Devuelve una pagina especifica con metadatos
   * - Perfecto para listas con scroll o paginador
   * 
   * NOTA IMPORTANTE:
   * SIMULACION EN CLIENTE - La API no soporta paginacion todavia.
   * Se obtienen todos y se dividen en el navegador.
   * Si hay 1000+ medicamentos, considera implementar paginacion real en API.
   * 
   * EJEMPLO DE USO:
   * this.medicineService.getPage(1, 10).subscribe(response => {
   *   console.log(response.items);       // Array de 10 medicamentos
   *   console.log(response.total);       // Total de medicamentos
   *   console.log(response.hasMore);     // true si hay mas paginas
   *   console.log(response.totalPages);  // Numero total de paginas
   * });
   * 
   * PARAMETROS:
   * - page: Numero de pagina (base 1, no base 0. Primera pagina es 1)
   * - pageSize: Cuantos items por pagina
   * 
   * RETORNA: Observable<PaginatedResponse<MedicineViewModel>>
   *   - items: Array de medicamentos de esa pagina
   *   - total: Total de medicamentos en toda la aplicacion
   *   - page: El numero de pagina solicitada
   *   - pageSize: Tamano de pagina
   *   - totalPages: Numero total de paginas
   *   - hasMore: Boolean, true si hay mas paginas despues de esta
   */
  getPage(page: number, pageSize: number): Observable<PaginatedResponse<MedicineViewModel>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    // SIMULACION: En producccion, la API devolveria datos paginados reales
    // Por ahora se obtienen TODOS los medicamentos y se dividen en cliente
    return this.getAll().pipe(
      map(allMedicines => {
        // Calcular indices para seccionar la lista
        const startIndex = (page - 1) * pageSize;  // Donde empieza (ej: pagina 2, size 10 -> indice 10)
        const endIndex = startIndex + pageSize;     // Donde termina (ej: indice 10 + 10 = 20)
        
        // Seccionar: tomar solo medicamentos de esa pagina
        const items = allMedicines.slice(startIndex, endIndex);
        
        // Calcular metadatos necesarios
        const total = allMedicines.length;                  // Total de medicamentos
        const totalPages = Math.ceil(total / pageSize);      // Cuantas paginas hay
        const hasMore = page < totalPages;                   // Hay paginas despues

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
   * search(term, pageSize) - Busca medicamentos por termino
   * 
   * QUE HACE:
   * - Busca en nombre, dosis (cantidadMg) y displayName del medicamento
   * - Case-insensitive (ignora mayusculas/minusculas)
   * - Si termino vacio, devuelve array vacio
   * - Si error en busqueda, devuelve array vacio (no rompe)
   * - Timeout de 5 segundos
   * - Limita resultados a pageSize (default 20 items)
   * 
   * BUSQUEDA EN:
   * - nombre: 'Paracetamol', 'Aspirin', etc
   * - cantidadMg: '500', '1000' (buscar por dosis)
   * - displayName: 'Paracetamol - 500mg' (busqueda combinada)
   * 
   * EJEMPLO:
   * // Buscar 'paracetamol'
   * this.medicineService.search('paracetamol').subscribe(results => {
   *   console.log(results);  // Array de medicamentos con 'paracetamol'
   * });
   * 
   * // Buscar y limitar a 50 resultados
   * this.medicineService.search('500', 50).subscribe(results => {
   *   console.log(results);  // Medicamentos con '500' en su informacion
   * });
   * 
   * PARAMETROS:
   * - term: String a buscar (se trimea y minuscula)
   * - pageSize: Maximo de resultados a devolver (default 20)
   * 
   * RETORNA: Observable<MedicineViewModel[]> - Lista de resultados
   */
  search(term: string, pageSize: number = 20): Observable<MedicineViewModel[]> {
    if (!term || term.trim().length === 0) {
      return of([]);  // Si termino vacio, devolver array vacio
    }

    return this.getAll().pipe(
      // Buscar localmente en los medicamentos obtenidos
      map(allMedicines => {
        const searchTerm = term.toLowerCase().trim();
        
        // Filtrar medicamentos que coincidan con el termino
        const results = allMedicines.filter(medicine =>
          medicine.nombre.toLowerCase().includes(searchTerm) ||
          medicine.cantidadMg.toString().includes(searchTerm) ||
          (medicine.displayName && medicine.displayName.toLowerCase().includes(searchTerm))
        );

        // Limitar a pageSize resultados (evita devolver miles de resultados)
        return results.slice(0, pageSize);
      }),
      timeout(5000),  // Si tarda mas de 5s, devuelve error
      catchError(err => {
        console.error('Error en busqueda:', err);
        return of([]);  // Si error, devolver array vacio
      })
    );
  }

  /**
   * ============ METODOS PRIVADOS (UTILIDADES INTERNAS) ============
   * Los componentes NO deben llamarlos. Se usan internamente para:
   * - Transformar datos de API a formato ViewModel para templates
   * - Utilidades: formatting, agrupacion, manejo de errores
   * - Datos mock para fallback
   */

  /**
   * transformMedicineToViewModel(medicine) - Transforma UN medicamento
   * 
   * QUE HACE:
   * - Recibe Medicine (objeto de API)
   * - Agrega campos calculados para la UI (isActive, daysUntilExpiration, etc)
   * - Calcula edad del medicamento y formatea fechas
   * - Determina estado de expiracion: active | expiring-soon | expired
   * - Crea displayName para mostrar en listas (ej: 'Paracetamol - 500mg')
   * - RETORNA MedicineViewModel (listo para UI)
   * 
   * CAMPOS AGREGADOS:
   * - formattedStartDate: Fecha inicio en texto legible
   * - formattedEndDate: Fecha fin en texto legible
   * - isActive: Boolean, true si no ha vencido
   * - isExpired: Boolean, true si ya paso la fecha fin
   * - daysUntilExpiration: Numero de dias hasta vencimiento
   * - expirationStatus: 'active' | 'expiring-soon' (<=7 dias) | 'expired'
   * - displayName: Texto para mostrar (nombre + dosis)
   * 
   * NOTA: Los campos del medicamento original (nombre, cantidadMg, etc)
   * Se mantienen pero se validan para evitar undefined.
   */
  private transformMedicineToViewModel(medicine: Medicine): MedicineViewModel {
    // Soportar tanto fechaInicio como startDate
    const startDateStr = (typeof medicine.fechaInicio === 'string' ? medicine.fechaInicio : medicine.fechaInicio?.toString()) || '';
    const endDateStr = (typeof medicine.fechaFin === 'string' ? medicine.fechaFin : medicine.fechaFin?.toString()) || '';
    
    // Crear objetos Date para calculos
    const startDate = new Date(startDateStr);
    const endDate = endDateStr ? new Date(endDateStr) : null;
    const today = new Date();

    // CALCULO: Dias hasta vencimiento
    // Si hay fecha fin, resta fecha fin - hoy, si no hay, null
    const daysUntilExpiration = endDate
      ? Math.floor((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    // CALCULO: Estado de expiracion
    // activo = no tiene fecha fin O fecha fin es futura
    // expiring-soon = faltan 7 dias o menos
    // expired = ya paso la fecha fin
    let expirationStatus: 'active' | 'expiring-soon' | 'expired';
    if (!endDate || endDate > today) {
      expirationStatus = daysUntilExpiration && daysUntilExpiration <= 7 ? 'expiring-soon' : 'active';
    } else {
      expirationStatus = 'expired';
    }

    // NOMBRES: Validar que no sean undefined
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
   * transformMedicinesToViewModel(medicines) - Transforma VARIOS medicamentos
   * 
   * QUE HACE:
   * - Recibe array de Medicine (objetos de API)
   * - Llama transformMedicineToViewModel() para cada uno
   * - RETORNA array de MedicineViewModel
   * 
   * Es basicamente un map (mapeo) del metodo singular.
   */
  private transformMedicinesToViewModel(medicines: Medicine[]): MedicineViewModel[] {
    return medicines.map(m => this.transformMedicineToViewModel(m));
  }

  /**
   * groupMedicinesByStatus(medicines) - Agrupa medicamentos por estado
   * 
   * QUE HACE:
   * - Recibe lista de medicamentos transformados
   * - Los divide en 3 grupos: activos | proximos a vencer | vencidos
   * - Devuelve array de grupos solo con grupos que tienen medicamentos
   * - Perfecto para mostrar en UI separado por estado
   * 
   * ESTRUCTURA DE SALIDA:
   * [
   *   { category: 'active', medicines: [...], count: 5 },
   *   { category: 'expiring-soon', medicines: [...], count: 2 }
   * ]
   * (nota: solo incluye grupos con count > 0, los vacios se filtran)
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
   * formatDate(date) - Formatea una fecha a string legible
   * 
   * QUE HACE:
   * - Recibe un objeto Date
   * - Convierte a string en formato largo localizado en espanol
   * - RESULTADO: '25 de diciembre de 2024'
   * - Se usa internamente para mostrar fechas en templates
   */
  private formatDate(date: Date): string {
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * handleError(error, context) - Manejo centralizado de errores HTTP
   * 
   * QUE HACE:
   * - Recibe un error (HttpErrorResponse u otro tipo)
   * - Extrae informacion del error y la estructura
   * - Crea objeto ApiError con codigo, mensaje, detalles, timestamp
   * - Log del error en consola
   * - RETORNA observable que lanza el error (para que componentes lo capturen)
   * 
   * MANEJA:
   * - HttpErrorResponse: Extrae codigo HTTP y respuesta
   * - TimeoutError: Crea error personalizado de timeout
   * - Otros errores: Crea error generico
   * 
   * PARAMETROS:
   * - error: El objeto de error capturado
   * - context: Texto describiendo que operacion fallaba (ej: 'al crear medicamento')
   *           para mensajes mas informativos
   * 
   * RETORNA: Observable<never> que lanza el error ApiError
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
   * getErrorMessage(status, context) - Obtiene mensaje de error segun codigo HTTP
   * 
   * QUE HACE:
   * - Recibe codigo HTTP de error (400, 401, 404, 500, etc)
   * - Retorna mensaje legible en espanol
   * - Si codigo no tiene mensaje personalizado, usa mensaje generico
   * - Incluye el contexto en el mensaje para mas informacion
   * 
   * CASOS CUBIERTOS:
   * - 400: Solicitud invalida
   * - 401: No autorizado (login requerido)
   * - 403: Acceso denegado (permisos)
   * - 404: Recurso no encontrado
   * - 409: Conflicto
   * - 500: Error del servidor
   * - 502: Bad Gateway
   * - 503: Servicio no disponible
   * - 504: Timeout
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
   * getMockMedicines() - Medicamentos de demostracion (datos fake)
   * 
   * QUE HACE:
   * - Retorna un array de medicamentos de ejemplo
   * - Se usan cuando el servidor no esta disponible (fallback)
   * - Permite que la app siga funcionando offline
   * - Datos realistas pero ficticios (Paracetamol, Ibuprofeno, etc)
   * 
   * USO:
   * - Sin internet -> devolver mock
   * - Timeout -> devolver mock
   * - Error servidor -> devolver mock (en algunos casos)
   * 
   * NOTA: No es para testing. Para testing hay que mocear HttpClient.
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
   * registrarConsumo(id, fecha, hora, consumido) - Registra que se tomo un medicamento
   * 
   * QUE HACE:
   * - Marca un medicamento como consumido en una fecha/hora especifica
   * - Peticion POST a /medicamentos/{id}/consumo?fecha=...&hora=...&consumido=...
   * - Envia parametros en query string (no en body)
   * - Log de exito/error
   * - Util para registrar tomas diarias en el calendario
   * 
   * PARAMETROS:
   * - id: ID del medicamento a registrar
   * - fecha: Formato yyyy-MM-dd (ej: 2024-12-25)
   * - hora: Formato HH:mm (ej: 08:30)
   * - consumido: Boolean, true=consumido, false=no consumido
   * 
   * EJEMPLO:
   * // Registrar que tome Paracetamol el 25/12/2024 a las 08:00
   * this.medicineService.registrarConsumo(1, '2024-12-25', '08:00', true)
   *   .subscribe(
   *     response => console.log('Registrado!'),
   *     error => console.error('Error:', error)
   *   );
   * 
   * RETORNA: Observable con respuesta del servidor
   */
  registrarConsumo(id: number, fecha: string, hora: string, consumido: boolean): Observable<any> {
    // Construir parametros de query explicitamente
    // Los parametros se envan en URL, no en body
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
   * obtenerConsumosDelDia(fecha) - Obtiene todos los consumos registrados en un dia
   * 
   * QUE HACE:
   * - Peticion GET a /medicamentos/consumos?fecha=yyyy-MM-dd
   * - Retorna lista de todos los consumos registrados ese dia
   * - Util para mostrar el historial de tomas del dia
   * - Si error, devuelve array vacio (no rompe el flujo)
   * 
   * PARAMETROS: fecha - Formato yyyy-MM-dd (ej: 2024-12-25)
   * 
   * RETORNA: Observable<any[]> - Lista de consumos del dia
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
   * obtenerConsumo(id, fecha, hora) - Obtiene el estado de consumo de UNA instancia
   * 
   * QUE HACE:
   * - Peticion GET a /medicamentos/{id}/consumo?fecha=...&hora=...
   * - Retorna si ese medicamento fue consumido en esa fecha/hora
   * - Util para verificar estado de una toma especifica
   * - Si no hay registro, devuelve null (no error)
   * 
   * PARAMETROS:
   * - id: ID del medicamento
   * - fecha: Formato yyyy-MM-dd
   * - hora: Formato HH:mm
   * 
   * EJEMPLO:
   * // Verificar si tome Paracetamol el 25/12 a las 08:00
   * this.medicineService.obtenerConsumo(1, '2024-12-25', '08:00')
   *   .subscribe(consumo => {
   *     if (consumo) console.log('Ya consumido');  // { consumido: true, fecha, hora }
   *     else console.log('Sin registro');          // null
   *   });
   * 
   * RETORNA: Observable<any> - Objeto con estado o null
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
