/**
 * Ejemplos de implementación de TAREA 3: Manejo de Respuestas HTTP
 * 
 * Este archivo contiene ejemplos de componentes usando:
 * 1. Tipado seguro con interfaces (ApiListResponse, PaginatedResponse)
 * 2. Transformación de datos con map (ViewModel)
 * 3. Manejo de errores con catchError
 * 4. Retry logic para fallos temporales
 * 
 * src/app/pages/medicines/medicines-tarea3-examples.component.ts
 */

import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MedicineService } from '../../data/medicine.service';
import { ToastService } from '../../shared/toast.service';
import { MedicineViewModel, ApiError } from '../../data/models/medicine.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/**
 * ============================================
 * EJEMPLO 1: Tipado seguro con async pipe
 * ============================================
 * 
 * Usa Observable directamente con async pipe
 * - Autocompletado de propiedades
 * - Manejo automático de suscripción/desuscripción
 * - Typing seguro en template
 */
@Component({
  selector: 'app-medicines-example-typed',
  template: `
    <div class="medicines-container">
      <h2>Medicamentos (Tipado Seguro)</h2>

      <!-- Observable con async pipe - automáticamente tipado -->
      <div *ngIf="(medicines$ | async) as medicinesResponse; else loading">
        <!-- Acceso seguro a propiedades -->
        <p class="total">Total: {{ medicinesResponse.items.length }} medicamentos</p>

        <!-- Iteración sobre items tipados como MedicineViewModel[] -->
        <div *ngFor="let medicine of medicinesResponse.items" class="medicine-card">
          <h3>{{ medicine.displayName }}</h3>
          <!-- Propiedades del ViewModel calculadas automáticamente -->
          <p>Iniciado: {{ medicine.formattedStartDate }}</p>
          <span class="status" [class]="'status-' + medicine.expirationStatus">
            {{ medicine.expirationStatus }}
          </span>
        </div>
      </div>

      <ng-template #loading>
        <p>Cargando medicamentos...</p>
      </ng-template>
    </div>
  `,
  styles: [`
    .status-active { color: green; }
    .status-expiring-soon { color: orange; }
    .status-expired { color: red; }
  `]
})
export class MedicinesExampleTypedComponent {
  private medicineService = inject(MedicineService);

  // Observable con tipado completo: ApiListResponse<MedicineViewModel>
  // Los datos ya están transformados por el servicio
  medicines$ = this.medicineService.getAll().pipe(
    // getAll() retorna Observable<MedicineViewModel[]>
    // Pero internamente hace map(response => ...) así que tipado es seguro
  );
}

/**
 * ============================================
 * EJEMPLO 2: Manejo manual con catchError
 * ============================================
 * 
 * Captura errores, loguea y relanza
 * Componente maneja el error mostrando mensaje personalizado
 */
@Component({
  selector: 'app-medicines-example-error-handling',
  template: `
    <div class="medicines-container">
      <h2>Medicamentos (Con Manejo de Errores)</h2>

      <div *ngIf="loading" class="spinner">Cargando...</div>
      <div *ngIf="error" class="error-box">
        <p><strong>Error:</strong> {{ error.message }}</p>
        <p><small>Código: {{ error.code }} | {{ error.timestamp }}</small></p>
        <button (click)="retry()">Reintentar</button>
      </div>

      <div *ngIf="!loading && !error && medicines.length > 0">
        <div *ngFor="let medicine of medicines" class="medicine-item">
          <h4>{{ medicine.name }}</h4>
          <p>{{ medicine.dosage }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .error-box {
      background: #fee;
      border: 1px solid #f00;
      padding: 1rem;
      border-radius: 4px;
    }
  `]
})
export class MedicinesExampleErrorHandlingComponent implements OnInit {
  private medicineService = inject(MedicineService);
  private toastService = inject(ToastService);

  medicines = signal<MedicineViewModel[]>([]);
  loading = signal(false);
  error = signal<ApiError | null>(null);

