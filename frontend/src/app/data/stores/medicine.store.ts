import { Injectable, inject, computed, signal } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap, catchError, switchMap } from 'rxjs/operators';
import { MedicineService } from '../medicine.service';
import { MedicineViewModel } from '../models/medicine.model';

/**
 * Store Reactivo de Medicamentos
 * ==============================
 * 
 * Centraliza el estado de medicamentos en memoria para toda la aplicación.
 * Todos los componentes que se suscriban reciben actualizaciones automáticas sin recargas HTTP.
 * 
 * Funcionalidades principales:
 *  Carga y en caché de medicamentos (solo 1 petición al inicio)
 *  Búsqueda local sin API (rápida e inmediata)
 *  Sincronización automática entre componentes
 *  Estadísticas derivadas (totales, caducados, etc)
 *  Operaciones CRUD locales (add/update/remove sin esperar API)
 * 
 * Arquitectura:
 * - BehaviorSubject internos: medicines$, loading$, error$
 * - Observables públicos: activeMedicines$, expiredMedicines$, stats$, etc
 * - Métodos públicos: refresh(), add(), update(), remove(), search()
 * 
 * Ventajas:
 *  Estado centralizado: una fuente única de verdad
 *  Rendimiento: datos en memoria, búsqueda local
 *  Reactividad: componentes se actualizan sin manualmente
 *  Caché: evita peticiones HTTP repetidas
 *  Computadas: estadísticas se recalculan automáticamente
 * 
 * @example
 * // En componente
 * constructor(public medicineStore: MedicineStore) {}
 * 
 * medicines$ = this.medicineStore.medicines$;
 * stats$ = this.medicineStore.stats$;
 * 
 * // En template
 * @if (medicines$ | async; as medicines) {
 *   @for (m of medicines; track m.id) {
 *     {{ m.nombre }}
 *   }
 * }
 */
@Injectable({ providedIn: 'root' })
export class MedicineStore {
  private medicineService = inject(MedicineService);

  // ============ ESTADO INTERNO (BehaviorSubject) ============
  
  /** Lista actual de medicamentos en memoria */
  private medicinesSubject = new BehaviorSubject<MedicineViewModel[]>([]);
  
  /** Indica si se está cargando desde API */
  private loadingSubject = new BehaviorSubject<boolean>(false);
  
  /** Mensaje de error si algo falla */
  private errorSubject = new BehaviorSubject<string | null>(null);

  // ============ OBSERVABLES PÚBLICOS ============
  
  /** Observable de la lista de medicamentos actual */
  medicines$ = this.medicinesSubject.asObservable();
  
  /** Observable que indica si está cargando */
  loading$ = this.loadingSubject.asObservable();
  
  /** Observable del último error */
  error$ = this.errorSubject.asObservable();

  // ============ CONTADORES DERIVADOS ============
  // Se recalculan automáticamente cuando medicines$ cambia
  
  /** Total de medicamentos */
  totalCount$ = this.medicines$.pipe(
    map(medicines => medicines.length)
  );

  /** Total de medicamentos activos */
  activeCount$ = this.medicines$.pipe(
    map(medicines => medicines.filter(m => m.isActive).length)
  );

  /** Total de medicamentos caducados */
  expiredCount$ = this.medicines$.pipe(
    map(medicines => medicines.filter(m => m.isExpired).length)
  );

  /** Total de medicamentos por caducar pronto */
  expiringSoonCount$ = this.medicines$.pipe(
    map(medicines => medicines.filter(m => m.expirationStatus === 'expiring-soon').length)
  );

  // ============ FILTROS DERIVADOS ============
  // Medicamentos filtrados por estado
  
  /** Lista de medicamentos activos */
  activeMedicines$ = this.medicines$.pipe(
    map(medicines => medicines.filter(m => m.isActive))
  );

  /** Lista de medicamentos caducados */
  expiredMedicines$ = this.medicines$.pipe(
    map(medicines => medicines.filter(m => m.isExpired))
  );

  /** Lista de medicamentos por caducar pronto */
  expiringSoonMedicines$ = this.medicines$.pipe(
    map(medicines => medicines.filter(m => m.expirationStatus === 'expiring-soon'))
  );

