import { 
  Component, 
  ChangeDetectionStrategy, 
  inject,
  OnInit,
  OnDestroy,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RealtimeService } from '../../core/services/realtime.service';
import { Notification } from '../../core/services/notifications.service';

/**
 * Componente de demostración: Notificaciones en tiempo real con WebSocket
 * 
 * Características:
 * ✅ Conexión WebSocket bidireccional
 * ✅ Recepción de mensajes en tiempo real
 * ✅ Estado de conexión visible
 * ✅ Reconexión automática con backoff exponencial
 * ✅ Envío de mensajes al servidor
 * ✅ Desconexión limpia en ngOnDestroy
 * 
 * WebSocket vs HTTP Polling:
 * ✅ Latencia ultra-baja (push inmediato)
 * ✅ Bidireccional (servidor puede iniciar comunicación)
 * ✅ Eficiente (una sola conexión persistente)
 * ⚠️ Requiere backend compatible
 * ⚠️ Más complejo de implementar
 * ⚠️ Problemas con proxies/firewalls
 * 
 * Casos de uso ideales:
 * - Chat en tiempo real
 * - Notificaciones push instantáneas
 * - Dashboards en vivo (precios, métricas)
 * - Colaboración en tiempo real
 * - Feeds de eventos (Twitter-like)
 * - Gaming/aplicaciones interactivas
 */
