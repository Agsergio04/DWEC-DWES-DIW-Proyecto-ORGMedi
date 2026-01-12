import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UserStore } from '../../data/stores/user.store';
import { UserViewModel } from '../../data/models/user.model';
import { ToastService } from '../../shared/toast.service';

/**
 * Componente de ejemplo: Lista reactiva de usuarios
 * 
 * Demuestra actualización dinámica sin recargas usando UserStore:
 * - Lista reactiva con BehaviorSubject
 * - Contadores y estadísticas en tiempo real
 * - trackBy para optimización del rendering
 * - Preservación del scroll durante actualizaciones
 * 
 * Características:
 * - Se suscribe a users$ del store
 * - Cualquier CRUD en otro componente actualiza automáticamente esta lista
 * - Las estadísticas se recalculan automáticamente
 * - El scroll se mantiene al actualizar elementos
 * 
 * ✅ OPTIMIZACIÓN: OnPush ChangeDetectionStrategy
 * - Solo se actualiza cuando cambian los observables con async pipe
 * - Reduce el número de ciclos de change detection
 * - Mejor rendimiento en listas grandes
 */
@Component({
  selector: 'app-users-list-reactive',
  standalone: true,
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="reactive-list-container">
      <!-- Header con estadísticas en tiempo real -->
      <header class="list-header">
        <h2>Usuarios</h2>
        
        <div class="stats-cards">
          <div class="stat-card">
            <span class="stat-value">{{ (store.totalCount$ | async) || 0 }}</span>
            <span class="stat-label">Total</span>
          </div>
          
          <div class="stat-card stat-active">
            <span class="stat-value">{{ (store.activeCount$ | async) || 0 }}</span>
            <span class="stat-label">Activos</span>
          </div>
          
          <div class="stat-card stat-inactive">
            <span class="stat-value">{{ (store.inactiveCount$ | async) || 0 }}</span>
            <span class="stat-label">Inactivos</span>
          </div>
          
          <div class="stat-card stat-medical">
            <span class="stat-value">{{ (store.withMedicalConditionsCount$ | async) || 0 }}</span>
            <span class="stat-label">Con condiciones</span>
          </div>

          <div class="stat-card stat-allergies">
            <span class="stat-value">{{ (store.withAllergiesCount$ | async) || 0 }}</span>
            <span class="stat-label">Con alergias</span>
          </div>
        </div>

        <!-- Estadísticas agregadas -->
        @if (store.stats$ | async; as stats) {
          <div class="summary">
            <p>
              <strong>{{ stats.total }}</strong> usuarios registrados
              @if (stats.averageAge !== null) {
                • Edad promedio: <strong>{{ stats.averageAge }} años</strong>
              }
              • <strong>{{ stats.withDoctorInfo }}</strong> con información de doctor
            </p>
          </div>
        }

        <div class="actions">
          <button 
            (click)="refresh()" 
            [disabled]="(store.loading$ | async) || false"
            class="btn-refresh">
            @if (store.loading$ | async) {
              <span class="spinner"></span>
            }
            Actualizar
          </button>
          
          <a routerLink="/registrarse" class="btn-create">
            + Nuevo usuario
          </a>
        </div>
      </header>

      <!-- Estado: Cargando -->
      @if (store.loading$ | async) {
        <div class="loading-state">
          <div class="spinner-large"></div>
          <p>Cargando usuarios...</p>
        </div>
      }

      <!-- Estado: Error -->
      @else if (store.error$ | async; as error) {
        <div class="error-state">
          <p>{{ error }}</p>
          <button (click)="retry()" class="btn-retry">Reintentar</button>
        </div>
      }

      <!-- Estado: Lista vacía -->
      @else if ((store.totalCount$ | async) === 0) {
        <div class="empty-state">
          <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
          </svg>
          <h3>No hay usuarios registrados</h3>
          <p>Comienza registrando el primer usuario</p>
          <a routerLink="/registrarse" class="btn-create-first">Registrar usuario</a>
        </div>
      }

      <!-- Lista de usuarios con trackBy -->
      @else {
        <div class="users-list" #listContainer>
          @for (user of (store.users$ | async); track trackById($index, user)) {
            <div 
              class="user-card"
              [class.inactive]="!user.active">
              
              <div class="user-header">
                <div class="user-info">
                  <h3>{{ user.displayName }}</h3>
                  <p class="email">{{ user.email }}</p>
                </div>
                <span 
                  class="status-badge"
                  [class.active]="user.active"
                  [class.inactive]="!user.active">
                  {{ user.active ? 'Activo' : 'Inactivo' }}
                </span>
              </div>

              <div class="user-details">
                @if (user.phone) {
                  <p><strong>Teléfono:</strong> {{ user.phone }}</p>
                }
                @if (user.age) {
                  <p><strong>Edad:</strong> {{ user.age }} años</p>
                }
                @if (user.formattedDateOfBirth) {
                  <p><strong>Fecha de nacimiento:</strong> {{ user.formattedDateOfBirth }}</p>
                }
                
                <!-- Indicadores de salud -->
                <div class="health-indicators">
                  @if (user.hasMedicalConditions) {
                    <span class="indicator medical">
                      ⚕️ Condiciones médicas
                    </span>
                  }
                  @if (user.hasAllergies) {
                    <span class="indicator allergy">
                      ⚠️ Alergias
                    </span>
                  }
                  @if (user.hasDoctorInfo) {
                    <span class="indicator doctor">
                      👨‍⚕️ Doctor asignado
                    </span>
                  }
                </div>

                <!-- Detalles médicos -->
                @if (user.medicalConditionsText) {
                  <p class="medical-detail">
                    <strong>Condiciones:</strong> {{ user.medicalConditionsText }}
                  </p>
                }
                @if (user.allergiesText) {
                  <p class="medical-detail">
                    <strong>Alergias:</strong> {{ user.allergiesText }}
                  </p>
                }
                @if (user.doctorName) {
                  <p class="medical-detail">
                    <strong>Doctor:</strong> {{ user.doctorName }}
                    @if (user.doctorContact) {
                      ({{ user.doctorContact }})
                    }
                  </p>
                }
              </div>

              <div class="user-actions">
                <a [routerLink]="['/profile', user.id]" class="btn-view">
                  Ver perfil
                </a>
                <button (click)="toggleActive(user)" class="btn-toggle">
                  {{ user.active ? 'Desactivar' : 'Activar' }}
                </button>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .reactive-list-container {
      padding: 1.5rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .list-header {
      margin-bottom: 2rem;
    }

    .list-header h2 {
      font-size: 1.875rem;
      font-weight: bold;
      margin-bottom: 1.5rem;
    }

    .stats-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .stat-card {
      background: white;
      padding: 1.25rem;
      border-radius: 0.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      text-align: center;
      border-left: 4px solid #3b82f6;
    }

    .stat-card.stat-active { border-left-color: #10b981; }
    .stat-card.stat-inactive { border-left-color: #6b7280; }
    .stat-card.stat-medical { border-left-color: #f59e0b; }
    .stat-card.stat-allergies { border-left-color: #ef4444; }

    .stat-value {
      display: block;
      font-size: 2rem;
      font-weight: bold;
      color: #1f2937;
    }

    .stat-label {
      display: block;
      font-size: 0.875rem;
      color: #6b7280;
      margin-top: 0.25rem;
    }

    .summary {
      background: #f3f4f6;
      padding: 1rem;
      border-radius: 0.375rem;
      margin-bottom: 1.5rem;
    }

    .summary p {
      margin: 0;
      color: #4b5563;
    }

    .actions {
      display: flex;
      gap: 1rem;
    }

    .btn-refresh, .btn-create {
      padding: 0.625rem 1.25rem;
      border-radius: 0.375rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-refresh {
      background: white;
      color: #3b82f6;
      border: 1px solid #3b82f6;
    }

    .btn-refresh:hover:not(:disabled) {
      background: #eff6ff;
    }

    .btn-refresh:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-create {
      background: #3b82f6;
      color: white;
      border: none;
    }

    .btn-create:hover {
      background: #2563eb;
    }

    .loading-state, .error-state, .empty-state {
      text-align: center;
      padding: 3rem 1.5rem;
    }

    .spinner, .spinner-large {
      display: inline-block;
      width: 1.25rem;
      height: 1.25rem;
      border: 2px solid #e5e7eb;
      border-top-color: #3b82f6;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    .spinner-large {
      width: 3rem;
      height: 3rem;
      border-width: 3px;
      margin-bottom: 1rem;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .empty-icon {
      width: 4rem;
      height: 4rem;
      color: #9ca3af;
      margin-bottom: 1rem;
    }

    .btn-create-first {
      display: inline-block;
      margin-top: 1rem;
      padding: 0.75rem 1.5rem;
      background: #3b82f6;
      color: white;
      border-radius: 0.375rem;
      text-decoration: none;
      font-weight: 500;
    }

    .users-list {
      display: grid;
      gap: 1rem;
    }

    .user-card {
      background: white;
      padding: 1.5rem;
      border-radius: 0.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      border-left: 4px solid #10b981;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .user-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 6px rgba(0,0,0,0.15);
    }

    .user-card.inactive {
      border-left-color: #6b7280;
      opacity: 0.7;
    }

    .user-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .user-info h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 0.25rem;
    }

    .email {
      color: #6b7280;
      font-size: 0.875rem;
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .status-badge.active {
      background: #d1fae5;
      color: #065f46;
    }

    .status-badge.inactive {
      background: #e5e7eb;
      color: #374151;
    }

    .user-details {
      color: #4b5563;
      margin-bottom: 1rem;
    }

    .user-details p {
      margin: 0.5rem 0;
    }

    .health-indicators {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin: 1rem 0;
    }

    .indicator {
      padding: 0.375rem 0.75rem;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .indicator.medical {
      background: #fef3c7;
      color: #92400e;
    }

    .indicator.allergy {
      background: #fee2e2;
      color: #991b1b;
    }

    .indicator.doctor {
      background: #dbeafe;
      color: #1e40af;
    }

    .medical-detail {
      font-size: 0.875rem;
      color: #6b7280;
    }

    .user-actions {
      display: flex;
      gap: 0.75rem;
      padding-top: 1rem;
      border-top: 1px solid #e5e7eb;
    }

    .btn-view, .btn-toggle, .btn-retry {
      padding: 0.5rem 1rem;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
    }

    .btn-view {
      background: #eff6ff;
      color: #3b82f6;
      text-decoration: none;
    }

    .btn-view:hover {
      background: #dbeafe;
    }

    .btn-toggle {
      background: #f3f4f6;
      color: #4b5563;
    }

    .btn-toggle:hover {
      background: #e5e7eb;
    }

    .btn-retry {
      background: #3b82f6;
      color: white;
    }

    .btn-retry:hover {
      background: #2563eb;
    }
  `]
})
export class UsersListReactiveComponent {
  store = inject(UserStore);
  private toast = inject(ToastService);

  /**
   * Refresca los datos desde la API
   * Todos los componentes suscritos se actualizarán automáticamente
   */
  refresh() {
    this.store.refresh();
  }

  /**
   * Reintenta cargar datos después de un error
   */
  retry() {
    this.store.clearError();
    this.store.refresh();
  }

  /**
   * Alterna el estado activo/inactivo de un usuario
   * La lista se actualiza automáticamente sin recargar la página
   */
  toggleActive(user: UserViewModel) {
    const newStatus = !user.active;
    const action = newStatus ? 'activar' : 'desactivar';
    
    if (!confirm(`¿Estás seguro de ${action} a "${user.name}"?`)) {
      return;
    }

    // TODO: Llamar al servicio para actualizar en backend
    // userService.patch(user.id, { active: newStatus }).subscribe((updated) => {
    //   this.store.update(updated);
    //   this.toast.show(`Usuario ${action}do`, 'success');
    // });
    
    // Por ahora solo actualizamos en el store
    const updated = { ...user, active: newStatus };
    this.store.update(updated);
    this.toast.show(`Usuario ${action}do`, 'success');
  }

  /**
   * Función trackBy para optimizar el rendering de *ngFor
   * Angular solo re-renderiza elementos cuyo ID cambió
   */
  trackById(index: number, user: UserViewModel): string {
    return user.id;
  }
}
