import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * Guard funcional: Protege rutas que requieren autenticación
 * 
 * Flujo CanActivate:
 * 1. Usuario intenta acceder a /medicamentos (ruta protegida)
 * 2. El guard verifica si auth.isLoggedIn === true
 * 3. Si está autenticado → permite acceso (return true)
 * 4. Si NO está autenticado → redirige a /iniciar-sesion
 *    con queryParam returnUrl=/medicamentos
 * 5. Tras login exitoso, el componente LoginPage lee returnUrl
 *    y navega de vuelta a la ruta original
 * 
 * Esto permite una UX fluida: usuario intenta acceder → login → vuelve a donde iba
 * 
 * @example
 * // En app.routes.ts
 * {
 *   path: 'medicamentos',
 *   loadComponent: () => import('./medicines').then(m => m.MedicinesPage),
 *   canActivate: [authGuard]  // ← Protegida
 * },
 * {
 *   path: 'perfil',
 *   loadComponent: () => import('./profile').then(m => m.ProfilePage),
 *   canActivate: [authGuard]  // ← Protegida
 * }
 */
export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Verificar si el usuario está autenticado
  if (auth.isLoggedIn) {
    return true;  // Permite la navegación
  }

  // No está autenticado, redirigir a login con returnUrl
  // state.url contiene la ruta original (ej: /medicamentos?page=2)
  return router.createUrlTree(['/iniciar-sesion'], {
    queryParams: { returnUrl: state.url }
  });
};
