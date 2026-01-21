import { Injectable, inject, signal } from '@angular/core';
import { Observable, timer, BehaviorSubject, EMPTY, of, throwError } from 'rxjs';
import { switchMap, shareReplay, catchError, tap, startWith, retry } from 'rxjs/operators';
import { ApiService } from '../data/api.service';
import { ToastService } from '../../../shared/toast.service';

/**
 * Modelo de notificación
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
 * Servicio de notificaciones con polling HTTP
 * 
 * Características:
 * ✅ Polling automático configurable
 * ✅ Control manual (start/stop)
 * ✅ Contador de no leídas (Signal)
 * ✅ Reintentos automáticos en caso de error
 * ✅ Compartición de resultados (shareReplay)
 * ✅ Manejo de errores sin interrumpir polling
 * 
 * Uso ideal:
 * - APIs sin WebSocket
 * - Actualizaciones cada 30-60 segundos
 * - Datos que no cambian muy frecuentemente
 * - Simplicidad sobre eficiencia
 * 
 * @example
 * // Auto-polling cada 30 segundos
 * notifications$ = notificationsService.pollNotifications(30000);
 * 
 * // Control manual
 * notificationsService.startPolling(60000);
 * notificationsService.stopPolling();
 * 
 * // Contador de no leídas (Signal)
 * unreadCount = notificationsService.unreadCount;
 */
