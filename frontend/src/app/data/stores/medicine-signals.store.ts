import { Injectable, inject, signal, computed, Signal } from '@angular/core';
import { MedicineService } from '../medicine.service';
import { MedicineViewModel } from '../models/medicine.model';

/**
 * Store Reactivo de Medicamentos con Angular Signals
 * ==================================================
 * 
 * Versión moderna del Store usando Angular Signals (no BehaviorSubject).
 * 
 * ¿Qué son Signals?
 * - Forma nativa de Angular para reactividad
 * - Más simple que Observables
 * - Mejor rendimiento (change detection granular)
 * - Se usan directamente en templates sin async pipe
 * 
 * Ventajas vs BehaviorSubject:
 *  No requiere .subscribe() - uso más simple
 *  No requiere async pipe en templates
 *  Mejor rendimiento y menos memory leaks
 *  API más intuitiva: signal() en lugar de new BehaviorSubject()
 *  Computed signals: se recalculan automáticamente (como 'watch' en Vue)
 * 
 * Uso en componentes:
 * ```typescript
 * constructor(private store: MedicineStoreSignals) {}
 * 
 * medicines = this.store.medicines;  // ReadonlySignal
 * loading = this.store.loading;      // ReadonlySignal
 * stats = this.store.stats;          // Computed signal
 * 
 * // En template (sin async pipe!):
 * @if (loading()) {
 *   <div>Cargando...</div>
 * }
 * <ul>
 *   @for (m of medicines(); track m.id) {
 *     <li>{{ m.nombre }} ({{ m.cantidadMg }}mg)</li>
 *   }
 * </ul>
 * ```
 */
@Injectable({ providedIn: 'root' })
export class MedicineStoreSignals {
  private medicineService = inject(MedicineService);

  // ============ SIGNALS PRIVADOS (Con escritura) ============
  
  /** Lista actual de medicamentos */
  private _medicines = signal<MedicineViewModel[]>([]);
  
  /** Indica si se está cargando desde API */
  private _loading = signal<boolean>(false);
  
  /** Mensaje de error si algo falla */
  private _error = signal<string | null>(null);

  // ============ SIGNALS PÚBLICOS (ReadOnly - Solo lectura) ============
  // Los componentes pueden leer pero no escribir directamente
  
  /** Observable reactive: lista de medicamentos actual */
  medicines = this._medicines.asReadonly();
  
  /** Observable reactive: estado de carga */
  loading = this._loading.asReadonly();
  
  /** Observable reactive: último error */
  error = this._error.asReadonly();

  // ============ COMPUTED SIGNALS (Se recalculan automáticamente) ============
  // Similares a getters, pero optimizados para reactividad
  
  /**
   * Total de medicamentos
   * Se actualiza automáticamente cuando medicines$ cambia
   */
  totalCount = computed(() => this._medicines().length);
  
  /**
   * Total de medicamentos activos
   */
  activeCount = computed(() => 
    this._medicines().filter(m => m.isActive).length
  );
  
  /**
   * Total de medicamentos caducados
   */
  expiredCount = computed(() => 
    this._medicines().filter(m => m.isExpired).length
  );
  
  /**
   * Total de medicamentos por caducar
   */
  expiringSoonCount = computed(() => 
    this._medicines().filter(m => m.expirationStatus === 'expiring-soon').length
  );

  // ============ FILTROS DERIVADOS (Computed Signals) ============
  
  /**
   * Lista de medicamentos activos
   */
  activeMedicines = computed(() => 
    this._medicines().filter(m => m.isActive)
  );
  
  /**
   * Lista de medicamentos caducados
   */
  expiredMedicines = computed(() => 
    this._medicines().filter(m => m.isExpired)
  );
  
  /**
   * Lista de medicamentos próximos a caducar
   */
  expiringSoonMedicines = computed(() => 
    this._medicines().filter(m => m.expirationStatus === 'expiring-soon')
  );

  // ============ ESTADÍSTICAS AGREGADAS ============
  
  /**
   * Objeto con todas las estadísticas compiladas
   * Útil para dashboards que necesitan múltiples valores
   * Se actualiza automáticamente
   */
  stats = computed(() => {
    const medicines = this._medicines();
    return {
      total: medicines.length,
      active: medicines.filter(m => m.isActive).length,
      expired: medicines.filter(m => m.isExpired).length,
      expiringSoon: medicines.filter(m => m.expirationStatus === 'expiring-soon').length,
      isEmpty: medicines.length === 0
    };
  });

  /** Flag para evitar cargas duplicadas */
  private _loaded = false;

  /**
   * Estado global combinado
   * Útil para templates complejos que necesitan múltiples flags
   */
  state = computed(() => ({
    medicines: this._medicines(),
    loading: this._loading(),
    error: this._error(),
    isEmpty: this._medicines().length === 0,
    hasError: this._error() !== null,
    isReady: !this._loading() && this._error() === null
  }));

