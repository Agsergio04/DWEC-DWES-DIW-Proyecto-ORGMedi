/**
 * PLANTILLA: Cómo implementar Fallback Selectivo en cualquier servicio
 * 
 * Este archivo es un EJEMPLO EDUCATIVO, no código de producción.
 * Cópialo y personalízalo para tus propios servicios.
 */

import { Injectable, inject } from '@angular/core';
import { Observable, of, throwError, timer } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { ApiService } from './data/api.service';

interface User {
  id: string;
  nombre: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private api = inject(ApiService);

  /**
   * PASO 1: Servicio básico SIN fallback selectivo
   */
  getUsers_SinFallback(): Observable<User[]> {
    return this.api.get<User[]>('usuarios');
  }

  /**
   * PASO 2: Agregar imports necesarios
   * import { Observable, of, throwError, timer } from 'rxjs';
   * import { catchError, switchMap } from 'rxjs/operators';
   */

  /**
   * PASO 3: Implementar fallback selectivo
   * 
   * El patrón base es:
   * 1. Hacer petición
   * 2. En catchError, evaluar tipo de error
   * 3. Según tipo, tomar acción diferente
   */
  getUsers_ConFallback(): Observable<User[]> {
    return this.api.get<User[]>('usuarios').pipe(
      // Aquí va el error handler selectivo
      catchError((error, caught) => {
        console.error('❌ Error al obtener usuarios:', error);

        // ========== FALLBACK SELECTIVO ==========

        // 1️⃣ SIN INTERNET → Usar datos en caché/mock
        if (!navigator.onLine) {
          console.warn('📵 Sin conexión → Usando datos en caché');
          return of(this.getCachedUsers());
        }

        // 2️⃣ SERVIDOR NO DISPONIBLE (503) → Reintentar automáticamente
        if (error.status === 503) {
          console.warn('🔄 Servidor no disponible (503) → Reintentando en 3 segundos');
          return timer(3000).pipe(
            switchMap(() => caught) // Reintentar toda la cadena
          );
        }

        // 3️⃣ ENDPOINT NO EXISTE (404) → Usar mock
        if (error.status === 404) {
          console.warn('🚫 Endpoint no existe (404) → Usando datos mock');
          return of(this.getMockUsers());
        }

        // 4️⃣ TIMEOUT → Usar datos anteriores
        if (error.name === 'TimeoutError') {
          console.warn('⏱️ Timeout → Usando datos en caché');
          return of(this.getCachedUsers());
        }

        // 5️⃣ NO AUTORIZADO (401) → Propagar error (usuario debe loguearse)
        if (error.status === 401) {
          console.error('🔐 No autorizado (401)');
          return throwError(() => error);
        }

        // 6️⃣ OTROS ERRORES → Opción A: Lista vacía | Opción B: Propagar error
        console.error('⚠️ Error inesperado:', error.status, error.message);
        
        // OPCIÓN A: No romper la UI
        return of([]);
        
        // OPCIÓN B: Propagar el error
        // return throwError(() => error);
      })
    );
  }

  /**
   * PASO 4: Crear métodos helper
   */

  /** Datos en caché (del último acceso exitoso) */
  private lastSuccessfulUsers: User[] = [];

  private getCachedUsers(): User[] {
    console.log('📦 Devolviendo datos en caché:', this.lastSuccessfulUsers.length, 'usuarios');
    return this.lastSuccessfulUsers;
  }

  /** Datos mock para demostración */
  private getMockUsers(): User[] {
    console.log('🎭 Devolviendo datos mock');
    return [
      { id: '1', nombre: 'Juan Pérez', email: 'juan@example.com' },
      { id: '2', nombre: 'María García', email: 'maria@example.com' },
      { id: '3', nombre: 'Carlos López', email: 'carlos@example.com' }
    ];
  }

