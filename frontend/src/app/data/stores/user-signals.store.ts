import { Injectable, inject, signal, computed } from '@angular/core';
import { UserService } from '../user.service';
import { UserViewModel } from '../models/user.model';

/**
 * Store reactivo para usuarios usando Angular Signals
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
 * store = inject(UserStoreSignals);
 * 
 * users = this.store.users;      // ReadonlySignal
 * loading = this.store.loading;  // ReadonlySignal
 * stats = this.store.stats;      // Computed signal
 * 
 * // En template:
 * <div *ngIf="loading()">Cargando...</div>
 * <p>Total: {{ stats().total }}</p>
 * <ul>
 *   <li *ngFor="let u of users()">{{ u.name }}</li>
 * </ul>
 * ```
 */
@Injectable({ providedIn: 'root' })
export class UserStoreSignals {
  private userService = inject(UserService);

  // Signals privados (escritura)
  private _users = signal<UserViewModel[]>([]);
  private _loading = signal<boolean>(false);
  private _error = signal<string | null>(null);

  // Signals públicos (solo lectura)
  users = this._users.asReadonly();
  loading = this._loading.asReadonly();
  error = this._error.asReadonly();

  // Contadores computados (se recalculan automáticamente)
  totalCount = computed(() => this._users().length);
  
  activeCount = computed(() => 
    this._users().filter(u => u.active).length
  );
  
  inactiveCount = computed(() => 
    this._users().filter(u => !u.active).length
  );
  
  withMedicalConditionsCount = computed(() => 
    this._users().filter(u => u.hasMedicalConditions).length
  );
  
  withAllergiesCount = computed(() => 
    this._users().filter(u => u.hasAllergies).length
  );
  
  withDoctorInfoCount = computed(() => 
    this._users().filter(u => u.hasDoctorInfo).length
  );

  // Usuarios filtrados por estado (computed)
  activeUsers = computed(() => 
    this._users().filter(u => u.active)
  );
  
  inactiveUsers = computed(() => 
    this._users().filter(u => !u.active)
  );
  
  usersWithMedicalConditions = computed(() => 
    this._users().filter(u => u.hasMedicalConditions)
  );
  
  usersWithAllergies = computed(() => 
    this._users().filter(u => u.hasAllergies)
  );

  // Estadísticas agregadas (computed)
  stats = computed(() => {
    const users = this._users();
    const usersWithAge = users.filter(u => u.age !== undefined && u.age !== null);
    const averageAge = usersWithAge.length > 0
      ? Math.round(usersWithAge.reduce((sum, u) => sum + (u.age ?? 0), 0) / usersWithAge.length)
      : null;

    return {
      total: users.length,
      active: users.filter(u => u.active).length,
      inactive: users.filter(u => !u.active).length,
      withMedicalConditions: users.filter(u => u.hasMedicalConditions).length,
      withAllergies: users.filter(u => u.hasAllergies).length,
      withDoctorInfo: users.filter(u => u.hasDoctorInfo).length,
      isEmpty: users.length === 0,
      averageAge
    };
  });

  // Estado combinado (computed)
  state = computed(() => ({
    users: this._users(),
    loading: this._loading(),
    error: this._error(),
    isEmpty: this._users().length === 0,
    hasError: this._error() !== null,
    isReady: !this._loading() && this._error() === null
  }));

  constructor() {
    // Carga inicial automática
    this.load();
  }

  /**
   * Carga todos los usuarios desde la API
   * Actualiza los signals automáticamente
   */
  load(): void {
    this._loading.set(true);
    this._error.set(null);

    this.userService.getUsers().subscribe({
      next: (users) => {
        this._users.set(users);
        this._loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar usuarios:', err);
        this._error.set('Error al cargar usuarios. Intenta de nuevo.');
        this._loading.set(false);
      }
    });
  }

