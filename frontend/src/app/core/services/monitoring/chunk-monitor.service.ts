import { Injectable } from '@angular/core';
import { Router, NavigationEnd, NavigationStart } from '@angular/router';
import { filter } from 'rxjs/operators';

/**
 * SERVICIO: ChunkMonitorService
 * 
 * ¿QUÉ HACE?
 * Monitorea en tiempo real CUÁNDO y CUÁNTO TARDA en descargarse cada chunk (módulo)
 * de la aplicación. Un chunk es un archivo JavaScript que se descarga bajo demanda
 * (cuando el usuario navega a esa sección).
 * 
 * INFORMACIÓN QUE RECOPILA:
 * - Cuándo comienza la navegación a una ruta
 * - Cuánto tiempo tarda en cargar el chunk (en milisegundos)
 * - Tamaño del archivo descargado (en KB)
 * - Hora exacta de cada evento
 * 
 * UTILIDAD:
 * - Debugging: Saber qué está sucediendo cuando navegas
 * - Performance: Identificar chunks lentos que necesitan optimización
 * - User Experience: Entender experiencia de carga del usuario
 */
@Injectable({ providedIn: 'root' })
export class ChunkMonitorService {
  
  // Map que almacena información de cada chunk cargado
  // Estructura: { "nombre-chunk": { timestamp: fecha, duration: ms } }
  private loadedChunks = new Map<string, { timestamp: number; duration: number }>();
  
  // Marca el momento exacto cuando comienza la navegación
  private navigationStartTime = 0;
  
  constructor(private router: Router) {
    this.initializeMonitoring();
  }
  
  /**
   * PASO 1: Inicializa el monitoreo de eventos de navegación
   * Se ejecuta una sola vez cuando el servicio se crea
   */
  private initializeMonitoring(): void {
    // EVENTO 1: Detecta cuándo COMIENZA la navegación
    this.router.events
      .pipe(filter(event => event instanceof NavigationStart))
      .subscribe((event: NavigationStart) => {
        // Guarda el tiempo actual para calcular duración después
        this.navigationStartTime = performance.now();
        console.log(` [${this.getTimestamp()}] Navegando a: ${event.url}`);
      });
    
    // EVENTO 2: Detecta cuándo TERMINA la navegación
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        // Calcula cuánto tiempo tardó la navegación
        const duration = performance.now() - this.navigationStartTime;
        console.log(` [${this.getTimestamp()}] Navegación completada en ${duration.toFixed(2)}ms → ${event.url}`);
        
        // Registra este chunk en el historial
        this.logChunkLoad(event.url, duration);
      });
    
    // Activa el monitoreo detallado de descargas de archivos
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
                  ` Descargado: ${chunkName} | ` +
                  `${(downloadTime).toFixed(0)}ms | ` +
                  `Tamaño: ${(entry_.transferSize / 1024).toFixed(1)}KB`
                );
              }
            }
          }
        });
        
        observer.observe({ entryTypes: ['resource'] });
      } catch (e) {
        console.warn('  PerformanceObserver no disponible');
      }
    }
  }
  
  /**
   * PASO 3: Extrae nombre legible del chunk de la URL
   * Transforma: "/static/auth-login.a1b2c3d4.js" → "auth-login"
   */
  private extractChunkName(url: string): string | null {
    // Regex: busca patrón "nombre.codigo.js"
    const match = url.match(/\/([a-z\-]+)\.[a-z0-9]+\.js/i);
    // Retorna solo el nombre o null si no encuentra
    return match ? match[1] : null;
  }
  
  /**
   * Registra un chunk en el historial de carga
   * Evita registros duplicados usando un Map
   */
  private logChunkLoad(url: string, duration: number): void {
    const chunkName = this.extractChunkName(url) || url;
    
    // Si no está en el map, lo agrega
    if (!this.loadedChunks.has(chunkName)) {
      this.loadedChunks.set(chunkName, {
        timestamp: Date.now(),
        duration
      });
    }
  }
  
  /**
   * Retorna la hora actual en formato legible (HH:MM:SS)
   */
  private getTimestamp(): string {
    return new Date().toLocaleTimeString('es-ES');
  }
  
  /**
   * METODO PÚBLICO: Obtiene estadísticas de chunks cargados
   * Útil para acceder a los datos desde componentes
   */
  public getLoadedChunksStats(): Map<string, { timestamp: number; duration: number }> {
    return new Map(this.loadedChunks);
  }
  
  /**
   * METODO PÚBLICO: Imprime reporte visual en consola
   * Muestra tabla con todos los chunks, duración y hora
   * 
   * EJEMPLO DE SALIDA:
   * ============================================================
   *  REPORTE DE CHUNKS CARGADOS
   * ============================================================
   *   auth-login             → 245ms (12:34:57)
   *   medicamentos           → 187ms (12:35:10)
   *   calendar               → 98ms (12:35:25)
   * ============================================================
   * Total de chunks: 3
   * Tiempo acumulado: 530ms
   * ============================================================
   */
  public printReport(): void {
    console.log('\n' + '='.repeat(60));
    console.log(' REPORTE DE CHUNKS CARGADOS');
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
   * METODO PÚBLICO: Limpia todas las estadísticas registradas
   */
  public reset(): void {
    this.loadedChunks.clear();
    console.log(' Estadísticas de chunks reseteadas');
  }
}

/**
 * CÓMO USAR EN COMPONENTES:
 * 
 * import { ChunkMonitorService } from './core/services/monitoring';
 * 
 * @Component({
 *   selector: 'app-performance-debug',
 *   template: '<button (click)="showReport()">Mostrar Reporte</button>'
 * })
 * export class PerformanceDebugComponent {
 *   constructor(private chunkMonitor: ChunkMonitorService) {}
 *   
 *   showReport() {
 *     this.chunkMonitor.printReport();  // Muestra reporte en consola
 *   }
 *   
 *   getStats() {
 *     const chunks = this.chunkMonitor.getLoadedChunksStats();
 *     console.log(chunks);  // Acceder a datos programáticamente
 *   }
 * }
 */

/**
 * EJEMPLO DE SALIDA EN CONSOLA:
 * 
 *  [12:34:56] Navegando a: /iniciar-sesion
 *  Descargado: auth-login | 145ms | Tamaño: 75.3KB
 *  [12:34:57] Navegación completada en 287ms → /iniciar-sesion
 * 
 *  [12:35:10] Navegando a: /medicamentos
 *  Descargado: medicamentos | 212ms | Tamaño: 142.8KB
 *  [12:35:10] Navegación completada en 225ms → /medicamentos
 * 
 * (Luego ejecutas en consola:)
 * > chunkMonitor.printReport()
 * 
 * ============================================================
 *  REPORTE DE CHUNKS CARGADOS
 * ============================================================
 *   auth-login             → 287ms (12:34:57)
 *   medicamentos           → 225ms (12:35:10)
 * ============================================================
 * Total de chunks: 2
 * Tiempo acumulado: 512ms
 * ============================================================
 */
