import { Injectable, inject, signal } from '@angular/core';
import { Observable, timer, BehaviorSubject, EMPTY, of, throwError } from 'rxjs';
import { switchMap, shareReplay, catchError, tap, retry } from 'rxjs/operators';
import { ApiService } from '../data/api.service';
import { ToastService } from '../../../shared/toast.service';

/**
 * Modelo de notificación
 * @property id - ID único
 * @property type - Tipo de notificación (info, success, warning, error)
 * @property title - Título
 * @property message - Mensaje
 * @property timestamp - Fecha de creación
 * @property read - Si ha sido leída
 * @property action - Acción opcional (botón con enlace)
 */
export interface Notification {
  id: number;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    url: string;
  };
}

/**
 * Respuesta de la API de notificaciones
 */
interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
  total: number;
}

/**
 * Servicio de Notificaciones
 * =========================
 * 
 * Gestiona notificaciones con dos modos de operación:
 * 
 * 1. **Polling Automático** - Obtiene notificaciones cada X segundos
 *    - Sin WebSocket: ideal para APIs simples
 *    - Intervalo configurable (default 30s)
 *    - Manejo automático de errores
 * 
 * 2. **Control Manual** - Inicia/detiene el polling bajo demanda
 *    - Útil cuando el polling debe activarse solo después de login
 *    - startPolling(ms) / stopPolling()
 * 
 * Características adicionales:
 *  Contador de no leídas en tiempo real (Signal)
 *  Reintentos automáticos en errores
 *  Cache local de notificaciones
 *  Fallback con datos mock si no hay conexión
 *  Marcación de leídas/eliminación
 * 
 * @example
 * // Polling automático cada 30 segundos
 * notifications$ = notificationsService.pollNotifications(30000);
 * 
 * // Control manual
 * notificationsService.startPolling(60000);
 * notificationsService.stopPolling();
 * 
 * // Contador de no leídas
 * unreadCount = notificationsService.unreadCount;
 * 
 * // Marcar como leída
 * notificationsService.markAsRead(123);
 */
