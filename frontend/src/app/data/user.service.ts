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
import { ApiService } from '../core/services/data';
import {
  User,
  CreateUserDto,
  UpdateUserDto,
  ApiUsersListResponse,
  UserViewModel,
  UserStats
} from './models/user.model';

// Re-exportar los tipos para que otros módulos puedan importarlos desde user.service
export type { 
  User, 
  CreateUserDto, 
  UpdateUserDto, 
  ApiUsersListResponse, 
  UserViewModel, 
  UserStats 
};

/**
 * SERVICIO DE USUARIOS
 * 
 * QUE HACE:
 * Gestiona todas las operaciones con usuarios en la aplicacion.
 * Realiza llamadas a la API para obtener, crear, actualizar y eliminar usuarios.
 * Transforma datos de la API a formato ViewModel para usar en templates.
 * Maneja errores inteligentemente con reintentos automaticos.
 * Proporciona busqueda, filtrado y estadisticas de usuarios.
 * Gestiona el usuario actualmente seleccionado via BehaviorSubject.
 * 
 * CARACTERISTICAS:
 * 1. REINTENTOS AUTOMATICOS: Si falla peticion 5xx, reintenta 2 veces
 * 2. TRANSFORMACION DE DATOS: Convierte User a UserViewModel
 * 3. CALCULOS INTERNOS: Edad, textos formateados, booleanos de condiciones
 * 4. MANEJO DE ERRORES: Centralizado con contexto personalizado
 * 5. SELECCION: Un usuario puede estar "seleccionado" (for formularios, detalles)
 * 6. FILTRADO Y BUSQUEDA: Soporta multiples criterios de busqueda
 * 
 * COMO USAR:
 * ```
 * export class ListUsuariosComponent implements OnInit {
 *   userService = inject(UserService);
 *   
 *   ngOnInit() {
 *     // Obtener todos
 *     this.userService.getUsers().subscribe(users => {
 *       console.log(users);
 *     });
 *     
 *     // Buscar con filtros
 *     this.userService.searchUsers({ search: 'juan', active: true }).subscribe(results => {
 *       console.log(results.items, 'Total:', results.total);
 *     });
 *     
 *     // Obtener usuario seleccionado
 *     this.userService.selectedUser$.subscribe(user => {
 *       if (user) console.log('Seleccionado:', user.name);
 *     });
 *   }
 * }
 * ```
 */
@Injectable({ providedIn: 'root' })
export class UserService {
  // Inyectar ApiService para hacer peticiones HTTP
  private api = inject(ApiService);
  
  // BehaviorSubject para mantener el usuario actualmente seleccionado
  // Util para formularios de edicion, detalles, etc
  private selectedUserSubject = new BehaviorSubject<User | null>(null);
  
  // Observable publico para que componentes se suscriban al usuario seleccionado
  selectedUser$ = this.selectedUserSubject.asObservable();

  /**
   * getUsers() - Obtiene todos los usuarios
   * 
   * QUE HACE:
   * - Peticion GET a /api/users
   * - Reintenta 2 veces si error 5xx
   * - Transforma cada usuario a UserViewModel (formato UI)
   * - Si error, propaga el error para que componente lo maneje
   * 
   * REINTENTOS:
   * - Si error 5xx (500, 502, 503, etc): 2 reintentos con delay 500ms
   * - Si error 4xx (400, 401, etc): no reintenta, propaga error
   * 
   * RETORNA: Observable con array de usuarios transformados
   * 
   * USO:
   * this.userService.getUsers().subscribe(usuarios => {
   *   console.log(usuarios);  // UserViewModel[]
   * });
   */
  getUsers(): Observable<UserViewModel[]> {
    return this.api.get<User[]>('users').pipe(
      // REINTENTOS: Automaticos para errores de servidor (5xx)
      // retryWhen + scan permite contar cantidad de reintentos
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
      // TRANSFORMACION: Convierte User a UserViewModel
      // Agrega campos calculados como age, formattedDateOfBirth, etc
      map(users => users.map(user => this.transformUserToViewModel(user))),
      // MANEJO DE ERRORES: Centralizado con contexto
    );
  }

