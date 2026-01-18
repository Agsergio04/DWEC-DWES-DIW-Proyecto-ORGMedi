import { Injectable } from '@angular/core';
import { Router, NavigationEnd, NavigationStart } from '@angular/router';
import { filter } from 'rxjs/operators';

/**
 * Servicio para monitorear la carga de chunks lazy en tiempo real
 * 
 * Útil para debugging, análisis de rendimiento y UX
 * Permite registrar y visualizar cuándo se descargan los chunks
 */
@Injectable({ providedIn: 'root' })
export class ChunkMonitorService {
  
  private loadedChunks = new Map<string, { timestamp: number; duration: number }>();
  private navigationStartTime = 0;
  
  constructor(private router: Router) {
    this.initializeMonitoring();
  }
  
  /**
   * Inicializa el monitoreo de navegación y chunks
   */
  private initializeMonitoring(): void {
    // Registrar inicio de navegación
    this.router.events
      .pipe(filter(event => event instanceof NavigationStart))
      .subscribe((event: NavigationStart) => {
        this.navigationStartTime = performance.now();
        console.log(`🔄 [${this.getTimestamp()}] Navegando a: ${event.url}`);
      });
    
    // Registrar fin de navegación (cuando se carga el componente)
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const duration = performance.now() - this.navigationStartTime;
        console.log(`✅ [${this.getTimestamp()}] Navegación completada en ${duration.toFixed(2)}ms → ${event.url}`);
        
        // Registrar el chunk cargado
        this.logChunkLoad(event.url, duration);
      });
    
    // Monitorear descargas de scripts (Network API)
    this.monitorScriptDownloads();
  }
  
  /**
   * Monitorea las descargas de scripts usando Performance API
   */
  private monitorScriptDownloads(): void {
    // Esperar a que el navegador complete las mediciones de recursos
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name.includes('.js')) {
              const entry_ = entry as PerformanceResourceTiming;
              const downloadTime = entry_.responseEnd - entry_.fetchStart;
              
              // Identificar qué chunk es
              const chunkName = this.extractChunkName(entry.name);
              
              if (chunkName && downloadTime > 10) { // Ignorar archivos muy pequeños
                console.log(
                  `📥 Descargado: ${chunkName} | ` +
                  `${(downloadTime).toFixed(0)}ms | ` +
                  `Tamaño: ${(entry_.transferSize / 1024).toFixed(1)}KB`
                );
              }
            }
          }
        });
        
        observer.observe({ entryTypes: ['resource'] });
      } catch (e) {
        console.warn('⚠️  PerformanceObserver no disponible');
      }
    }
  }
  
  /**
   * Extrae el nombre del chunk del nombre del archivo
   */
  private extractChunkName(url: string): string | null {
    // Buscar patrones como: "auth-login.abc123.js"
    const match = url.match(/\/([a-z\-]+)\.[a-z0-9]+\.js/i);
    return match ? match[1] : null;
  }
  
  /**
   * Registra la carga de un chunk
   */
  private logChunkLoad(url: string, duration: number): void {
    const chunkName = this.extractChunkName(url) || url;
    
    if (!this.loadedChunks.has(chunkName)) {
      this.loadedChunks.set(chunkName, {
        timestamp: Date.now(),
        duration
      });
    }
  }
  
  /**
   * Retorna un timestamp formateado
   */
  private getTimestamp(): string {
    return new Date().toLocaleTimeString('es-ES');
  }
  
  /**
   * Obtiene estadísticas de chunks cargados
   */
  public getLoadedChunksStats(): Map<string, { timestamp: number; duration: number }> {
    return new Map(this.loadedChunks);
  }
  
  /**
   * Imprime un reporte en consola
   */
  public printReport(): void {
    console.log('\n' + '='.repeat(60));
    console.log('📊 REPORTE DE CHUNKS CARGADOS');
    console.log('='.repeat(60));
    
    if (this.loadedChunks.size === 0) {
      console.log('No hay chunks cargados aún');
      return;
    }
    
    let totalTime = 0;
    const sortedChunks = Array.from(this.loadedChunks.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    sortedChunks.forEach(([chunk, data]) => {
      totalTime += data.duration;
      const time = new Date(data.timestamp);
      console.log(
        `  ${chunk.padEnd(25)} → ${data.duration.toFixed(0).padStart(5)}ms ` +
        `(${time.toLocaleTimeString('es-ES')})`
      );
    });
    
    console.log('='.repeat(60));
    console.log(`Total de chunks: ${this.loadedChunks.size}`);
    console.log(`Tiempo acumulado: ${totalTime.toFixed(0)}ms`);
    console.log('='.repeat(60) + '\n');
  }
  
  /**
   * Resetea las estadísticas
   */
  public reset(): void {
    this.loadedChunks.clear();
    console.log('🔄 Estadísticas de chunks reseteadas');
  }
}

/**
 * USO EN COMPONENTES:
 * 
 * import { ChunkMonitorService } from './core/services/monitoring';
 * 
 * @Component({...})
 * export class MyComponent {
 *   constructor(private chunkMonitor: ChunkMonitorService) {}
 *   
 *   printStats() {
 *     this.chunkMonitor.printReport();
 *   }
 * }
 */

/**
 * SALIDA ESPERADA EN CONSOLA:
 * 
 * 🔄 [12:34:56] Navegando a: /iniciar-sesion
 * 📥 Descargado: auth-login | 145ms | Tamaño: 75.3KB
 * ✅ [12:34:57] Navegación completada en 287ms → /iniciar-sesion
 * 
 * 🔄 [12:35:10] Navegando a: /medicamentos
 * ✅ [12:35:10] Navegación completada en 15ms → /medicamentos
 * (Ya estaba precargado con PreloadAllModules)
 */
