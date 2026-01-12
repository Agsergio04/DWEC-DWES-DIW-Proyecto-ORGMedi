import { 
  Component, 
  ChangeDetectionStrategy, 
  signal, 
  inject, 
  OnInit, 
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewInit 
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MedicineService } from '../../data/medicine.service';
import { MedicineViewModel, PaginatedResponse } from '../../data/models/medicine.model';
import { ToastService } from '../../shared/toast.service';

/**
 * Componente con Infinite Scroll (scroll infinito)
 * 
 * Características:
 * ✅ Carga automática al hacer scroll hacia abajo
 * ✅ Usa IntersectionObserver para detectar scroll
 * ✅ Acumula datos de páginas anteriores
 * ✅ Loading state solo en el pie de lista
 * ✅ No bloquea la UI durante cargas
 * ✅ Detecta fin de datos (eof = end of file)
 * 
 * Flujo:
 * 1. Usuario hace scroll y el "anchor" entra en viewport
 * 2. Se detecta con IntersectionObserver
 * 3. Se carga siguiente página si no está loading ni eof
 * 4. Nuevos items se AGREGAN a los existentes (no reemplazan)
 * 5. Se incrementa el número de página
 * 6. Se marca eof si no hay más datos
 * 
 * Ventajas vs Paginación Clásica:
 * - Experiencia más fluida (sin clicks)
 * - Mejor para mobile/touch
 * - Menos interrupciones en la lectura
 * - Sensación de contenido infinito
 * 
 * Desventajas:
 * - Mayor consumo de memoria (todos los datos en DOM)
 * - Difícil volver a un punto específico
 * - No apto para datasets enormes
 */
