/**
 * Barrel de Servicios de Monitoreo
 * 
 * Re-exporta todos los servicios de monitoreo desde un punto central.
 * Facilita importar múltiples servicios sin usar rutas largas.
 * 
 * Servicios exportados:
 * - ChunkLoadingMonitorService: Registra información sobre chunks descargados
 * - ChunkMonitorService: Monitorea en tiempo real cuándo se cargan chunks
 */

export * from './chunk-loading-monitor.service';
export * from './chunk-monitor.service';