@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private apiService = inject(ApiService);
  private toastService = inject(ToastService);

  // Control de polling
  private pollingSubject = new BehaviorSubject<number>(0);
  private isPolling = false;

  // Signal para contador de no leídas
  unreadCount = signal(0);

  // Cache de notificaciones
  private notificationsCache = signal<Notification[]>([]);

  /**
   * Obtiene las notificaciones actuales del cache
   */
  get notifications() {
    return this.notificationsCache.asReadonly();
  }

  /**
   * Polling automático de notificaciones
   * 
   * Características:
   * - Emite inmediatamente (timer(0, interval))
   * - Usa switchMap para cancelar peticiones anteriores
   * - shareReplay(1) comparte la última respuesta entre suscriptores
   * - Maneja errores sin interrumpir el polling
   * 
   * @param intervalMs - Intervalo en milisegundos (default: 30000 = 30 segundos)
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
    console.log(`🔄 Iniciando polling de notificaciones cada ${intervalMs}ms`);

    return timer(0, intervalMs).pipe(
      tap(() => console.log('📡 Obteniendo notificaciones...')),
      switchMap(() => this.fetchNotifications()),
      shareReplay(1), // Comparte la última respuesta entre múltiples suscriptores
      catchError(error => {
        console.error('❌ Error en polling de notificaciones:', error);
        // No interrumpir el polling, solo registrar el error
        return EMPTY;
      })
    );
  }

  /**
   * Inicia polling manual controlable
   * 
   * Permite iniciar/detener el polling manualmente desde el componente.
   * Útil cuando el polling debe activarse solo bajo ciertas condiciones.
   * 
   * @param intervalMs - Intervalo en milisegundos
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
      console.warn('⚠️ El polling ya está activo');
      return;
    }

    this.isPolling = true;
    this.pollingSubject.next(intervalMs);
    console.log(`▶️ Polling iniciado (cada ${intervalMs}ms)`);
  }

  /**
   * Detiene el polling manual
   */
  stopPolling(): void {
    if (!this.isPolling) {
      console.warn('⚠️ El polling no está activo');
      return;
    }

    this.isPolling = false;
    this.pollingSubject.next(0);
    console.log('⏸️ Polling detenido');
  }

  /**
   * Observable de polling controlable manualmente
   * 
   * Se activa cuando startPolling() es llamado
   * Se detiene cuando stopPolling() es llamado
   */
  get controlledPolling$(): Observable<Notification[]> {
    return this.pollingSubject.pipe(
      switchMap(interval => {
        if (interval === 0) {
          return EMPTY;
        }
        return timer(0, interval).pipe(
          switchMap(() => this.fetchNotifications())
        );
      }),
      shareReplay(1)
    );
  }

  /**
   * Obtiene notificaciones del servidor (llamada única)
   * Con fallback selectivo según tipo de error
   * 
   * @returns Observable con las notificaciones
   */
  private fetchNotifications(): Observable<Notification[]> {
    return this.apiService.get<Notification[] | NotificationsResponse>('notifications').pipe(
      retry(2), // Reintentar 2 veces si falla
      tap(response => {
        // Manejar ambos formatos: Array directo o Objeto con propiedades
        const notifications = Array.isArray(response) ? response : response.notifications || [];
        const unreadCount = Array.isArray(response) ? notifications.filter(n => !n.read).length : response.unreadCount || 0;
        
        // Actualizar cache y contador
        this.notificationsCache.set(notifications);
        this.unreadCount.set(unreadCount);
        
        console.log(`✅ ${notifications.length} notificaciones obtenidas (${unreadCount} no leídas)`);
      }),
      switchMap(response => [Array.isArray(response) ? response : response.notifications || []]),
      catchError((error, caught) => {
        console.error('❌ Error al obtener notificaciones:', error);

        // ========== FALLBACK SELECTIVO ==========
        
        // 1️⃣ SIN INTERNET → Usar datos mock
        if (!navigator.onLine) {
          console.warn('📵 Sin conexión a internet → Usando datos mock');
          const mockNotifications = this.getMockNotifications();
          this.notificationsCache.set(mockNotifications);
          this.unreadCount.set(mockNotifications.filter(n => !n.read).length);
          this.toastService.warning('Modo offline: mostrando datos de demostración');
          return of(mockNotifications);
        }

        // 2️⃣ SERVIDOR NO DISPONIBLE (503) → Reintentar después de 2 segundos
        if (error.status === 503) {
          console.warn('🔄 Servidor no disponible → Reintentando en 2 segundos');
          this.toastService.warning('Servidor temporalmente no disponible, reintentando...');
          return timer(2000).pipe(
            switchMap(() => caught) // Reintentar toda la cadena
          );
        }

        // 3️⃣ ENDPOINT NO ENCONTRADO (404) → Usar datos mock
        if (error.status === 404) {
          console.warn('🚫 Endpoint no existe → Usando datos mock');
          const mockNotifications = this.getMockNotifications();
          this.notificationsCache.set(mockNotifications);
          this.unreadCount.set(mockNotifications.filter(n => !n.read).length);
          this.toastService.info('Notificaciones no disponibles, mostrando demo');
          return of(mockNotifications);
        }

        // 4️⃣ NO AUTORIZADO (401) → Propagar error (usuario debe loguearse)
        if (error.status === 401) {
          console.error('🔐 No autorizado → Limpiando sesión');
          this.toastService.error('Sesión expirada, por favor vuelve a iniciar sesión');
          return throwError(() => error);
        }

        // 5️⃣ OTROS ERRORES → Propagar error original
        console.error('⚠️ Error inesperado:', error.status, error.message);
        this.toastService.error('Error al cargar notificaciones');
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtiene notificaciones una sola vez (sin polling)
   * 
   * @returns Observable con las notificaciones
   * 
   * @example
   * // Refrescar manualmente
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
   * Marca una notificación como leída
   * 
   * @param id - ID de la notificación
   * @returns Observable que completa cuando se marca como leída
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

        // Decrementar contador
        this.unreadCount.update(count => Math.max(0, count - 1));

        console.log(`✅ Notificación ${id} marcada como leída`);
      }),
      catchError(error => {
        console.error('❌ Error al marcar notificación como leída:', error);
        this.toastService.error('Error al actualizar notificación');
        return EMPTY;
      })
    );
  }

  /**
   * Marca todas las notificaciones como leídas
   */
  markAllAsRead(): Observable<void> {
    return this.apiService.post<void>('notifications/read-all', {}).pipe(
      tap(() => {
        // Actualizar cache local
        this.notificationsCache.update(notifications =>
          notifications.map(n => ({ ...n, read: true }))
        );

        this.unreadCount.set(0);
        console.log('✅ Todas las notificaciones marcadas como leídas');
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
   * Elimina una notificación
   */
  deleteNotification(id: number): Observable<void> {
    return this.apiService.delete<void>(`notifications/${id}`).pipe(
      tap(() => {
        // Actualizar cache local
        const wasUnread = this.notificationsCache().find(n => n.id === id)?.read === false;
        
        this.notificationsCache.update(notifications =>
          notifications.filter(n => n.id !== id)
        );

        if (wasUnread) {
          this.unreadCount.update(count => Math.max(0, count - 1));
        }

        console.log(`🗑️ Notificación ${id} eliminada`);
      }),
      catchError(error => {
        console.error('❌ Error al eliminar notificación:', error);
        this.toastService.error('Error al eliminar notificación');
        return EMPTY;
      })
    );
  }

  /**
   * Simula datos de notificaciones (para desarrollo/demo)
   * 
   * Devuelve notificaciones mock cuando el backend no está disponible
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