@Component({
  selector: 'app-medicines-infinite-scroll',
  standalone: true,
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="infinite-scroll-container">
      <!-- Header -->
      <header class="header">
        <h2>Medicamentos - Infinite Scroll</h2>
        <p class="subtitle">Carga automática al hacer scroll</p>
        
        <!-- Contador de elementos cargados -->
        <div class="loaded-count">
          <span class="count-badge">
            {{ state().data.length }} de {{ state().total }} medicamentos cargados
          </span>
          @if (state().total > 0) {
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                [style.width.%]="getLoadedPercentage()">
              </div>
            </div>
          }
        </div>
      </header>

      <!-- Estado: Loading inicial -->
      @if (state().loading && state().data.length === 0) {
        <div class="loading-state">
          <div class="spinner-large"></div>
          <p>Cargando medicamentos...</p>
        </div>
      }

      <!-- Estado: Error inicial -->
      @else if (state().error && state().data.length === 0) {
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

      <!-- Lista de medicamentos con infinite scroll -->
      @else {
        <div class="medicines-list">
          <!-- Grid de tarjetas -->
          <div class="medicines-grid">
            @for (medicine of state().data; track medicine.id) {
              <article 
                class="medicine-card"
                [class.expired]="medicine.isExpired"
                [class.expiring]="medicine.expirationStatus === 'expiring-soon'">
                
                <!-- Header de la tarjeta -->
                <div class="card-header">
                  <h3 class="medicine-name">{{ medicine.displayName || medicine.name }}</h3>
                  <span class="status-badge" [class]="'status-' + medicine.expirationStatus">
                    {{ getStatusLabel(medicine.expirationStatus) }}
                  </span>
                </div>

                <!-- Información -->
                <div class="card-body">
                  <div class="info-row">
                    <span class="info-label">Dosis:</span>
                    <span class="info-value">{{ medicine.dosage }}</span>
                  </div>
                  
                  <div class="info-row">
                    <span class="info-label">Frecuencia:</span>
                    <span class="info-value">{{ medicine.frequency }}</span>
                  </div>
                  
                  <div class="info-row">
                    <span class="info-label">Inicio:</span>
                    <span class="info-value">{{ medicine.formattedStartDate }}</span>
                  </div>
                  
                  @if (medicine.formattedEndDate) {
                    <div class="info-row">
                      <span class="info-label">Fin:</span>
                      <span class="info-value">{{ medicine.formattedEndDate }}</span>
                    </div>
                  }

                  @if (medicine.description) {
                    <div class="info-row description">
                      <p>{{ medicine.description }}</p>
                    </div>
                  }
                </div>

                <!-- Acciones -->
                <div class="card-footer">
                  <a [routerLink]="['/edit-medicine', medicine.id]" class="btn-card-action">
                    ✏️ Editar
                  </a>
                  <button (click)="viewDetails(medicine)" class="btn-card-action">
                    👁️ Ver
                  </button>
                </div>
              </article>
            }
          </div>

          <!-- Anchor para IntersectionObserver -->
          <!-- Este elemento invisible detecta cuando llegamos al final -->
          <div #anchor class="scroll-anchor"></div>

          <!-- Loading más elementos -->
          @if (state().loading) {
            <div class="loading-more">
              <div class="spinner"></div>
              <p>Cargando más medicamentos...</p>
            </div>
          }

          <!-- Fin de datos -->
          @if (state().eof && !state().loading) {
            <div class="end-of-data">
              <svg class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <p>Has visto todos los medicamentos</p>
              <span class="total-loaded">{{ state().data.length }} elementos en total</span>
            </div>
          }

          <!-- Botón para volver arriba -->
          @if (state().data.length > 10) {
            <button 
              (click)="scrollToTop()" 
              class="btn-scroll-top"
              title="Volver arriba">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M5 10l7-7m0 0l7 7m-7-7v18"/>
              </svg>
            </button>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .infinite-scroll-container {
      max-width: 1400px;
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
      margin: 0 0 1rem;
      color: var(--color-text-secondary, #718096);
      font-size: 0.95rem;
    }

    /* Contador de elementos cargados */
    .loaded-count {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .count-badge {
      display: inline-block;
      padding: 0.5rem 1rem;
      background: var(--color-primary, #3b82f6);
      color: white;
      border-radius: 9999px;
      font-size: 0.85rem;
      font-weight: 600;
    }

    .progress-bar {
      height: 0.5rem;
      background: var(--color-border, #e2e8f0);
      border-radius: 9999px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: var(--color-primary, #3b82f6);
      transition: width 0.3s ease;
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

    /* Grid de medicamentos */
    .medicines-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    /* Tarjeta de medicamento */
    .medicine-card {
      background: white;
      border-radius: 0.75rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      transition: all 0.3s;
      display: flex;
      flex-direction: column;
    }

    .medicine-card:hover {
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
    }

    .medicine-card.expired {
      border-left: 4px solid #ef4444;
      background: #fef2f2;
    }

    .medicine-card.expiring {
      border-left: 4px solid #f59e0b;
      background: #fffbeb;
    }

    /* Header de tarjeta */
    .card-header {
      padding: 1.25rem;
      border-bottom: 1px solid var(--color-border, #e2e8f0);
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1rem;
    }

    .medicine-name {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--color-text-primary, #1a202c);
      flex: 1;
    }

    .status-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
      white-space: nowrap;
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

    /* Cuerpo de tarjeta */
    .card-body {
      padding: 1.25rem;
      flex: 1;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.75rem;
      font-size: 0.9rem;
    }

    .info-row.description {
      flex-direction: column;
      margin-top: 1rem;
    }

    .info-row.description p {
      margin: 0;
      color: var(--color-text-secondary, #718096);
      font-size: 0.85rem;
      line-height: 1.5;
    }

    .info-label {
      font-weight: 600;
      color: var(--color-text-secondary, #718096);
    }

    .info-value {
      color: var(--color-text-primary, #1a202c);
    }

    /* Footer de tarjeta */
    .card-footer {
      padding: 1rem 1.25rem;
      background: var(--color-bg-secondary, #f7fafc);
      border-top: 1px solid var(--color-border, #e2e8f0);
      display: flex;
      gap: 0.75rem;
    }

    .btn-card-action {
      flex: 1;
      padding: 0.625rem 1rem;
      background: white;
      border: 1px solid var(--color-border, #e2e8f0);
      border-radius: 0.375rem;
      font-size: 0.85rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      text-align: center;
      text-decoration: none;
      color: var(--color-text-primary, #1a202c);
    }

    .btn-card-action:hover {
      background: var(--color-bg-secondary, #f7fafc);
      border-color: var(--color-primary, #3b82f6);
      color: var(--color-primary, #3b82f6);
    }

    /* Anchor para IntersectionObserver */
    .scroll-anchor {
      height: 20px;
      margin: 2rem 0;
    }

    /* Loading más elementos */
    .loading-more {
      text-align: center;
      padding: 2rem;
    }

    .loading-more .spinner {
      width: 2rem;
      height: 2rem;
      border: 2px solid var(--color-border, #e2e8f0);
      border-top-color: var(--color-primary, #3b82f6);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 0.75rem;
    }

    .loading-more p {
      margin: 0;
      color: var(--color-text-secondary, #718096);
      font-size: 0.9rem;
    }

    /* Fin de datos */
    .end-of-data {
      text-align: center;
      padding: 3rem 2rem;
      background: var(--color-bg-secondary, #f7fafc);
      border-radius: 0.75rem;
      margin: 2rem 0;
    }

    .check-icon {
      width: 3rem;
      height: 3rem;
      margin: 0 auto 1rem;
      color: var(--color-success, #10b981);
    }

    .end-of-data p {
      margin: 0 0 0.5rem;
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--color-text-primary, #1a202c);
    }

    .total-loaded {
      display: block;
      color: var(--color-text-secondary, #718096);
      font-size: 0.9rem;
    }

    /* Botón scroll to top */
    .btn-scroll-top {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      width: 3rem;
      height: 3rem;
      background: var(--color-primary, #3b82f6);
      color: white;
      border: none;
      border-radius: 50%;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      cursor: pointer;
      transition: all 0.3s;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100;
    }

    .btn-scroll-top:hover {
      background: var(--color-primary-dark, #2563eb);
      transform: translateY(-2px);
      box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
    }

    .btn-scroll-top svg {
      width: 1.5rem;
      height: 1.5rem;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .medicines-grid {
        grid-template-columns: 1fr;
      }

      .btn-scroll-top {
        bottom: 1rem;
        right: 1rem;
      }
    }
  `]
})
export class MedicinesInfiniteScrollComponent implements OnInit, AfterViewInit, OnDestroy {
  private medicineService = inject(MedicineService);
  private toastService = inject(ToastService);

  // Referencia al anchor element para IntersectionObserver
  @ViewChild('anchor', { static: false }) anchor!: ElementRef<HTMLElement>;
  
  private observer!: IntersectionObserver;

  // Estado con Signals
  state = signal<{
    loading: boolean;
    data: MedicineViewModel[];
    total: number;
    page: number;
    pageSize: number;
    eof: boolean; // End of file (fin de datos)
    error: string | null;
  }>({
    loading: false,
    data: [],
    total: 0,
    page: 1,
    pageSize: 20, // Cargar 20 elementos por página
    eof: false,
    error: null
  });

  ngOnInit() {
    // Cargar primera página al iniciar
    this.loadMore();
  }

  ngAfterViewInit() {
    // Configurar IntersectionObserver después de que el anchor esté en el DOM
    this.setupIntersectionObserver();
  }

  ngOnDestroy() {
    // Limpiar observer al destruir componente
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  /**
   * Configura el IntersectionObserver para detectar scroll
   * Se dispara cuando el anchor entra en el viewport
   */
  private setupIntersectionObserver(): void {
    if (!this.anchor) {
      console.warn('Anchor element not found');
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        // Cuando el anchor entra en el viewport
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadMore();
          }
        });
      },
      {
        root: null, // Usar viewport como root
        rootMargin: '200px', // Anticipar carga 200px antes de llegar al final
        threshold: 0.1 // Disparar cuando 10% del anchor sea visible
      }
    );

    this.observer.observe(this.anchor.nativeElement);
  }

  /**
   * Carga la siguiente página de datos
   * Solo se ejecuta si no está loading y no llegó al final
   */
  loadMore(): void {
    const currentState = this.state();

    // No cargar si ya está cargando o llegó al final
    if (currentState.loading || currentState.eof) {
      return;
    }

    // Activar loading
    this.state.update(s => ({ ...s, loading: true, error: null }));

    // Llamar a la API con la página actual
    this.medicineService.getPage(currentState.page, currentState.pageSize).subscribe({
      next: (response: PaginatedResponse<MedicineViewModel>) => {
        this.state.update(s => ({
          ...s,
          loading: false,
          // IMPORTANTE: AGREGAR nuevos items, no reemplazar
          data: [...s.data, ...response.items],
          total: response.total,
          page: s.page + 1, // Incrementar página para la siguiente carga
          eof: !response.hasMore || response.items.length === 0, // Marcar fin si no hay más
          error: null
        }));

        // Notificar si llegamos al final
        if (!response.hasMore || response.items.length === 0) {
          this.toastService.info('Has visto todos los medicamentos');
        }
      },
      error: (error) => {
        this.state.update(s => ({
          ...s,
          loading: false,
          error: 'Error al cargar más medicamentos'
        }));
        this.toastService.error('Error al cargar medicamentos');
      }
    });
  }

  /**
   * Reintenta la carga después de un error
   */
  retry(): void {
    // Reiniciar estado y cargar desde el principio
    this.state.set({
      loading: false,
      data: [],
      total: 0,
      page: 1,
      pageSize: 20,
      eof: false,
      error: null
    });
    this.loadMore();
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
   * Calcula el porcentaje de elementos cargados
   */
  getLoadedPercentage(): number {
    const { data, total } = this.state();
    if (total === 0) return 0;
    return Math.min((data.length / total) * 100, 100);
  }

  /**
   * Scroll suave hacia arriba
   */
  scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
}
