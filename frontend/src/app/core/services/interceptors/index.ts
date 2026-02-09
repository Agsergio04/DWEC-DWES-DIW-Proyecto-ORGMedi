/**
 * Barrel de Interceptores HTTP
 * 
 * Re-exporta todos los interceptores disponibles desde un único punto de entrada.
 * Facilita importar múltiples interceptores sin usar rutas largas.
 * 
 * Interceptores exportados:
 * - authInterceptor: Agrega token JWT a las peticiones
 * - errorInterceptor: Maneja errores HTTP globalmente
 */

export * from '../../interceptors/auth.interceptor';
export * from '../../interceptors/error.interceptor';
