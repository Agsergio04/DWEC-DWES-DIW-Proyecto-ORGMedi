import { Component, OnInit, OnDestroy, inject, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MedicineCardComponent } from '../../components/shared/medicine-card/medicine-card';
import { MedicineStoreSignals } from '../../data/stores/medicine-signals.store';
import { MedicineViewModel, PaginatedResponse } from '../../data/models/medicine.model';
import { MedicineService } from '../../data/medicine.service';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-medicines-page',
  standalone: true,
  imports: [CommonModule, MedicineCardComponent, ReactiveFormsModule],
  templateUrl: './medicines.html',
  styleUrls: ['./medicines.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MedicinesPage implements OnInit, OnDestroy {
  private medicineStore = inject(MedicineStoreSignals);
  private medicineService = inject(MedicineService);
  private router = inject(Router);

  // Signals del store (readonly)
  medicines = this.medicineStore.medicines;
  loading = this.medicineStore.loading;
  error = this.medicineStore.error;
  stats = this.medicineStore.stats;

  // ✅ Signals para paginación (Tarea 4)
  currentPage = signal(1);
  pageSize = signal(10);
  
  // ✅ State de paginación
  paginationState = signal<{
    loading: boolean;
    items: MedicineViewModel[];
    total: number;
    totalPages: number;
    hasMore: boolean;
  }>({
    loading: false,
    items: [],
    total: 0,
    totalPages: 0,
    hasMore: false
  });

  // ✅ Computed para saber si puede navegar
  canGoPrevious = computed(() => this.currentPage() > 1);
  canGoNext = computed(() => this.paginationState().hasMore);

  // ✅ NUEVO (Tarea 5): Control de búsqueda
  searchControl = new FormControl('');
  
  // ✅ NUEVO (Tarea 5): Estado de búsqueda
  searchState = signal<{
    term: string;
    loading: boolean;
    results: MedicineViewModel[];
  }>({
    term: '',
    loading: false,
    results: []
  });

  // ✅ NUEVO (Tarea 5): Para limpiar observables en ngOnDestroy
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    // Verificar si hay token de autenticación
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.warn('[MedicinesPage] No token found, redirecting to login');
      this.router.navigate(['/iniciar-sesion']);
      return;
    }

    // ✅ NUEVO (Tarea 5): Conectar búsqueda con debounce
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(term => this.searchLocal(term));

    // ✅ Cargar primera página de medicamentos (Tarea 4)
    this.loadPage(1);
  }

  /**
   * Limpiar observables en destroy
   * ✅ Tarea 5: Prevenir memory leaks
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Carga una página específica de medicamentos
   * ✅ Tarea 4: Paginación
   */
  loadPage(page: number): void {
    this.currentPage.set(page);
    this.paginationState.update(s => ({ ...s, loading: true }));

    this.medicineService.getPage(page, this.pageSize()).subscribe({
      next: (response: PaginatedResponse<MedicineViewModel>) => {
        this.paginationState.set({
          loading: false,
          items: response.items,
          total: response.total,
          totalPages: response.totalPages,
          hasMore: response.hasMore
        });
      },
      error: (error) => {
        console.error('Error loading page:', error);
        this.paginationState.update(s => ({ ...s, loading: false }));
      }
    });
  }

  /**
   * Navega a la página anterior
   * ✅ Tarea 4: Paginación
   */
  previousPage(): void {
    if (this.canGoPrevious()) {
      this.loadPage(this.currentPage() - 1);
    }
  }

  /**
   * Navega a la página siguiente
   * ✅ Tarea 4: Paginación
   */
  nextPage(): void {
    if (this.canGoNext()) {
      this.loadPage(this.currentPage() + 1);
    }
  }

  /**
   * Navega a una página específica
   * ✅ Tarea 4: Paginación
   * @param page Número de página a cargar
   */
  goToPage(page: number): void {
    if (page > 0 && page <= this.paginationState().totalPages) {
      this.loadPage(page);
    }
  }

  /**
   * Búsqueda local en medicamentos con debounce
   * ✅ Tarea 5: Búsqueda y Filtrado
   * @param term Término de búsqueda
   */
  searchLocal(term: string): void {
    this.searchState.update(s => ({ ...s, term, loading: true }));

    // Si hay término de búsqueda
    if (term.trim().length > 0) {
      this.medicineService.search(term).subscribe({
        next: (results) => {
          this.searchState.set({
            term,
            loading: false,
            results
          });
        },
        error: (error) => {
          console.error('Error en búsqueda:', error);
          this.searchState.update(s => ({ ...s, loading: false, results: [] }));
        }
      });
    } else {
      // Sin término, mostrar lista paginada
      this.searchState.set({ term: '', loading: false, results: [] });
      // Recargar página actual para mostrar paginación
      this.loadPage(this.currentPage());
    }
  }

  /**
   * Limpia el campo de búsqueda
   * ✅ Tarea 5: Búsqueda y Filtrado
   */
  clearSearch(): void {
    this.searchControl.reset();
    this.searchLocal('');
  }

  /**
   * Obtiene los items a mostrar: resultados o paginación
   * ✅ Tarea 5: Búsqueda y Filtrado
   */
  get itemsToDisplay(): MedicineViewModel[] {
    const { term, results } = this.searchState();
    
    // Si hay búsqueda activa, mostrar resultados
    if (term.trim().length > 0) {
      return results;
    }
    
    // Si no, mostrar items de página actual
    return this.paginationState().items;
  }

  /**
   * TrackBy para optimizar *ngFor y prevenir re-renders innecesarios
   */
  trackById(index: number, medicine: MedicineViewModel): string | number {
    return medicine.id;
  }

  /**
   * Obtiene medicamentos activos desde el store
   */
  get activeMedicines(): MedicineViewModel[] {
    return this.medicineStore.activeMedicines();
  }

  /**
   * Obtiene medicamentos expirados desde el store
   */
  get expiredMedicines(): MedicineViewModel[] {
    return this.medicineStore.expiredMedicines();
  }

  /**
   * Verifica si un medicamento ha vencido
   */
  isExpired(medicine: MedicineViewModel): boolean {
    return medicine.isExpired || false;
  }

  /**
   * Verifica si un medicamento está por vencer (dentro de 7 días)
   */
  isExpiring(medicine: MedicineViewModel): boolean {
    if (!medicine.fechaFin) return false;
    const endDate = new Date(medicine.fechaFin);
    const today = new Date();
    const daysUntilExpiry = (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  }

  /**
   * Toggle consumo del medicamento
   */
  toggleConsumption(id: number): void {
    console.log('Toggle consumo para medicamento:', id);
    const current = this.medicineStore.getById(id)();
    if (!current) return;

    const newValue = !current.consumed;
    // Optimist update local store
    this.medicineStore.update({ ...current, consumed: newValue });

    // Persistir en backend (PATCH parcial)
    this.medicineService.patch(id as any, { consumed: newValue }).subscribe({
      next: (updated) => {
        // Actualizar store con respuesta del servidor
        this.medicineStore.update(updated as any);
      },
      error: (err) => {
        console.error('Error al persistir consumo:', err);
        // Revertir cambio local
        this.medicineStore.update(current);
      }
    });
  }

  /**
   * Navega a la página de crear medicamento
   */
  navigateToCreate(): void {
    this.router.navigate(['/medicamentos/crear-medicamento']);
  }

  /**
   * Navega a la página de crear medicamento desde foto
   */
  navigateToCreateFromPhoto(): void {
    this.router.navigate(['/medicamentos/crear-foto']);
  }

  /**
   * Navega a la página de editar medicamento
   * @param medicineId ID del medicamento a editar
   */
  editMedicine(medicineId: string | number): void {
    this.router.navigate(['/medicamento', medicineId, 'editar-medicamento']);
  }

  /**
   * Elimina un medicamento con confirmación
   * @param medicineId ID del medicamento a eliminar
   */
  deleteMedicine(medicineId: string | number): void {
    const currentMedicines = this.medicines();
    const medicine = currentMedicines.find(m => Number(m.id) === Number(medicineId));
    if (!medicine) return;

    if (!confirm(`¿Está seguro de que desea eliminar "${medicine.nombre}"?`)) {
      return;
    }

    // Llamar a la API para eliminar en backend y, en caso de éxito,
    // actualizar tanto el store global como el estado de paginación/local.
    this.medicineService.delete(medicineId).subscribe({
      next: () => {
        // Quitar del store reactivo
        this.medicineStore.remove(medicineId);

        // Quitar de la página actual si pertenece a ella
        this.paginationState.update(s => {
          const items = s.items.filter(it => Number(it.id) !== Number(medicineId));
          const total = Math.max(0, s.total - 1);
          const totalPages = total === 0 ? 0 : Math.max(1, Math.ceil(total / this.pageSize()));
          const hasMore = this.currentPage() < totalPages;
          return { ...s, items, total, totalPages, hasMore };
        });

        console.log('Medicamento eliminado:', medicine.nombre);

        // Si la página quedó vacía y existen páginas anteriores, retroceder una
        const nowItems = this.paginationState().items;
        if (nowItems.length === 0 && this.currentPage() > 1) {
          this.loadPage(this.currentPage() - 1);
        }
      },
      error: (err) => {
        console.error('Error eliminando medicamento:', err);
        // Notificar al usuario de forma simple
        alert('Error al eliminar el medicamento. Intenta de nuevo.');
      }
    });
  }
}