  /**
   * getUsersSafe() - Obtiene usuarios de forma segura (version robusta)
   * 
   * QUE HACE:
   * - Igual a getUsers() pero devuelve array vacio si falla
   * - Un solo reintento (menos agresivo)
   * - Util cuando no es critico fallar (dashboard, listas opcionales)
   * - Mejor para UX: la app no se rompe si users no cargan
   * 
   * DIFERENCIA CON getUsers():
   * - getUsers(): Propaga errores, reintenta 2 veces, mas critico
   * - getUsersSafe(): Silencioso, reintenta 1 vez, devuelve vacio
   * 
   * RETORNA: Observable<UserViewModel[]> - Array vacio si error
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
   * getUserById(id) - Obtiene un usuario especifico por ID
   * 
   * QUE HACE:
   * - Peticion GET a /api/users/:id
   * - Timeout de 10 segundos (si tarda mas, falla)
   * - Transforma resultado a UserViewModel
   * - Manejo de errores centralizado
   * 
   * PARAMETROS: id - el ID del usuario (string)
   * RETORNA: Observable con el usuario transformado
   * 
   * USO:
   * this.userService.getUserById('123').subscribe(usuario => {
   *   console.log(usuario.name);
   * });
   */
  getUserById(id: string): Observable<UserViewModel> {
    return this.api.get<User>(`users/${id}`).pipe(
      timeout(10000), // 10 segundos de timeout
      map(user => this.transformUserToViewModel(user)),
      catchError(err => this.handleError(err, `al obtener usuario ${id}`))
    );
  }

  /**
   * getUserByEmail(email) - Obtiene un usuario especifico por email
   * 
   * QUE HACE:
   * - Peticion GET a /api/users/email/:email
   * - Timeout de 10 segundos
   * - Transforma resultado a UserViewModel
   * - Manejo de errores
   * 
   * PARAMETROS: email - el email del usuario
   * RETORNA: Observable con el usuario transformado
   */
  getUserByEmail(email: string): Observable<UserViewModel> {
    return this.api.get<User>(`users/email/${email}`).pipe(
      timeout(10000),
      map(user => this.transformUserToViewModel(user)),
      catchError(err => this.handleError(err, `al buscar usuario por email ${email}`))
    );
  }

  /**
   * createUser(dto) - Crea un novo usuario
   * 
   * QUE HACE:
   * - Peticion POST a /api/users con los datos
   * - Transforma respuesta a UserViewModel
   * - Log de exito
   * - Manejo de errores
   * 
   * PARAMETROS: dto - CreateUserDto (datos para crear)
   * RETORNA: Observable con el usuario creado transformado
   * 
   * USO:
   * this.userService.createUser({ name: 'Juan', email: 'juan@email.com', ... })
   *   .subscribe(usuario => console.log('Creado:', usuario));
   */
  createUser(dto: CreateUserDto): Observable<UserViewModel> {
    return this.api.post<User>('users', dto).pipe(
      tap(result => console.log('Usuario creado:', result)),
      map(user => this.transformUserToViewModel(user)),
      catchError(err => this.handleError(err, 'al crear usuario'))
    );
  }

  /**
   * updateUser(id, dto) - Actualiza un usuario completamente (PUT)
   * 
   * QUE HACE:
   * - Peticion PUT a /api/users/:id
   * - PUT = reemplaza TODO el registro (no parcialmente)
   * - Si necesitas actualizar solo algunos campos, usa patchUser() en su lugar
   * - Transforma respuesta a UserViewModel
   * - Log y manejo de errores
   * 
   * PARAMETROS:
   * - id: ID del usuario a actualizar
   * - dto: UpdateUserDto (datos completos)
   * RETORNA: Observable con usuario actualizado
   * 
   * DIFERENCIA PUT vs PATCH:
   * - PUT: Reemplaza TODO. Envias todos los campos.
   * - PATCH: Actualiza parcialmente. Solo envias campos que cambian.
   */
  updateUser(id: string, dto: UpdateUserDto): Observable<UserViewModel> {
    return this.api.put<User>(`users/${id}`, dto).pipe(
      tap(result => console.log('Usuario actualizado:', result)),
      map(user => this.transformUserToViewModel(user)),
      catchError(err => this.handleError(err, `al actualizar usuario ${id}`))
    );
  }

  /**
   * patchUser(id, dto) - Actualiza parcialmente un usuario (PATCH)
   * 
   * QUE HACE:
   * - Peticion PATCH a /api/users/:id
   * - PATCH = actualiza SOLO los campos que envias
   * - Por ejemplo, si envias {name: 'nuevo'}, solo cambia nombre
   * - Transforma respuesta a UserViewModel
   * - Log y manejo de errores
   * 
   * PARAMETROS:
   * - id: ID del usuario
   * - dto: Objeto con solo los campos a cambiar
   * RETORNA: Observable con usuario actualizado
   */
  patchUser(id: string, dto: Partial<UpdateUserDto>): Observable<UserViewModel> {
    return this.api.patch<User>(`users/${id}`, dto).pipe(
      tap(result => console.log('Usuario actualizado parcialmente:', result)),
      map(user => this.transformUserToViewModel(user)),
      catchError(err => this.handleError(err, `al actualizar usuario ${id}`))
    );
  }

