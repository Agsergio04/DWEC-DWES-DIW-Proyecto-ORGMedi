import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../auth/auth.service';

/**
 * GUARD: publicGuard
 * 
 * PROPÓSITO:
 * Protege rutas públicas (como login y registro) impidiendo que usuarios
 * ya autenticados accedan a ellas. Funciona como el opuesto a authGuard.
 * 
 * DESCRIPCIÓN:
 * Este guard redirige automáticamente a la página principal (home) si el usuario
 * ya está logueado. Es especialmente útil para evitar que usuarios autenticados
 * vuelvan a ver páginas de "Iniciar Sesión" o "Registro".
 * 
 * LÓGICA DE FUNCIONAMIENTO:
 * 1. Usuario intenta acceder a /iniciar-sesion o /registro
 * 2. Guard verifica si está autenticado (isLoggedIn)
 * 3. SI está autenticado:
 *    → Redirige a la página principal (/)
 *    → No permite acceso a la ruta
 * 4. SI NO está autenticado:
 *    → Permite acceso normal a login/registro
 *    → El usuario ve la página de autenticación
 * 
 * PARÁMETROS:
 * - route: ActivatedRouteSnapshot - Información de la ruta actual
 * - state: RouterStateSnapshot - Estado del router con la URL solicitada
 * 
 * RETORNA:
 * - boolean | UrlTree: true si acceso permitido, UrlTree si redirige
 * 
 * DEPENDENCIAS INYECTADAS:
 * - AuthService: Servicio de autenticación para verificar estado de login
 * - Router: Servicio de routing para redirecciones
 * 
 * CASOS DE USO:
 * @example
 * const routes: Routes = [
 *   { path: 'iniciar-sesion', canActivate: [publicGuard], component: LoginComponent },
 *   { path: 'registro', canActivate: [publicGuard], component: RegisterComponent },
 *   { path: 'olvide-contraseña', canActivate: [publicGuard], component: ForgotComponent }
 * ];
 * 
 * FLUJOS DE EJEMPLO:
 * 
 * Caso 1: Usuario NO autenticado
 * ────────────────────────────
 * Usuario → /iniciar-sesion
 *    ↓
 * Guard comprueba: isLoggedIn = false
 *    ↓
 * Resultado: ✓ Acceso permitido → Ve login
 * 
 * Caso 2: Usuario autenticado intenta acceder a login
 * ──────────────────────────────────────────────────
 * Usuario autenticado → /iniciar-sesion
 *    ↓
 * Guard comprueba: isLoggedIn = true
 *    ↓
 * Resultado: ✗ Redirige a / → Ve home
 * 
 * GUARDIAS RELACIONADOS:
 * - authGuard: Hace lo opuesto (protege rutas privadas)
 * - adminGuard: Valida permisos de administrador
 * 
 * NOTAS:
 * - Este guard NO autentica, solo redirige si ya estás loguaeado
 * - Ideal para mejorar UX evitando que usuarios vean login si ya entraron
 * - Comúnmente usado en flujos de Single Page Applications (SPA)
 * - Previene acceso redundante a páginas de autenticación
 */
export const publicGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  // Inyecta AuthService para acceder al estado de autenticación
  const auth = inject(AuthService);
  
  // Inyecta Router para realizar redirecciones cuando sea necesario
  const router = inject(Router);

  /**
   * VERIFICACIÓN PRINCIPAL:
   * Si el usuario ya está autenticado (isLoggedIn === true),
   * no debe poder acceder a rutas públicas como login/registro
   */
  if (auth.isLoggedIn) {
    // Redirige al home (raíz de la aplicación)
    // El usuario ya autenticado no debe ver estas páginas
    return router.createUrlTree(['/']);
  }

  /**
   * ACCESO PERMITIDO:
   * El usuario NO está autenticado, por lo que es seguro permitirle
   * acceder a la ruta pública de autenticación (login, registro, etc)
   */
  return true;
};
