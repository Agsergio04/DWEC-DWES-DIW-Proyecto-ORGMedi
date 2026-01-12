import { Injectable, inject, signal, computed, Signal } from '@angular/core';
import { MedicineService } from '../medicine.service';
import { MedicineViewModel } from '../models/medicine.model';

/**
 * Store reactivo para medicamentos usando Angular Signals
 * 
 * Ventajas sobre BehaviorSubject:
 * - No requiere async pipe en templates
 * - Menos boilerplate, API más simple
 * - Integración nativa con el motor de Angular
 * - Mejor rendimiento (change detection granular)
 * - No hay riesgo de fugas de memoria (no subscribe)
 * 
 * Uso en componentes:
 * ```typescript
 * store = inject(MedicineStoreSignals);
 * 
 * medicines = this.store.medicines;  // ReadonlySignal
 * loading = this.store.loading;      // ReadonlySignal
 * 
 * // En template:
 * <div *ngIf="loading()">Cargando...</div>
 * <ul>
 *   <li *ngFor="let m of medicines()">{{ m.name }}</li>
 * </ul>
 * ```
 */
@Injectable({ providedIn: 'root' })
export class MedicineStoreSignals {
  private medicineService = inject(MedicineService);

  // Signals privados (escritura)
  private _medicines = signal<MedicineViewModel[]>([]);
  private _loading = signal<boolean>(false);
  private _error = signal<string | null>(null);

  // Signals públicos (solo lectura)
  medicines = this._medicines.asReadonly();
  loading = this._loading.asReadonly();
  error = this._error.asReadonly();

  // Contadores computados (se recalculan automáticamente)
  totalCount = computed(() => this._medicines().length);
  
  activeCount = computed(() => 
    this._medicines().filter(m => m.isActive).length
  );
  
  expiredCount = computed(() => 
    this._medicines().filter(m => m.isExpired).length
  );
  
  expiringSoonCount = computed(() => 
    this._medicines().filter(m => m.expirationStatus === 'expiring-soon').length
  );

  // Medicamentos filtrados por estado (computed)
  activeMedicines = computed(() => 
    this._medicines().filter(m => m.isActive)
  );
  
  expiredMedicines = computed(() => 
    this._medicines().filter(m => m.isExpired)
  );
  
  expiringSoonMedicines = computed(() => 
    this._medicines().filter(m => m.expirationStatus === 'expiring-soon')
  );

  // Estadísticas agregadas (computed)
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

  // Estado combinado (computed)
  state = computed(() => ({
    medicines: this._medicines(),
    loading: this._loading(),
    error: this._error(),
    isEmpty: this._medicines().length === 0,
    hasError: this._error() !== null,
    isReady: !this._loading() && this._error() === null
  }));

  constructor() {
    // Carga inicial automática
    this.load();
  }

  /**
   * Carga todos los medicamentos desde la API
   * Actualiza los signals automáticamente
   */
  load(): void {
    this._loading.set(true);
    this._error.set(null);

    this.medicineService.getAll().subscribe({
      next: (medicines) => {
        this._medicines.set(medicines);
        this._loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar medicamentos:', err);
        this._error.set('Error al cargar medicamentos. Intenta de nuevo.');
        this._loading.set(false);
      }
    });
  }

  /**
   * Añade un medicamento a la lista local
   * Usa update() para modificar el signal de forma inmutable
   * @param medicine Medicamento a añadir
   */
  add(medicine: MedicineViewModel): void {
    this._medicines.update(current => [...current, medicine]);
  }

  /**
   * Actualiza un medicamento en la lista
   * @param medicine Medicamento actualizado
   */
  update(medicine: MedicineViewModel): void {
    this._medicines.update(current =>
      current.map(m => (m.id === medicine.id ? medicine : m))
    );
  }

  /**
   * Elimina un medicamento de la lista
   * @param id ID del medicamento a eliminar
   */
  remove(id: string): void {
    this._medicines.update(current =>
      current.filter(m => m.id !== id)
    );
  }