  /**
   * Añade un usuario a la lista local
   * Usa update() para modificar el signal de forma inmutable
   * @param user Usuario a añadir
   */
  add(user: UserViewModel): void {
    this._users.update(current => [...current, user]);
  }

  /**
   * Actualiza un usuario en la lista
   * @param user Usuario actualizado
   */
  update(user: UserViewModel): void {
    this._users.update(current =>
      current.map(u => (u.id === user.id ? user : u))
    );
  }

  /**
   * Elimina un usuario de la lista
   * @param id ID del usuario a eliminar
   */
  remove(id: string): void {
    this._users.update(current =>
      current.filter(u => u.id !== id)
    );
  }

  /**
   * Reemplaza toda la lista de usuarios
   * @param users Nueva lista de usuarios
   */
  setUsers(users: UserViewModel[]): void {
    this._users.set(users);
  }

  /**
   * Busca un usuario por ID
   * Devuelve un computed signal que se actualiza automáticamente
   * @param id ID del usuario
   * @returns Computed signal con el usuario o undefined
   */
  getById(id: string) {
    return computed(() => 
      this._users().find(u => u.id === id)
    );
  }

  /**
   * Busca un usuario por email
   * Devuelve un computed signal que se actualiza automáticamente
   * @param email Email del usuario
   * @returns Computed signal con el usuario o undefined
   */
  getByEmail(email: string) {
    const lowerEmail = email.toLowerCase();
    return computed(() => 
      this._users().find(u => u.email.toLowerCase() === lowerEmail)
    );
  }

  /**
   * Busca usuarios por término
   * Devuelve un computed signal que se actualiza automáticamente
   * @param searchTerm Término de búsqueda
   * @returns Computed signal con los usuarios filtrados
   */
  search(searchTerm: string) {
    return computed(() => {
      const term = searchTerm.toLowerCase().trim();
      if (!term) {
        return this._users();
      }

      return this._users().filter(u =>
        u.name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        u.phone?.toLowerCase().includes(term)
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
   * No reactivo - usa users() si necesitas reactividad
   */
  getCurrentUsers(): UserViewModel[] {
    return this._users();
  }

  /**
   * Verifica si un usuario existe por ID
   * @param id ID del usuario
   */
  exists(id: string): boolean {
    return this._users().some(u => u.id === id);
  }

  /**
   * Verifica si un usuario existe por email
   * @param email Email del usuario
   */
  existsByEmail(email: string): boolean {
    const lowerEmail = email.toLowerCase();
    return this._users().some(u => u.email.toLowerCase() === lowerEmail);
  }

  /**
   * Obtiene usuarios por rango de edad
   * @param minAge Edad mínima
   * @param maxAge Edad máxima
   * @returns Computed signal con usuarios filtrados
   */
  getByAgeRange(minAge: number, maxAge: number) {
    return computed(() =>
      this._users().filter(u => {
        if (!u.age) return false;
        return u.age >= minAge && u.age <= maxAge;
      })
    );
  }

  /**
   * Ordena usuarios por campo
   * @param field Campo por el que ordenar
   * @param order Orden ascendente o descendente
   * @returns Computed signal con usuarios ordenados
   */
  sortBy(field: keyof UserViewModel, order: 'asc' | 'desc' = 'asc') {
    return computed(() => {
      const users = [...this._users()];
      return users.sort((a, b) => {
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
   * Filtra usuarios por estado activo
   * @param active True para activos, false para inactivos
   * @returns Computed signal con usuarios filtrados
   */
  filterByActive(active: boolean) {
    return computed(() =>
      this._users().filter(u => u.active === active)
    );
  }

  /**
   * Obtiene usuarios que necesitan atención médica
   * (tienen condiciones médicas o alergias pero no tienen doctor asignado)
   * @returns Computed signal con usuarios que necesitan atención
   */
  getUsersNeedingMedicalAttention() {
    return computed(() =>
      this._users().filter(u =>
        (u.hasMedicalConditions || u.hasAllergies) && !u.hasDoctorInfo
      )
    );
  }
}
