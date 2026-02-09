import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { UserService } from '../user.service';
import { UserViewModel } from '../models/user.model';

/**
 * STORE REACTIVO DE USUARIOS CON BEHAVIORSUBJECT
 * 
 * QUE HACE:
 * Gestiona el estado global de usuarios usando BehaviorSubject y RxJS.
 * BehaviorSubject es la forma "tradicional" de manejar estado reactivo en Angular.
 * Almacena usuarios en memoria y permite updates sin recargar la API.
 * Todos los observables (users$, stats$, etc) se actualizan automaticamente.
 * 
 * DIFERENCIA CON SIGNALS (ver user-signals.store.ts):
 * BEHAVIORSUBJECT (este archivo):
 * - Necesitas async pipe en templates: {{ users$ | async }}
 * - Requiere suscripciones y unsubscribe
 * - Usa RxJS operators (map, filter, etc)
 * - API un poco mas compleja
 * 
 * SIGNALS (user-signals.store.ts):
 * - Llamas directo en templates: {{ users() }}
 * - No hay suscripciones que manejar
 * - Mas rapido, cambio detection granular
 * - Mas moderno (Angular 17+)
 * 
 * FLUJO DE DATOS:
 * 1. UserService.getUsers() obtiene de la API
 * 2. El resultado va a usersSubject (BehaviorSubject privado)
 * 3. users$ (observable publico) emite el cambio
 * 4. Todos los derived observables (totalCount$, stats$, etc) se recalculan porque dependen de users$
 * 5. Los componentes suscritos con async pipe se redibujan automaticamente
 * 
 * COMO USAR EN COMPONENTES:
 * ```
 * export class ListUsuariosComponent {
 *   store = inject(UserStore);
 *   
 *   // En template:
 *   <div *ngIf="store.loading$ | async">Cargando...</div>
 *   <p>Total: {{ (store.stats$ | async)?.total }}</p>
 *   <ul>
 *     <li *ngFor="let user of store.users$ | async">{{ user.name }}</li>
 *   </ul>
 * }
 * ```
 * 
 * METODOS PRINCIPALES:
 * - refresh(): Obtiene todos los usuarios de la API
 * - add(user): Aniade un usuario localmente
 * - update(user): Actualiza un usuario localmente
 * - remove(id): Elimina un usuario localmente
 * - search(term): Busca en nombre/email/telefono
 * - getById(id): Obtiene un usuario por ID (observable)
 */
@Injectable({ providedIn: 'root' })
export class UserStore {
  private userService = inject(UserService);

  // BEHAVIORSUBJECTS PRIVADOS (estado interno, escribible internamente)
  // BehaviorSubject es como una variable que emite eventos cuando cambia
  private usersSubject = new BehaviorSubject<UserViewModel[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);

  // OBSERVABLES PUBLICOS (solo lectura desde afuera)
  // asObservable() previene que componentes externos modifiquen el estado
  users$ = this.usersSubject.asObservable();           // Lista de usuarios
  loading$ = this.loadingSubject.asObservable();       // true mientras carga API
  error$ = this.errorSubject.asObservable();           // Mensaje de error o null

  // CONTADORES DERIVADOS
  // Estos observables se recalculan automaticamente cuando users$ cambia
  // map() es un operador RxJS que transforma el valor del observable
  
  totalCount$ = this.users$.pipe(
    // Transforma lista completa en numero de usuarios
    map(users => users.length)
  );

  activeCount$ = this.users$.pipe(
    // Cuenta usuarios con active = true
    map(users => users.filter(u => u.active).length)
  );

  inactiveCount$ = this.users$.pipe(
    // Cuenta usuarios con active = false
    map(users => users.filter(u => !u.active).length)
  );

  withMedicalConditionsCount$ = this.users$.pipe(
    // Cuenta usuarios que tienen condiciones medicas
    map(users => users.filter(u => u.hasMedicalConditions).length)
  );

  withAllergiesCount$ = this.users$.pipe(
    // Cuenta usuarios que tienen alergias
    map(users => users.filter(u => u.hasAllergies).length)
  );

  withDoctorInfoCount$ = this.users$.pipe(
    // Cuenta usuarios que tienen doctor asignado
    map(users => users.filter(u => u.hasDoctorInfo).length)
  );

  // USUARIOS FILTRADOS POR ESTADO
  // Observables que devuelven sublistas pre-filtradas
  
