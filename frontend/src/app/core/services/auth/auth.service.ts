import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { ApiService } from '../data/api.service';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
}

export interface AuthRequest {
  usuario: string;
  contrasena: string;
}

export interface AuthResponse {
  token: string;
}

export interface ChangePasswordRequest {
  correoActual: string;
  contrasenaActual: string;
  contrasenanueva: string;
}

/**
 * Servicio de autenticación
 * Gestiona el estado de login/logout del usuario y comunica con la API
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = inject(ApiService);
  private readonly baseUrl = 'auth';
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.checkStoredAuth());
  private currentUserSubject = new BehaviorSubject<AuthUser | null>(this.getStoredUser());

  // Observables públicas para suscribirse a cambios
  isLoggedIn$ = this.isLoggedInSubject.asObservable();
  currentUser$ = this.currentUserSubject.asObservable();

  constructor() {}

  /**
   * Obtener el estado actual de autenticación
   */
  get isLoggedIn(): boolean {
    return this.isLoggedInSubject.value;
  }

  /**
   * Obtener el usuario actual
   */
  get currentUser(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  /**
   * Obtener el token JWT guardado en localStorage
   */
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('authToken');
  }

  /**
   * Guardar el token JWT en localStorage
   */
  setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token);
    }
  }

  /**
   * Realizar login en el backend
   * Envía usuario/contraseña y recibe JWT en la respuesta
   */
  login(username: string, password: string): Observable<boolean> {
    // Limpiar cualquier sesión anterior
    this.logout();
    
    const request: AuthRequest = {
      usuario: username,
      contrasena: password
    };

    return this.api.post<any>(`${this.baseUrl}/login`, request, {
      responseType: 'json' as const
    }).pipe(
      tap((response) => {
        // Manejar respuesta vacía o sin token
        if (!response || (typeof response === 'object' && Object.keys(response).length === 0)) {
          console.error('[AuthService] ⚠️  Response vacía en login:', response);
          throw new Error('Servidor respondió sin token. Verifica que el backend está actualizado.');
        }
        
        const token = response?.token || response?.['token'];
        if (!token) {
          throw new Error('Invalid login response: missing token. Response: ' + JSON.stringify(response));
        }
        this.setToken(token);
        const user: AuthUser = {
          id: 1,
          name: username,
          email: username
        };
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.isLoggedInSubject.next(true);
        this.currentUserSubject.next(user);
      }),
      map(() => true),
      catchError(err => {
        console.error('Error en login:', err);
        return throwError(() => err);
      })
    );
  }

  /**
   * Realizar registro en el backend
   * Envía email/usuario/contraseña y recibe JWT en la respuesta
   */
  register(email: string, username: string, password: string): Observable<boolean> {
    // Limpiar cualquier sesión anterior
    this.logout();
    
    const request = {
      correo: email,
      usuario: username,
      contrasena: password
    };

    return this.api.post<any>(`${this.baseUrl}/register`, request, {
      headers: { 'Content-Type': 'application/json' },
      responseType: 'json' as const
    }).pipe(
      tap((response) => {
        // La respuesta puede llegar como null, string vacío, o un objeto
        // Si es null, el servidor está enviando una respuesta sin cuerpo
        if (!response || (typeof response === 'object' && Object.keys(response).length === 0)) {
          console.error('[AuthService] ⚠️  Response vacía. El servidor respondió pero sin token:', response);
          throw new Error('Servidor respondió sin token en el cuerpo. Verifica que la versión del backend tiene las fixes.');
        }
        
        // Extraer token - puede venir como response.token o directamente como token
        let token: string | null = null;
        
        if (typeof response === 'object' && response !== null) {
          token = response.token || response['token'];
        }
        
        if (!token) {
          console.error('[AuthService] ❌ No se encontró token en la respuesta:', response);
          throw new Error('La respuesta del servidor no contiene token. Response: ' + JSON.stringify(response));
        }
        this.setToken(token);
        
        const user: AuthUser = {
          id: 1,
          name: username,
          email: email
        };
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.isLoggedInSubject.next(true);
        this.currentUserSubject.next(user);
      }),
      map(() => true),
      catchError(err => {
        console.error('Error en registro:', err);
        return throwError(() => err);
      })
    );
  }

  /**
   * Cerrar sesión
   * Borra el token JWT y todos los datos de sesión del localStorage
   */
  logout(): void {
    // Limpiar todos los datos de autenticación del localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('currentUser');
      
      // Limpiar cualquier otra data de sesión que pudiera estar guardada
      const keysToRemove = Object.keys(localStorage).filter(key => 
        key.includes('auth') || key.includes('token') || key.includes('user')
      );
      
      keysToRemove.forEach(key => {
        if (!['authToken', 'isLoggedIn', 'currentUser'].includes(key)) {
          localStorage.removeItem(key);
        }
      });
    }
    
    // Actualizar los estados observables
    this.isLoggedInSubject.next(false);
    this.currentUserSubject.next(null);
  }

  /**
   * Verificar si hay autenticación guardada en localStorage
   */
  private checkStoredAuth(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('isLoggedIn') === 'true';
  }

  /**
   * Obtener usuario guardado en localStorage
   */
  private getStoredUser(): AuthUser | null {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem('currentUser');
    return stored ? JSON.parse(stored) : null;
  }

  /**
   * Obtener el usuario actual del backend
   * Devuelve los datos reales del usuario autenticado
   */
  getCurrentUser(): Observable<AuthUser> {
    return this.api.get<AuthUser>(`${this.baseUrl}/me`).pipe(
      tap((user) => {
        // Manejar respuestas vacías del servidor
        if (!user || !user.id) {
          // Usar datos del localStorage si existen
          const storedUser = this.getStoredUser();
          if (storedUser) {
            this.currentUserSubject.next(storedUser);
          }
          return;
        }

        // Actualizar localStorage con datos del servidor
        const authUser: AuthUser = {
          id: user.id,
          name: user.name,
          email: user.email
        };
        localStorage.setItem('currentUser', JSON.stringify(authUser));
        this.currentUserSubject.next(authUser);
      }),
      catchError(err => {
        console.error('Error fetching current user:', err);
        // En caso de error, intentar usar datos almacenados
        const storedUser = this.getStoredUser();
        if (storedUser) {
          this.currentUserSubject.next(storedUser);
          return of(storedUser);
        }
        return throwError(() => err);
      })
    );
  }

  /**
   * Actualizar nombre de usuario
   * Envía el nuevo nombre de usuario al backend
   */
  updateUsername(newUsername: string): Observable<boolean> {
    const currentUser = this.currentUser;
    if (!currentUser) {
      return throwError(() => new Error('No user logged in'));
    }
    const request = {
      usuario: newUsername,
      correo: currentUser.email,
      contrasena: '' // Campo requerido por la API pero no se actualiza
    };

    return this.api.put<any>(`usuarios/${currentUser.id}`, request).pipe(
      tap((response) => {
        // Actualizar usuario en localStorage
        const updatedUser: AuthUser = {
          ...currentUser,
          name: newUsername
        };
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        this.currentUserSubject.next(updatedUser);
      }),
      map(() => true),
      catchError(err => {
        console.error('Error updating username:', err);
        return throwError(() => err);
      })
    );
  }

  /**
   * Cambiar contraseña
   * Valida la contraseña actual antes de permitir el cambio
   */
  changePassword(currentPassword: string, newPassword: string): Observable<boolean> {
    const currentUser = this.currentUser;
    if (!currentUser) {
      return throwError(() => new Error('No user logged in'));
    }

    const request = {
      correoActual: currentUser.email,
      contrasenaActual: currentPassword,
      contrasenanueva: newPassword
    };

    return this.api.post<any>(`${this.baseUrl}/change-password`, request).pipe(
      tap((response) => {
      }),
      map(() => true),
      catchError(err => {
        console.error('Error changing password:', err);
        return throwError(() => err);
      })
    );
  }
}
