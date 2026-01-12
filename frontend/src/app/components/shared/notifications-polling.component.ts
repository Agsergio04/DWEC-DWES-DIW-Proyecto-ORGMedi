import { 
  Component, 
  ChangeDetectionStrategy, 
  inject,
  OnInit,
  OnDestroy,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationsService, Notification } from '../../core/services/notifications.service';
import { Observable } from 'rxjs';

/**
 * Componente de demostración: Notificaciones con HTTP Polling
 * 
 * Características:
 * ✅ Polling automático cada 30 segundos
 * ✅ Control manual (start/stop)
 * ✅ Contador de no leídas (Signal)
 * ✅ Marcar como leída
 * ✅ Eliminar notificaciones
 * ✅ Reintentos automáticos en caso de error
 * 
 * HTTP Polling vs WebSocket:
 * ✅ Más simple de implementar
 * ✅ Compatible con cualquier REST API
 * ✅ Funciona con proxies/firewalls
 * ✅ Stateless (fácil de escalar)
 * ⚠️ Mayor latencia (segundos en lugar de ms)
 * ⚠️ Mayor consumo de datos (headers HTTP)
 * ⚠️ Solo cliente → servidor (no push real)
 * 
 * Casos de uso ideales:
 * - APIs sin soporte WebSocket
 * - Actualizaciones cada 30-60 segundos
 * - Datos que no cambian muy frecuentemente
 * - Dashboards con métricas
 * - Sincronización de datos
 * - Cuando la simplicidad es más importante que la latencia
 */