  ngOnInit() {
    this.loadMedicines();
  }

  loadMedicines() {
    this.loading.set(true);
    this.error.set(null);

    // Suscripción manual con manejo de errores
    this.medicineService.getAll().subscribe({
      next: (medicines) => {
        this.medicines.set(medicines);
        this.loading.set(false);
      },
      error: (err: ApiError) => {
        // Error capturado y tipado como ApiError
        this.error.set(err);
        this.loading.set(false);
        this.toastService.error(err.message);
        console.error('Error al cargar medicamentos:', err);
      }
    });
  }

  retry() {
    this.loadMedicines();
  }
}

/**
 * ============================================
 * EJEMPLO 3: Graceful Degradation
 * ============================================
 * 
 * En lugar de mostrar error, devuelve lista vacía
 * La UI siempre muestra algo (aunque sea vacío)
 */
@Component({
  selector: 'app-medicines-example-graceful',
  template: `
    <div class="medicines-container">
      <h2>Medicamentos (Graceful Degradation)</h2>

      <div *ngIf="(medicinesSafe$ | async) as medicines">
        <div *ngIf="medicines.length === 0" class="empty-state">
          <p>No hay medicamentos disponibles</p>
          <p><small>Pero la página sigue funcionando correctamente</small></p>
        </div>

        <div *ngFor="let medicine of medicines" class="medicine-card">
          <h3>{{ medicine.name }}</h3>
          <p>{{ medicine.dosage }} - {{ medicine.frequency }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .empty-state {
      padding: 2rem;
      text-align: center;
      background: #f5f5f5;
      border-radius: 4px;
    }
  `]
})
export class MedicinesExampleGracefulComponent {
  private medicineService = inject(MedicineService);

  // getActive() retorna Observable<MedicineViewModel[]>
  // Si falla, devuelve of([]) en lugar de throwError
  // Así el async pipe nunca muestra error, siempre muestra lista (vacía si falla)
  medicinesSafe$ = this.medicineService.getActive();
}

/**
 * ============================================
 * EJEMPLO 4: Transformación con map
 * ============================================
 * 
 * El servicio ya transforma a ViewModel
 * Pero aquí mostramos cómo aplicar map adicional en componente
 */
@Component({
  selector: 'app-medicines-example-transformation',
  template: `
    <div class="medicines-container">
      <h2>Medicamentos (Datos Transformados)</h2>

      <div *ngIf="(medicinesGrouped$ | async) as groups">
        <div *ngFor="let group of groups" class="group">
          <h3>{{ group.category }} ({{ group.count }})</h3>
          <div *ngFor="let medicine of group.medicines" class="medicine-card">
            <h4>{{ medicine.displayName }}</h4>
            <p *ngIf="medicine.formattedStartDate">
              Iniciado: {{ medicine.formattedStartDate }}
            </p>
            <p *ngIf="medicine.daysUntilExpiration !== undefined">
              Días: {{ medicine.daysUntilExpiration }}
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .group {
      margin-bottom: 2rem;
      padding: 1rem;
      background: #f9f9f9;
      border-radius: 4px;
    }
  `]
})
export class MedicinesExampleTransformationComponent {
  private medicineService = inject(MedicineService);

  // getGroupedMedicines() agrupa medicamentos por estado
  // Es una transformación adicional sobre getAll()
  medicinesGrouped$ = this.medicineService.getGroupedMedicines();
}

/**
 * ============================================
 * EJEMPLO 5: Paginación con Tipado
 * ============================================
 * 
 * Usa PaginatedResponse<T> para obtener metadatos de paginación
 * Permite navegar entre páginas de forma segura
 */
