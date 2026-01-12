import { Signal, WritableSignal, signal, computed } from '@angular/core';
import { Observable } from 'rxjs';
import { 
  LoadingState, 
  LoadingStateWithSuccess,
  loadingState, 
  successState, 
  errorState,
  successStateWithFlag,
  errorStateWithFlag,
  INITIAL_LOADING_STATE,
  INITIAL_LOADING_STATE_WITH_SUCCESS
} from '../models/loading-state.model';

/**
 * Servicio de utilidades para manejo de estados de carga con signals
 * src/app/shared/utils/loading-state.utils.ts
 */

/**
 * Crea un signal de estado de carga con métodos auxiliares
 * Simplifica el manejo de estados loading/error/data
 * 
 * @example
 * const medicinesState = createLoadingState<Medicine[]>();
 * 
 * loadMedicines() {
 *   medicinesState.setLoading();
 *   this.medicineService.getAll().subscribe({
 *     next: data => medicinesState.setSuccess(data),
 *     error: err => medicinesState.setError(err.message)
 *   });
 * }
 */
export function createLoadingState<T>(initialData: T | null = null) {
  const state = signal<LoadingState<T>>({
    loading: false,
    error: null,
    data: initialData
  });

  return {
    // Signal base
    state: state as Signal<LoadingState<T>>,
    
    // Computed properties
    loading: computed(() => state().loading),
    error: computed(() => state().error),
    data: computed(() => state().data),
    hasError: computed(() => state().error !== null),
    hasData: computed(() => state().data !== null),
    isEmpty: computed(() => {
      const currentState = state();
      return !currentState.loading && 
        !currentState.error && 
        (currentState.data === null || (Array.isArray(currentState.data) && currentState.data.length === 0));
    }),
    isIdle: computed(() => !state().loading && state().error === null && state().data === null),

    // Setters
    setLoading: () => state.set(loadingState<T>()),
    setSuccess: (data: T) => state.set(successState(data)),
    setError: (error: string) => state.set(errorState<T>(error)),
    reset: () => state.set(INITIAL_LOADING_STATE),
    
    // Update directo del signal
    update: (updater: (state: LoadingState<T>) => LoadingState<T>) => state.update(updater)
  };
}

/**
 * Crea un signal de estado de carga con flag de success
 * Útil para operaciones de escritura donde necesitas mostrar feedback de éxito
 * 
 * @example
 * const saveState = createLoadingStateWithSuccess<Medicine>();
 * 
 * saveMedicine(data: CreateMedicineDto) {
 *   saveState.setLoading();
 *   this.medicineService.create(data).subscribe({
 *     next: medicine => {
 *       saveState.setSuccess(medicine);
 *       this.toast.success('Medicamento creado');
 *     },
 *     error: err => saveState.setError(err.message)
 *   });
 * }
 */
export function createLoadingStateWithSuccess<T>(initialData: T | null = null) {
  const state = signal<LoadingStateWithSuccess<T>>({
    loading: false,
    error: null,
    data: initialData,
    success: false
  });

  return {
    // Signal base
    state: state as Signal<LoadingStateWithSuccess<T>>,
    
    // Computed properties
    loading: computed(() => state().loading),
    error: computed(() => state().error),
    data: computed(() => state().data),
    success: computed(() => state().success),
    hasError: computed(() => state().error !== null),
    hasData: computed(() => state().data !== null),
    isEmpty: computed(() => {
      const currentState = state();
      return !currentState.loading && 
        !currentState.error && 
        (currentState.data === null || (Array.isArray(currentState.data) && currentState.data.length === 0));
    }),

    // Setters
    setLoading: () => state.set({ loading: true, error: null, data: null, success: false }),
    setSuccess: (data: T) => state.set(successStateWithFlag(data)),
    setError: (error: string) => state.set(errorStateWithFlag<T>(error)),
    reset: () => state.set(INITIAL_LOADING_STATE_WITH_SUCCESS),
    clearSuccess: () => state.update(s => ({ ...s, success: false })),
    
    // Update directo del signal
    update: (updater: (state: LoadingStateWithSuccess<T>) => LoadingStateWithSuccess<T>) => state.update(updater)
  };
}

/**
 * Ejecuta una petición Observable y actualiza el estado automáticamente
 * Simplifica el patrón subscribe() manual
 * 
 * @example
 * const medicinesState = createLoadingState<Medicine[]>();
 * 
 * loadMedicines() {
 *   executeWithState(
 *     this.medicineService.getAll(),
 *     medicinesState
 *   );
 * }
 */
export function executeWithState<T>(
  observable: Observable<T>,
  stateHandler: ReturnType<typeof createLoadingState<T>>
): void {
  stateHandler.setLoading();
  
  observable.subscribe({
    next: (data) => stateHandler.setSuccess(data),
    error: (err) => stateHandler.setError(err?.message || 'Error desconocido')
  });
}

/**
 * Ejecuta una petición Observable con estado y success flag
 * 
 * @example
 * const saveState = createLoadingStateWithSuccess<Medicine>();
 * 
 * saveMedicine(data: CreateMedicineDto) {
 *   executeWithSuccessState(
 *     this.medicineService.create(data),
 *     saveState,
 *     () => this.toast.success('Guardado correctamente')
 *   );
 * }
 */
export function executeWithSuccessState<T>(
  observable: Observable<T>,
  stateHandler: ReturnType<typeof createLoadingStateWithSuccess<T>>,
  onSuccess?: (data: T) => void,
  onError?: (error: string) => void
): void {
  stateHandler.setLoading();
  
  observable.subscribe({
    next: (data) => {
      stateHandler.setSuccess(data);
      if (onSuccess) onSuccess(data);
    },
    error: (err) => {
      const errorMsg = err?.message || 'Error desconocido';
      stateHandler.setError(errorMsg);
      if (onError) onError(errorMsg);
    }
  });
}

/**
 * Crea un signal simple para operaciones de escritura
 * Solo maneja loading/error sin data
 * 
 * @example
 * const deleteState = createOperationState();
 * 
 * deleteMedicine(id: string) {
 *   deleteState.setLoading();
 *   this.medicineService.delete(id).subscribe({
 *     next: () => {
 *       deleteState.setSuccess();
 *       this.toast.success('Eliminado');
 *     },
 *     error: err => deleteState.setError(err.message)
 *   });
 * }
 */
export function createOperationState() {
  const loading = signal(false);
  const error = signal<string | null>(null);
  const success = signal(false);

  return {
    loading: loading.asReadonly(),
    error: error.asReadonly(),
    success: success.asReadonly(),
    
    setLoading: () => {
      loading.set(true);
      error.set(null);
      success.set(false);
    },
    setSuccess: () => {
      loading.set(false);
      error.set(null);
      success.set(true);
    },
    setError: (err: string) => {
      loading.set(false);
      error.set(err);
      success.set(false);
    },
    reset: () => {
      loading.set(false);
      error.set(null);
      success.set(false);
    },
    clearSuccess: () => success.set(false)
  };
}
