import { Injectable, inject, signal, computed } from '@angular/core';
import { UserService } from '../user.service';
import { UserViewModel } from '../models/user.model';

/**
 * STORE REACTIVO DE USUARIOS CON ANGULAR SIGNALS
 * 
 * QUE HACE:
 * Gestiona el estado global de usuarios de la aplicacion usando Angular Signals.
 * Signals es la nueva forma reactiva de Angular (mas moderna que BehaviorSubject).
 * Se encarga de cargar, actualizar y filtrar la lista de usuarios.
 * Calcula automaticamente estadisticas como edad promedio, recuentos por estado, etc.
 * 
 * VENTAJAS DE SIGNALS VS BEHAVIORSUBJECT:
 * - No necesitas .asObservable() ni async pipe
 * - Mas rapido: Angular sabe exactamente que cambio
 * - API mas simple: solo llamas la signal como funcion ()
 * - No hay riesgo de memory leaks (no hay suscripciones que olvidar)
 * 
 * COMO SE USA EN COMPONENTES:
 * ```
 * export class ListUsuariosComponent {
 *   store = inject(UserStoreSignals);
 *   
 *   // Acceso directo a signals (reactive):
 *   users = this.store.users;      // Signal de la lista
 *   loading = this.store.loading;  // Signal booleano
 *   stats = this.store.stats;      // Computed con estadisticas
 *   
 *   // En el template:
 *   // - Llamas sin async pipe:
 *   <div *ngIf="loading()">Cargando...</div>
 *   <p>Total usuarios: {{ stats().total }}</p>
 *   <p>Edad promedio: {{ stats().averageAge }}</p>
 *   <ul>
 *     <li *ngFor="let user of users()">{{ user.name }}</li>
 *   </ul>
 * }
 * ```
 * 
 * FLUJO INTERNO:
 * 1. Constructor autollamada load()
 * 2. load() obtiene usuarios de API via UserService
 * 3. _users signal se actualiza automaticamente
 * 4. Todos los computed signals que dependen de _users se recalculan
 * 5. El template detecta el cambio (change detection)
 * 6. Angular redibuja solo lo que cambio
 * 
 * COMO FUNCIONAN LOS SIGNALS:
 * - Signal privado: _users, _loading, _error (escritura interna)
 * - Signal publico: users, loading, error (solo lectura desde fuera)
 * - Computed: totalCount, stats, etc. (se recalculan cuando sus dependencias cambian)
 * 
 * OPERACIONES PRINCIPALES:
 * - load(): obtiene usuarios de la API
 * - add(user): aniade un usuario a la lista
 * - update(user): actualiza un usuario existente
 * - remove(id): elimina un usuario
 * - search(term): busca usuarios por nombre/email/telefono
 * - filterByActive(bool): filtra por estado activo/inactivo
 * - sortBy(field): ordena por campo especifico
 */
@Injectable({ providedIn: 'root' })
export class UserStoreSignals {
  private userService = inject(UserService);

  // SIGNALS PRIVATE (solo modificables internamente)
  // Estos son los datos reales que se modifican cuando ocurren cambios
  private _users = signal<UserViewModel[]>([]);
  private _loading = signal<boolean>(false);
  private _error = signal<string | null>(null);

  // SIGNALS PUBLIC (solo lectura desde los componentes)
  // asReadonly() evita que el exterior modifique directamente
  users = this._users.asReadonly();           // Lista de usuarios
  loading = this._loading.asReadonly();       // true mientras se carga de API
  error = this._error.asReadonly();           // Mensaje de error o null

  // CONTADORES COMPUTADOS
  // Estos se recalculan automaticamente cuando _users cambia
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

  // USUARIOS FILTRADOS (computed)
  // Listas pre-filtradas que se actualizan solas
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

