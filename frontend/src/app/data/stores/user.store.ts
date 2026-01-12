import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { UserService } from '../user.service';
import { UserViewModel } from '../models/user.model';

/**
 * Store reactivo para usuarios
 * Mantiene la lista de usuarios en memoria y expone observables para actualización dinámica sin recargas.
 * Todos los componentes que se suscriban a users$ recibirán actualizaciones automáticas.
 */
@Injectable({ providedIn: 'root' })
export class UserStore {
  private userService = inject(UserService);

  // Estado interno con BehaviorSubject
  private usersSubject = new BehaviorSubject<UserViewModel[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);

  // Observables públicos
  users$ = this.usersSubject.asObservable();
  loading$ = this.loadingSubject.asObservable();
  error$ = this.errorSubject.asObservable();

  // Contadores y estadísticas derivados (se recalculan automáticamente)
  totalCount$ = this.users$.pipe(
    map(users => users.length)
  );

  activeCount$ = this.users$.pipe(
    map(users => users.filter(u => u.active).length)
  );

  inactiveCount$ = this.users$.pipe(
    map(users => users.filter(u => !u.active).length)
  );

  withMedicalConditionsCount$ = this.users$.pipe(
    map(users => users.filter(u => u.hasMedicalConditions).length)
  );

  withAllergiesCount$ = this.users$.pipe(
    map(users => users.filter(u => u.hasAllergies).length)
  );

  withDoctorInfoCount$ = this.users$.pipe(
    map(users => users.filter(u => u.hasDoctorInfo).length)
  );

  // Usuarios por estado
  activeUsers$ = this.users$.pipe(
    map(users => users.filter(u => u.active))
  );

  inactiveUsers$ = this.users$.pipe(
    map(users => users.filter(u => !u.active))
  );

  usersWithMedicalConditions$ = this.users$.pipe(
    map(users => users.filter(u => u.hasMedicalConditions))
  );

  usersWithAllergies$ = this.users$.pipe(
    map(users => users.filter(u => u.hasAllergies))
  );

  // Estadísticas agregadas
  stats$ = this.users$.pipe(
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
    // Carga inicial automática
    this.refresh();
  }

  /**
   * Recarga todos los usuarios desde la API
   * Actualiza automáticamente todos los observables suscritos
   */
  refresh(): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    this.userService.getUsers().pipe(
      tap(users => {
        this.usersSubject.next(users);
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        this.errorSubject.next('Error al cargar usuarios');
        this.loadingSubject.next(false);
        throw error;
      })
    ).subscribe();
  }

  /**
   * Añade un usuario a la lista local sin recargar desde API
   * Útil después de crear un usuario para actualizar la UI inmediatamente
   * @param user Usuario a añadir
   */
  add(user: UserViewModel): void {
    const current = this.usersSubject.value;
    this.usersSubject.next([...current, user]);
  }

  /**
   * Actualiza un usuario en la lista local
   * Útil después de editar para actualizar la UI sin recargar
   * @param user Usuario actualizado
   */
  update(user: UserViewModel): void {
    const current = this.usersSubject.value;
    this.usersSubject.next(
      current.map(u => (u.id === user.id ? user : u))
    );
  }

  /**
   * Elimina un usuario de la lista local
   * Útil después de eliminar para actualizar la UI sin recargar
   * @param id ID del usuario a eliminar
   */
  remove(id: string): void {
    const current = this.usersSubject.value;
    this.usersSubject.next(current.filter(u => u.id !== id));
  }

  /**
   * Obtiene un usuario por ID desde la lista en memoria
   * Evita petición HTTP si el usuario ya está en el store
   * @param id ID del usuario
   * @returns Observable<UserViewModel | undefined>
   */
  getById(id: string): Observable<UserViewModel | undefined> {
    return this.users$.pipe(
      map(users => users.find(u => u.id === id))
    );
  }

  /**
   * Obtiene un usuario por email desde la lista en memoria
   * @param email Email del usuario
   * @returns Observable<UserViewModel | undefined>
   */
  getByEmail(email: string): Observable<UserViewModel | undefined> {
    const lowerEmail = email.toLowerCase();
    return this.users$.pipe(
      map(users => users.find(u => u.email.toLowerCase() === lowerEmail))
    );
  }

  /**
   * Busca usuarios por nombre o email (búsqueda local sin API)
   * @param searchTerm Término de búsqueda
   * @returns Observable<UserViewModel[]>
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
   * Limpia el error actual
   */
  clearError(): void {
    this.errorSubject.next(null);
  }

  /**
   * Obtiene el valor actual de la lista sin suscripción
   * Útil para operaciones síncronas
   */
  getCurrentUsers(): UserViewModel[] {
    return this.usersSubject.value;
  }

  /**
   * Verifica si un usuario existe por ID
   * @param id ID del usuario
   */
  exists(id: string): boolean {
    return this.usersSubject.value.some(u => u.id === id);
  }

  /**
   * Verifica si un usuario existe por email
   * @param email Email del usuario
   */
  existsByEmail(email: string): boolean {
    const lowerEmail = email.toLowerCase();
    return this.usersSubject.value.some(u => u.email.toLowerCase() === lowerEmail);
  }

  /**
   * Calcula la edad promedio de los usuarios
   * @param users Lista de usuarios
   */
  private calculateAverageAge(users: UserViewModel[]): number | null {
    const usersWithAge = users.filter(u => u.age !== undefined && u.age !== null);
    if (usersWithAge.length === 0) return null;

    const totalAge = usersWithAge.reduce((sum, u) => sum + (u.age ?? 0), 0);
    return Math.round(totalAge / usersWithAge.length);
  }
}
