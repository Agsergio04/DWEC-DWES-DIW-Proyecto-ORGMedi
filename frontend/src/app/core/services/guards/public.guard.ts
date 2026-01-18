import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../auth/auth.service';

/**
 * Guard funcional: Redirige a home si está autenticado
 * Útil para rutas públicas que no deben ser accesibles si ya estás logueado
 * Ej: login, registro
 * 
 * @example
 * { path: 'iniciar-sesion', canActivate: [publicGuard], component: LoginPage }
 */
export const publicGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Si ya está autenticado, redirige a home
  if (auth.isLoggedIn) {
    return router.createUrlTree(['/']);
  }

  // Si no está autenticado, permite acceder a la ruta pública
  return true;
};