  // ESTADISTICAS AGREGADAS (computed)
  // Calcula metricas sobre los usuarios: edad promedio, conteos, etc.
  stats = computed(() => {
    const users = this._users();
    // Filtra usuarios que tienen edad definida
    const usersWithAge = users.filter(u => u.age !== undefined && u.age !== null);
    // Calcula edad promedio (o null si no hay usuarios con edad)
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

  // ESTADO COMBINADO (computed)
  // Agrega toda la informacion en un unico computed signal
  // Utiles en templates para verificar varias condiciones a la vez
  state = computed(() => ({
    users: this._users(),
    loading: this._loading(),
    error: this._error(),
    isEmpty: this._users().length === 0,
    hasError: this._error() !== null,
    isReady: !this._loading() && this._error() === null
  }));

  constructor() {
    // Carga inicial automatica al inyectar el store
    this.load();
  }

  /**
   * load() - Carga todos los usuarios desde la API
   * 
   * QUE HACE:
   * - Marca loading = true (mostrar spinner de carga)
   * - Limpia errores previos
   * - Llama a UserService.getUsers() para obtener datos
   * - Actualiza _users signal con la respuesta
   * - Si hay error, lo guarda en _error signal
   * - Marca loading = false cuando termina
   * 
   * TODO LOS SIGNALS COMPUTADOS DEPENDIENTES SE ACTUALIZAN AUTOMATICAMENTE
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
   * add(user) - Anade un usuario a la lista local
   * 
   * QUE HACE:
   * - Toma un usuario nuevo
   * - Lo aniade al final de la lista actual usando update()
   * - NO hace llamada a API, es solo local
   * - Los computed signals se actualizan automaticamente
   * 
   * NOTA: update() es mejor que set() porque mantiene usuarios previos
   */
  add(user: UserViewModel): void {
    this._users.update(current => [...current, user]);
  }

  /**
   * update(user) - Actualiza un usuario existente en la lista
   * 
   * QUE HACE:
   * - Busca usuario con id igual
   * - Reemplaza ese usuario con la version actualizada
   * - Mantiene el resto de usuarios sin cambios
   * - Los computed signals se actualizan automaticamente
   * 
   * USO: Cuando editas un usuario, llamas esto para reflejar cambios en el store
   */
  update(user: UserViewModel): void {
    this._users.update(current =>
      current.map(u => (u.id === user.id ? user : u))
    );
  }

  /**
   * remove(id) - Elimina un usuario de la lista
   * 
   * QUE HACE:
   * - Busca usuario por ID
   * - Lo quita de la lista (filter)
   * - Mantiene todos los otros usuarios
   * 
   * USO: Cuando eliminas un usuario, reflejas ese cambio localmente
   */
  remove(id: string): void {
    this._users.update(current =>
      current.filter(u => u.id !== id)
    );
  }

  /**
   * setUsers(users) - Reemplaza TODA la lista de usuarios
   * 
   * QUE HACE:
   * - Descarta la lista actual completamente
   * - Asigna una nueva lista (util para resetear datos)
   * - Menos frecuente que add/update/remove
   * - set() es mas directo que update() cuando quieres reemplazar todo
   */
  setUsers(users: UserViewModel[]): void {
    this._users.set(users);
  }

  /**
   * getById(id) - Busca un usuario por ID
   * 
   * QUE HACE:
   * - Devuelve un computed signal (no es un valor fijo)
   * - El computed se recalcula cuando la lista cambia
   * - Ideal para acceder a un usuario especifico en el template
   * - Devuelve undefined si no existe
   * 
   * RETORNA: Computed signal con el usuario o undefined
   * 
   * EJEMPLO:
   * user$ = this.store.getById('123');
   * <p>{{ user$().name }}</p>  // En template
   */
  getById(id: string) {
    return computed(() => 
      this._users().find(u => u.id === id)
    );
  }

  /**
   * getByEmail(email) - Busca un usuario por email
   * 
   * QUE HACE:
   * - Case-insensitive (ignora mayusculas/minusculas)
   * - Devuelve computed signal para reactividad
   * - Utiles para validar si un email ya existe
   * 
   * NOTA: Busqueda sin sensibilidad a mayusculas para flexibilidad
   */
  getByEmail(email: string) {
    const lowerEmail = email.toLowerCase();
    return computed(() => 
      this._users().find(u => u.email.toLowerCase() === lowerEmail)
    );
  }

  /**
   * search(searchTerm) - Busca usuarios por nombre/email/telefono
   * 
   * QUE HACE:
   * - Recibe un termino de busqueda
   * - Busca en nombre, email, telefono del usuario
   * - Case-insensitive (no importan mayusculas)
   * - Si el termino esta vacio, devuelve todos
   * - Devuelve computed signal (reactivo)
   * 
   * EJEMPLO:
   * results$ = this.store.search('juan');
   * // Devuelve todos los usuarios que tengan 'juan' en nombre/email/telefono
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
   * clearError() - Limpia el mensaje de error actual
   * 
   * QUE HACE:
   * - Establece _error signal a null
   * - Util para desaparecer mensajes de error despues de mostrarlos
   */
  clearError(): void {
    this._error.set(null);
  }

  /**
   * getCurrentUsers() - Obtiene la lista actual de usuarios (sincrono)
   * 
   * QUE HACE:
   * - Devuelve el valor actual llamando users()
   * - NO es reactivo (no se actualiza si la lista cambia despues)
   * - Util cuando necesitas el valor puntual, no observable
   * 
   * DIFERENCIA:
   * - this.store.users() en template = reactivo
   * - this.store.getCurrentUsers() en .ts = snapshot actual
   */
  getCurrentUsers(): UserViewModel[] {
    return this._users();
  }

  /**
   * exists(id) - Verifica si un usuario existe por ID
   * 
   * QUE HACE:
   * - Devuelve true/false (booleano, no signal)
   * - Util para validaciones rapidas
   * - Busqueda simple con some()
   * 
   * EJEMPLO:
   * if (this.store.exists('123')) { ... }
   */
  exists(id: string): boolean {
    return this._users().some(u => u.id === id);
  }

  /**
   * existsByEmail(email) - Verifica si un usuario existe por email
   * 
   * QUE HACE:
   * - Case-insensitive
   * - Devuelve true/false
   * - Util para validar que email no este duplicado
   */
  existsByEmail(email: string): boolean {
    const lowerEmail = email.toLowerCase();
    return this._users().some(u => u.email.toLowerCase() === lowerEmail);
  }

  /**
   * getByAgeRange(minAge, maxAge) - Obtiene usuarios en rango de edad
   * 
   * QUE HACE:
   * - Filtra usuarios con edad >= minAge y <= maxAge
   * - Ignora usuarios sin edad definida
   * - Devuelve computed signal (reactivo)
   * 
   * EJEMPLO:
   * adultos$ = this.store.getByAgeRange(18, 65);
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
   * sortBy(field, order) - Ordena usuarios por un campo especifico
   * 
   * QUE HACE:
   * - Ordena por nombre, edad, email, etc
   * - order: 'asc' = ascendente, 'desc' = descendente
   * - Devuelve computed signal (reactivo)
   * - Maneja campos undefined/null correctamente
   * 
   * EJEMPLO:
   * porEdad$ = this.store.sortBy('age', 'asc');    // menor a mayor edad
   * porNombre$ = this.store.sortBy('name', 'desc'); // Z a A
   * 
   * NOTA: Crea copia con [...usuarios] para no modificar original
   */
  sortBy(field: keyof UserViewModel, order: 'asc' | 'desc' = 'asc') {
    return computed(() => {
      // Copia la lista para no modificar el signal original
      const users = [...this._users()];
      return users.sort((a, b) => {
        const aVal = a[field];
        const bVal = b[field];
        
        // Undefined/null van al final
        if (aVal === undefined || aVal === null) return 1;
        if (bVal === undefined || bVal === null) return -1;
        
        // Compara comun: -1 si a < b, 1 si a > b, 0 si igual
        const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        // Si es descendente, invierte el resultado
        return order === 'asc' ? comparison : -comparison;
      });
    });
  }

  /**
   * filterByActive(active) - Filtra usuarios por estado (activo/inactivo)
   * 
   * QUE HACE:
   * - Si active=true: devuelve solo usuarios activos
   * - Si active=false: devuelve solo usuarios inactivos
   * - Devuelve computed signal (reactivo)
   * 
   * EJEMPLO:
   * activos$ = this.store.filterByActive(true);
   * inactivos$ = this.store.filterByActive(false);
   */
  filterByActive(active: boolean) {
    return computed(() =>
      this._users().filter(u => u.active === active)
    );
  }

  /**
   * getUsersNeedingMedicalAttention() - Usuarios que necesitan atencion medica
   * 
   * QUE HACE:
   * - Filtra usuarios que:
   *   - Tienen condiciones medicas O alergias
   *   - Y NO tienen doctor asignado
   * - Casos de uso:
   *   - Mostrar lista de seguimiento
   *   - Alertas de atenciones pendientes
   *   - Reportes de pacientes sin medico
   * - Devuelve computed signal (reactivo)
   */
  getUsersNeedingMedicalAttention() {
    return computed(() =>
      this._users().filter(u =>
        (u.hasMedicalConditions || u.hasAllergies) && !u.hasDoctorInfo
      )
    );
  }
}