@Component({
  selector: 'app-notifications-polling',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="notifications-container">
      <!-- Header -->
      <header class="header">
        <div class="header-content">
          <div>
            <h2>Notificaciones con Polling HTTP</h2>
            <p class="subtitle">Actualización automática cada 30 segundos</p>
          </div>

          <!-- Badge de no leídas -->
          @if (unreadCount() > 0) {
            <div class="unread-badge">
              <span class="badge-icon">🔔</span>
              <div class="badge-info">
                <strong>{{ unreadCount() }}</strong>
                <small>sin leer</small>
              </div>
            </div>
          }
        </div>
      </header>

      <!-- Controles -->
      <div class="controls-section">
        <div class="controls-group">
          <button 
            (click)="startPolling()" 
            [disabled]="isPolling()"
            class="btn btn-primary">
            ▶️ Iniciar Polling (30s)
          </button>

          <button 
            (click)="stopPolling()" 
            [disabled]="!isPolling()"
            class="btn btn-secondary">
            ⏸️ Detener Polling
          </button>

          <button 
            (click)="refreshOnce()" 
            [disabled]="isRefreshing()"
            class="btn btn-accent">
            @if (isRefreshing()) {
              <span class="spinner-small"></span>
            } @else {
              🔄
            }
            Actualizar ahora
          </button>
        </div>

        <div class="controls-group">
          <button 
            (click)="markAllAsRead()" 
            [disabled]="unreadCount() === 0"
            class="btn btn-info">
            ✅ Marcar todo como leído
          </button>

          <button 
            (click)="useMockData()" 
            class="btn btn-warning">
            🎭 Cargar datos de prueba
          </button>
        </div>
      </div>

      <!-- Estado del polling -->
      <div class="polling-status">
        <div class="status-item">
          <span class="status-label">Estado:</span>
          <span class="status-value" [class.active]="isPolling()">
            {{ isPolling() ? '🟢 Activo' : '🔴 Detenido' }}
          </span>
        </div>

        <div class="status-item">
          <span class="status-label">Intervalo:</span>
          <span class="status-value">30 segundos</span>
        </div>

        <div class="status-item">
          <span class="status-label">Última actualización:</span>
          <span class="status-value">{{ lastUpdate() || 'Nunca' }}</span>
        </div>

        <div class="status-item">
          <span class="status-label">Total:</span>
          <span class="status-value">{{ (notifications$ | async)?.length || 0 }} notificaciones</span>
        </div>
      </div>

      <!-- Lista de notificaciones -->
      <div class="notifications-section">
        <div class="section-header">
          <h3>📬 Notificaciones</h3>
        </div>

        @if (notifications$ | async; as notifications) {
          @if (notifications.length === 0) {
            <div class="empty-state">
              <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <h4>No hay notificaciones</h4>
              <p>Cuando haya nuevas notificaciones, aparecerán aquí</p>
              <button (click)="useMockData()" class="btn btn-primary">
                Cargar datos de prueba
              </button>
            </div>
          } @else {
            <div class="notifications-list">
              @for (notification of notifications; track notification.id) {
                <article 
                  class="notification-card" 
                  [class]="'type-' + notification.type"
                  [class.unread]="!notification.read">
                  
                  <!-- Badge de no leída -->
                  @if (!notification.read) {
                    <div class="unread-indicator"></div>
                  }

                  <div class="notification-icon">
                    {{ getNotificationIcon(notification.type) }}
                  </div>

                  <div class="notification-content">
                    <div class="notification-header">
                      <h4>{{ notification.title }}</h4>
                      <span class="notification-time">{{ formatTime(notification.timestamp) }}</span>
                    </div>

                    <p class="notification-message">{{ notification.message }}</p>

                    <div class="notification-actions">
                      @if (notification.action) {
                        <a [href]="notification.action.url" class="notification-action-link">
                          {{ notification.action.label }} →
                        </a>
                      }

                      @if (!notification.read) {
                        <button 
                          (click)="markAsRead(notification.id)" 
                          class="action-btn">
                          ✓ Marcar leída
                        </button>
                      }

                      <button 
                        (click)="deleteNotification(notification.id)" 
                        class="action-btn danger">
                        🗑️ Eliminar
                      </button>
                    </div>
                  </div>
                </article>
              }
            </div>
          }
        } @else {
          <!-- Loading inicial -->
          <div class="loading-state">
            <div class="spinner"></div>
            <p>Cargando notificaciones...</p>
          </div>
        }
      </div>

      <!-- Explicación técnica -->
      <div class="tech-explanation">
        <h4>🔧 Implementación Técnica - HTTP Polling</h4>

        <div class="explanation-section">
          <h5>1️⃣ Polling Automático con timer</h5>
          <div class="code-example">
            <pre><code>// NotificationsService
pollNotifications(intervalMs = 30000): Observable&lt;Notification[]&gt; {
  return timer(0, intervalMs).pipe(
    switchMap(() => this.fetchNotifications()),
    shareReplay(1)  // Comparte la última respuesta
  );
}

// En el componente
notifications$ = this.service.pollNotifications(30000);

// En el template (async pipe maneja la subscription)
@if (notifications$ | async; as notifications) {{ '{' }}
  @for (n of notifications; track n.id) {{ '{' }}
    &lt;div&gt;{{ '{{' }} n.message {{ '}}' }}&lt;/div&gt;
  {{ '}' }}
{{ '}' }}</code></pre>
          </div>
        </div>

        <div class="explanation-section">
          <h5>2️⃣ Control Manual del Polling</h5>
          <div class="code-example">
            <pre><code>// Servicio con BehaviorSubject
private pollingSubject = new BehaviorSubject&lt;number&gt;(0);

startPolling(intervalMs: number) {
  this.pollingSubject.next(intervalMs);
}

stopPolling() {
  this.pollingSubject.next(0);
}

// Observable controlable
controlledPolling$ = this.pollingSubject.pipe(
  switchMap(interval => {
    if (interval === 0) return EMPTY;
    return timer(0, interval).pipe(
      switchMap(() => this.fetchNotifications())
    );
  })
);</code></pre>
          </div>
        </div>

        <div class="explanation-section">
          <h5>3️⃣ Integración con Signals</h5>
          <div class="code-example">
            <pre><code>// Signal para contador de no leídas
unreadCount = signal(0);

// Actualizar desde HTTP response
fetchNotifications().pipe(
  tap(response => {
    this.unreadCount.set(response.unreadCount);
  })
);

// En el template (sin async pipe)
@if (unreadCount() > 0) {
  &lt;span&gt;{{ unreadCount() }} sin leer&lt;/span&gt;
}</code></pre>
          </div>
        </div>

        <div class="comparison-section">
          <h5>📊 Comparación: Polling vs WebSocket</h5>
          <table class="comparison-table">
            <thead>
              <tr>
                <th>Aspecto</th>
                <th>HTTP Polling</th>
                <th>WebSocket</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Implementación</strong></td>
                <td>✅ Simple (timer + HTTP)</td>
                <td>⚠️ Compleja (WebSocket + reconexión)</td>
              </tr>
              <tr>
                <td><strong>Backend</strong></td>
                <td>✅ REST API estándar</td>
                <td>⚠️ Requiere soporte WS</td>
              </tr>
              <tr>
                <td><strong>Latencia</strong></td>
                <td>⚠️ Segundos (30-60s típico)</td>
                <td>✅ Milisegundos (~10ms)</td>
              </tr>
              <tr>
                <td><strong>Eficiencia</strong></td>
                <td>⚠️ Nueva conexión cada vez</td>
                <td>✅ Conexión persistente</td>
              </tr>
              <tr>
                <td><strong>Escalabilidad</strong></td>
                <td>✅ Stateless (fácil)</td>
                <td>⚠️ Sticky sessions necesarias</td>
              </tr>
              <tr>
                <td><strong>Firewall/Proxy</strong></td>
                <td>✅ Siempre funciona</td>
                <td>⚠️ Puede ser bloqueado</td>
              </tr>
              <tr>
                <td><strong>Dirección</strong></td>
                <td>⚠️ Solo cliente → servidor</td>
                <td>✅ Bidireccional</td>
              </tr>
              <tr>
                <td><strong>Ideal para</strong></td>
                <td>Updates cada 30-60s</td>
                <td>Updates en tiempo real</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="best-practices">
          <h5>💡 Best Practices para Polling</h5>
          <ul>
            <li>✅ Usa intervalos razonables (30-60 segundos, no menos de 10s)</li>
            <li>✅ Implementa shareReplay(1) para compartir respuestas entre suscriptores</li>
            <li>✅ Usa switchMap para cancelar peticiones anteriores</li>
            <li>✅ Maneja errores sin interrumpir el polling (catchError + EMPTY)</li>
            <li>✅ Añade control manual (start/stop) para ahorrar recursos</li>
            <li>✅ Detén el polling cuando el componente se destruye</li>
            <li>✅ Detén el polling cuando el tab está inactivo (Page Visibility API)</li>
            <li>⚠️ No uses polling para datos que cambian cada segundo</li>
            <li>⚠️ Aumenta el intervalo si el servidor está bajo carga</li>
            <li>⚠️ Considera implementar backoff exponencial en errores</li>
          </ul>
        </div>

        <div class="use-cases">
          <h5>🎯 Cuándo usar cada patrón</h5>
          <div class="use-cases-grid">
            <div class="use-case">
              <h6>✅ Usa Polling cuando:</h6>
              <ul>
                <li>La API no soporta WebSocket</li>
                <li>Las actualizaciones son cada 30+ segundos</li>
                <li>Necesitas simplicidad sobre latencia</li>
                <li>Trabajas con APIs de terceros</li>
                <li>Tu app funciona offline con cache</li>
              </ul>
            </div>

            <div class="use-case">
              <h6>✅ Usa WebSocket cuando:</h6>
              <ul>
                <li>Necesitas latencia ultra-baja (<100ms)</li>
                <li>Actualizaciones muy frecuentes</li>
                <li>Comunicación bidireccional</li>
                <li>Chat, gaming, colaboración</li>
                <li>El backend soporta WebSocket</li>
              </ul>
            </div>
          </div>
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

    /* Badge de no leídas */
    .unread-badge {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 1.5rem;
      background: #fee2e2;
      border: 2px solid #ef4444;
      border-radius: 0.75rem;
      color: #991b1b;
    }

    .badge-icon {
      font-size: 2rem;
      animation: ring 2s infinite;
    }

    @keyframes ring {
      0%, 100% { transform: rotate(0deg); }
      10%, 30% { transform: rotate(-15deg); }
      20%, 40% { transform: rotate(15deg); }
    }

    .badge-info strong {
      display: block;
      font-size: 1.5rem;
      line-height: 1;
    }

    .badge-info small {
      display: block;
      font-size: 0.75rem;
      opacity: 0.8;
    }

    /* Controles */
    .controls-section {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .controls-group {
      display: flex;
      gap: 1rem;
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
      display: flex;
      align-items: center;
      gap: 0.5rem;
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

    .btn-info {
      background: #0ea5e9;
      color: white;
    }

    .btn-info:hover:not(:disabled) {
      background: #0284c7;
    }

    .btn-warning {
      background: #f59e0b;
      color: white;
    }

    .btn-warning:hover:not(:disabled) {
      background: #d97706;
    }

    .spinner-small {
      width: 1rem;
      height: 1rem;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Estado del polling */
    .polling-status {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      padding: 1.5rem;
      background: var(--color-bg-secondary, #f7fafc);
      border-radius: 0.75rem;
      margin-bottom: 2rem;
    }

    .status-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .status-label {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--color-text-secondary, #718096);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .status-value {
      font-size: 1rem;
      color: var(--color-text-primary, #1a202c);
    }

    .status-value.active {
      color: #10b981;
      font-weight: 600;
    }

    /* Notifications section */
    .notifications-section {
      margin-bottom: 2rem;
    }

    .section-header {
      margin-bottom: 1.5rem;
    }

    .section-header h3 {
      margin: 0;
      font-size: 1.25rem;
      color: var(--color-text-primary, #1a202c);
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

    /* Loading state */
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      background: var(--color-bg-secondary, #f7fafc);
      border-radius: 0.75rem;
    }

    .spinner {
      width: 3rem;
      height: 3rem;
      border: 3px solid var(--color-border, #e2e8f0);
      border-top-color: #3b82f6;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-bottom: 1rem;
    }

    .loading-state p {
      margin: 0;
      color: var(--color-text-secondary, #718096);
    }

    /* Notifications list */
    .notifications-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .notification-card {
      position: relative;
      display: flex;
      gap: 1rem;
      padding: 1.25rem;
      background: white;
      border-radius: 0.75rem;
      border-left: 4px solid;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      transition: all 0.2s;
    }

    .notification-card:hover {
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .notification-card.unread {
      background: #f0f9ff;
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

    .unread-indicator {
      position: absolute;
      top: 1rem;
      right: 1rem;
      width: 0.625rem;
      height: 0.625rem;
      background: #3b82f6;
      border-radius: 50%;
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

    .notification-actions {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .notification-action-link {
      display: inline-block;
      font-size: 0.85rem;
      font-weight: 500;
      color: #3b82f6;
      text-decoration: none;
      transition: color 0.2s;
    }

    .notification-action-link:hover {
      color: #2563eb;
      text-decoration: underline;
    }

    .action-btn {
      padding: 0.375rem 0.75rem;
      border: 1px solid var(--color-border, #e2e8f0);
      background: white;
      border-radius: 0.375rem;
      font-size: 0.8rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      color: var(--color-text-secondary, #718096);
    }

    .action-btn:hover {
      background: var(--color-bg-secondary, #f7fafc);
      border-color: #3b82f6;
      color: #3b82f6;
    }

    .action-btn.danger:hover {
      border-color: #ef4444;
      color: #ef4444;
    }

    /* Tech explanation (estilos similares a componente anterior) */
    .tech-explanation {
      margin-top: 3rem;
      padding: 2rem;
      background: var(--color-bg-secondary, #f7fafc);
      border-radius: 0.75rem;
      border-left: 4px solid #f59e0b;
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

    .comparison-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 1rem;
      background: white;
      border-radius: 0.5rem;
      overflow: hidden;
    }

    .comparison-table thead {
      background: #f59e0b;
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

    .best-practices,
    .use-cases {
      padding: 1.5rem;
      background: white;
      border-radius: 0.5rem;
      border: 2px solid #f59e0b;
      margin-bottom: 2rem;
    }

    .best-practices h5,
    .use-cases h5 {
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

    .use-cases-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .use-case {
      padding: 1.25rem;
      background: var(--color-bg-secondary, #f7fafc);
      border-radius: 0.5rem;
    }

    .use-case h6 {
      margin: 0 0 0.75rem;
      font-size: 0.95rem;
      color: var(--color-text-primary, #1a202c);
    }

    .use-case ul {
      margin: 0;
      padding-left: 1.25rem;
      list-style: disc;
    }

    .use-case li {
      font-size: 0.85rem;
      color: var(--color-text-secondary, #718096);
      margin-bottom: 0.375rem;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        align-items: flex-start;
      }

      .controls-group {
        flex-direction: column;
      }

      .btn {
        width: 100%;
      }

      .polling-status {
        grid-template-columns: 1fr;
      }

      .use-cases-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class NotificationsPollingComponent implements OnInit, OnDestroy {
  private notificationsService = inject(NotificationsService);

  // Observable de notificaciones con polling
  notifications$!: Observable<Notification[]>;

  // Signals para estado
  isPolling = signal(false);
  isRefreshing = signal(false);
  lastUpdate = signal<string | null>(null);

  // Acceso directo al contador de no leídas del servicio
  unreadCount = this.notificationsService.unreadCount;

  ngOnInit() {
    // Iniciar con polling automático
    this.notifications$ = this.notificationsService.pollNotifications(30000);
    this.isPolling.set(true);
    this.updateLastUpdate();
  }

  ngOnDestroy() {
    // Detener polling al destruir
    this.notificationsService.stopPolling();
  }

  /**
   * Inicia el polling
   */
  startPolling(): void {
    this.notificationsService.startPolling(30000);
    this.isPolling.set(true);
    this.updateLastUpdate();
  }

  /**
   * Detiene el polling
   */
  stopPolling(): void {
    this.notificationsService.stopPolling();
    this.isPolling.set(false);
  }

  /**
   * Refresca manualmente las notificaciones
   */
  refreshOnce(): void {
    this.isRefreshing.set(true);
    this.notificationsService.getNotifications().subscribe({
      next: () => {
        this.isRefreshing.set(false);
        this.updateLastUpdate();
      },
      error: () => {
        this.isRefreshing.set(false);
      }
    });
  }

  /**
   * Marca una notificación como leída
   */
  markAsRead(id: number): void {
    this.notificationsService.markAsRead(id).subscribe();
  }

  /**
   * Marca todas como leídas
   */
  markAllAsRead(): void {
    this.notificationsService.markAllAsRead().subscribe();
  }

  /**
   * Elimina una notificación
   */
  deleteNotification(id: number): void {
    this.notificationsService.deleteNotification(id).subscribe();
  }

  /**
   * Carga datos mock para pruebas
   */
  useMockData(): void {
    // Simulamos actualizar el cache con datos mock
    const mockNotifications = this.notificationsService.getMockNotifications();
    console.log('📦 Datos mock cargados:', mockNotifications);
    
    // En una implementación real, esto actualizaría el signal del servicio
    // Por ahora, llamamos a refresh para obtener datos reales
    this.refreshOnce();
  }

  /**
   * Actualiza la marca de tiempo de la última actualización
   */
  private updateLastUpdate(): void {
    const now = new Date();
    this.lastUpdate.set(now.toLocaleTimeString('es-ES'));
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