  activeUsers$ = this.users$.pipe(
    // Lista de usuarios activos
    map(users => users.filter(u => u.active))
  );

  inactiveUsers$ = this.users$.pipe(
    // Lista de usuarios inactivos
    map(users => users.filter(u => !u.active))
  );

  usersWithMedicalConditions$ = this.users$.pipe(
    // Lista de usuarios con condiciones medicas
    map(users => users.filter(u => u.hasMedicalConditions))
  );

  usersWithAllergies$ = this.users$.pipe(
    // Lista de usuarios con alergias
    map(users => users.filter(u => u.hasAllergies))
  );

  // ESTADISTICAS AGREGADAS
  // Un observable que contiene todas las metricas de usuarios
  stats$ = this.users$.pipe(
    // Calcula multiples numeros a partir de la lista
    map(users => ({
      total: users.length,
      active: users.filter(u => u.active).length,
      inactive: users.filter(u => !u.active).length,
      withMedicalConditions: users.filter(u => u.hasMedicalConditions).length,
      withAllergies: users.filter(u => u.hasAllergies).length,
      withDoctorInfo: users.filter(u => u.hasDoctorInfo).length,
      isEmpty: users.length === 0,
      averageAge: this.calculateAverageAge(users)
    }))
  );


  constructor() {
    // Carga inicial de usuarios cuando se inyecta el store
    this.refresh();
  }