@Component({
  selector: 'app-medicines-example-pagination',
  template: `
    <div class="medicines-container">
      <h2>Medicamentos (Paginados)</h2>

      <div *ngIf="(paginatedMedicines$ | async) as response">
        <!-- Información de paginación tipada -->
        <p>Página {{ response.page }} de {{ response.totalPages }} 
           ({{ response.total }} medicamentos totales)</p>

        <!-- Items de la página actual -->
        <div *ngFor="let medicine of response.items" class="medicine-card">
          <h4>{{ medicine.name }}</h4>
        </div>

        <!-- Botones de navegación -->
        <div class="pagination">
          <button (click)="previousPage()" [disabled]="response.page === 1">
            ← Anterior
          </button>
          <span>{{ response.page }} / {{ response.totalPages }}</span>
          <button (click)="nextPage()" [disabled]="!response.hasMore">
            Siguiente →
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .pagination {
      display: flex;
      gap: 1rem;
      align-items: center;
      margin-top: 1rem;
    }
  `]
})
export class MedicinesExamplePaginationComponent {
  private medicineService = inject(MedicineService);

  currentPage = signal(1);
  pageSize = signal(5);

  // Observable que se actualiza cuando cambia currentPage
  get paginatedMedicines$() {
    return this.medicineService.getPage(this.currentPage(), this.pageSize());
  }

  nextPage() {
    this.currentPage.update(p => p + 1);
  }

  previousPage() {
    this.currentPage.update(p => Math.max(1, p - 1));
  }
}

/**
 * ============================================
 * EJEMPLO 6: Búsqueda con Timeout y Retry
 * ============================================
 * 
 * searchRemote() tiene timeout de 5s y graceful degradation
 * Demuestra cómo combinar múltiples operadores RxJS
 */
@Component({
  selector: 'app-medicines-example-search',
  template: `
    <div class="medicines-container">
      <h2>Medicamentos (Búsqueda)</h2>

      <input 
        type="text" 
        placeholder="Buscar medicamentos..."
        (keyup)="onSearch($event)"
      />

      <div *ngIf="(searchResults$ | async) as results">
        <p *ngIf="searchTerm() && results.length === 0" class="no-results">
          No hay resultados para "{{ searchTerm() }}"
        </p>

        <div *ngFor="let medicine of results" class="medicine-card">
          <h4>{{ medicine.name }}</h4>
          <p>{{ medicine.dosage }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    input {
      padding: 0.5rem;
      width: 100%;
      margin-bottom: 1rem;
    }
    .no-results {
      color: #999;
      font-style: italic;
    }
  `]
})
export class MedicinesExampleSearchComponent {
  private medicineService = inject(MedicineService);

  searchTerm = signal('');
  searchResults$ = this.medicineService.searchRemote('');

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
    this.searchResults$ = this.medicineService.searchRemote(value);
  }
}

/**
 * ============================================
 * EJEMPLO 7: Combinación de Patrones
 * ============================================
 * 
 * Componente realista que usa:
 * - Tipado completo
 * - Transformación con map
 * - Error handling
 * - Retry logic
 * - Loading states
 */
