import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * Guard funcional para proteger rutas que requieren autenticación
 * Si no está autenticado, redirige a /iniciar-sesion con returnUrl
 */
export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn) {
    return true;
  }

  // Redirige a /iniciar-sesion con la URL de retorno
  return router.createUrlTree(['/iniciar-sesion'], {
    queryParams: { returnUrl: state.url }
  });
};
