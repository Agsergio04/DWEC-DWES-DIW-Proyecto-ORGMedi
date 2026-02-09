/**
 * Archivo central de exportación (barrel)
 * 
 * Re-exporta todos los servicios de interfaz de usuario para un acceso simplificado.
 * 
 * Servicios disponibles:
 * - BreadcrumbService: Genera migas de pan dinámicas basadas en la ruta
 * - ThemeService: Gestiona el tema de la aplicación (claro/oscuro)
 * - NotificationsService: Muestra notificaciones visuales (toasts)
 * 
 * Permite importar desde 'core/services/ui' en lugar de especificar cada servicio
 */

export * from './breadcrumb.service';
export * from './theme.service';
export * from './notifications.service';