  constructor() {
    // Ya no se auto-carga. Cada página llama load() o loadIfNeeded() explícitamente.
  }

  // ============ MÉTODOS PÚBLICOS ============

  /**
   * Carga todos los medicamentos desde la API
   */
  load(): void {
    this._loading.set(true);
    this._error.set(null);
    this._loaded = true;

    this.medicineService.getAll().subscribe({
      next: (medicines) => {
        this._medicines.set(medicines);
        this._loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar medicamentos:', err);
        this._error.set('Error al cargar medicamentos. Intenta de nuevo.');
        this._loading.set(false);
        this._loaded = false;
      }
    });
  }

  /**
   * Carga solo si no se ha cargado antes (lazy loading)
   */
  loadIfNeeded(): void {
    if (!this._loaded) {
      this.load();
    }
  }

  /**
   * Añade un medicamento a la lista LOCAL (sin petición HTTP)
   * 
   * Usa update() para modificación inmutable
   * (crea un nuevo array en lugar de mutarlo)
   * 
   * @param medicine Medicamento a añadir
   */
  add(medicine: MedicineViewModel): void {
    this._medicines.update(current => [...current, medicine]);
  }

  /**
   * Actualiza un medicamento en la lista LOCAL
   * 
   * Busca por ID y reemplaza el medicamento
   * 
   * @param medicine Medicamento actualizado
   */
  update(medicine: MedicineViewModel): void {
    this._medicines.update(current =>
      current.map(m => (m.id === medicine.id ? medicine : m))
    );
  }

  /**
   * Elimina un medicamento de la lista LOCAL
   * 
   * @param id ID del medicamento a eliminar
   */
  remove(id: string | number): void {
    this._medicines.update(current =>
      current.filter(m => Number(m.id) !== Number(id))
    );
  }

  /**
   * Reemplaza TODA la lista de medicamentos
   * Útil después de recibir una respuesta del servidor
   * 
   * @param medicines Nueva lista completa
   */
  setMedicines(medicines: MedicineViewModel[]): void {
    this._medicines.set(medicines);
  }

  /**
   * Obtiene un medicamento por ID
   * 
   * Devuelve un COMPUTED SIGNAL que:
   * - Se actualiza automáticamente cuando la lista cambia
   * - Se usa directamente en el template sin async pipe
   * - Es eficiente (se recalcula solo cuando es necesario)
   * 
   * @param id ID del medicamento
   * @returns Computed signal con el medicamento o undefined
   * 
   * @example
   * medicine$ = this.store.getById(123);
   * 
   * // En template
   * @if (medicine$(); as medicine) {
   *   {{ medicine.nombre }}
   * }
   */
  getById(id: string | number) {
    return computed(() => 
      this._medicines().find(m => Number(m.id) === Number(id))
    );
  }

  /**
   * Busca medicamentos por término
   * 
   * Devuelve un COMPUTED SIGNAL con resultados filtrados
   * Se actualiza automáticamente cuando la lista cambia
   * 
   * @param searchTerm Término de búsqueda
   * @returns Computed signal con medicamentos coincidentes
   */
  search(searchTerm: string) {
    return computed(() => {
      const term = searchTerm.toLowerCase().trim();
      if (!term) {
        return this._medicines();
      }

      return this._medicines().filter(m =>
        m.nombre.toLowerCase().includes(term) ||
        m.cantidadMg.toString().includes(term) ||
        m.displayName?.toLowerCase().includes(term)
      );
    });
  }

  /**
   * Limpia el mensaje de error
   */
  clearError(): void {
    this._error.set(null);
  }

  /**
   * Obtiene el valor ACTUAL de la lista (síncrono)
   * 
   * Diferencia:
   * - medicines() → Reactivo (se actualiza en templates)
   * - getCurrentMedicines() → Valor puntual ahora
   * 
   * Cuándo usar:
   * - Para operaciones síncronas que necesitan el valor YA
   * - Debugging/logs
   * - No para templates (usar medicines() en su lugar)
   * 
   * @returns Array de medicamentos actual
   */
  getCurrentMedicines(): MedicineViewModel[] {
    return this._medicines();
  }

  /**
   * Verifica si un medicamento existe por ID
   * Síncrono, devuelve boolean
   * 
   * @param id ID del medicamento
   * @returns true si existe, false si no
   */
  exists(id: string | number): boolean {
    return this._medicines().some(m => Number(m.id) === Number(id));
  }

  /**
   * Verifica si un medicamento existe por nombre
   * Búsqueda case-insensitive
   * 
   * @param name Nombre del medicamento
   * @returns true si existe, false si no
   */
  existsByName(name: string): boolean {
    const lowerName = name.toLowerCase();
    return this._medicines().some(m => m.nombre.toLowerCase() === lowerName);
  }

