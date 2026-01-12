/**
 * Estados de carga para peticiones HTTP
 * src/app/shared/models/loading-state.model.ts
 */

/**
 * Estado genérico de una petición HTTP
 * Maneja loading, error y data
 */
export interface LoadingState<T> {
  loading: boolean;
  error: string | null;
  data: T | null;
}

/**
 * Estado extendido con success flag
 * Útil para operaciones de escritura (POST, PUT, DELETE)
 */
export interface LoadingStateWithSuccess<T> extends LoadingState<T> {
  success: boolean;
}

/**
 * Estado inicial para LoadingState
 */
export const INITIAL_LOADING_STATE: LoadingState<any> = {
  loading: false,
  error: null,
  data: null
};

/**
 * Estado inicial para LoadingStateWithSuccess
 */
export const INITIAL_LOADING_STATE_WITH_SUCCESS: LoadingStateWithSuccess<any> = {
  loading: false,
  error: null,
  data: null,
  success: false
};

/**
 * Estado de carga (iniciando petición)
 */
export function loadingState<T>(): LoadingState<T> {
  return {
    loading: true,
    error: null,
    data: null
  };
}

/**
 * Estado de éxito (petición completada)
 */
export function successState<T>(data: T): LoadingState<T> {
  return {
    loading: false,
    error: null,
    data
  };
}

/**
 * Estado de error (petición fallida)
 */
export function errorState<T>(error: string): LoadingState<T> {
  return {
    loading: false,
    error,
    data: null
  };
}

/**
 * Estado de éxito con flag de success
 */
export function successStateWithFlag<T>(data: T): LoadingStateWithSuccess<T> {
  return {
    loading: false,
    error: null,
    data,
    success: true
  };
}

/**
 * Estado de error con flag de success
 */
export function errorStateWithFlag<T>(error: string): LoadingStateWithSuccess<T> {
  return {
    loading: false,
    error,
    data: null,
    success: false
  };
}

/**
 * Helpers para verificar el estado
 */
export const LoadingStateHelpers = {
  isLoading: <T>(state: LoadingState<T>): boolean => state.loading,
  hasError: <T>(state: LoadingState<T>): boolean => state.error !== null,
  hasData: <T>(state: LoadingState<T>): boolean => state.data !== null,
  isEmpty: <T>(state: LoadingState<T>): boolean => 
    !state.loading && !state.error && (state.data === null || (Array.isArray(state.data) && state.data.length === 0)),
  isIdle: <T>(state: LoadingState<T>): boolean => 
    !state.loading && state.error === null && state.data === null
};