@Component({
  selector: 'app-medicines-example-complete',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="medicines-container">
      <h2>Medicamentos (Ejemplo Completo)</h2>

      <!-- Loading -->
      <div *ngIf="loading()" class="spinner">
        <p>Cargando medicamentos...</p>
      </div>

      <!-- Error -->
      <div *ngIf="error() && !loading()" class="error-box">
        <h4>Error al cargar medicamentos</h4>
        <p>{{ error()!.message }}</p>
        <button (click)="retry()" class="btn-retry">Reintentar</button>
      </div>

      <!-- Success -->
      <div *ngIf="!loading() && !error()">
        <!-- Agrupados por estado -->
        <div *ngFor="let group of medicinesGrouped()" class="group">
          <h3>{{ group.category | titlecase }} ({{ group.count }})</h3>
          
          <div *ngFor="let medicine of group.medicines" class="medicine-card">
            <div class="header">
              <h4>{{ medicine.displayName }}</h4>
              <span class="badge" [class]="'badge-' + medicine.expirationStatus">
                {{ medicine.expirationStatus }}
              </span>
            </div>

            <div class="details">
              <p>
                <strong>Iniciado:</strong> {{ medicine.formattedStartDate }}
              </p>
              <p *ngIf="medicine.formattedEndDate">
                <strong>Finaliza:</strong> {{ medicine.formattedEndDate }}
              </p>
              <p *ngIf="medicine.daysUntilExpiration !== undefined">
                <strong>Días:</strong> {{ medicine.daysUntilExpiration }}
              </p>
            </div>

            <div class="actions">
              <button (click)="viewDetails(medicine.id)">Ver</button>
              <button (click)="edit(medicine.id)">Editar</button>
              <button (click)="delete(medicine.id)" class="btn-danger">
                Eliminar
              </button>
            </div>
          </div>
        </div>

        <!-- Sin medicamentos -->
        <div *ngIf="medicinesGrouped().length === 0" class="empty-state">
          <p>No hay medicamentos registrados</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .spinner, .empty-state {
      padding: 2rem;
      text-align: center;
    }
    .error-box {
      background: #fee;
      border: 2px solid #f00;
      padding: 1rem;
      border-radius: 4px;
      margin: 1rem 0;
    }
    .group {
      margin-bottom: 2rem;
    }
    .medicine-card {
      border: 1px solid #ddd;
      padding: 1rem;
      margin-bottom: 1rem;
      border-radius: 4px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    .badge {
      padding: 0.25rem 0.5rem;
      border-radius: 3px;
      font-size: 0.85rem;
      font-weight: bold;
      color: white;
    }
    .badge-active { background: green; }
    .badge-expiring-soon { background: orange; }
    .badge-expired { background: red; }
    .actions {
      display: flex;
      gap: 0.5rem;
      margin-top: 1rem;
    }
    button {
      padding: 0.5rem 1rem;
      cursor: pointer;
      border: 1px solid #ccc;
      border-radius: 4px;
      background: white;
    }
    button:hover {
      background: #f0f0f0;
    }
    .btn-danger {
      color: red;
      border-color: red;
    }
    .btn-retry {
      background: #007bff;
      color: white;
      border-color: #007bff;
    }
  `]
})
export class MedicinesExampleCompleteComponent implements OnInit, OnDestroy {
  private medicineService = inject(MedicineService);
  private toastService = inject(ToastService);
  private destroy$ = new Subject<void>();

  loading = signal(false);
  error = signal<ApiError | null>(null);
  medicinesGrouped = signal<any[]>([]);

  ngOnInit() {
    this.loadMedicines();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadMedicines() {
    this.loading.set(true);
    this.error.set(null);

    this.medicineService
      .getGroupedMedicines()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (groups) => {
          this.medicinesGrouped.set(groups);
          this.loading.set(false);
        },
        error: (err: ApiError) => {
          this.error.set(err);
          this.loading.set(false);
          this.toastService.error(err.message);
        }
      });
  }

  retry() {
    this.loadMedicines();
  }

  viewDetails(id: string) {
    console.log('Ver detalles:', id);
    // Navegar a vista detalle
  }

  edit(id: string) {
    console.log('Editar:', id);
    // Navegar a vista editar
  }

  delete(id: string) {
    if (!confirm('¿Eliminar medicamento?')) return;

    this.medicineService.delete(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastService.success('Medicamento eliminado');
          this.loadMedicines();
        },
        error: (err: ApiError) => {
          this.toastService.error(err.message);
        }
      });
  }
}

/**
 * Exportar todos los componentes de ejemplo
 */
export const TAREA3_EXAMPLES = [
  MedicinesExampleTypedComponent,
  MedicinesExampleErrorHandlingComponent,
  MedicinesExampleGracefulComponent,
  MedicinesExampleTransformationComponent,
  MedicinesExamplePaginationComponent,
  MedicinesExampleSearchComponent,
  MedicinesExampleCompleteComponent
];
