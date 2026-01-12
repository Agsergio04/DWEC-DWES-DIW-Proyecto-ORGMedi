import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { 
  catchError, 
  map, 
  tap, 
  retry,
  retryWhen, 
  delay, 
  scan,
  timeout
} from 'rxjs/operators';
import { ApiService } from '../core/services/api.service';
import {
  User,
  CreateUserDto,
  UpdateUserDto,
  ApiUsersListResponse,
  UserViewModel,
  UserStats
} from './models/user.model';

/**
 * Servicio de usuarios
 * Gestiona operaciones CRUD de usuarios vía HTTP con manejo de respuestas mejorado
 */
@Injectable({ providedIn: 'root' })
export class UserService {
  private api = inject(ApiService);
  private selectedUserSubject = new BehaviorSubject<User | null>(null);
  
  selectedUser$ = this.selectedUserSubject.asObservable();

  /**
   * GET /api/users
   * Obtiene lista completa de usuarios con transformación a ViewModel
   * Aplica retry en caso de errores 5xx
   * @returns Observable<UserViewModel[]>
   */
  getUsers(): Observable<UserViewModel[]> {
    return this.api.get<User[]>('users').pipe(
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
      // Transformar a ViewModel
      map(users => users.map(user => this.transformUserToViewModel(user))),
      // Manejo de errores
      catchError(err => this.handleError(err, 'al cargar usuarios'))
    );
  }

  /**
   * GET /api/users (versión segura)
   * Devuelve lista vacía en caso de error para no romper el flujo
   * @returns Observable<UserViewModel[]>
   */
  getUsersSafe(): Observable<UserViewModel[]> {
    return this.api.get<User[]>('users').pipe(
      retry(1), // Un solo reintento
      map(users => users.map(user => this.transformUserToViewModel(user))),
      catchError(() => {
        console.warn('Error al cargar usuarios, devolviendo lista vacía');
        return of([]);
      })
    );
  }