  // ============ ESTADÍSTICAS AGREGADAS ============
  
  /**
   * Objeto con todas las estadísticas en un solo observable
   * Útil para templates que necesitan múltiples valores a la vez
   */
  stats$ = this.medicines$.pipe(
    map(medicines => ({
      total: medicines.length,
      active: medicines.filter(m => m.isActive).length,
      expired: medicines.filter(m => m.isExpired).length,
      expiringSoon: medicines.filter(m => m.expirationStatus === 'expiring-soon').length,
      isEmpty: medicines.length === 0
    }))
  );

  constructor() {
    // Carga automática al inyectar el servicio
    this.refresh();
  }

  // ============ MÉTODOS PÚBLICOS ============

  /**
   * Recarga todos los medicamentos desde la API
   * 
   * Qué hace:
   * 1. Establece loading$ = true
   * 2. Petición HTTP GET a la API
   * 3. Actualiza medicinesSubject con nuevos datos
   * 4. Todos los observables dependientes se actualizan automáticamente
   * 5. Establece loading$ = false
   * 
   * Cuándo usarlo:
   * - Página inicial (se llamada automáticamente)
   * - Botón "Actualizar"
   * - Después de crear/editar/eliminar (después de esperar respuesta del servidor)
   */
  refresh(): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    this.medicineService.getAll().pipe(
      tap(medicines => {
        this.medicinesSubject.next(medicines);
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        this.errorSubject.next('Error al cargar medicamentos');
        this.loadingSubject.next(false);
        throw error;
      })
    ).subscribe();
  }

  /**
   * Añade un medicamento a la lista LOCAL (sin petición HTTP)
   * 
   * Útil para:
   * - Actualizar UI inmediatamente después de crear
   * - Evitar parpadeo mientras espera la respuesta del servidor
   * - Mantener sincronizado el estado local
   * 
   * Nota: El usuario ya ha enviado el medicamento a la API,
   * esto es solo para actualizar el estado local
   * 
   * @param medicine Medicamento a añadir
   */
  add(medicine: MedicineViewModel): void {
    const current = this.medicinesSubject.value;
    this.medicinesSubject.next([...current, medicine]);
  }

  /**
   * Actualiza un medicamento en la lista LOCAL (sin petición HTTP)
   * 
   * Útil para:
   * - Actualizar UI inmediatamente después de editar
   * - Evitar parpadeo mientras espera la respuesta del servidor
   * - Mantener el caché sincronizado
   * 
   * @param medicine Medicamento actualizado (debe tener el mismo ID)
   * 
   * @example
   * const updated = { ...medicine, nombre: 'Nuevo nombre' };
   * this.medicineStore.update(updated);
   */
  update(medicine: MedicineViewModel): void {
    const current = this.medicinesSubject.value;
    this.medicinesSubject.next(
      current.map(m => (m.id === medicine.id ? medicine : m))
    );
  }

  /**
   * Elimina un medicamento de la lista LOCAL (sin petición HTTP)
   * 
   * Útil para:
   * - Actualizar UI inmediatamente después de eliminar
   * - Evitar parpadeo mientras espera la respuesta del servidor
   * 
   * @param id ID del medicamento a eliminar
   */
  remove(id: string | number): void {
    const current = this.medicinesSubject.value;
    this.medicinesSubject.next(current.filter(m => Number(m.id) !== Number(id)));
  }

  /**
   * Obtiene un medicamento por ID desde el caché en memoria
   * 
   * Ventajas:
   * -  Instantáneo (sin esperar API)
   * -  Usa datos en caché
   * -  Devuelve Observable (reactivo)
   * 
   * @param id ID del medicamento
   * @returns Observable<MedicineViewModel | undefined>
   * 
   * @example
   * this.medicineStore.getById(123).subscribe(medicine => {
   *   console.log(medicine);
   * });
   */
  getById(id: string | number): Observable<MedicineViewModel | undefined> {
    return this.medicines$.pipe(
      map(medicines => medicines.find(m => Number(m.id) === Number(id)))
    );
  }

  /**
   * Busca medicamentos en el caché LOCAL (sin petición HTTP)
   * 
   * Busca por:
   * - Nombre: "Aspirina"
   * - Dosis: "500"
   * - Color: "blanco"
   * - Display name: cualquier formato alternativo
   * 
   * Características:
   * -  Instantáneo (usa datos en memoria)
   * -  Case-insensitive (mayúsculas/minúsculas)
   * -  Sin espacios (trimming automático)
   * 
   * @param searchTerm Término de búsqueda
   * @returns Observable<MedicineViewModel[]> Medicamentos coincidentes
   * 
   * @example
   * this.medicineStore.search('Aspir').subscribe(medicines => {
   *   console.log(medicines); // Medicamentos que coincidan
   * });
   */
  search(searchTerm: string): Observable<MedicineViewModel[]> {
    const term = searchTerm.toLowerCase().trim();
    if (!term) {
      return this.medicines$;
    }

    return this.medicines$.pipe(
      map(medicines =>
        medicines.filter(m =>
          m.nombre.toLowerCase().includes(term) ||
          m.cantidadMg.toString().includes(term) ||
          m.color?.toLowerCase().includes(term) ||
          m.displayName?.toLowerCase().includes(term)
        )
      )
    );
  }

  /**
   * Búsqueda Reactiva Conectada
   * ===========================
   * 
   * Conecta un Observable de búsqueda para filtrado en tiempo real.
   * Útil cuando el usuario está escribiendo en un input.
   * 
   * Patrón recomendado:
   * 1. Input emite cambios rápidamente
   * 2. debounceTime(300) espera 300ms sin cambios
   * 3. distinctUntilChanged evita búsquedas duplicadas
   * 4. connectSearch filtra resultados
   * 
   * @param search$ Observable que emite términos de búsqueda
   * @returns Observable<MedicineViewModel[]> Resultados filtrados
   * 
   * @example
   * const searchControl = new FormControl('');
   * const search$ = searchControl.valueChanges.pipe(
   *   debounceTime(300),
   *   distinctUntilChanged()
   * );
   * 
   * this.filteredMedicines$ = this.medicineStore.connectSearch(search$);
   * 
   * // En el template
   * @if (filteredMedicines$ | async; as medicines) {
   *   @for (m of medicines; track m.id) {
   *     {{ m.nombre }}
   *   }
   * }
   */
  connectSearch(search$: Observable<string>): Observable<MedicineViewModel[]> {
    return search$.pipe(
      switchMap(term => this.search(term))
    );
  }

  /**
   * Limpia el mensaje de error
   * 
   * Útil para:
   * - Descartar notificaciones de error después de que el usuario las vea
   * - Reintentar después de un error
   */
  clearError(): void {
    this.errorSubject.next(null);
  }

  /**
   * Obtiene el valor ACTUAL de la lista sin suscripción
   * 
   * Devuelve un valor síncrono (acción inmediata, no Observable).
   * Útil para operaciones que necesitan el valor ahora mismo.
   * 
   * Cuándo usarlo:
   * - Validaciones antes de guardar
   * - Operaciones síncronas que necesitan lenguaje
   * - Debugging/logs
   * 
   * No usarlo:
   * - Templates (usar medicines$ | async en su lugar)
   * - Reacciones a cambios (usar observables)
   * 
   * @returns Medicamentos actuales como array
   */
  getCurrentMedicines(): MedicineViewModel[] {
    return this.medicinesSubject.value;
  }

  /**
   * Verifica si un medicamento existe por ID
   * 
   * Útil para:
   * - Validar si un ID existe antes de operar
   * - Mostrar/ocultar botones de edición
   * 
   * @param id ID del medicamento
   * @returns true si existe, false si no
   */
  exists(id: string | number): boolean {
    return this.medicinesSubject.value.some(m => Number(m.id) === Number(id));
  }

  /**
   * Verifica si un medicamento existe por nombre (búsqueda exacta)
   * 
   * Útil para:
   * - Evitar duplicados: verificar antes de crear
   * - Validar nombres únicos
   * 
   * @param name Nombre del medicamento (búsqueda case-insensitive)
   * @returns true si existe, false si no
   */
  existsByName(name: string): boolean {
    const lowerName = name.toLowerCase();
    return this.medicinesSubject.value.some(m => m.nombre.toLowerCase() === lowerName);
  }
}
