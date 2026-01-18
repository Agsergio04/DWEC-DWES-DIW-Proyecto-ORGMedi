import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { tap, catchError, map } from 'rxjs/operators';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
}

export interface AuthRequest {
  correo: string;
  contrasena: string;
}

export interface AuthResponse {
  token: string;
}

/**
 * Servicio de autenticación
 * Gestiona el estado de login/logout del usuario y comunica con la API
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/api/auth';
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
   * Envía email/contraseña y recibe JWT en la respuesta
   */
  login(email: string, password: string): Observable<boolean> {
    const request: AuthRequest = {
      correo: email,
      contrasena: password
    };

    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, request).pipe(
      tap((response) => {
        this.setToken(response.token);
        const user: AuthUser = {
          id: 1,
          name: email,
          email: email
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
    const request = {
      correo: email,
      usuario: username,
      contrasena: password
    };

    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, request).pipe(
      tap((response) => {
        this.setToken(response.token);
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
   */
  logout(): void {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
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
}
