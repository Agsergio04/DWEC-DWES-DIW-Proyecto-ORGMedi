/**
 * Modelos y DTOs para medicamentos
 * src/app/data/models/medicine.model.ts
 * 
 * TAREA 3: Manejo de Respuestas HTTP
 * Define interfaces completas para tipado seguro de respuestas API
 */

/**
 * Modelo base de medicamento desde la API
 * Representa la respuesta del servidor en GET/POST/PUT
 */
export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  description?: string;
  startDate: string;
  endDate?: string;
  quantity?: number;
  remainingDays?: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * DTO para crear un medicamento
 * No incluye id ni campos de timestamp (generados por servidor)
 */
export interface CreateMedicineDto {
  name: string;
  dosage: string;
  frequency: string;
  description?: string;
  startDate: string;
  endDate?: string;
  quantity?: number;
}

/**
 * DTO para actualizar un medicamento
 * Todos los campos son opcionales (para PATCH)
 */
export interface UpdateMedicineDto {
  name?: string;
  dosage?: string;
  frequency?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  quantity?: number;
}

/**
 * Respuesta genérica de lista desde la API (TAREA 3: Tipado)
 * Tipo genérico T para reutilizar en otros servicios
 * 
 * Estructura:
 * {
 *   items: T[],
 *   total: number,
 *   page?: number,
 *   pageSize?: number
 * }
 */
export interface ApiListResponse<T> {
  items: T[];
  total: number;
  page?: number;
  pageSize?: number;
}

/**
 * Respuesta paginada desde la API (TAREA 3: Tipado)
 * Incluye información completa de paginación
 * 
 * Estructura:
 * {
 *   items: T[],
 *   total: number,
 *   page: number,
 *   pageSize: number,
 *   totalPages: number,
 *   hasMore: boolean
 * }
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}

/**
 * Respuesta genérica de un recurso desde la API (TAREA 3: Tipado)
 * Para operaciones CRUD individuales (POST, GET singular)
 * 
 * Estructura:
 * {
 *   data: T,
 *   message?: string,
 *   timestamp?: string
 * }
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  timestamp?: string;
}

/**
 * Respuesta de error de la API (TAREA 3: Manejo de errores)
 * Estructura uniforme para todos los errores HTTP
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
}

/**
 * ViewModel de medicamento (TAREA 3: Transformación con map)
 * Extiende Medicine con campos calculados para la UI
 * 
 * Campos adicionales calculados:
 * - formattedStartDate: startDate convertida a string legible
 * - formattedEndDate: endDate convertida a string legible (si existe)
 * - isActive: boolean indicando si el medicamento está activo
 * - isExpired: boolean indicando si expiró
 * - daysUntilExpiration: número de días hasta expiración
 * - expirationStatus: 'active' | 'expiring-soon' | 'expired'
 * - displayName: nombre formateado para mostrar (name + dosage)
 */
export interface MedicineViewModel extends Medicine {
  // Fechas formateadas
  formattedStartDate?: string;
  formattedEndDate?: string;

  // Estados calculados
  isActive: boolean;
  isExpired: boolean;
  daysUntilExpiration?: number;
  expirationStatus: 'active' | 'expiring-soon' | 'expired';

  // Campos de presentación
  displayName: string;
}

/**
 * Medicamentos agrupados por categoría
 * Utilizado en la vista de medicamentos agrupados por estado
 */
export interface MedicineGrouped {
  category: 'active' | 'expiring-soon' | 'expired';
  medicines: MedicineViewModel[];
  count: number;
}