  /**
   * deleteUser(id) - Elimina un usuario
   * 
   * QUE HACE:
   * - Peticion DELETE a /api/users/:id
   * - Log de exito
   * - Manejo de errores
   * - No devuelve datos, solo confirmacion
   * 
   * PARAMETROS: id - el ID del usuario a eliminar
   * RETORNA: Observable<void> (sin datos de retorno)
   */
  deleteUser(id: string): Observable<void> {
    return this.api.delete<void>(`users/${id}`).pipe(
      tap(() => console.log(`Usuario ${id} eliminado`)),
      catchError(err => this.handleError(err, `al eliminar usuario ${id}`))
    );
  }

  /**
   * getActiveUsers() - Obtiene solo usuarios activos
   * 
   * QUE HACE:
   * - Obtiene TODOS los usuarios (llama getUsers())
   * - Filtra solo los que tienen active = true
   * - Retorna observable con usuarios activos
   * 
   * RETORNA: Observable<UserViewModel[]> - Solo usuarios activos
   */
  getActiveUsers(): Observable<UserViewModel[]> {
    return this.getUsers().pipe(
      map(users => users.filter(user => user.active))
    );
  }

  /**
   * getUserStats() - Obtiene estadisticas de usuarios
   * 
   * QUE HACE:
   * - Obtiene TODOS los usuarios
   * - Calcula conteos por estado y condiciones
   * - Perfecto para dashboard, graficos, resumenes
   * 
   * ESTRUCTURA RETORNADA:
   * {
   *   totalActive: numero de usuarios activos,
   *   totalInactive: numero de usuarios inactivos,
   *   withMedicalConditions: usuarios con condiciones medicas,
   *   withAllergies: usuarios con alergias,
   *   withDoctorInfo: usuarios con doctor asignado
   * }
   * 
   * RETORNA: Observable<UserStats> - Objeto con estadisticas
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
   * selectUser(user) - Selecciona un usuario en la UI
   * 
   * QUE HACE:
   * - Establece el usuario actualmente seleccionado
   * - Emite el cambio via selectedUser$ observable
   * - Util para formularios de edicion, detalles, etc
   * 
   * PARAMETROS: user - Usuario a seleccionar (o null para deseleccionar)
   */
  selectUser(user: User | null) {
    this.selectedUserSubject.next(user);
  }

  /**
   * getSelectedUser() - Obtiene el usuario actualmente seleccionado (snapshot)
   * 
   * QUE HACE:
   * - Retorna el valor actual del BehaviorSubject
   * - NO es reactivo (no se actualiza si cambia despues)
   * - Para reactividad, usa selectedUser$ observable en su lugar
   * 
   * RETORNA: User | null - Usuario actual o null si ninguno seleccionado
   */
  getSelectedUser(): User | null {
    return this.selectedUserSubject.value;
  }

  /**
   * searchUsers(filters) - Busca y filtra usuarios con multiples criterios
   * 
   * QUE HACE:
   * - Peticion GET a /api/users con parametros de filtrado
   * - Soporta busqueda, estado, condiciones medicas, alergias, ordenamiento
   * - Reintenta 2 veces si error 5xx
   * - Transforma usuarios a ViewModel
   * - Devuelve items + total para paginacion
   * 
   * PARAMETROS (todos opcionales):
   * - page: Numero de pagina (default 1)
   * - pageSize: Items por pagina (default 10)
   * - search: Termino de busqueda en nombre/email
   * - active: true/false filtra por estado
   * - hasMedicalConditions: true/false filtra por condiciones
   * - hasAllergies: true/false filtra por alergias
   * - sortBy: Campo por el que ordenar (name, email, etc)
   * - sortOrder: 'asc' o 'desc'
   * 
   * EJEMPLO:
   * this.userService.searchUsers({
   *   search: 'juan',
   *   active: true,
   *   hasMedicalConditions: true,
   *   page: 1,
   *   pageSize: 20,
   *   sortBy: 'name',
   *   sortOrder: 'asc'
   * }).subscribe(response => {
   *   console.log(response.items);   // Usuarios encontrados
   *   console.log(response.total);   // Total de registros
   * });
   * 
   * RETORNA: Observable con items (usuarios) y total
   */
  searchUsers(filters: any = {}): Observable<any> {
    const params: Record<string, any> = {
      page: filters.page ?? 1,
      pageSize: filters.pageSize ?? 10
    };

    if (filters.search) {
      params['search'] = filters.search;
    }
    if (filters.active !== undefined) {
      params['active'] = filters.active;
    }
    if (filters.hasMedicalConditions !== undefined) {
      params['hasMedicalConditions'] = filters.hasMedicalConditions;
    }
    if (filters.hasAllergies !== undefined) {
      params['hasAllergies'] = filters.hasAllergies;
    }
    if (filters.sortBy) {
      params['sortBy'] = filters.sortBy;
    }
    if (filters.sortOrder) {
      params['sortOrder'] = filters.sortOrder;
    }

    return this.api.getWithParams<any>('users', params).pipe(
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
      // TRANSFORMACION: Convierte usuarios a ViewModel
      // Retorna estructura con items transformados + total para paginacion
      map((response: any) => ({
        items: response.items.map((user: any) => this.transformUserToViewModel(user)),
        total: response.total
      })),
      catchError(err => this.handleError(err, 'al buscar usuarios'))
    );
  }

