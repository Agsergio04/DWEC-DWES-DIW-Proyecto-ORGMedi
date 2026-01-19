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
 * Compatible con el backend que devuelve: id, nombre, cantidadMg, fechaInicio, fechaFin, color, frecuencia
 */
export interface Medicine {
  // Campos principales (del backend)
  id: number;
  nombre: string;
  cantidadMg: number;
  horaInicio: string;
  fechaInicio: string | Date;
  fechaFin: string | Date;
  color: string;
  frecuencia: number;
  
  // Campos opcionales (para compatibilidad con frontend)
  remainingDays?: number;
  icon?: string;
  consumed?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * DTO para crear un medicamento
 * No incluye id (generado por servidor)
 * Compatible con: POST /api/medicamentos
 */
export interface CreateMedicineDto {
  nombre: string;
  cantidadMg: number;
  horaInicio: string;
  fechaInicio: string;
  fechaFin: string;
  color: string;
  frecuencia: number;
}

/**
 * DTO para actualizar un medicamento
 * Todos los campos son opcionales (para PATCH)
 */
export interface UpdateMedicineDto {
  nombre?: string;
  cantidadMg?: number;
  fechaInicio?: string;
  fechaFin?: string;
  color?: string;
  frecuencia?: number;
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
