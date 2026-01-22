import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../../shared/toast.service';
import { AuthService } from '../services/auth/auth.service';

/**
 * Interceptor de manejo global de errores HTTP
 * Intercepta todas las respuestas de error y las transforma en mensajes amigables para el usuario.
 * 
 * Mapeo de códigos de estado a mensajes:
 * - 0: Sin conexión con el servidor
 * - 401: Sesión expirada o no válida - limpia sesión y va al home
 * - 403: Sin permisos para la acción
 * - 404: Recurso no encontrado
 * - 409: Conflicto, recurso duplicado
 * - 5xx: Error interno del servidor
 * 
 * Los errores se muestran mediante ToastService y se propagan con throwError
 * para que los servicios/componentes puedan reaccionar si es necesario.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let message = 'Error inesperado. Inténtalo de nuevo más tarde.';

      if (error.status === 0) {
        // Sin conexión al servidor
        message = 'No hay conexión con el servidor. Verifica tu conexión a internet.';
      } else if (error.status === 401) {
        // Token expirado o no autenticado
        message = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
        // Limpiar sesión completamente usando AuthService (como logout)
        authService.logout();
        // Redirigir al home (/) en lugar de al login
        router.navigate(['/']);
      } else if (error.status === 403) {
        // Sin permisos
        message = 'No tienes permisos para realizar esta acción.';
      } else if (error.status === 404) {
        // Recurso no encontrado
        message = 'El recurso solicitado no existe.';
      } else if (error.status === 409) {
        // Conflicto (recurso duplicado)
        message = error.error?.message || 'El recurso ya existe o hay un conflicto.';
      } else if (error.status >= 500) {
        // Error del servidor
        message = 'Error interno del servidor. Intenta de nuevo más tarde.';
      } else if (error.error?.message) {
        // Mensaje personalizado del backend
        message = error.error.message;
      }

      toastService.error(message);
      return throwError(() => error);
    })
  );
};
