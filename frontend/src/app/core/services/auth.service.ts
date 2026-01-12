import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
}

/**
 * Servicio de autenticación
 * Gestiona el estado de login/logout del usuario
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
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
   * Simular login
   * En una app real, esto llamaría a un API
   */
  login(email: string, password: string): Observable<boolean> {
    return new Observable(observer => {
      // Simular llamada a API con delay
      setTimeout(() => {
        const user: AuthUser = {
          id: 1,
          name: 'Usuario Demo',
          email: email
        };

        // Guardar en localStorage
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('currentUser', JSON.stringify(user));

        // Actualizar subjects
        this.isLoggedInSubject.next(true);
        this.currentUserSubject.next(user);

        observer.next(true);
        observer.complete();
      }, 500);
    });
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
