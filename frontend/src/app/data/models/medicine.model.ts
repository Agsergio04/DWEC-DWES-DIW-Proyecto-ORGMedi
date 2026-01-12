/**
 * Modelos y DTOs para medicamentos
 * src/app/data/models/medicine.model.ts
 */

/**
 * Modelo base de medicamento desde la API
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
 * Respuesta genérica de lista desde la API
 * Tipo genérico T para reutilizar en otros servicios
 */
export interface ApiListResponse<T> {
  items: T[];
  total: number;
  page?: number;
  pageSize?: number;
}

/**
 * Respuesta paginada desde la API
 * Incluye información de paginación
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
 * Respuesta genérica de un recurso desde la API
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  timestamp?: string;
}

/**
 * Respuesta de error de la API
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
}

/**
 * Vista de modelo para el componente (con datos transformados)
 * Agrupa datos del servidor + datos calculados para la UI
 */
export interface MedicineViewModel extends Medicine {
  // Campos calculados
  formattedStartDate?: string;
  formattedEndDate?: string;
  isActive: boolean;
  isExpired: boolean;
  daysUntilExpiration?: number;
  expirationStatus: 'active' | 'expiring-soon' | 'expired';
  displayName?: string;
}

/**
 * Grupo de medicamentos para UI
 */
export interface MedicineGrouped {
  category: 'active' | 'expiring-soon' | 'expired';
  medicines: MedicineViewModel[];
  count: number;
}
