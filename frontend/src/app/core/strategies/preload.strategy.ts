import { Injectable } from '@angular/core';
import { PreloadingStrategy, Route } from '@angular/router';
import { Observable, of } from 'rxjs';

/**
 * Estrategias de Precarga para Angular Router
 * ============================================
 * 
 * La precarga (preloading) significa descargar módulos lazy-loaded en segundo plano
 * antes de que el usuario los necesite. Optimiza la experiencia mejorando la velocidad
 * de carga cuando el usuario navega a esas rutas.
 * 
 * Este archivo contiene 4 estrategias diferentes:
 * 1. SelectivePreloading - Control manual con data.preload
 * 2. DelayedPreloading - Precarga después de un tiempo
 * 3. NetworkAwarePreloading - Solo en conexiones rápidas
 * 4. SmartPreloading - Inteligencia personalizada
 * 
 * CÓMO USAR:
 * En app.config.ts:
 * - provideRouter(routes, withPreloading(SelectivePreloadingStrategy))
 * 
 * En app.routes.ts:
 * - data: { preload: true } para activar una ruta
 */

/**
 * Estrategia 1: Precarga Selectiva (RECOMENDADA PARA LA MAYORÍA)
 * ===========================================================
 * 
 * Control fino: solo precarga rutas explícitamente marcadas con data.preload = true
 * 
 * Ventajas:
 * -  Control total sobre qué se precarga
 * -  No descarga módulos innecesarios
 * -  Ideal para apps grandes
 * 
 * @example
 * // Ruta que se PRECARGA
 * { path: 'home', ..., data: { preload: true } }
 * 
 * // Ruta que se carga bajo DEMANDA
 * { path: 'admin', ... }
 */
@Injectable({ providedIn: 'root' })
export class SelectivePreloadingStrategy implements PreloadingStrategy {
  
  /**
   * Determina si una ruta debe precargarse
   * 
   * @param route - La ruta a evaluar
   * @param load - Función que descarga el módulo
   * @returns Observable que descarga si data.preload = true, o null si no
   */
  preload(route: Route, load: () => Observable<any>): Observable<any> {
    // Si la ruta tiene data.preload = true, precarga ahora
    if (route.data && route.data['preload']) {
      return load();
    }
    
    // Si no, devuelve observable vacío (carga bajo demanda después)
    return of(null);
  }
}

/**
 * Estrategia 2: Precarga con Retraso
 * ==================================
 * 
 * Espera X milisegundos antes de precargar (evita congestión de red inicial)
 * 
 * Ventajas:
 * -  No ralentiza carga inicial del HTML
 * -  Precarga en segundo plano sin afectar UX
 * -  Ideal para apps con muchos módulos
 * 
 * Despliegue típico:
 * - 0-3s: Usuario ve página + JavaScript crítico
 * - 3s en adelante: Precarga de otros módulos
 */
@Injectable({ providedIn: 'root' })
export class DelayedPreloadingStrategy implements PreloadingStrategy {
  
  preload(route: Route, load: () => Observable<any>): Observable<any> {
    // Espera 3 segundos antes de precargar
    const DELAY_MS = 3000;
    
    if (route.data && route.data['preload'] !== false) {
      setTimeout(() => {
        load().subscribe();
      }, DELAY_MS);
    }
    
    return of(null);
  }
}

/**
 * Estrategia 3: Precarga Consciente de Conexión
 * ==============================================
 * 
 * Solo precarga en conexiones rápidas (4G/WiFi).
 * No precarga en conexiones lentas (3G) para ahorrar datos.
 * 
 * Ventajas:
 * -  Respeta dispositivos con conexión lenta
 * -  Ahorra datos a usuarios con planes limitados
 * -  Ideal para apps mobile
 * 
 * Ejemplo:
 * - Usuario en WiFi: Precarga todos los módulos
 * - Usuario en 3G: Solo carga lo solicitado
 * - Usuario en modo datos reducidos: No precarga
 */
@Injectable({ providedIn: 'root' })
export class NetworkAwarePreloadingStrategy implements PreloadingStrategy {
  
  preload(route: Route, load: () => Observable<any>): Observable<any> {
    // Verificar velocidad de conexión (si está disponible en el navegador)
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      const effectiveType = connection?.effectiveType;
      
      // Precargar solo en 4G o WiFi, no en 3G
      if (effectiveType === '4g' || connection?.saveData === false) {
        return load();
      } else {
        return of(null);
      }
    }
    
    // Fallback: precargar si data.preload = true (si no podemos detectar conexión)
    return route.data?.['preload'] ? load() : of(null);
  }
}

/**
 * Estrategia 4: Precarga Inteligente
 * =================================
 * 
 * Combina múltiples criterios para decidir qué precargar:
 * - Rutas explícitamente marcadas
 * - Rutas críticas (home, medicamentos)
 * - Evita duplicados
 * - Respeta preferencia de movimiento reducido
 * 
 * Ventajas:
 * - ✅ Precarga inteligente sin configuración manual excesiva
 * - ✅ Identifica rutas críticas automáticamente
 * - ✅ Respeta preferencias de accesibilidad del usuario
 * 
 * Caso de uso:
 * - Apps moderadamente complejas
 * - Donde ciertos módulos son siempre necesarios
 */
@Injectable({ providedIn: 'root' })
export class SmartPreloadingStrategy implements PreloadingStrategy {
  
  /** Rastrea rutas ya precargadas para evitar duplicados */
  private preloadedRoutes = new Set<string>();
  
  preload(route: Route, load: () => Observable<any>): Observable<any> {
    const routePath = route.path || 'unknown';
    
    // Evitar precargar la misma ruta dos veces
    if (this.preloadedRoutes.has(routePath)) {
      return of(null);
    }
    
    // Criterios para decidir si precargar:
    // 1. Explícitamente marcada: data.preload = true
    // 2. Rutas críticas: home, medicamentos (siempre necesarias)
    const shouldPreload = 
      (route.data?.['preload'] === true) ||  
      (['home', 'medicamentos'].includes(routePath));
    
    if (shouldPreload && !this.isReducedMotion()) {
      this.preloadedRoutes.add(routePath);
      return load();
    }
    
    return of(null);
  }
  
  /**
   * Respeta cuando el usuario ha configurado "movimiento reducido"
   * en la accesibilidad del SO (puede causar mareos/náuseas)
   * 
   * @returns true si el usuario prefiere movimiento reducido
   */
  private isReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
}

/**
 * COMPARATIVA DE ESTRATEGIAS
 * 
 * ┌──────────────────┬─────────────────────────┬──────────────────────┐
 * │ Estrategia       │ Cuándo usar             │ Característica       │
 * ├──────────────────┼─────────────────────────┼──────────────────────┤
 * │ Selective        │ Apps grandes/medianas   │ Control manual        │
 * │ Delayed          │ Evitar congestión red   │ Espera X segundos     │
 * │ NetworkAware     │ Apps mobile/bajo datos  │ Detecta conexión      │
 * │ Smart            │ UX personalizada        │ Inteligencia + acceso │
 * └──────────────────┴─────────────────────────┴──────────────────────┘
 * 
 * RECOMENDACIÓN:
 * ✅ Inicio: SelectivePreloadingStrategy (control fino)
 * ✅ Mobile: NetworkAwarePreloadingStrategy (ahorra datos)
 * ✅ Apps grandes: SmartPreloadingStrategy (automatizada)
 */