  /**
   * Reemplaza toda la lista de medicamentos
   * @param medicines Nueva lista de medicamentos
   */
  setMedicines(medicines: MedicineViewModel[]): void {
    this._medicines.set(medicines);
  }

  /**
   * Busca un medicamento por ID
   * Devuelve un computed signal que se actualiza automáticamente
   * @param id ID del medicamento
   * @returns Computed signal con el medicamento o undefined
   */
  getById(id: string) {
    return computed(() => 
      this._medicines().find(m => m.id === id)
    );
  }

  /**
   * Busca medicamentos por término
   * Devuelve un computed signal que se actualiza automáticamente
   * @param searchTerm Término de búsqueda
   * @returns Computed signal con los medicamentos filtrados
   */
  search(searchTerm: string) {
    return computed(() => {
      const term = searchTerm.toLowerCase().trim();
      if (!term) {
        return this._medicines();
      }

      return this._medicines().filter(m =>
        m.name.toLowerCase().includes(term) ||
        m.dosage.toLowerCase().includes(term) ||
        m.description?.toLowerCase().includes(term)
      );
    });
  }

  /**
   * Limpia el error actual
   */
  clearError(): void {
    this._error.set(null);
  }

  /**
   * Obtiene el valor actual de la lista (síncrono)
   * No reactivo - usa medicines() si necesitas reactividad
   */
  getCurrentMedicines(): MedicineViewModel[] {
    return this._medicines();
  }

  /**
   * Verifica si un medicamento existe por ID
   * @param id ID del medicamento
   */
  exists(id: string): boolean {
    return this._medicines().some(m => m.id === id);
  }

  /**
   * Verifica si un medicamento existe por nombre
   * @param name Nombre del medicamento
   */
  existsByName(name: string): boolean {
    const lowerName = name.toLowerCase();
    return this._medicines().some(m => m.name.toLowerCase() === lowerName);
  }

  /**
   * Obtiene medicamentos próximos a expirar en X días
   * @param days Número de días
   * @returns Computed signal con medicamentos próximos a expirar
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
   * Ordena medicamentos por campo
   * @param field Campo por el que ordenar
   * @param order Orden ascendente o descendente
   * @returns Computed signal con medicamentos ordenados
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
   * Filtra medicamentos basado en un término de búsqueda
   * Crea un computed signal que se actualiza automáticamente cuando cambia _medicines
   * 
   * @param searchTerm Signal que contiene el término de búsqueda
   * @returns Computed signal con medicamentos filtrados
   * 
   * Ejemplo de uso con Signal:
   * ```typescript
   * searchTerm = signal('');
   * filtered = this.store.filterBySearch(this.searchTerm);
   * 
   * // En el template
   * @for (medicine of filtered(); track medicine.id) {
   *   <div>{{ medicine.name }}</div>
   * }
   * ```
   */
  filterBySearch(searchTerm: Signal<string>) {
    return computed(() => {
      const term = searchTerm().toLowerCase().trim();
      
      if (!term) {
        return this._medicines();
      }

      return this._medicines().filter(medicine =>
        medicine.name.toLowerCase().includes(term) ||
        medicine.dosage.toLowerCase().includes(term) ||
        medicine.description?.toLowerCase().includes(term) ||
        medicine.displayName?.toLowerCase().includes(term)
      );
    });
  }

  /**
   * Variante que acepta un término de búsqueda directo (string)
   * Útil para búsquedas puntuales sin necesidad de un signal reactivo
   * 
   * @param searchTerm Término de búsqueda
   * @returns Array filtrado de medicamentos
   */
  searchDirect(searchTerm: string): MedicineViewModel[] {
    const term = searchTerm.toLowerCase().trim();
    
    if (!term) {
      return this._medicines();
    }

    return this._medicines().filter(medicine =>
      medicine.name.toLowerCase().includes(term) ||
      medicine.dosage.toLowerCase().includes(term) ||
      medicine.description?.toLowerCase().includes(term) ||
      medicine.displayName?.toLowerCase().includes(term)
    );
  }
}