  /**
   * Obtiene medicamentos próximos a expirar en X días
   * 
   * Devuelve un COMPUTED SIGNAL reactivo
   * 
   * @param days Número de días (ej: 7 para próxima semana)
   * @returns Computed signal con medicamentos por expirar
   * 
   * @example
   * nextWeek$ = this.store.getExpiringInDays(7);
   * 
   * // En template
   * @if (nextWeek$().length > 0) {
   *   <div class="warning">
   *     @for (m of nextWeek$(); track m.id) {
   *       {{ m.nombre }} vence en {{ m.daysUntilExpiration }} días
   *     }
   *   </div>
   * }
   */
  getExpiringInDays(days: number) {
    return computed(() =>
      this._medicines().filter(m => {
        if (!m.daysUntilExpiration) return false;
        return m.daysUntilExpiration <= days && m.daysUntilExpiration > 0;
      })
    );
  }

  /**
   * Ordena medicamentos por un campo
   * 
   * Devuelve un COMPUTED SIGNAL con los medicamentos ordenados
   * La ordenación se recalcula cuando la lista cambia
   * 
   * @param field Campo por el que ordenar (ej: 'nombre', 'cantidadMg')
   * @param order Ascendente ('asc') o descendente ('desc')
   * @returns Computed signal con medicamentos ordenados
   * 
   * @example
   * sortedByName$ = this.store.sortBy('nombre', 'asc');
   * sortedByExpiration$ = this.store.sortBy('daysUntilExpiration', 'asc');
   */
  sortBy(field: keyof MedicineViewModel, order: 'asc' | 'desc' = 'asc') {
    return computed(() => {
      const medicines = [...this._medicines()];
      return medicines.sort((a, b) => {
        const aVal = a[field];
        const bVal = b[field];
        
        if (aVal === undefined || aVal === null) return 1;
        if (bVal === undefined || bVal === null) return -1;
        
        const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return order === 'asc' ? comparison : -comparison;
      });
    });
  }

  /**
   * Búsqueda Reactiva Conectada
   * ==========================
   * 
   * Conecta un SIGNAL DE BÚSQUEDA para filtrado en tiempo real
   * Ideal para inputs donde el usuario está escribiendo
   * 
   * El patrón recomendado:
   * 1. User escribe → searchTerm signal se actualiza
   * 2. filterBySearch detecta cambio en searchTerm
   * 3. Computed signal se recalcula automáticamente
   * 4. Template se actualiza con nuevos resultados
   * 
   * Diferencia vs search():
   * - search(string) → búsqueda de un valor fijo
   * - filterBySearch(signal) → búsqueda reactiva que cambia
   * 
   * @param searchTerm Signal<string> que contiene el término
   * @returns Computed signal con medicamentos filtrados
   * 
   * @example
   * // En el componente
   * searchTerm = signal('');
   * filtered = this.store.filterBySearch(this.searchTerm);
   * 
   * // En el template
   * <input [(ngModel)]="searchTerm" placeholder="Buscar...">
   * 
   * @if (filtered().length > 0) {
   *   @for (medicine of filtered(); track medicine.id) {
   *     <div>{{ medicine.nombre }}</div>
   *   }
   * } @else {
   *   <p>No hay resultados</p>
   * }
   */
  filterBySearch(searchTerm: Signal<string>) {
    return computed(() => {
      const term = searchTerm().toLowerCase().trim();
      
      if (!term) {
        return this._medicines();
      }

      return this._medicines().filter(medicine =>
        medicine.nombre.toLowerCase().includes(term) ||
        medicine.cantidadMg.toString().includes(term) ||
        medicine.color?.toLowerCase().includes(term) ||
        medicine.displayName?.toLowerCase().includes(term)
      );
    });
  }

  /**
   * Búsqueda Directa (No Reactiva)
   * =============================
   * 
   * Alternativa Simple: Devuelve un array normal
   * Útil para búsquedas puntuales sin reactividad
   * 
   * Diferencia vs filterBySearch():
   * - filterBySearch() → Computed signal (reactivo)
   * - searchDirect() → Array simple (no reactivo)
   * 
   * Cuándo usar searchDirect():
   * - Búsquedas que se disparan por un botón
   * - No necesitas actualización en tiempo real
   * - Código más simple cuando no hay reactividad
   * 
   * @param searchTerm Término de búsqueda como string
   * @returns Array filtrado de medicamentos
   * 
   * @example
   * // Búsqueda por botón
   * <button (click)="buscar()">Buscar</button>
   * 
   * buscar(): void {
   *   const results = this.store.searchDirect('aspirina');
   *   console.log(results);
   * }
   */
  searchDirect(searchTerm: string): MedicineViewModel[] {
    const term = searchTerm.toLowerCase().trim();
    
    if (!term) {
      return this._medicines();
    }

    return this._medicines().filter(medicine =>
      medicine.nombre.toLowerCase().includes(term) ||
      medicine.cantidadMg.toString().includes(term) ||
      medicine.color?.toLowerCase().includes(term) ||
      medicine.displayName?.toLowerCase().includes(term)
    );
  }
}
