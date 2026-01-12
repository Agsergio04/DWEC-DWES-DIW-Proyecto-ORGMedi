import { Injectable } from '@angular/core';
import { PreloadingStrategy, Route } from '@angular/router';
import { Observable, of } from 'rxjs';

/**
 * Estrategia de Precarga Selectiva para Angular Router
 * 
 * Permite controlar qué rutas lazy se precargan automáticamente:
 * - Con data.preload = true → Se precarga en segundo plano
 * - Sin data.preload o = false → Se carga bajo demanda
 * 
 * Útil para aplicaciones grandes donde PreloadAllModules 
 * descargaría demasiados chunks innecesarios
 */
@Injectable({ providedIn: 'root' })
export class SelectivePreloadingStrategy implements PreloadingStrategy {
  
  /**
   * Determina si una ruta debe precargarse
   * 
   * @param route - La ruta a evaluar
   * @param load - Función que realiza la carga del módulo
   * @returns Observable que carga el módulo si data.preload es true
   */
  preload(route: Route, load: () => Observable<any>): Observable<any> {
    // Si la ruta tiene data.preload = true, precarga
    if (route.data && route.data['preload']) {
      console.log(`✅ Precargando: ${route.path}`);
      return load();
    }
    
    // Si no, devuelve un observable vacío (carga bajo demanda)
    return of(null);
  }
}

/**
 * EJEMPLO DE USO EN app.config.ts:
 * 
 * import { SelectivePreloadingStrategy } from './core/strategies/preload.strategy';
 * 
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideRouter(
 *       routes,
 *       withPreloading(SelectivePreloadingStrategy)
 *     ),
 *   ]
 * };
 */

/**
 * EJEMPLO DE USO EN app.routes.ts:
 * 
 * export const routes: Routes = [
 *   {
 *     path: 'home',
 *     loadComponent: () => import('./home').then(m => m.Home),
 *     data: { preload: true }  // ← Se precarga
 *   },
 *   {
 *     path: 'admin',
 *     loadComponent: () => import('./admin').then(m => m.Admin),
 *     // Sin data.preload = se carga bajo demanda
 *   }
 * ];
 */

/**
 * ESTRATEGIA ALTERNATIVA: Precarga con Retraso
 * Descarga lazy routes después de un tiempo específico
 */
@Injectable({ providedIn: 'root' })
export class DelayedPreloadingStrategy implements PreloadingStrategy {
  
  preload(route: Route, load: () => Observable<any>): Observable<any> {
    // Espera 3 segundos antes de precargar
    const DELAY_MS = 3000;
    
    if (route.data && route.data['preload'] !== false) {
      setTimeout(() => {
        console.log(`⏱️  Precargando con retraso: ${route.path}`);
        load().subscribe(
          () => console.log(`✅ Precarga completada: ${route.path}`),
          (error) => console.error(`❌ Error precargando ${route.path}:`, error)
        );
      }, DELAY_MS);
    }
    
    return of(null);
  }
}

/**
 * ESTRATEGIA ALTERNATIVA: Precarga Condicionada por Conexión
 * Solo precarga en conexiones rápidas (4G/WiFi)
 */
@Injectable({ providedIn: 'root' })
export class NetworkAwarePreloadingStrategy implements PreloadingStrategy {
  
  preload(route: Route, load: () => Observable<any>): Observable<any> {
    // Verificar velocidad de conexión (si está disponible)
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      const effectiveType = connection?.effectiveType;
      
      // Precargar solo en 4g o WiFi
      if (effectiveType === '4g' || connection?.saveData === false) {
        console.log(`🚀 Precargando en conexión rápida: ${route.path}`);
        return load();
      } else {
        console.log(`📵 Saltando precarga (conexión lenta): ${route.path}`);
        return of(null);
      }
    }
    
    // Fallback: precargar si data.preload = true
    return route.data?.['preload'] ? load() : of(null);
  }
}

/**
 * ESTRATEGIA ALTERNATIVA: Precarga Inteligente
 * Carga de forma inteligente basándose en varios factores
 */
@Injectable({ providedIn: 'root' })
export class SmartPreloadingStrategy implements PreloadingStrategy {
  
  private preloadedRoutes = new Set<string>();
  
  preload(route: Route, load: () => Observable<any>): Observable<any> {
    const routePath = route.path || 'unknown';
    
    // Evitar duplicados
    if (this.preloadedRoutes.has(routePath)) {
      return of(null);
    }
    
    // Verificar múltiples criterios
    const shouldPreload = 
      (route.data?.['preload'] === true) ||  // Explícitamente marcado
      (['home', 'medicamentos'].includes(routePath)); // Rutas críticas
    
    if (shouldPreload && !this.isReducedMotion()) {
      this.preloadedRoutes.add(routePath);
      console.log(`🧠 Precargando (inteligente): ${routePath}`);
      return load();
    }
    
    return of(null);
  }
  
  /**
   * Respeta preferencia de movimiento reducido del usuario
   */
  private isReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
}

/**
 * COMPARATIVA DE ESTRATEGIAS
 * 
 * ┌─────────────────────────────────────────────────────────────┐
 * │ Estrategia              │ Caso de Uso                         │
 * ├─────────────────────────────────────────────────────────────┤
 * │ PreloadAllModules       │ Apps pequeñas/medianas              │
 * │ SelectivePreloading     │ Apps grandes, control fino           │
 * │ DelayedPreloading       │ Evitar congestión de red inicial     │
 * │ NetworkAwarePreloading  │ Apps de bajo ancho de banda          │
 * │ SmartPreloading         │ UX personalizada por usuario         │
 * └─────────────────────────────────────────────────────────────┘
 */