@Component({
  selector: 'app-notifications-websocket',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="notifications-container">
      <!-- Header -->
      <header class="header">
        <div class="header-content">
          <div>
            <h2>Notificaciones en Tiempo Real</h2>
            <p class="subtitle">WebSocket bidireccional con reconexión automática</p>
          </div>

          <!-- Estado de conexión -->
          <div class="connection-badge" [class]="'status-' + connectionStatus()">
            <span class="status-indicator"></span>
            <div class="status-info">
              <strong>{{ getStatusLabel(connectionStatus()) }}</strong>
              <small>{{ getStatusDescription(connectionStatus()) }}</small>
            </div>
          </div>
        </div>
      </header>

      <!-- Controles -->
      <div class="controls-section">
        <button 
          (click)="connect()" 
          [disabled]="connectionStatus() === 'connected' || connectionStatus() === 'reconnecting'"
          class="btn btn-primary">
          🔌 Conectar WebSocket
        </button>

        <button 
          (click)="disconnect()" 
          [disabled]="connectionStatus() === 'disconnected'"
          class="btn btn-secondary">
          ❌ Desconectar
        </button>

        <button 
          (click)="sendTestMessage()" 
          [disabled]="connectionStatus() !== 'connected'"
          class="btn btn-accent">
          📤 Enviar mensaje de prueba
        </button>

        <button 
          (click)="clearNotifications()" 
          class="btn btn-danger">
          🗑️ Limpiar ({{ notifications().length }})
        </button>
      </div>

      <!-- Info técnica -->
      <div class="info-panel">
        <h3>💡 Información de la conexión</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Protocolo:</span>
            <code>WebSocket (wss://)</code>
          </div>
          <div class="info-item">
            <span class="info-label">Estado:</span>
            <code>{{ connectionStatus() }}</code>
          </div>
          <div class="info-item">
            <span class="info-label">Mensajes recibidos:</span>
            <code>{{ notifications().length }}</code>
          </div>
          <div class="info-item">
            <span class="info-label">Reconexión automática:</span>
            <code>✅ Backoff exponencial</code>
          </div>
        </div>
      </div>

      <!-- Lista de notificaciones -->
      <div class="notifications-section">
        <div class="section-header">
          <h3>📬 Notificaciones Recibidas</h3>
          @if (notifications().length > 0) {
            <span class="badge">{{ notifications().length }}</span>
          }
        </div>

        @if (connectionStatus() === 'disconnected') {
          <div class="empty-state">
            <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              <line x1="1" y1="1" x2="23" y2="23"/>
            </svg>
            <h4>Desconectado</h4>
            <p>Conecta al WebSocket para recibir notificaciones en tiempo real</p>
            <button (click)="connect()" class="btn btn-primary">
              Conectar ahora
            </button>
          </div>
        } @else if (notifications().length === 0) {
          <div class="empty-state">
            <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <h4>Sin notificaciones</h4>
            <p>Esperando mensajes del servidor...</p>
            <button (click)="sendTestMessage()" class="btn btn-accent" [disabled]="connectionStatus() !== 'connected'">
              Enviar mensaje de prueba
            </button>
          </div>
        } @else {
          <div class="notifications-list">
            @for (notification of notifications(); track notification.id) {
              <article class="notification-card" [class]="'type-' + notification.type">
                <div class="notification-icon">
                  {{ getNotificationIcon(notification.type) }}
                </div>

                <div class="notification-content">
                  <div class="notification-header">
                    <h4>{{ notification.title }}</h4>
                    <span class="notification-time">{{ formatTime(notification.timestamp) }}</span>
                  </div>

                  <p class="notification-message">{{ notification.message }}</p>

                  @if (notification.action) {
                    <a [href]="notification.action.url" class="notification-action">
                      {{ notification.action.label }} →
                    </a>
                  }
                </div>

                <button 
                  (click)="removeNotification(notification.id)" 
                  class="notification-close"
                  aria-label="Cerrar notificación">
                  ✕
                </button>
              </article>
            }
          </div>
        }
      </div>

      <!-- Explicación técnica -->
      <div class="tech-explanation">
        <h4>🔧 Implementación Técnica - WebSocket</h4>

        <div class="explanation-section">
          <h5>1️⃣ Conexión y Reconexión</h5>
          <div class="code-example">
            <pre><code>// Servicio RealtimeService
connect(url: string): WebSocketSubject&lt;any&gt; {{ '{' }}
  this.socket$ = webSocket({{ '{' }}
    url,
    openObserver: {{ '{' }}
      next: () => console.log('✅ Conectado')
    {{ '}' }},
    closeObserver: {{ '{' }}
      next: () => console.log('🔌 Desconectado')
    {{ '}' }}
  {{ '}' }});
  return this.socket$;
{{ '}' }}

// Reconexión automática con backoff exponencial
listen&lt;T&gt;(): Observable&lt;T&gt; {
  return this.connect().pipe(
    retryWhen(errors => errors.pipe(
      tap(err => console.error('Error:', err)),
      delayWhen(() => timer(this.getBackoffDelay()))
    ))
  );
}</code></pre>
          </div>
        </div>

        <div class="explanation-section">
          <h5>2️⃣ Uso en el Componente</h5>
          <div class="code-example">
            <pre><code>notifications = signal&lt;Notification[]&gt;([]);

ngOnInit() {
  // Conectar al WebSocket
  this.realtime.connect('wss://api.miapp.com/ws');

  // Escuchar mensajes
  this.realtime.listen&lt;Notification&gt;().subscribe({
    next: (msg) => {
      // Agregar al inicio de la lista
      this.notifications.update(list => [msg, ...list]);
    },
    error: (err) => console.error('Error:', err)
  });
}

// Limpiar al destruir
ngOnDestroy() {
  this.realtime.close();
}</code></pre>
          </div>
        </div>

        <div class="comparison-section">
          <h5>📊 WebSocket vs HTTP Polling</h5>
          <table class="comparison-table">
            <thead>
              <tr>
                <th>Característica</th>
                <th>WebSocket</th>
                <th>HTTP Polling</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Latencia</strong></td>
                <td>✅ Ultra-baja (~10ms)</td>
                <td>⚠️ Variable (segundos)</td>
              </tr>
              <tr>
                <td><strong>Dirección</strong></td>
                <td>✅ Bidireccional</td>
                <td>❌ Solo cliente → servidor</td>
              </tr>
              <tr>
                <td><strong>Eficiencia</strong></td>
                <td>✅ Una conexión persistente</td>
                <td>⚠️ Nueva conexión cada vez</td>
              </tr>
              <tr>
                <td><strong>Overhead</strong></td>
                <td>✅ Mínimo (sin headers HTTP)</td>
                <td>❌ Headers HTTP completos</td>
              </tr>
              <tr>
                <td><strong>Implementación</strong></td>
                <td>⚠️ Compleja</td>
                <td>✅ Simple</td>
              </tr>
              <tr>
                <td><strong>Backend</strong></td>
                <td>⚠️ Requiere soporte WS</td>
                <td>✅ Cualquier REST API</td>
              </tr>
              <tr>
                <td><strong>Firewall/Proxy</strong></td>
                <td>⚠️ Puede ser bloqueado</td>
                <td>✅ Funciona siempre</td>
              </tr>
              <tr>
                <td><strong>Escalabilidad</strong></td>
                <td>⚠️ Requiere sticky sessions</td>
                <td>✅ Stateless</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="best-practices">
          <h5>💡 Best Practices</h5>
          <ul>
            <li>✅ Implementar reconexión automática con backoff exponencial</li>
            <li>✅ Mostrar estado de conexión al usuario (conectado/desconectado/reconectando)</li>
            <li>✅ Cerrar conexión en ngOnDestroy para evitar memory leaks</li>
            <li>✅ Usar wss:// (WebSocket Secure) en producción</li>
            <li>✅ Implementar heartbeat/ping-pong para detectar conexiones muertas</li>
            <li>⚠️ Considerar fallback a polling si WebSocket falla</li>
            <li>⚠️ Limitar el número de reconexiones (evitar loops infinitos)</li>
            <li>⚠️ Validar y sanitizar mensajes del servidor</li>
          </ul>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .notifications-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    /* Header */
    .header {
      margin-bottom: 2rem;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 2rem;
    }

    .header h2 {
      margin: 0 0 0.5rem;
      font-size: 1.75rem;
      color: var(--color-text-primary, #1a202c);
    }

    .subtitle {
      margin: 0;
      color: var(--color-text-secondary, #718096);
      font-size: 0.95rem;
    }

    /* Estado de conexión */
    .connection-badge {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 1.5rem;
      border-radius: 0.75rem;
      border: 2px solid;
      transition: all 0.3s;
    }

    .status-connected {
      background: #d1fae5;
      border-color: #10b981;
      color: #065f46;
    }

    .status-disconnected {
      background: #fee2e2;
      border-color: #ef4444;
      color: #991b1b;
    }

    .status-reconnecting {
      background: #fef3c7;
      border-color: #f59e0b;
      color: #92400e;
    }

    .status-error {
      background: #fee2e2;
      border-color: #dc2626;
      color: #7f1d1d;
    }

    .status-indicator {
      width: 1rem;
      height: 1rem;
      border-radius: 50%;
      background: currentColor;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    .status-info strong {
      display: block;
      font-size: 0.95rem;
      margin-bottom: 0.25rem;
    }

    .status-info small {
      display: block;
      font-size: 0.75rem;
      opacity: 0.8;
    }

    /* Controles */
    .controls-section {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 0.5rem;
      font-size: 0.95rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-primary {
      background: #3b82f6;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #2563eb;
      transform: translateY(-1px);
    }

    .btn-secondary {
      background: #6b7280;
      color: white;
    }

    .btn-secondary:hover:not(:disabled) {
      background: #4b5563;
    }

    .btn-accent {
      background: #10b981;
      color: white;
    }

    .btn-accent:hover:not(:disabled) {
      background: #059669;
    }

    .btn-danger {
      background: #ef4444;
      color: white;
    }

    .btn-danger:hover:not(:disabled) {
      background: #dc2626;
    }

    /* Info panel */
    .info-panel {
      padding: 1.5rem;
      background: var(--color-bg-secondary, #f7fafc);
      border-radius: 0.75rem;
      border-left: 4px solid #3b82f6;
      margin-bottom: 2rem;
    }

    .info-panel h3 {
      margin: 0 0 1rem;
      font-size: 1.1rem;
      color: var(--color-text-primary, #1a202c);
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
    }

    .info-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem;
      background: white;
      border-radius: 0.375rem;
    }

    .info-label {
      font-weight: 600;
      color: var(--color-text-secondary, #718096);
      font-size: 0.9rem;
    }

    .info-item code {
      background: #e2e8f0;
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      font-size: 0.85rem;
      color: #3b82f6;
    }

    /* Notifications section */
    .notifications-section {
      margin-bottom: 2rem;
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .section-header h3 {
      margin: 0;
      font-size: 1.25rem;
      color: var(--color-text-primary, #1a202c);
    }

    .badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 2rem;
      height: 2rem;
      padding: 0 0.5rem;
      background: #3b82f6;
      color: white;
      border-radius: 9999px;
      font-size: 0.85rem;
      font-weight: 600;
    }

    /* Empty state */
    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      background: var(--color-bg-secondary, #f7fafc);
      border-radius: 0.75rem;
    }

    .empty-icon {
      width: 4rem;
      height: 4rem;
      margin: 0 auto 1rem;
      color: var(--color-text-tertiary, #a0aec0);
      stroke-width: 1.5;
    }

    .empty-state h4 {
      margin: 0 0 0.5rem;
      font-size: 1.25rem;
      color: var(--color-text-primary, #1a202c);
    }

    .empty-state p {
      margin: 0 0 1.5rem;
      color: var(--color-text-secondary, #718096);
    }

    /* Notifications list */
    .notifications-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .notification-card {
      display: flex;
      gap: 1rem;
      padding: 1.25rem;
      background: white;
      border-radius: 0.75rem;
      border-left: 4px solid;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      transition: all 0.2s;
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(-20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    .notification-card:hover {
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .notification-card.type-success {
      border-color: #10b981;
    }

    .notification-card.type-info {
      border-color: #3b82f6;
    }

    .notification-card.type-warning {
      border-color: #f59e0b;
    }

    .notification-card.type-error {
      border-color: #ef4444;
    }

    .notification-icon {
      width: 2.5rem;
      height: 2.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      font-size: 1.25rem;
      flex-shrink: 0;
    }

    .type-success .notification-icon {
      background: #d1fae5;
    }

    .type-info .notification-icon {
      background: #dbeafe;
    }

    .type-warning .notification-icon {
      background: #fef3c7;
    }

    .type-error .notification-icon {
      background: #fee2e2;
    }

    .notification-content {
      flex: 1;
    }

    .notification-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      margin-bottom: 0.5rem;
    }

    .notification-header h4 {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
      color: var(--color-text-primary, #1a202c);
    }

    .notification-time {
      font-size: 0.75rem;
      color: var(--color-text-tertiary, #a0aec0);
      white-space: nowrap;
    }

    .notification-message {
      margin: 0 0 0.75rem;
      font-size: 0.9rem;
      color: var(--color-text-secondary, #718096);
      line-height: 1.5;
    }

    .notification-action {
      display: inline-block;
      font-size: 0.85rem;
      font-weight: 500;
      color: #3b82f6;
      text-decoration: none;
      transition: color 0.2s;
    }

    .notification-action:hover {
      color: #2563eb;
      text-decoration: underline;
    }

    .notification-close {
      width: 2rem;
      height: 2rem;
      border: none;
      background: transparent;
      color: var(--color-text-tertiary, #a0aec0);
      font-size: 1.25rem;
      cursor: pointer;
      border-radius: 0.25rem;
      transition: all 0.2s;
      flex-shrink: 0;
    }

    .notification-close:hover {
      background: var(--color-bg-secondary, #f7fafc);
      color: var(--color-text-primary, #1a202c);
    }

    /* Tech explanation */
    .tech-explanation {
      margin-top: 3rem;
      padding: 2rem;
      background: var(--color-bg-secondary, #f7fafc);
      border-radius: 0.75rem;
      border-left: 4px solid #10b981;
    }

    .tech-explanation h4 {
      margin: 0 0 2rem;
      font-size: 1.25rem;
      color: var(--color-text-primary, #1a202c);
    }

    .explanation-section {
      margin-bottom: 2.5rem;
    }

    .explanation-section h5 {
      margin: 0 0 1rem;
      font-size: 1.05rem;
      color: var(--color-text-primary, #1a202c);
    }

    .code-example {
      background: #1a202c;
      padding: 1.5rem;
      border-radius: 0.5rem;
      overflow-x: auto;
    }

    .code-example code {
      color: #e2e8f0;
      font-family: 'Monaco', 'Courier New', monospace;
      font-size: 0.85rem;
      line-height: 1.7;
    }

    /* Comparison table */
    .comparison-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 1rem;
      background: white;
      border-radius: 0.5rem;
      overflow: hidden;
    }

    .comparison-table thead {
      background: #10b981;
      color: white;
    }

    .comparison-table th,
    .comparison-table td {
      padding: 0.875rem 1rem;
      text-align: left;
      border-bottom: 1px solid var(--color-border, #e2e8f0);
    }

    .comparison-table th {
      font-weight: 600;
      font-size: 0.9rem;
    }

    .comparison-table td {
      font-size: 0.85rem;
      color: var(--color-text-secondary, #718096);
    }

    .comparison-table tbody tr:hover {
      background: var(--color-bg-secondary, #f7fafc);
    }

    /* Best practices */
    .best-practices {
      padding: 1.5rem;
      background: white;
      border-radius: 0.5rem;
      border: 2px solid #10b981;
    }

    .best-practices h5 {
      margin: 0 0 1rem;
      font-size: 1.05rem;
      color: var(--color-text-primary, #1a202c);
    }

    .best-practices ul {
      margin: 0;
      padding-left: 1.5rem;
      line-height: 1.8;
    }

    .best-practices li {
      color: var(--color-text-secondary, #718096);
      margin-bottom: 0.5rem;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        align-items: flex-start;
      }

      .controls-section {
        flex-direction: column;
      }

      .btn {
        width: 100%;
      }

      .info-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class NotificationsWebsocketComponent implements OnInit, OnDestroy {
  private realtimeService = inject(RealtimeService);

  // Signals para estado
  notifications = signal<Notification[]>([]);
  connectionStatus = signal<'connected' | 'disconnected' | 'reconnecting' | 'error'>('disconnected');

  ngOnInit() {
    // Suscribirse al estado de conexión
    this.realtimeService.connectionStatus.subscribe(
      status => this.connectionStatus.set(status)
    );
  }

  ngOnDestroy() {
    // Limpiar conexión
    this.disconnect();
  }

  /**
   * Conecta al WebSocket
   */
  connect(): void {
    // URL simulada (en producción sería la URL real del backend)
    const wsUrl = 'wss://echo.websocket.org'; // Servidor de echo para pruebas

    this.realtimeService.listen<Notification>().subscribe({
      next: (message) => {
        console.log('📥 Mensaje recibido:', message);
        
        // Si es el servidor de echo, crear notificación mock
        const notification = this.parseMessage(message);
        this.notifications.update(list => [notification, ...list]);
      },
      error: (error) => {
        console.error('❌ Error en WebSocket:', error);
      }
    });
  }

  /**
   * Desconecta del WebSocket
   */
  disconnect(): void {
    this.realtimeService.close();
  }

  /**
   * Envía un mensaje de prueba
   */
  sendTestMessage(): void {
    const testMessage = {
      type: 'notification',
      data: {
        title: 'Mensaje de prueba',
        message: 'Este es un mensaje enviado desde el cliente',
        timestamp: new Date().toISOString()
      }
    };

    this.realtimeService.send(testMessage);
  }

  /**
   * Limpia todas las notificaciones
   */
  clearNotifications(): void {
    this.notifications.set([]);
  }

  /**
   * Elimina una notificación específica
   */
  removeNotification(id: number): void {
    this.notifications.update(list => list.filter(n => n.id !== id));
  }

  /**
   * Parsea un mensaje del WebSocket a notificación
   */
  private parseMessage(message: any): Notification {
    // Si el mensaje ya es una notificación válida
    if (message.id && message.type && message.title) {
      return message;
    }

    // Crear notificación mock basada en el mensaje
    return {
      id: Date.now(),
      type: 'info',
      title: 'Nuevo mensaje',
      message: typeof message === 'string' ? message : JSON.stringify(message),
      timestamp: new Date(),
      read: false
    };
  }

  /**
   * Obtiene el label del estado de conexión
   */
  getStatusLabel(status: string): string {
    const labels = {
      'connected': 'Conectado',
      'disconnected': 'Desconectado',
      'reconnecting': 'Reconectando...',
      'error': 'Error de conexión'
    };
    return labels[status as keyof typeof labels] || status;
  }

  /**
   * Obtiene la descripción del estado
   */
  getStatusDescription(status: string): string {
    const descriptions = {
      'connected': 'Recibiendo mensajes en tiempo real',
      'disconnected': 'No hay conexión activa',
      'reconnecting': 'Intentando reconectar...',
      'error': 'Máximo de intentos alcanzado'
    };
    return descriptions[status as keyof typeof descriptions] || '';
  }

  /**
   * Obtiene el icono de la notificación
   */
  getNotificationIcon(type: string): string {
    const icons = {
      'success': '✅',
      'info': 'ℹ️',
      'warning': '⚠️',
      'error': '❌'
    };
    return icons[type as keyof typeof icons] || '📬';
  }

  /**
   * Formatea el tiempo relativo
   */
  formatTime(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `Hace ${days}d`;
    if (hours > 0) return `Hace ${hours}h`;
    if (minutes > 0) return `Hace ${minutes}m`;
    return 'Ahora';
  }
}