  /**
   * getUsersByAgeRange(minAge, maxAge) - Obtiene usuarios en rango de edad
   * 
   * QUE HACE:
   * - Peticion GET a /api/users con parametros minAge y maxAge
   * - Retorna usuarios con edad dentro del rango especificado
   * - Transforma usuarios a ViewModel
   * - Manejo de errores
   * 
   * PARAMETROS:
   * - minAge: Edad minima (ej: 18)
   * - maxAge: Edad maxima (ej: 65)
   * 
   * EJEMPLO:
   * // Obtener usuarios mayores de edad
   * this.userService.getUsersByAgeRange(18, 65).subscribe(usuarios => {
   *   console.log(usuarios);  // Usuarios entre 18 y 65 anos
   * });
   * 
   * RETORNA: Observable<UserViewModel[]> - Usuarios en el rango
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
   * ============ METODOS PRIVADOS (UTILIDADES INTERNAS) ============
   * Los componentes NO deben llamarlos. Se usan internamente para:
   * - Transformar datos de API a formato ViewModel para templates
   * - Calcular campos derivados
   * - Manejo centralizado de errores
   */

  /**
   * transformUserToViewModel(user) - Transforma UN usuario
   * 
   * QUE HACE:
   * - Recibe User (objeto de API)
   * - Agrega campos calculados para la UI
   * - Calcula age a partir de fecha de nacimiento
   * - Formatea fechas a strings legibles en espanol
   * - Convierte arrays de condiciones a textos
   * - Calcula booleanos para condiciones/alergias/doctor
   * - RETORNA UserViewModel (listo para UI)
   * 
   * CAMPOS AGREGADOS:
   * - age: Number, edad calculada
   * - formattedDateOfBirth: String con fecha nacimiento legible
   * - formattedCreatedAt: String con fecha creacion legible
   * - hasMedicalConditions: Boolean, true si tiene condiciones
   * - hasAllergies: Boolean, true si tiene alergias
   * - hasDoctorInfo: Boolean, true si tiene doctor asignado
   * - displayName: Texto para mostrar (nombre o email)
   * - medicalConditionsText: String con condiciones separadas por comas
   * - allergiesText: String con alergias separadas por comas
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
   * calculateAge(dateOfBirth) - Calcula la edad a partir de fecha de nacimiento
   * 
   * QUE HACE:
   * - Recibe fecha de nacimiento como string
   * - Calcula anos entre fecha nacimiento y hoy
   * - Considera mes y dia para ajustes correctos
   * - RETORNA: Numero de anos cumplidos
   * 
   * NOTA: Se usa internamente en transformUserToViewModel
   * 
   * EJEMPLO INTERNO:
   * const age = this.calculateAge('1995-03-15');  // Retorna edad actual
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
   * handleError(error, context) - Manejo centralizado de errores HTTP
   * 
   * QUE HACE:
   * - Recibe un error (HttpErrorResponse u otro tipo)
   * - Analiza el tipo de error y crea mensaje personalizado
   * - Log del error en consola
   * - RETORNA observable que lanza el error con mensaje usuario
   * 
   * CASOS CUBIERTOS:
   * - Error de red (status 0): Verifica tu conexion
   * - 404: Usuario no encontrado
   * - 5xx: Error del servidor, intenta mas tarde
   * - Otros 4xx: Usa mensaje del servidor si existe
   * - Otros errores: Mensaje generico
   * 
   * PARAMETROS:
   * - error: El objeto de error capturado
   * - context: Texto describiendo que operacion fallaba
   *           (ej: 'al cargar usuarios', para logs mas claros)
   * 
   * RETORNA: Observable<never> que lanza error con mensaje usuario
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
    
    return throwError(() => new Error(userMessage));
  }
}

