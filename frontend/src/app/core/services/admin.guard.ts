import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * Guard funcional: Valida que el usuario sea admin
 * Extiende authGuard para validar roles/permisos
 * 
 * Nota: En tu proyecto, podrías añadir un campo "role" a AuthUser
 * para implementar validación real de admin.
 * 
 * @example
 * { path: 'admin', canActivate: [adminGuard], component: AdminComponent }
 */
export const adminGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Primero verificar autenticación
  if (!auth.isLoggedIn) {
    return router.createUrlTree(['/iniciar-sesion'], {
      queryParams: { returnUrl: state.url }
    });
  }

  // TODO: Cuando implementes roles en AuthUser, descomentar:
  // const user = auth.currentUser;
  // if (user?.role !== 'admin') {
  //   this.toastService.error('No tienes permisos para acceder a esta sección');
  //   return false;
  // }

  return true;
};