  /**
   * GET /api/users/:id
   * Obtiene un usuario específico por ID con transformación a ViewModel
   * Timeout de 10 segundos
   * @param id ID del usuario
   * @returns Observable<UserViewModel>
   */
  getUserById(id: string): Observable<UserViewModel> {
    return this.api.get<User>(`users/${id}`).pipe(
      timeout(10000), // 10 segundos de timeout
      map(user => this.transformU con transformación a ViewModel
   * @param email Email del usuario
   * @returns Observable<UserViewModel>
   */
  getUserByEmail(email: string): Observable<UserViewModel> {
    return this.api.get<User>(`users/email/${email}`).pipe(
      timeout(10000),
      map(user => this.transformUserToViewModel(user)),
      catchError(err => this.handleError(err, `al buscar usuario por email ${email}`))
    

  /**
   * GET /api/users/email/:email
   * Obtiene un usuario por email
   */
  getUserByEmail(email: st con transformación a ViewModel
   * @param dto Datos del usuario a crear
   * @returns Observable<UserViewModel>
   */
  createUser(dto: CreateUserDto): Observable<UserViewModel> {
    return this.api.post<User>('users', dto).pipe(
      tap(result => console.log('Usuario creado:', result)),
      map(user => this.transformUserToViewModel(user)),
      catchError(err => this.handleError(err, 'al crear usuario'))
    
  /**
   * POST /api/users
   * Crea un nuevo usuario
   */
  createUser(dto: CreateUserDto): Obser con transformación a ViewModel
   * @param id ID del usuario
   * @param dto Datos completos del usuario
   * @returns Observable<UserViewModel>
   */
  updateUser(id: string, dto: UpdateUserDto): Observable<UserViewModel> {
    return this.api.put<User>(`users/${id}`, dto).pipe(
      tap(result => console.log('Usuario actualizado:', result)),
      map(user => this.transformUserTo con transformación a ViewModel
   * @param id ID del usuario
   * @param dto Datos parciales del usuario
   * @returns Observable<UserViewModel>
   */
  patchUser(id: string, dto: Partial<UpdateUserDto>): Observable<UserViewModel> {
    return this.api.patch<User>(`users/${id}`, dto).pipe(
      tap(result => console.log('Usuario actualizado parcialmente:', result)),
      map(user => this.transformUserToViewModel(user)),
      catchError(err => this.handleError(err, `al actualizar usuario ${id}`))
    
   * PUT /api/users/:id
   * Actualiza completamente un usuario
   */
  updateUser(id: string con manejo de errores
   * @param id ID del usuario a eliminar
   * @returns Observable<void>
   */
  deleteUser(id: string): Observable<void> {
    return this.api.delete<void>(`users/${id}`).pipe(
      tap(() => console.log(`Usuario ${id} eliminado`)),
      catchError(err => this.handleError(err, `al eliminar usuario ${id}`))
    );
  }

  /**
   * Obtiene usuarios activos (versión con filtro)
   * @returns Observable<UserViewModel[]>
   */
  getActiveUsers(): Observable<UserViewModel[]> {
    return this.getUsers().pipe(
      map(users => users.filter(user => user.active))
    );
  }

  /**
   * Obtiene estadísticas de usuarios
   * Combina transformación de datos para dashboard
   * @returns Observable<UserStats>
   */
  getUserStats(): Observable<UserStats> {
    return this.getUsers().pipe(
      map(users => ({
        totalActive: users.filter(u => u.active).length,
        totalInactive: users.filter(u => !u.active).length,
        withMedicalConditions: users.filter(u => u.hasMedicalConditions).length,
        withAllergies: users.filter(u => u.hasAllergies).length,
        withDoctorInfo: users.filter(u => u.hasDoctorInfo).length
      }))
    );
  }

  /**
   * Selecciona un usuario en la UI
   */
  selectUser(user: User | null) {
    this.selectedUserSubject.next(user);
  }

  /**
   * Obtiene el usuario actualmente seleccionado
   */
  getSelectedUser(): User | null {
    return this.selectedUserSubject.value;
  }

  /**
   * Busca usuarios con filtros y paginación
   * GET /users?page=1&pageSize=10&search=juan&active=true
   * @param filters Objeto con filtros opcionales
   * @returns Observable<ApiUsersListResponse>
   */
  searchUsers(filters: {
    page?: number;
    pageSize?: number;
    search?: string;
    active?: boolean;
    hasMedicalConditions?: boolean;
    hasAllergies?: boolean;
    sortBy?: 'name' | 'email' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
  } = {}): Observable<{ items: UserViewModel[]; total: number }> {
    const params: Record<string, string | number | boolean> = {
      page: filters.page ?? 1,
      pageSize: filters.pageSize ?? 10
    };

    if (filters.search) params['search'] = filters.search;
    if (filters.active !== undefined) params['active'] = filters.active;
    if (filters.hasMedicalConditions !== undefined) params['hasMedicalConditions'] = filters.hasMedicalConditions;
    if (filters.hasAllergies !== undefined) params['hasAllergies'] = filters.hasAllergies;
    if (filters.sortBy) params['sortBy'] = filters.sortBy;
    if (filters.sortOrder) params['sortOrder'] = filters.sortOrder;

    return this.api.getWithParams<{ items: User[]; total: number }>('users', params).pipe(
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
      map(response => ({
        items: response.items.map(user => this.transformUserToViewModel(user)),
        total: response.total
      })),
      catchError(err => this.handleError(err, 'al buscar usuarios'))
    );
  }

  /**
   * Obtiene usuarios por rango de edad
   * GET /users?minAge=18&maxAge=65
   * @param minAge Edad mínima
   * @param maxAge Edad máxima
   * @returns Observable<UserViewModel[]>
   */
  getUsersByAgeRange(minAge: number, maxAge: number): Observable<UserViewModel[]> {
    return this.api.getWithParams<User[]>('users', {
      minAge,
      maxAge
    }).pipe(
      map(users => users.map(user => this.transformUserToViewModel(user))),
      catchError(err => this.handleError(err, `al obtener usuarios entre ${minAge} y ${maxAge} años`))
    );
  }

  /**
   * ============ MÉTODOS PRIVADOS ============
   */

  /**
   * Transforma un usuario a ViewModel
   * Agrega campos calculados para la UI
   */
  private transformUserToViewModel(user: User): UserViewModel {
    const age = user.dateOfBirth ? this.calculateAge(user.dateOfBirth) : undefined;

    return {
      ...user,
      age,
      formattedDateOfBirth: user.dateOfBirth 
        ? new Date(user.dateOfBirth).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          })
        : undefined,
      formattedCreatedAt: user.createdAt
        ? new Date(user.createdAt).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        : undefined,
      hasMedicalConditions: !!user.medicalConditions && user.medicalConditions.length > 0,
      hasAllergies: !!user.allergies && user.allergies.length > 0,
      hasDoctorInfo: !!user.doctorName || !!user.doctorContact,
      displayName: user.name || user.email,
      medicalConditionsText: user.medicalConditions?.join(', '),
      allergiesText: user.allergies?.join(', ')
    };
  }

  /**
   * Calcula la edad a partir de fecha de nacimiento
   */
  private calculateAge(dateOfBirth: string): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  /**
   * Manejo centralizado de errores
   * Registra el error y devuelve un mensaje de negocio
   */
  private handleError(error: any, context: string): Observable<never> {
    console.error(`Error ${context}:`, error);
    
    let userMessage = `Error ${context}`;
    
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        userMessage = 'Error de red. Verifica tu conexión.';
      } else if (error.status === 404) {
        userMessage = 'Usuario no encontrado.';
      } else if (error.status >= 500) {
        userMessage = 'Error del servidor. Intenta más tarde.';
      } else if (error.error?.message) {
        userMessage = error.error.message;
      }
    }
    
    return throwError(() => new Error(userMessage)){id}`);
  }

  /**
   * Selecciona un usuario en la UI
   */
  selectUser(user: User | null) {
    this.selectedUserSubject.next(user);
  }

  /**
   * Obtiene el usuario actualmente seleccionado
   */
  getSelectedUser(): User | null {
    return this.selectedUserSubject.value;
  }
}

