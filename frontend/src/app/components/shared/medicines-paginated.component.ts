import { Component, ChangeDetectionStrategy, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MedicineService } from '../../data/medicine.service';
import { MedicineViewModel, PaginatedResponse } from '../../data/models/medicine.model';
import { ToastService } from '../../shared/toast.service';

/**
 * Componente con paginación clásica (anterior/siguiente)
 * 
 * Características:
 * ✅ Paginación basada en page y pageSize
 * ✅ Loading state durante carga de páginas
 * ✅ Deshabilitación de botones durante loading
 * ✅ Control de límites (primera/última página)
 * ✅ OnPush para rendimiento óptimo
 * ✅ Signals para estado reactivo
 * 
 * Flujo:
 * 1. Usuario hace clic en "Siguiente" o "Anterior"
 * 2. Se activa loading = true
 * 3. Se hace petición a la API con nueva página
 * 4. Se actualiza el estado con nuevos datos
 * 5. Se desactiva loading = false
 * 
 * Ventajas:
 * - Control preciso de la página actual
 * - Menor consumo de memoria (solo una página a la vez)
 * - Mejor para datasets grandes
 * - Facilita ir a páginas específicas
 */
@Component({
  selector: 'app-medicines-paginated',
  standalone: true,
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="paginated-container">
      <!-- Header -->
      <header class="header">
        <h2>Medicamentos - Paginación Clásica</h2>
        <p class="subtitle">Navegación por páginas con anterior/siguiente</p>
      </header>

      <!-- Estado: Loading -->
      @if (state().loading && state().data.length === 0) {
        <div class="loading-state">
          <div class="spinner-large"></div>
          <p>Cargando medicamentos...</p>
        </div>
      }

      <!-- Estado: Error -->
      @else if (state().error) {
        <div class="error-state">
          <svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
          <p>{{ state().error }}</p>
          <button (click)="retry()" class="btn-retry">Reintentar</button>
        </div>
      }

      <!-- Estado: Vacío -->
      @else if (state().data.length === 0 && !state().loading) {
        <div class="empty-state">
          <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          <h3>No hay medicamentos</h3>
          <p>Empieza agregando tu primer medicamento</p>
          <a routerLink="/create-medicine" class="btn-create">Crear medicamento</a>
        </div>
      }

      <!-- Lista de medicamentos -->
      @else {
        <div class="content">
          <!-- Info de paginación -->
          <div class="pagination-info">
            <span class="info-text">
              Mostrando {{ getStartIndex() + 1 }} - {{ getEndIndex() }} de {{ state().total }} medicamentos
            </span>
            <span class="page-indicator">
              Página {{ page() }} de {{ getTotalPages() }}
            </span>
          </div>

          <!-- Overlay de loading para transiciones entre páginas -->
          <div class="table-wrapper" [class.loading-overlay]="state().loading">
            @if (state().loading) {
              <div class="overlay-spinner">
                <div class="spinner"></div>
                <p>Cargando página {{ page() }}...</p>
              </div>
            }

            <!-- Tabla de medicamentos -->
            <table class="medicines-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Dosis</th>
                  <th>Frecuencia</th>
                  <th>Estado</th>
                  <th>Fecha inicio</th>
                  <th>Fecha fin</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                @for (medicine of state().data; track medicine.id) {
                  <tr [class.expired]="medicine.isExpired" 
                      [class.expiring]="medicine.expirationStatus === 'expiring-soon'">
                    <td class="medicine-name">
                      <strong>{{ medicine.displayName || medicine.name }}</strong>
                    </td>
                    <td>{{ medicine.dosage }}</td>
                    <td>{{ medicine.frequency }}</td>
                    <td>
                      <span class="status-badge" [class]="'status-' + medicine.expirationStatus">
                        {{ getStatusLabel(medicine.expirationStatus) }}
                      </span>
                    </td>
                    <td>{{ medicine.formattedStartDate }}</td>
                    <td>{{ medicine.formattedEndDate || '-' }}</td>
                    <td class="actions">
                      <a [routerLink]="['/edit-medicine', medicine.id]" class="btn-icon" title="Editar">
                        ✏️
                      </a>
                      <button (click)="viewDetails(medicine)" class="btn-icon" title="Ver detalles">
                        👁️
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Controles de paginación -->
          <div class="pagination-controls">
            <button 
              (click)="loadPage(page() - 1)" 
              [disabled]="page() === 1 || state().loading"
              class="btn-pagination btn-prev"
              title="Página anterior">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
              Anterior
            </button>

            <!-- Números de página -->
            <div class="page-numbers">
              @for (pageNum of getPageNumbers(); track pageNum) {
                @if (pageNum === '...') {
                  <span class="page-ellipsis">...</span>
                } @else {
                  <button
                    (click)="loadPage(+pageNum)"
                    [disabled]="state().loading"
                    [class.active]="page() === +pageNum"
                    class="btn-page-number">
                    {{ pageNum }}
                  </button>
                }
              }
            </div>

            <button 
              (click)="loadPage(page() + 1)"
              [disabled]="!state().hasMore || state().loading"
              class="btn-pagination btn-next"
              title="Página siguiente">
              Siguiente
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>
          </div>

          <!-- Selector de tamaño de página -->
          <div class="page-size-selector">
            <label for="pageSize">Elementos por página:</label>
            <select 
              id="pageSize"
              [value]="pageSize()"
              (change)="changePageSize($event)"
              [disabled]="state().loading">
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .paginated-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .header {
      margin-bottom: 2rem;
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

    /* Estados */
    .loading-state,
    .error-state,
    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
    }

    .spinner-large {
      width: 3rem;
      height: 3rem;
      border: 3px solid var(--color-border, #e2e8f0);
      border-top-color: var(--color-primary, #3b82f6);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 1rem;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .error-icon,
    .empty-icon {
      width: 4rem;
      height: 4rem;
      margin: 0 auto 1rem;
      color: var(--color-error, #ef4444);
    }

    .empty-icon {
      color: var(--color-text-tertiary, #a0aec0);
    }

    .btn-retry,
    .btn-create {
      margin-top: 1rem;
      padding: 0.75rem 1.5rem;
      background: var(--color-primary, #3b82f6);
      color: white;
      border: none;
      border-radius: 0.5rem;
      font-size: 0.95rem;
      cursor: pointer;
      text-decoration: none;
      display: inline-block;
    }

    /* Info de paginación */
    .pagination-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      padding: 0.75rem 1rem;
      background: var(--color-bg-secondary, #f7fafc);
      border-radius: 0.5rem;
    }

    .info-text {
      font-size: 0.9rem;
      color: var(--color-text-secondary, #718096);
    }

    .page-indicator {
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--color-text-primary, #1a202c);
    }

    /* Tabla */
    .table-wrapper {
      position: relative;
      background: white;
      border-radius: 0.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      margin-bottom: 1.5rem;
    }

    .table-wrapper.loading-overlay {
      pointer-events: none;
      opacity: 0.6;
    }

    .overlay-spinner {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 10;
      background: white;
      padding: 2rem;
      border-radius: 0.5rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      text-align: center;
    }

    .overlay-spinner .spinner {
      width: 2rem;
      height: 2rem;
      border: 2px solid var(--color-border, #e2e8f0);
      border-top-color: var(--color-primary, #3b82f6);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 0.5rem;
    }

    .medicines-table {
      width: 100%;
      border-collapse: collapse;
    }

    .medicines-table th {
      background: var(--color-bg-secondary, #f7fafc);
      padding: 1rem;
      text-align: left;
      font-weight: 600;
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--color-text-secondary, #718096);
      border-bottom: 2px solid var(--color-border, #e2e8f0);
    }

    .medicines-table td {
      padding: 1rem;
      border-bottom: 1px solid var(--color-border, #e2e8f0);
      font-size: 0.9rem;
    }

    .medicines-table tr:hover {
      background: var(--color-bg-hover, #f7fafc);
    }

    .medicines-table tr.expired {
      background: #fef2f2;
    }

    .medicines-table tr.expiring {
      background: #fffbeb;
    }

    .medicine-name strong {
      color: var(--color-text-primary, #1a202c);
    }

    .status-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-active {
      background: #d1fae5;
      color: #065f46;
    }

    .status-expiring-soon {
      background: #fef3c7;
      color: #92400e;
    }

    .status-expired {
      background: #fee2e2;
      color: #991b1b;
    }

    .actions {
      display: flex;
      gap: 0.5rem;
    }

    .btn-icon {
      padding: 0.5rem;
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1.1rem;
      transition: transform 0.2s;
      text-decoration: none;
    }

    .btn-icon:hover {
      transform: scale(1.2);
    }

    /* Controles de paginación */
    .pagination-controls {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1rem;
    }

    .btn-pagination {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.25rem;
      background: white;
      border: 1px solid var(--color-border, #e2e8f0);
      border-radius: 0.5rem;
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-pagination:hover:not(:disabled) {
      background: var(--color-bg-secondary, #f7fafc);
      border-color: var(--color-primary, #3b82f6);
      color: var(--color-primary, #3b82f6);
    }

    .btn-pagination:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-pagination svg {
      width: 1.25rem;
      height: 1.25rem;
    }

    /* Números de página */
    .page-numbers {
      display: flex;
      gap: 0.25rem;
    }

    .btn-page-number {
      min-width: 2.5rem;
      height: 2.5rem;
      padding: 0.5rem;
      background: white;
      border: 1px solid var(--color-border, #e2e8f0);
      border-radius: 0.375rem;
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-page-number:hover:not(:disabled) {
      background: var(--color-bg-secondary, #f7fafc);
      border-color: var(--color-primary, #3b82f6);
    }

    .btn-page-number.active {
      background: var(--color-primary, #3b82f6);
      color: white;
      border-color: var(--color-primary, #3b82f6);
    }

    .page-ellipsis {
      display: flex;
      align-items: center;
      padding: 0 0.5rem;
      color: var(--color-text-tertiary, #a0aec0);
    }

    /* Selector de tamaño */
    .page-size-selector {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 0.75rem;
      margin-top: 1.5rem;
      font-size: 0.9rem;
    }

    .page-size-selector label {
      color: var(--color-text-secondary, #718096);
    }

    .page-size-selector select {
      padding: 0.5rem 0.75rem;
      border: 1px solid var(--color-border, #e2e8f0);
      border-radius: 0.375rem;
      background: white;
      cursor: pointer;
    }

    .page-size-selector select:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `]
})
export class MedicinesPaginatedComponent implements OnInit {
  private medicineService = inject(MedicineService);
  private toastService = inject(ToastService);

  // Estado con Signals
  page = signal(1);
  pageSize = signal(10);
  state = signal<{
    loading: boolean;
    data: MedicineViewModel[];
    total: number;
    hasMore: boolean;
    error: string | null;
  }>({
    loading: false,
    data: [],
    total: 0,
    hasMore: false,
    error: null
  });

  ngOnInit() {
    this.loadPage(1);
  }

  /**
   * Carga una página específica
   */
  loadPage(pageNumber: number): void {
    // Validar número de página
    if (pageNumber < 1) return;

    // Activar loading y actualizar página
    this.page.set(pageNumber);
    this.state.update(s => ({ ...s, loading: true, error: null }));

    // Llamar a la API
    this.medicineService.getPage(pageNumber, this.pageSize()).subscribe({
      next: (response: PaginatedResponse<MedicineViewModel>) => {
        this.state.set({
          loading: false,
          data: response.items,
          total: response.total,
          hasMore: response.hasMore,
          error: null
        });
      },
      error: (error) => {
        this.state.update(s => ({
          ...s,
          loading: false,
          error: 'Error al cargar medicamentos. Intenta nuevamente.'
        }));
        this.toastService.error('Error al cargar medicamentos');
      }
    });
  }

  /**
   * Cambia el tamaño de página y recarga
   */
  changePageSize(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const newSize = parseInt(select.value, 10);
    
    this.pageSize.set(newSize);
    this.loadPage(1); // Volver a la primera página
  }

  /**
   * Reintenta la carga después de un error
   */
  retry(): void {
    this.loadPage(this.page());
  }

  /**
   * Ver detalles de un medicamento
   */
  viewDetails(medicine: MedicineViewModel): void {
    this.toastService.info(`Detalles: ${medicine.displayName || medicine.name}`);
  }

  /**
   * Obtiene el label del estado
   */
  getStatusLabel(status: 'active' | 'expiring-soon' | 'expired'): string {
    const labels = {
      'active': 'Activo',
      'expiring-soon': 'Por vencer',
      'expired': 'Vencido'
    };
    return labels[status];
  }

  /**
   * Calcula el índice inicial de la página actual
   */
  getStartIndex(): number {
    return (this.page() - 1) * this.pageSize();
  }

  /**
   * Calcula el índice final de la página actual
   */
  getEndIndex(): number {
    const end = this.page() * this.pageSize();
    return Math.min(end, this.state().total);
  }

  /**
   * Calcula el número total de páginas
   */
  getTotalPages(): number {
    return Math.ceil(this.state().total / this.pageSize());
  }

  /**
   * Genera array de números de página para mostrar
   * Lógica: siempre muestra primera, última, actual y 2 alrededor
   * Ejemplo con página 5: [1, ..., 4, 5, 6, ..., 10]
   */
  getPageNumbers(): (number | string)[] {
    const current = this.page();
    const total = this.getTotalPages();
    const numbers: (number | string)[] = [];

    if (total <= 7) {
      // Si hay 7 o menos páginas, mostrar todas
      for (let i = 1; i <= total; i++) {
        numbers.push(i);
      }
    } else {
      // Mostrar primera página
      numbers.push(1);

      if (current > 3) {
        numbers.push('...');
      }

      // Páginas alrededor de la actual
      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);

      for (let i = start; i <= end; i++) {
        numbers.push(i);
      }

      if (current < total - 2) {
        numbers.push('...');
      }

      // Mostrar última página
      numbers.push(total);
    }

    return numbers;
  }
}
