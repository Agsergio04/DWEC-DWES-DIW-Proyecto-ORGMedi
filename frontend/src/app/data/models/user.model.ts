/**
 * Modelos y Tipos de Usuarios
 * ============================
 * 
 * Este archivo define toda la estructura de datos de usuarios.
 * Incluye:
 * - User: Modelo base (api)
 * - CreateUserDto: Datos para crear usuario
 * - UpdateUserDto: Datos para actualizar usuario
 * - UserViewModel: Enriquecido con datos calculados para la UI
 * - UserStats: Estadísticas agregadas
 * 
 * Patrón: Separación clara entre API (entidades) y UI (viewmodels)
 */

/**
 * Modelo Base de Usuario (desde la API)
 * ===================================
 * 
 * Representa el usuario tal como viene de la base de datos.
 * Todos los campos que devuelve la API.
 * 
 * @property id - ID único del usuario
 * @property name - Nombre completo
 * @property email - Email (único)
 * @property phone - Número de teléfono (opcional)
 * @property dateOfBirth - Fecha de nacimiento (opcional)
 * @property medicalConditions - Lista de condiciones médicas (ej: diabetes, hipertensión)
 * @property allergies - Lista de alergias (ej: penicilina, latex)
 * @property doctorName - Nombre del médico a cargo
 * @property doctorContact - Contacto del médico
 * @property active - Si el usuario está habilitado/activo
 * @property createdAt - Cuándo se creó (timestamp)
 * @property updatedAt - Última actualización (timestamp)
 */
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  medicalConditions?: string[];
  allergies?: string[];
  doctorName?: string;
  doctorContact?: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * DTO para Crear Usuario
 * ======================
 * 
 * Data Transfer Object: Los datos que el cliente ENVÍA a la API
 * para crear un nuevo usuario.
 * 
 * Nota: NO incluye:
 * - id (lo genera la API)
 * - active (se asume true automáticamente)
 * - createdAt/updatedAt (los genera la API)
 * 
 * @example
 * // En un formulario de registro
 * const newUser: CreateUserDto = {
 *   name: 'Juan Pérez',
 *   email: 'juan@example.com',
 *   phone: '123456789',
 *   dateOfBirth: '1990-05-15',
 *   allergies: ['penicilina'],
 *   doctorName: 'Dr. García'
 * };
 */
export interface CreateUserDto {
  name: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  medicalConditions?: string[];
  allergies?: string[];
  doctorName?: string;
  doctorContact?: string;
}

/**
 * DTO para Actualizar Usuario
 * ===========================
 * 
 * Data Transfer Object: Los datos que el cliente ENVÍA a la API
 * para actualizar un usuario existente.
 * 
 * Usa Partial<CreateUserDto>:
 * - Significa que TODOS los campos son opcionales
 * - Puedes actualizar solo 1 campo sin enviar los demás
 * - Más flexible que CreateUserDto
 * 
 * @example
 * // Actualizar solo el teléfono
 * const update: UpdateUserDto = {
 *   phone: '987654321'
 * };
 */
export interface UpdateUserDto extends Partial<CreateUserDto> {}

/**
 * Respuesta de Lista de Usuarios (desde la API)
 * ============================================
 * 
 * Estructura de la respuesta cuando se pide un listado de usuarios.
 * Incluye paginación.
 * 
 * @property items - Array de usuarios
 * @property total - Total de usuarios en la BD (sin paginación)
 * @property page - Página actual (opcional)
 * @property pageSize - Usuarios por página (opcional)
 * 
 * @example
 * // Respuesta de la API
 * {
 *   items: [{ id: 1, name: 'Juan', ... }, { id: 2, name: 'María', ... }],
 *   total: 150,
 *   page: 1,
 *   pageSize: 10
 * }
 */
export interface ApiUsersListResponse {
  items: User[];
  total: number;
  page?: number;
  pageSize?: number;
}

/**
 * ViewModel de Usuario (para la UI)
 * ================================
 * 
 * Extiende User con datos CALCULADOS/TRANSFORMADOS específicos para la interfaz.
 * 
 * Los campos calculados se generan en un transformer o resolver:
 * - age: calculado a partir de dateOfBirth
 * - formattedDateOfBirth: formato legible (DD/MM/YYYY)
 * - formattedCreatedAt: formato legible con hora
 * - hasMedicalConditions: true si tiene al menos 1
 * - hasAllergies: true si tiene al menos 1
 * - hasDoctorInfo: true si tiene nombre y contacto del médico
 * - displayName: nombre formateado (ej: "Pérez, Juan")
 * - medicalConditionsText: lista como string: "Diabetes, Hipertensión"
 * - allergiesText: lista como string: "Penicilina, Latex"
 * 
 * Ventajas:
 *  Evita lógica de cálculos en templates/componentes
 *  Reutilizable en múltiples vistas
 *  Mejor rendimiento (calcula una sola vez)
 * 
 * @example
 * // En template
 * @if (user.hasAllergies) {
 *   <div class="alert">Alergias: {{ user.allergiesText }}</div>
 * }
 * <p>Edad: {{ user.age }} años</p>
 */
export interface UserViewModel extends User {
  // Campos calculados/derivados
  age?: number;
  formattedDateOfBirth?: string;
  formattedCreatedAt?: string;
  hasMedicalConditions: boolean;
  hasAllergies: boolean;
  hasDoctorInfo: boolean;
  displayName: string;
  medicalConditionsText?: string;
  allergiesText?: string;
}

/**
 * Estadísticas de Usuarios para Dashboard
 * ======================================
 * 
 * Objeto con métricas agregadas de usuarios.
 * Se usa en dashboards/análisis.
 * 
 * @property totalActive - Total de usuarios activos
 * @property totalInactive - Total de usuarios inactivos
 * @property withMedicalConditions - Usuarios que tienen al menos 1 condición médica
 * @property withAllergies - Usuarios que tienen al menos 1 alergia
 * @property withDoctorInfo - Usuarios que tienen registrado un médico
 * 
 * @example
 * // En un dashboard
 * <div class="stats">
 *   <p>Usuarios activos: {{ stats.totalActive }}</p>
 *   <p>Con alergias: {{ stats.withAllergies }}</p>
 * </div>
 */
export interface UserStats {
  totalActive: number;
  totalInactive: number;
  withMedicalConditions: number;
  withAllergies: number;
  withDoctorInfo: number;
}
