/**
 * INTERCEPTOR DE MANEJO GLOBAL DE ERRORES HTTP
 * ============================================
 * Intercepta todas las respuestas de ERROR HTTP y las transforma en mensajes
 * amigables al usuario. Centraliza el manejo de errores para toda la aplicación.
 * 
 * FLUJO DE UN ERROR:
 * 1. Petición HTTP falla (ej: servidor devuelve 401)
 * 2. catchError captura el error
 * 3. Se determina que tipo de error es según el status code
 * 4. Se muestra un mensaje de toast al usuario
 * 5. Se propaga el error con throwError para que servicios/componentes reaccionen
 * 
 * CÓDIGOS DE ERROR Y ACCIONES:
 * - 0 / ENOTFOUND: Sin conexión con servidor
 * - 401: No autenticado o token expirado → logout + redirige al home
 * - 403: Sin permisos para la acción
 * - 404: Recurso no encontrado
 * - 409: Conflicto / Recurso duplicado
 * - 5xx: Error interno del servidor
 * - Otros: Mensaje genérico o del backend
 * 
 * EJEMPLO DE USO:
 * Este interceptor funciona automáticamente, no necesita ser llamado.
 * La respuesta de error se captura aquí, se muestra toast, y se propaga.
 * 
 * Los componentes pueden:
 * - Ignorar el error (si lo maneja el toast)
 * - Hacer catch() adicional
 * - Mostrar UI especial para el error
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Variable para almacenar el mensaje que se mostrará al usuario
      let message = '❌ Error inesperado. Inténtalo de nuevo más tarde.';

      // 1. ERROR DE CONEXIÓN (status 0)
      if (error.status === 0) {
        message = '🚫 Sin conexión con el servidor. Verifica tu conexión a internet.';
        console.error('[ErrorInterceptor] Conexión fallida:', error);
      }
      // 2. NO AUTENTICADO O TOKEN EXPIRADO (401)
      else if (error.status === 401) {
        message = '🔐 Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
        console.warn('[ErrorInterceptor] 401 No autenticado - cerrando sesión');
        
        // Limpiar sesiones del usuario (logout completo)
        // Esto elimina el token, currentUser, isLoggedIn, etc.
        authService.logout();
        
        // Redirigir al home (/) en lugar de al login para mejor UX
        // Desde el home el usuario puede acceder al login si quiere
        router.navigate(['/']);
      }
      // 3. SIN PERMISOS (403)
      else if (error.status === 403) {
        message = '🚫 No tienes permisos para realizar esta acción.';
        console.warn('[ErrorInterceptor] 403 Acceso prohibido');
      }
      // 4. RECURSO NO ENCONTRADO (404)
      else if (error.status === 404) {
        message = '🔍 El recurso solicitado no existe.';
        console.warn('[ErrorInterceptor] 404 Recurso no encontrado');
      }
      // 5. CONFLICTO / DUPLICADO (409)
      else if (error.status === 409) {
        // Usar mensaje personalizado del backend si existe
        message = error.error?.message || '⚠️ El recurso ya existe o hay un conflicto.';
        console.warn('[ErrorInterceptor] 409 Conflicto:', error.error);
      }
      // 6. ERROR DEL SERVIDOR (5xx)
      else if (error.status >= 500) {
        message = '❌ Error interno del servidor. Intenta de nuevo más tarde.';
        console.error('[ErrorInterceptor] Error del servidor:', error.status, error.error);
      }
      // 7. MENSAJE PERSONALIZADO DEL BACKEND
      else if (error.error?.message) {
        message = error.error.message;
      }

      // Mostrar el mensaje al usuario mediante Toast (notificación)
      toastService.error(message);
      
      // Propagar el error para que servicios y componentes puedan manejarlo
      // si necesitan hacer algo adicional (ej: reintentar, limpiar estado, etc)
      return throwError(() => error);
    })
  );
};

import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../../shared/toast.service';
import { AuthService } from '../services/auth/auth.service';
