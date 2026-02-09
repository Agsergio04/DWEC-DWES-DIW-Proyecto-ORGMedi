/**
 * ARCHIVO BARREL - Índice de Guardias de Rutas
 * 
 * PROPÓSITO:
 * Este es un archivo "barrel" que centraliza y re-exporta todos los guards
 * (protectores de rutas) disponibles en la aplicación. Facilita las importaciones
 * permitiendo importar múltiples guards desde un único punto de entrada:
 * `import { authGuard, adminGuard } from '@core/services/guards'`
 * 
 * VENTAJAS:
 * - Simplifica las importaciones en otras partes de la app
 * - Mantiene una estructura organizada y centralizada
 * - Facilita agregar o retirar guards sin cambiar rutas de importación
 * 
 * GUARDS EXPORTADOS:
 * 
 * 1. authGuard (../auth/auth.guard)
 *    - Valida que el usuario esté autenticado
 *    - Redirige a login si no está logueado
 *    - Uso: Rutas privadas accesibles solo para usuarios registrados
 * 
 * 2. adminGuard (./admin.guard)
 *    - Valida que el usuario sea administrador
 *    - Requiere estar autenticado y tener rol de admin
 *    - Uso: Rutas administrativas exclusivas para admins
 * 
 * 3. publicGuard (./public.guard)
 *    - Valida que ciertas rutas sean solo accesibles si NO estás autenticado
 *    - Típicamente redirige usuarios logueados fuera de login/registro
 *    - Uso: Protege rutas como login, registro, recuperar contraseña
 * 
 * 4. pendingChangesGuard (./pending-changes.guard)
 *    - Advierte al usuario si hay cambios sin guardar
 *    - Previene pérdida accidental de datos
 *    - Uso: Formularios con campos modificados
 * 
 * EJEMPLO DE USO EN RUTAS:
 * @example
 * const routes: Routes = [
 *   { path: 'login', canActivate: [publicGuard], component: LoginComponent },
 *   { path: 'profile', canActivate: [authGuard], component: ProfileComponent },
 *   { path: 'admin', canActivate: [adminGuard], component: AdminComponent },
 *   { path: 'edit', canDeactivate: [pendingChangesGuard], component: EditComponent }
 * ];
 */

export * from '../auth/auth.guard';
export * from './admin.guard';
export * from './public.guard';
export * from './pending-changes.guard';
