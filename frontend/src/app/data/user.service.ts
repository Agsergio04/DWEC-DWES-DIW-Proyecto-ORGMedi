import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, throwError } from 'rxjs';

export interface User {
  id: number;
  name: string;
  active: boolean;
  // otros campos opcionales
  [key: string]: any;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly baseUrl = '/api/users';

  // Estado seleccionado (ejemplo de estado simple en el servicio)
  private selectedUserIdSubject = new BehaviorSubject<number | null>(null);
  // Exponer la observable como getter público para evitar advertencias de "unused" en el archivo
  get selectedUserId$(): Observable<number | null> {
    return this.selectedUserIdSubject.asObservable();
  }

  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.baseUrl).pipe(
      map(users => Array.isArray(users) ? users.filter(u => u.active) : []),
      catchError(this.handleError)
    );
  }

  // Permite seleccionar un usuario por id; el componente puede delegar esta lógica
  selectUser(id: number | null) {
    this.selectedUserIdSubject.next(id);
  }

  private handleError(err: any) {
    // Aquí podrías mapear distintos códigos/status a mensajes locales
    console.error('UserService error', err);
    return throwError(() => new Error('Error cargando usuarios'));
  }
}