  /**
   * refresh() - Recarga todos los usuarios desde la API
   * 
   * QUE HACE:
   * - Marca loading = true (mostrar spinner)
   * - Limpia errores previos
   * - Llama a UserService.getUsers()
   * - Con tap(): actualiza usersSubject cuando llega respuesta
   * - Con catchError(): captura errores y guarda mensaje
   * - Marca loading = false cuando termina
   * 
   * TODOS LOS OBSERVABLES SUSCRITOS SE ACTUALIZAN AUTOMATICAMENTE
   * (porque dependen de users$ internamente)
   * 
   * NOTA: tap() y catchError() son operadores RxJS que interceptan el flujo
   */
  refresh(): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    this.userService.getUsers().pipe(
      // tap() ejecuta una funcion sin modificar el valor
      tap(users => {
        this.usersSubject.next(users);  // Emite el nuevo valor
        this.loadingSubject.next(false);
      }),
      // catchError() captura errores del observable
      catchError(error => {
        this.errorSubject.next('Error al cargar usuarios');
        this.loadingSubject.next(false);
        throw error;  // Re-lanza el error
      })
    ).subscribe();  // subscribe() inicia el flujo
  }

  /**
   * add(user) - Anade un usuario a la lista local
   * 
   * QUE HACE:
   * - Obtiene la lista actual con .value
   * - Crea nueva lista con spread operator [...actual, usuario]
   * - Emite la nueva lista con next()
   * - NO hace llamada a API, es solo local
   * - Util despues de crear un usuario para actualizar UI
   * 
   * TODO LOS OBSERVABLES DERIVADOS SE RECALCULAN AUTOMATICAMENTE
   * (totalCount$, stats$, activeCount$, etc)
   */
  add(user: UserViewModel): void {
    const current = this.usersSubject.value;
    this.usersSubject.next([...current, user]);
  }

  /**
   * update(user) - Actualiza un usuario existente en la lista
   * 
   * QUE HACE:
   * - Busca usuario con mismo ID
   * - Reemplaza ese usuario con la version actualizada
   * - Emite la lista modificada
   * - NO hace llamada a API, es solo local
   * - Util despues de editar para ver cambios inmediato
   * 
   * EJEMPLO:
   * const userModificado = { ...usuario, name: 'Juan Nuevo' };
   * this.store.update(userModificado);
   */
  update(user: UserViewModel): void {
    const current = this.usersSubject.value;
    this.usersSubject.next(
      current.map(u => (u.id === user.id ? user : u))
    );
  }

  /**
   * remove(id) - Elimina un usuario de la lista
   * 
   * QUE HACE:
   * - Filtra el usuario con ese ID
   * - Emite la lista sin ese usuario
   * - NO hace llamada a API, es solo local
   * - Util despues de eliminar para actualizar UI
   */
  remove(id: string): void {
    const current = this.usersSubject.value;
    this.usersSubject.next(current.filter(u => u.id !== id));
  }

  /**
   * getById(id) - Busca un usuario por ID
   * 
   * QUE HACE:
   * - Retorna un observable (no el usuario directo)
   * - Usa map() para buscar en la lista
   * - Se recalcula cuando la lista cambia
   * - Devuelve undefined si no existe
   * - NO hace llamada a API
   * 
   * EJEMPLO:
   * usuario$ = this.store.getById('123');
   * // En template: {{ (usuario$ | async)?.name }}
   */
  getById(id: string): Observable<UserViewModel | undefined> {
    return this.users$.pipe(
      map(users => users.find(u => u.id === id))
    );
  }

  /**
   * getByEmail(email) - Busca un usuario por email
   * 
   * QUE HACE:
   * - Case-insensitive (ignora mayusculas/minusculas)
   * - Retorna observable con el usuario o undefined
   * - Util para validar si email ya existe
   * - NO hace llamada a API
   */
  getByEmail(email: string): Observable<UserViewModel | undefined> {
    const lowerEmail = email.toLowerCase();
    return this.users$.pipe(
      map(users => users.find(u => u.email.toLowerCase() === lowerEmail))
    );
  }

  /**
   * search(searchTerm) - Busca usuarios por nombre/email/telefono
   * 
   * QUE HACE:
   * - Recibe un termino de busqueda (texto)
   * - Busca en nombre, email, telefono
   * - Case-insensitive
   * - Si termino esta vacio, devuelve todos
   * - Retorna observable con lista de resultados
   * - NO hace llamada a API, busca localmente
   * 
   * EJEMPLO:
   * resultados$ = this.store.search('juan');
   * // Devuelve usuarios con 'juan' en nombre/email/telefono
   */
  search(searchTerm: string): Observable<UserViewModel[]> {
    const term = searchTerm.toLowerCase().trim();
    if (!term) {
      return this.users$;
    }

    return this.users$.pipe(
      map(users =>
        users.filter(u =>
          u.name.toLowerCase().includes(term) ||
          u.email.toLowerCase().includes(term) ||
          u.phone?.toLowerCase().includes(term)
        )
      )
    );
  }

  /**
   * clearError() - Limpia el mensaje de error
   * 
   * QUE HACE:
   * - Establece error = null
   * - Util para desaparecer mensajes de error
   */
  clearError(): void {
    this.errorSubject.next(null);
  }

  /**
   * getCurrentUsers() - Obtiene la lista actual (valor puntual, no observable)
   * 
   * QUE HACE:
   * - Retorna .value del BehaviorSubject (snapshot actual)
   * - NO es reactivo (no se actualiza si la lista cambia despues)
   * - Util cuando necesitas el valor ahora, no observable
   * 
   * DIFERENCIA:
   * - this.store.users$ = observable, reactivo con async pipe
   * - this.store.getCurrentUsers() = valor directo, no reactivo
   */
  getCurrentUsers(): UserViewModel[] {
    return this.usersSubject.value;
  }

  /**
   * exists(id) - Verifica si un usuario existe por ID
   * 
   * QUE HACE:
   * - Retorna true/false booleano (no observable)
   * - Busca en la lista actual
   * - Util para validaciones rapidas
   * 
   * EJEMPLO:
   * if (this.store.exists('123')) { ... }
   */
  exists(id: string): boolean {
    return this.usersSubject.value.some(u => u.id === id);
  }

  /**
   * existsByEmail(email) - Verifica si un usuario existe por email
   * 
   * QUE HACE:
   * - Case-insensitive
   * - Retorna true/false
   * - Util para validar que email no este duplicado
   */
  existsByEmail(email: string): boolean {
    const lowerEmail = email.toLowerCase();
    return this.usersSubject.value.some(u => u.email.toLowerCase() === lowerEmail);
  }

  /**
   * calculateAverageAge(users) - Calcula edad promedio (privado)
   * 
   * QUE HACE:
   * - Filtra usuarios que tienen edad definida
   * - Suma todas las edades
   * - Divide por numero de usuarios
   * - Redondea el resultado
   * - Retorna null si no hay usuarios con edad
   * 
   * NOTA: Es privado porque lo usa stats$ internamente
   */
  private calculateAverageAge(users: UserViewModel[]): number | null {
    const usersWithAge = users.filter(u => u.age !== undefined && u.age !== null);
    if (usersWithAge.length === 0) return null;

    const totalAge = usersWithAge.reduce((sum, u) => sum + (u.age ?? 0), 0);
    return Math.round(totalAge / usersWithAge.length);
  }
}
