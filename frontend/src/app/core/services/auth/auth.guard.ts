/**
 * IMPORTACIONES
 * - CanActivateFn: Tipo para guards que protegen rutas (prevé la activación)
 * - ActivatedRouteSnapshot: Información de la ruta siendo activada
 * - RouterStateSnapshot: Estado del router (URL actual, etc)
 * - AuthService: Servicio que gestiona autenticación
 */
import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * GUARD FUNCIONAL: PROTECCIÓN DE RUTAS AUTENTICADAS
 * ===================================================
 * Previene el acceso a rutas protegidas si el usuario NO está autenticado.
 * 
 * ¿QUÉ HACE?
 * - Controla si el usuario tiene una sesión activa (token JWT)
 * - Si está autenticado → Permite acceder a la ruta
 * - Si NO está autenticado → Redirige a /iniciar-sesión
 * 
 * FLUJO COMPLETO:
 * ===============
 * 1. Usuario intenta acceder a /medicamentos?page=2
 * 2. El router detecta que hay canActivate: [authGuard]
 * 3. Ejecuta authGuard pasando los snapshots
 * 4. authGuard verifica auth.isLoggedIn
 * 
 * CASO A: Usuario AUTÍD CON TOKEN JWT
 * ├─ isLoggedIn === true
 * ├─ Retorna true
 * └─ Router PERMITE navegar a /medicamentos
 * 
 * CASO B: Usuario SIN SESIÓN ACTIVA
 * ├─ isLoggedIn === false
 * ├─ Crea URL para redirigir: /iniciar-sesión?returnUrl=/medicamentos?page=2
 * ├─ Guarda la ruta original como queryParam (returnUrl)
 * └─ Router REDIRIGE a /iniciar-sesión
 * 
 * PASO 5: Usuario hace login en LoginPage
 * ├─ Se autentica correctamente
 * ├─ Se guarda token en localStorage
 * ├─ AuthService.isLoggedIn cambia a true
 * └─ LoginPage redirige a /medicamentos (leyendo returnUrl del queryParam)
 * 
 * PASO 6: Usuario intenta acceder a /medicamentos de nuevo
 * ├─ Guard verifica auth.isLoggedIn === true
 * └─ Router PERMITE navegar (sin repetir el guard)
 * 
 * CASOS DE USO EN app.routes.ts:
 * ============================
 * 
 * // Ruta protegida - requiere autenticación
 * {
 *   path: 'medicamentos',
 *   loadComponent: () => import('./medicines').then(m => m.MedicinesPage),
 *   canActivate: [authGuard]  // ← PROTECCIÓN
 * },
 * 
 * // Otra ruta protegida
 * {
 *   path: 'perfil',
 *   loadComponent: () => import('./profile').then(m => m.ProfilePage),
 *   canActivate: [authGuard]
 * }
 * 
 * // Ruta pública - SIN guard, accesible para todos
 * {
 *   path: 'inicio',
 *   loadComponent: () => import('./home').then(m => m.HomePage)
 *   // ☞ Sin canActivate - NO protegida
 * }
 * 
 * BENEFICIOS:
 * ===========
 * ✅ Seguridad: Solo usuarios autenticados acceden a datos sensibles
 * ✅ UX fluida: Si no está loguead -> va a login -> vuelve a donde iba
 * ✅ TypeSafe: Angular previene acceso a rutas protegidas
 * ✅ Centralizado: Un guard para todas las rutas protegidas
 * @example
 */
export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  // Inyectar servicios necesarios
  const auth = inject(AuthService);
  const router = inject(Router);

  // Log para debugging
  console.log('[AuthGuard] Verificando acceso a:', state.url, '| Autenticado:', auth.isLoggedIn);

  // CASO 1: Usuario ESTÁ AUTENTICADO
  if (auth.isLoggedIn) {
    console.log('[AuthGuard] ✅ Usuario autenticado - permitiendo acceso');
    return true;  // Permitir navegación
  }

  // CASO 2: Usuario NO ESTÁ AUTENTICADO
  // Redirigir a login guardando la ruta original como queryParam
  console.log('[AuthGuard] ❌ Usuario no autenticado - redirigiendo a login');
  
  // state.url es la URL completa que intentó acceder
  // Ejemplo: /medicamentos?page=2&sort=name
  const queryParams = { returnUrl: state.url };
  
  // Crear URL tree para redirigir a /iniciar-sesión con queryParams
  // createUrlTree permite configurar la redirección de forma reactiva
  // sin necesidad de llamar a router.navigate()
  return router.createUrlTree(['/iniciar-sesion'], { queryParams });
};
