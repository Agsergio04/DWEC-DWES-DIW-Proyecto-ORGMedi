import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../auth/auth.service';

/**
 * Guard funcional para proteger rutas administrativas
 * 
 * DESCRIPCIÓN:
 * Este guard valida que un usuario tenga permisos de administrador antes de 
 * permitir el acceso a rutas protegidas. Actúa como validador de autorización
 * a nivel de ruta en Angular.
 * 
 * FUNCIONAMIENTO:
 * 1. Verifica si el usuario está autenticado (isLoggedIn)
 * 2. Si NO está autenticado:
 *    - Redirige a la página de inicio de sesión
 *    - Guarda la URL solicitada en parámetros de consulta (returnUrl)
 * 3. Si está autenticado:
 *    - Valida que el usuario tenga rol de "admin"
 *    - Actualmente retorna true (acepta el acceso)
 *    - TODO: Descomentar validación de rol cuando esté implementado
 * 
 * PARÁMETROS:
 * - route: ActivatedRouteSnapshot - Información de la ruta actual
 * - state: RouterStateSnapshot - Estado del router con la URL solicitada
 * 
 * RETORNA:
 * - boolean | UrlTree: true si acceso permitido, UrlTree si redirige
 * 
 * DEPENDENCIAS INYECTADAS:
 * - AuthService: Servicio de autenticación para verificar estado del usuario
 * - Router: Servicio de routing para redirecciones
 * 
 * USO EN RUTAS:
 * @example
 * { path: 'admin', canActivate: [adminGuard], component: AdminComponent }
 * 
 * MEJORAS PENDIENTES:
 * - Implementar campo "role" en el modelo AuthUser
 * - Descomentar la validación de rol de administrador (línea 34-37)
 * - Agregar toastService para notificaciones de acceso denegado
 */
export const adminGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  // Inyecta AuthService para acceder a información de autenticación del usuario
  const auth = inject(AuthService);
  
  // Inyecta Router para realizar redirecciones cuando sea necesario
  const router = inject(Router);

  /**
   * PASO 1: Validar que el usuario esté autenticado
   * Si no está autenticado, redirige a la página de login
   */
  if (!auth.isLoggedIn) {
    // Crea un árbol de rutas que redirige a '/iniciar-sesion'
    // Los parámetros de consulta guardan la URL original para volver después del login
    return router.createUrlTree(['/iniciar-sesion'], {
      queryParams: { returnUrl: state.url }
    });
  }

  /**
   * PASO 2: Validar que el usuario sea administrador
   * COMENTADO: Descomenta cuando implementes roles en el modelo AuthUser
   */
  // const user = auth.currentUser;
  // if (user?.role !== 'admin') {
  //   // Mostrar notificación de error (requiere toastService inyectado)
  //   this.toastService.error('No tienes permisos para acceder a esta sección');
  //   // Deniego el acceso
  //   return false;
  // }

  /**
   * PASO 3: Si el usuario está autenticado y es admin, retorna true
   * Esto permite el acceso a la ruta protegida
   */
  return true;
};
