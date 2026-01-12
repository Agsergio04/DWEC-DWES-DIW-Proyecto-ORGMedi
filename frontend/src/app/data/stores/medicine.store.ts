import { Injectable, inject, computed, signal } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap, catchError, switchMap } from 'rxjs/operators';
import { MedicineService } from '../medicine.service';
import { MedicineViewModel } from '../models/medicine.model';

/**
 * Store reactivo para medicamentos
 * Mantiene la lista de medicamentos en memoria y expone observables para actualización dinámica sin recargas.
 * Todos los componentes que se suscriban a medicines$ recibirán actualizaciones automáticas.
 */
@Injectable({ providedIn: 'root' })
export class MedicineStore {
  private medicineService = inject(MedicineService);

  // Estado interno con BehaviorSubject
  private medicinesSubject = new BehaviorSubject<MedicineViewModel[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);

  // Observables públicos
  medicines$ = this.medicinesSubject.asObservable();
  loading$ = this.loadingSubject.asObservable();
  error$ = this.errorSubject.asObservable();

  // Contadores y estadísticas derivados (se recalculan automáticamente)
  totalCount$ = this.medicines$.pipe(
    map(medicines => medicines.length)
  );

  activeCount$ = this.medicines$.pipe(
    map(medicines => medicines.filter(m => m.isActive).length)
  );

  expiredCount$ = this.medicines$.pipe(
    map(medicines => medicines.filter(m => m.isExpired).length)
  );

  expiringSoonCount$ = this.medicines$.pipe(
    map(medicines => medicines.filter(m => m.expirationStatus === 'expiring-soon').length)
  );

  // Medicamentos por estado
  activeMedicines$ = this.medicines$.pipe(
    map(medicines => medicines.filter(m => m.isActive))
  );

  expiredMedicines$ = this.medicines$.pipe(
    map(medicines => medicines.filter(m => m.isExpired))
  );

  expiringSoonMedicines$ = this.medicines$.pipe(
    map(medicines => medicines.filter(m => m.expirationStatus === 'expiring-soon'))
  );

  // Estadísticas agregadas
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
    // Carga inicial automática
    this.refresh();
  }

  /**
   * Recarga todos los medicamentos desde la API
   * Actualiza automáticamente todos los observables suscritos
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
   * Añade un medicamento a la lista local sin recargar desde API
   * Útil después de crear un medicamento para actualizar la UI inmediatamente
   * @param medicine Medicamento a añadir
   */
  add(medicine: MedicineViewModel): void {
    const current = this.medicinesSubject.value;
    this.medicinesSubject.next([...current, medicine]);
  }

  /**
   * Actualiza un medicamento en la lista local
   * Útil después de editar para actualizar la UI sin recargar
   * @param medicine Medicamento actualizado
   */
  update(medicine: MedicineViewModel): void {
    const current = this.medicinesSubject.value;
    this.medicinesSubject.next(
      current.map(m => (m.id === medicine.id ? medicine : m))
    );
  }

  /**
   * Elimina un medicamento de la lista local
   * Útil después de eliminar para actualizar la UI sin recargar
   * @param id ID del medicamento a eliminar
   */
  remove(id: string): void {
    const current = this.medicinesSubject.value;
    this.medicinesSubject.next(current.filter(m => m.id !== id));
  }

  /**
   * Obtiene un medicamento por ID desde la lista en memoria
   * Evita petición HTTP si el medicamento ya está en el store
   * @param id ID del medicamento
   * @returns Observable<MedicineViewModel | undefined>
   */
  getById(id: string): Observable<MedicineViewModel | undefined> {
    return this.medicines$.pipe(
      map(medicines => medicines.find(m => m.id === id))
    );
  }

  /**
   * Busca medicamentos por nombre (búsqueda local sin API)
   * @param searchTerm Término de búsqueda
   * @returns Observable<MedicineViewModel[]>
   */
  search(searchTerm: string): Observable<MedicineViewModel[]> {
    const term = searchTerm.toLowerCase().trim();
    if (!term) {
      return this.medicines$;
    }

    return this.medicines$.pipe(
      map(medicines =>
        medicines.filter(m =>
          m.name.toLowerCase().includes(term) ||
          m.dosage.toLowerCase().includes(term) ||
          m.description?.toLowerCase().includes(term) ||
          m.displayName?.toLowerCase().includes(term)
        )
      )
    );
  }

  /**
   * Conecta un observable de búsqueda para filtrado reactivo
   * Útil para inputs con debounce que emiten términos de búsqueda
   * 
   * @param search$ Observable que emite términos de búsqueda
   * @returns Observable<MedicineViewModel[]> Resultados filtrados
   * 
   * Ejemplo de uso:
   * ```typescript
   * const searchControl = new FormControl('');
   * const search$ = searchControl.valueChanges.pipe(
   *   debounceTime(300),
   *   distinctUntilChanged()
   * );
   * 
   * this.filtered$ = this.store.connectSearch(search$);
   * ```
   */
  connectSearch(search$: Observable<string>): Observable<MedicineViewModel[]> {
    return search$.pipe(
      switchMap(term => this.search(term))
    );
  }

  /**
   * Limpia el error actual
   */
  clearError(): void {
    this.errorSubject.next(null);
  }

  /**
   * Obtiene el valor actual de la lista sin suscripción
   * Útil para operaciones síncronas
   */
  getCurrentMedicines(): MedicineViewModel[] {
    return this.medicinesSubject.value;
  }

  /**
   * Verifica si un medicamento existe por ID
   * @param id ID del medicamento
   */
  exists(id: string): boolean {
    return this.medicinesSubject.value.some(m => m.id === id);
  }

  /**
   * Verifica si un medicamento existe por nombre
   * @param name Nombre del medicamento
   */
  existsByName(name: string): boolean {
    const lowerName = name.toLowerCase();
    return this.medicinesSubject.value.some(m => m.name.toLowerCase() === lowerName);
  }
}