@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private apiService = inject(ApiService);
  private toastService = inject(ToastService);

  // ============ CONTROL DE POLLING ============
  
  /** Observable para controlar el intervalo de polling */
  private pollingSubject = new BehaviorSubject<number>(0);
  
  /** Indica si el polling manual está activo */
  private isPolling = false;

  // ============ ESTADO ============
  
  /** Signal: Contador de notificaciones no leídas */
  unreadCount = signal(0);

  /** Signal: Cache de las notificaciones actuales */
  private notificationsCache = signal<Notification[]>([]);

  /**
   * Obtiene las notificaciones actuales del cache (solo lectura)
   */
  get notifications() {
    return this.notificationsCache.asReadonly();
  }

  /**
   * Polling Automático de Notificaciones
   * ====================================
   * 
   * Obtiene notificaciones periódicamente:
   * - Emite inmediatamente (sin esperar al primer intervalo)
   * - Repite cada X milisegundos (default: 30s)
   * - Cancela peticiones anteriores si llega un nuevo intervalo
   * - Comparte resultados entre múltiples suscriptores
   * - Maneja errores sin detener el polling
   * 
   * @param intervalMs - Intervalo en milisegundos (default: 30000)
   * @returns Observable que emite las notificaciones periódicamente
   * 
   * @example
   * // En el componente
   * notifications$ = this.notificationsService.pollNotifications(30000);
   * 
   * // En el template
   * @if (notifications$ | async; as notifications) {
   *   @for (notification of notifications; track notification.id) {
   *     <div>{{ notification.message }}</div>
   *   }
   * }
   */
  pollNotifications(intervalMs = 30000): Observable<Notification[]> {
    return timer(0, intervalMs).pipe(
      switchMap(() => this.fetchNotifications()),
      shareReplay(1), // Comparte resultados entre suscriptores
      catchError(error => {
        console.error('❌ Error en polling de notificaciones:', error);
        // No interrumpir el polling, continuar intentando
        return EMPTY;
      })
    );
  }

  /**
   * Inicia Polling Manual
   * ====================
   * 
   * Comienza a obtener notificaciones periódicamente.
   * Útil cuando el polling debe activarse solo bajo ciertas condiciones.
   * 
   * @param intervalMs - Intervalo en milisegundos (default: 30000)
   * 
   * @example
   * // Iniciar cuando el usuario hace login
   * authService.user$.subscribe(user => {
   *   if (user) {
   *     notificationsService.startPolling(60000);
   *   } else {
   *     notificationsService.stopPolling();
   *   }
   * });
   */
  startPolling(intervalMs = 30000): void {
    if (this.isPolling) {
      return;
    }

    this.isPolling = true;
    this.pollingSubject.next(intervalMs);
  }

  /**
   * Detiene Polling Manual
   * 
   * Cancela las peticiones periódicas de notificaciones
   */
  stopPolling(): void {
    if (!this.isPolling) {
      console.debug('ℹ️ El polling no estaba activo, ignorando detención');
      return;
    }

    this.isPolling = false;
    this.pollingSubject.next(0);
  }

  /**
   * Observable de Polling Controlable
   * 
   * Se activa cuando startPolling() es llamado
   * Se detiene cuando stopPolling() es llamado
   * 
   * @returns Observable que emite cuando hay nuevas notificaciones
   */
  get controlledPolling$(): Observable<Notification[]> {
    return this.pollingSubject.pipe(
      switchMap(interval => {
        if (interval === 0) {
          return EMPTY; // Sin polling
        }
        return timer(0, interval).pipe(
          switchMap(() => this.fetchNotifications())
        );
      }),
      shareReplay(1)
    );
  }

  /**
   * Obtiene Notificaciones del Servidor
   * =================================
   * 
   * Llamada HTTP única (sin polling).
   * Con fallback inteligente según tipo de error:
   * - Sin internet → datos mock
   * - Servidor down (503) → reintentar
   * - No autorizado (401) → propagar error
   * - Otros errores → propagar error
   * 
   * @returns Observable con las notificaciones
   * @private
   */
  private fetchNotifications(): Observable<Notification[]> {
    return this.apiService.get<Notification[] | NotificationsResponse>('notifications').pipe(
      retry(2), // Reintentar 2 veces si falla
      tap(response => {
        // Manejar ambos formatos: Array puro o Objeto con propiedades
        const notifications = Array.isArray(response) ? response : response.notifications || [];
        const unreadCount = Array.isArray(response) ? notifications.filter(n => !n.read).length : response.unreadCount || 0;
        
        // Actualizar cache y contador
        this.notificationsCache.set(notifications);
        this.unreadCount.set(unreadCount);
      }),
      switchMap(response => [Array.isArray(response) ? response : response.notifications || []]),
      catchError((error, caught) => {
        console.error('❌ Error al obtener notificaciones:', error);

        // ========== FALLBACK SELECTIVO SEGÚN TIPO DE ERROR ==========
        
        // 1️⃣ SIN INTERNET → Usar datos mock
        if (!navigator.onLine) {
          const mockNotifications = this.getMockNotifications();
          this.notificationsCache.set(mockNotifications);
          this.unreadCount.set(mockNotifications.filter(n => !n.read).length);
          this.toastService.warning('Modo offline: mostrando datos de demostración');
          return of(mockNotifications);
        }

        // 2️⃣ SERVIDOR NO DISPONIBLE (503) → Reintentar después de 2 segundos
        if (error.status === 503) {
          this.toastService.warning('Servidor temporalmente no disponible, reintentando...');
          return timer(2000).pipe(
            switchMap(() => caught) // Reintentar toda la cadena
          );
        }

        // 3️⃣ ENDPOINT NO ENCONTRADO (404) → Usar datos mock
        if (error.status === 404) {
          const mockNotifications = this.getMockNotifications();
          this.notificationsCache.set(mockNotifications);
          this.unreadCount.set(mockNotifications.filter(n => !n.read).length);
          this.toastService.info('Notificaciones no disponibles, mostrando demo');
          return of(mockNotifications);
        }

        // 4️⃣ NO AUTORIZADO (401) → Propagar error (usuario debe loguearse)
        if (error.status === 401) {
          console.error('🔐 No autorizado (401) → Limpiando sesión');
          this.toastService.error('Sesión expirada, por favor vuelve a iniciar sesión');
          return throwError(() => error);
        }

        // 5️⃣ PROHIBIDO (403) → Token inválido/expirado o usuario sin permisos
        if (error.status === 403) {
          console.error('🚫 Prohibido (403) → Token inválido o expirado');
          // El interceptor de errores manejará esto y redirigirá al login
          return throwError(() => error);
        }

        // 6️⃣ OTROS ERRORES → Propagar error original
        console.error('⚠️ Error inesperado:', error.status, error.message);
        this.toastService.error('Error al cargar notificaciones');
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtiene Notificaciones Una Sola Vez
   * ===================================
   * 
   * Llamada HTTP única (sin polling).
   * Útil para refrescar manualmente las notificaciones.
   * 
   * @returns Observable con las notificaciones
   * 
   * @example
   * // Botón para refrescar
   * <button (click)="refresh()">Actualizar</button>
   * 
   * refresh() {
   *   this.notificationsService.getNotifications().subscribe();
   * }
   */
  getNotifications(): Observable<Notification[]> {
    return this.fetchNotifications();
  }

  /**
   * Marca una Notificación como Leída
   * ================================
   * 
   * Actualiza en el servidor y en el cache local.
   * Decrementa el contador de no leídas.
   * 
   * @param id - ID de la notificación a marcar como leída
   * @returns Observable que completa cuando se actualiza
   * 
   * @example
   * markAsRead(123);
   */
  markAsRead(id: number): Observable<void> {
    return this.apiService.patch<void>(`notifications/${id}/read`, {}).pipe(
      tap(() => {
        // Actualizar cache local
        this.notificationsCache.update(notifications =>
          notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
          )
        );

        // Decrementar contador de no leídas
        this.unreadCount.update(count => Math.max(0, count - 1));
      }),
      catchError(error => {
        console.error('❌ Error al marcar notificación como leída:', error);
        this.toastService.error('Error al actualizar notificación');
        return EMPTY;
      })
    );
  }

  /**
   * Marca Todas las Notificaciones como Leídas
   * ========================================
   * 
   * Llamada especial al servidor para marcar todo de una vez.
   * Actualiza cache local y contador.
   */
  markAllAsRead(): Observable<void> {
    return this.apiService.post<void>('notifications/read-all', {}).pipe(
      tap(() => {
        // Actualizar cache local: todas como leídas
        this.notificationsCache.update(notifications =>
          notifications.map(n => ({ ...n, read: true }))
        );

        this.unreadCount.set(0);
        this.toastService.success('Todas las notificaciones marcadas como leídas');
      }),
      catchError(error => {
        console.error('❌ Error al marcar todas como leídas:', error);
        this.toastService.error('Error al actualizar notificaciones');
        return EMPTY;
      })
    );
  }

  /**
   * Elimina una Notificación
   * ======================
   * 
   * Borra del servidor y del cache local.
   * También decrementa el contador si estaba sin leer.
   * 
   * @param id - ID de la notificación a eliminar
   */
  deleteNotification(id: number): Observable<void> {
    return this.apiService.delete<void>(`notifications/${id}`).pipe(
      tap(() => {
        // Verificar si estaba sin leer antes de eliminar
        const wasUnread = this.notificationsCache().find(n => n.id === id)?.read === false;
        
        // Eliminar del cache
        this.notificationsCache.update(notifications =>
          notifications.filter(n => n.id !== id)
        );

        // Decrementar contador si estaba sin leer
        if (wasUnread) {
          this.unreadCount.update(count => Math.max(0, count - 1));
        }
      }),
      catchError(error => {
        console.error('❌ Error al eliminar notificación:', error);
        this.toastService.error('Error al eliminar notificación');
        return EMPTY;
      })
    );
  }

  /**
   * Datos Mock de Notificaciones
   * ==========================
   * 
   * Devuelve datos de ejemplo para desarrollo/demostración.
   * Se usa cuando:
   * - No hay conexión a internet
   * - El backend no está disponible
   * - El endpoint no existe (404)
   * 
   * @returns Array de notificaciones ficticias
   */
  getMockNotifications(): Notification[] {
    return [
      {
        id: 1,
        type: 'success',
        title: 'Medicamento agregado',
        message: 'Paracetamol 500mg se agregó correctamente',
        timestamp: new Date(Date.now() - 5 * 60 * 1000), // Hace 5 minutos
        read: false,
        action: {
          label: 'Ver medicamento',
          url: '/medicines/1'
        }
      },
      {
        id: 2,
        type: 'warning',
        title: 'Medicamento por vencer',
        message: 'Ibuprofeno 400mg vence en 7 días',
        timestamp: new Date(Date.now() - 15 * 60 * 1000), // Hace 15 minutos
        read: false,
        action: {
          label: 'Ver detalles',
          url: '/medicines/2'
        }
      },
      {
        id: 3,
        type: 'error',
        title: 'Medicamento vencido',
        message: 'Aspirina 100mg ha vencido',
        timestamp: new Date(Date.now() - 60 * 60 * 1000), // Hace 1 hora
        read: true
      },
      {
        id: 4,
        type: 'info',
        title: 'Recordatorio',
        message: 'Recuerda tomar tu medicación diaria',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // Hace 2 horas
        read: true
      }
    ];
  }
}