  /**
   * PASO 5: Guardar en caché cuando exitoso (RECOMENDADO)
   * 
   * Usa tap() para guardar datos exitosos antes de procesarlos
   * Así si hay un error en la próxima petición, tienes datos anteriores
   */
  getUsers_ConCaching(): Observable<User[]> {
    return this.api.get<User[]>('usuarios').pipe(
      // ✅ Guardar datos exitosos en caché ANTES de pasar al siguiente operador
      tap(users => {
        this.lastSuccessfulUsers = users;
        console.log('💾 Datos guardados en caché:', users.length, 'usuarios');
      }),
      // ❌ Manejar errores con fallback selectivo
      catchError((error, caught) => {
        if (!navigator.onLine) {
          console.warn('📵 Sin internet → Usando caché');
          return of(this.getCachedUsers());
        }
        if (error.status === 503) {
          console.warn('🔄 Servidor no disponible → Reintentando');
          return timer(2000).pipe(switchMap(() => caught));
        }
        if (error.status === 404) {
          console.warn('🚫 Endpoint no existe → Mock');
          return of(this.getMockUsers());
        }
        if (error.status === 401) {
          console.error('🔐 No autorizado');
          return throwError(() => error);
        }
        // Otros errores → lista vacía
        console.error('⚠️ Error inesperado:', error.status);
        return of([]);
      })
    );
  }
}

/**
 * MATRIZ DE DECISIÓN: ¿Qué hacer en cada caso?
 * 
 * ┌──────────────────────────┬──────────────┬─────────────────┬──────────┐
 * │ Situación                │ Status Code  │ Acción          │ UI       │
 * ├──────────────────────────┼──────────────┼─────────────────┼──────────┤
 * │ Sin internet (offline)   │ N/A          │ Usar caché/mock │ ✅ OK    │
 * │ Servidor caído           │ 503          │ Reintentar 2-3s │ ↻ Espera │
 * │ Endpoint no existe       │ 404          │ Mock/vacío      │ ⚠️ Demo  │
 * │ Timeout (muy lento)      │ -            │ Caché/mock      │ ✅ OK    │
 * │ No autorizado            │ 401          │ Propagar error  │ ❌ Login │
 * │ Prohibido                │ 403          │ Propagar error  │ ❌ Error │
 * │ Otro error               │ 5xx, 4xx     │ Vacío/error     │ ❌ Error │
 * └──────────────────────────┴──────────────┴─────────────────┴──────────┘
 */

/**
 * VENTAJAS DE ESTE PATRÓN
 * 
 * ✅ App funciona sin backend/internet
 * ✅ Mejor UX (no muestra errores técnicos)
 * ✅ Desarrollo rápido (independencia frontend/backend)
 * ✅ Resiliente (maneja 503, timeouts, offline, etc)
 * ✅ Datos consistentes (caché entre requests)
 * ✅ Debugging fácil (logs claros por tipo de error)
 * ✅ Testing simplificado (datos mock predecibles)
 */

/**
 * INSTALACIÓN RÁPIDA EN TU SERVICIO
 * 
 * 1. PASO 1: Agregar imports
 *    import { Observable, of, throwError, timer } from 'rxjs';
 *    import { catchError, switchMap, tap } from 'rxjs/operators';
 * 
 * 2. PASO 2: Copiar el bloque catchError((error, caught) => {...})
 *    desde el método getUsers_ConFallback() o getUsers_ConCaching()
 * 
 * 3. PASO 3: Personalizar status codes según tu API
 * 
 * 4. PASO 4: Crear métodos getMock*() y getCache*()
 * 
 * 5. PASO 5: ¡Listo! Tu servicio ahora es resiliente
 */

/**
 * EJEMPLO: Aplicar a ProductService
 * 
 * @Injectable({ providedIn: 'root' })
 * export class ProductService {
 *   private api = inject(ApiService);
 *   private cachedProducts: Product[] = [];
 * 
 *   getProducts(): Observable<Product[]> {
 *     return this.api.get<Product[]>('productos').pipe(
 *       tap(products => this.cachedProducts = products),
 *       catchError((error, caught) => {
 *         if (!navigator.onLine) return of(this.cachedProducts);
 *         if (error.status === 503) return timer(2000).pipe(switchMap(() => caught));
 *         if (error.status === 404) return of(this.getMockProducts());
 *         if (error.status === 401) return throwError(() => error);
 *         return of([]);
 *       })
 *     );
 *   }
 * 
 *   private getMockProducts(): Product[] {
 *     return [
 *       { id: 1, name: 'Producto 1', price: 100 },
 *       { id: 2, name: 'Producto 2', price: 200 }
 *     ];
 *   }
 * }
 */

/**
 * REFERENCIAS IMPLEMENTADAS
 * 
 * ✅ NotificationsService - Implementado con fallback selectivo
 * ✅ MedicineService - Implementado con fallback selectivo + caché
 * 📝 FALLBACK_PATTERN.md - Documentación completa del patrón
 * 📝 IMPLEMENTACION_FALLBACK.md - Resumen de cambios realizados
 */
