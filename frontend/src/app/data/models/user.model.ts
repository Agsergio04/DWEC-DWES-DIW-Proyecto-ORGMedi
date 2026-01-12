/**
 * Modelos y DTOs para usuarios
 * src/app/data/models/user.model.ts
 */

/**
 * Modelo base de usuario desde la API
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
 * DTO para crear usuario
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
 * DTO para actualizar usuario
 */
export interface UpdateUserDto extends Partial<CreateUserDto> {}

/**
 * Respuesta genérica de lista de usuarios desde la API
 */
export interface ApiUsersListResponse {
  items: User[];
  total: number;
  page?: number;
  pageSize?: number;
}

/**
 * ViewModel para usuario (con datos transformados para UI)
 */
export interface UserViewModel extends User {
  // Campos calculados
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
 * Estadísticas de usuarios para dashboard
 */
export interface UserStats {
  totalActive: number;
  totalInactive: number;
  withMedicalConditions: number;
  withAllergies: number;
  withDoctorInfo: number;
}
