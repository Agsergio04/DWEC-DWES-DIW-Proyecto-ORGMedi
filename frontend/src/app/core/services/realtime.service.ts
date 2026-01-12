import { Injectable, inject } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Observable, Subject, timer, EMPTY } from 'rxjs';
import { retryWhen, tap, delayWhen, catchError } from 'rxjs/operators';
import { ToastService } from '../../shared/toast.service';

/**
 * Servicio para conexiones WebSocket en tiempo real
 * 
 * Características:
 * ✅ Conexión WebSocket bidireccional
 * ✅ Reconexión automática con backoff exponencial
 * ✅ Manejo de errores y notificaciones
 * ✅ Múltiples canales/topics
 * ✅ Estado de conexión observable
 * 
 * Uso ideal:
 * - Chat en tiempo real
 * - Notificaciones push
 * - Dashboards en vivo
 * - Actualizaciones colaborativas
 * - Feeds de eventos
 * 
 * @example
 * // Conectar y escuchar mensajes
 * const realtime = inject(RealtimeService);
 * realtime.connect('wss://api.miapp.com/ws');
 * realtime.listen<Notification>().subscribe(msg => {
 *   console.log('Nueva notificación:', msg);
 * });
 * 
 * // Enviar mensaje
 * realtime.send({ type: 'subscribe', channel: 'medicines' });
 * 
 * // Limpiar al destruir
 * ngOnDestroy() {
 *   realtime.close();
 * }
 */
@Injectable({ providedIn: 'root' })
export class RealtimeService {
  private toastService = inject(ToastService);

  private socket$: WebSocketSubject<any> | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 2000; // Base: 2 segundos

  // Subject para estado de conexión
  private connectionStatus$ = new Subject<'connected' | 'disconnected' | 'reconnecting' | 'error'>();

  /**
   * Estado de la conexión WebSocket
   */
  get connectionStatus(): Observable<'connected' | 'disconnected' | 'reconnecting' | 'error'> {
    return this.connectionStatus$.asObservable();
  }

  /**
   * Conecta al servidor WebSocket
   * 
   * @param url - URL del WebSocket (debe empezar con ws:// o wss://)
   * @returns WebSocketSubject para interactuar con el servidor
   * 
   * @example
   * // Producción con SSL
   * connect('wss://api.miapp.com/ws/notifications');
   * 
   * // Desarrollo local
   * connect('ws://localhost:8080/ws');
   */
  connect(url = 'wss://api.miapp.com/ws/notifications'): WebSocketSubject<any> {
    if (!this.socket$ || this.socket$.closed) {
      this.socket$ = webSocket({
        url,
        openObserver: {
          next: () => {
            console.log('✅ WebSocket conectado:', url);
            this.reconnectAttempts = 0;
            this.connectionStatus$.next('connected');
            this.toastService.success('Conexión en tiempo real establecida');
          }
        },
        closeObserver: {
          next: () => {
            console.log('🔌 WebSocket desconectado');
            this.connectionStatus$.next('disconnected');
          }
        }
      });
    }
    return this.socket$;
  }

  /**
   * Escucha mensajes del WebSocket con reconexión automática
   * 
   * @returns Observable que emite mensajes del servidor
   * 
   * @example
   * listen<Notification>().subscribe({
   *   next: (msg) => console.log('Mensaje:', msg),
   *   error: (err) => console.error('Error:', err)
   * });
   */
  listen<T>(): Observable<T> {
    return this.connect().asObservable().pipe(
      retryWhen(errors =>
        errors.pipe(
          tap(err => {
            this.reconnectAttempts++;
            console.error(`❌ Error WebSocket (intento ${this.reconnectAttempts}):`, err);

            if (this.reconnectAttempts >= this.maxReconnectAttempts) {
              this.connectionStatus$.next('error');
              this.toastService.error('No se pudo restablecer la conexión en tiempo real');
              throw new Error('Max reconnect attempts reached');
            }

            this.connectionStatus$.next('reconnecting');
            const delay = this.getReconnectDelay();
            console.log(`🔄 Reintentando conexión en ${delay}ms...`);
          }),
          delayWhen(() => timer(this.getReconnectDelay()))
        )
      ),
      catchError(error => {
        console.error('💥 Error fatal en WebSocket:', error);
        this.connectionStatus$.next('error');
        return EMPTY;
      })
    );
  }

  /**
   * Envía un mensaje al servidor WebSocket
   * 
   * @param message - Mensaje a enviar (será serializado a JSON)
   * 
   * @example
   * // Suscribirse a un canal
   * send({ type: 'subscribe', channel: 'medicines' });
   * 
   * // Enviar datos
   * send({ type: 'update', data: { id: 1, status: 'active' } });
   */
  send(message: unknown): void {
    if (this.socket$ && !this.socket$.closed) {
      this.socket$.next(message);
      console.log('📤 Mensaje enviado:', message);
    } else {
      console.warn('⚠️ WebSocket no conectado. No se puede enviar mensaje.');
      this.toastService.error('No hay conexión en tiempo real');
    }
  }

  /**
   * Cierra la conexión WebSocket
   */
  close(): void {
    if (this.socket$) {
      this.socket$.complete();
      this.socket$ = null;
      this.connectionStatus$.next('disconnected');
      console.log('🔌 WebSocket cerrado manualmente');
    }
  }

  /**
   * Calcula el delay de reconexión con backoff exponencial
   * 
   * Estrategia:
   * - Intento 1: 2 segundos
   * - Intento 2: 4 segundos
   * - Intento 3: 8 segundos
   * - Intento 4: 16 segundos
   * - Intento 5: 32 segundos
   * 
   * @returns Tiempo en milisegundos a esperar antes de reconectar
   */
  private getReconnectDelay(): number {
    // Backoff exponencial: 2^attempt * reconnectInterval
    // Máximo 30 segundos
    return Math.min(
      Math.pow(2, this.reconnectAttempts - 1) * this.reconnectInterval,
      30000
    );
  }

  /**
   * Verifica si el WebSocket está conectado
   */
  isConnected(): boolean {
    return this.socket$ !== null && !this.socket$.closed;
  }

  /**
   * Resetea los intentos de reconexión (útil para testing)
   */
  resetReconnectAttempts(): void {
    this.reconnectAttempts = 0;
  }
}
