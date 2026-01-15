import { Injectable, inject } from '@angular/core';
import { Router, NavigationEnd, NavigationStart } from '@angular/router';
import { filter } from 'rxjs/operators';

/**
 * ChunkLoadingMonitorService - Monitorea la descarga de chunks lazy
 * ================================================================
 * 
 * Rastrea cuándo se descargan módulos/componentes lazy en segundo plano.
 * Útil para entender el comportamiento del lazy loading y debugging.
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

  private initializeMonitoring(): void {
    // Monitorear eventos de navegación
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationStart)
      )
      .subscribe((event: any) => {
        console.log(`[Lazy Loading] Navegando a: ${event.url}`);
      });

    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd)
      )
      .subscribe((event: any) => {
        console.log(`[Lazy Loading] Ruta cargada: ${event.urlAfterRedirects}`);
        this.logBundleSize();
      });

    // Monitorear errores de carga
    window.addEventListener('error', (e) => {
      if (e.message?.includes('chunk')) {
        console.error(`[Lazy Loading Error] Error cargando chunk:`, e);
      }
    });
  }

  /**
   * Obtener información de chunks cargados
   * Usa Performance API para obtener resources cargados
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
   * Tamaño aproximado de chunks descargados
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
   * Log tamaño total de bundle
   */
  private logBundleSize(): void {
    const bundleInfo = this.getBundleInfo();
    const totalSize = bundleInfo.reduce((sum, chunk) => sum + chunk.size, 0);
    console.table(bundleInfo);
    console.log(
      `[Lazy Loading] Tamaño total descargado: ${(totalSize / 1024).toFixed(2)} KB`
    );
  }

  /**
   * Monitorear cuándo se precarga un chunk en segundo plano
   * (sin que el usuario navegue a él)
   */
  onChunkPreloaded(chunkName: string): void {
    if (!this.loadedChunks.has(chunkName)) {
      this.loadedChunks.add(chunkName);
      console.log(
        `[Lazy Loading] Chunk precargado en segundo plano: ${chunkName}`
      );
    }
  }

  /**
   * Listar todos los chunks descargados
   */
  printLoadedChunks(): void {
    const chunks = this.getLoadedChunks();
    console.log('[Lazy Loading] Chunks descargados:');
    chunks.forEach(chunk => console.log(`  - ${chunk}`));
  }
}
