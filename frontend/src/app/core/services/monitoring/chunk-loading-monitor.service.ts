import { Injectable, inject } from '@angular/core';
import { Router, NavigationEnd, NavigationStart } from '@angular/router';
import { filter } from 'rxjs/operators';

/**
 * SERVICIO: ChunkLoadingMonitorService
 * 
 * ¿QUÉ HACE?
 * Monitorea y registra cuándo se descargan chunks (módulos) lazy de la aplicación.
 * Un "chunk" es una parte del código que se descarga solo cuando se necesita (lazy loading).
 * 
 * PARA QUÉ SIRVE?
 * - Debugging: Ver qué se descarga y cuándo
 * - Performance: Conocer el tamaño de cada chunk descargado
 * - Optimización: Identificar chunks pesados que podrían optimizarse
 * 
 * FUNCIONALIDADES:
 * 
 * 1. Monitorea navegación:
 *    - Detecta cuándo el usuario comienza a navegar a una ruta
 *    - Registra cuándo la ruta se ha cargado completamente
 * 
 * 2. Obtiene información de chunks:
 *    getLoadedChunks() - Lista todos los chunks descargados
 *    getBundleInfo() - Tamaño y duración de cada chunk
 * 
 * 3. Detecta errores de carga:
 *    Si un chunk falla al descargar, lo registra en consola
 * 
 * 4. Precarga chunks en segundo plano:
 *    onChunkPreloaded() - Registra chunks precargados sin navegación
 * 
 * EJEMPLO EN CONSOLA:
 * [Lazy Loading] Navegando a: /medicamentos
 * [Lazy Loading] Ruta cargada: /medicamentos
 * ┌─────────────────────┬────────┬──────────┐
 * │ filename            │ size   │ duration │
 * ├─────────────────────┼────────┼──────────┤
 * │ chunk-1a2b3c.js    │ 45250  │ 152      │
 * │ chunk-4d5e6f.js    │ 28100  │ 98       │
 * └─────────────────────┴────────┴──────────┘
 * [Lazy Loading] Tamaño total descargado: 71.43 KB
 */
@Injectable({
  providedIn: 'root'
})
export class ChunkLoadingMonitorService {
  private router = inject(Router);
  private loadedChunks = new Set<string>();

  constructor() {
    this.initializeMonitoring();
  }

  /**
   * Inicializa el monitoreo de eventos de navegación y carga
   */
  private initializeMonitoring(): void {
    // Monitorea cuándo COMIENZA la navegación
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationStart)
      )
      .subscribe((event: any) => {
      });

    // Monitorea cuándo TERMINA la navegación (chunk cargado)
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd)
      )
      .subscribe((event: any) => {
        this.logBundleSize();
      });

    // Detecta si hay error al cargar un chunk
    window.addEventListener('error', (e) => {
      if (e.message?.includes('chunk')) {
        console.error(`[Lazy Loading Error] Error cargando chunk:`, e);
      }
    });
  }

  /**
   * Obtiene lista de chunks (.js) que se han descargado
   * Usa Performance API del navegador para obtener los recursos
   */
  getLoadedChunks(): string[] {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const jsChunks = resources
      .filter(r => r.name.includes('.js'))
      .map(r => {
        const chunks = r.name.match(/([^\/]+\.js)$/);
        return chunks ? chunks[1] : r.name;
      })
      .filter(chunk => chunk.includes('chunk') || chunk.includes('-'));

    return [...new Set(jsChunks)];
  }

  /**
   * Obtiene información detallada de cada chunk: nombre, tamaño, duración
   */
  getBundleInfo(): {
    filename: string;
    size: number;
    duration: number;
  }[] {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    return resources
      .filter(r => r.name.includes('.js'))
      .map(r => ({
        filename: r.name.split('/').pop() || 'unknown',
        size: r.transferSize || 0,
        duration: r.duration
      }));
  }

  /**
   * Registra en consola el tamaño total de todos los chunks
   */
  private logBundleSize(): void {
    const bundleInfo = this.getBundleInfo();
    const totalSize = bundleInfo.reduce((sum, chunk) => sum + chunk.size, 0);
    console.table(bundleInfo);
  }

  /**
   * Registra un chunk que se precargó en segundo plano
   * (sin que el usuario navegara explícitamente a él)
   */
  onChunkPreloaded(chunkName: string): void {
    if (!this.loadedChunks.has(chunkName)) {
      this.loadedChunks.add(chunkName);
    }
  }

  /**
   * Muestra en consola todos los chunks descargados
   */
  printLoadedChunks(): void {
    const chunks = this.getLoadedChunks();
    chunks.forEach(chunk => console.log(`  - ${chunk}`));
  }
}
