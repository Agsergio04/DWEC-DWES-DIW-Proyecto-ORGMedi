import { Injectable, signal } from '@angular/core';

/**
 * Servicio de estado de formularios
 * Gestiona el estado de validación, envío y errores de formularios
 */
@Injectable({ providedIn: 'root' })
export class FormStateService {
  
  // ============ ESTADO MEDICINA ============

  private medicineFormSignal = signal<{
    isSubmitting: boolean;
    hasErrors: boolean;
    errors: Record<string, string>;
    successMessage: string | null;
  }>({
    isSubmitting: false,
    hasErrors: false,
    errors: {},
    successMessage: null
  });

  medicineFormState = this.medicineFormSignal.asReadonly();

  // ============ ESTADO USUARIO ============

  private userFormSignal = signal<{
    isSubmitting: boolean;
    hasErrors: boolean;
    errors: Record<string, string>;
    successMessage: string | null;
  }>({
    isSubmitting: false,
    hasErrors: false,
    errors: {},
    successMessage: null
  });

  userFormState = this.userFormSignal.asReadonly();

  // ============ MÉTODOS PÚBLICOS ============

  /**
   * Establecer estado de envío de formulario
   */
  setMedicineFormSubmitting(submitting: boolean) {
    this.medicineFormSignal.update(state => ({
      ...state,
      isSubmitting: submitting
    }));
  }

  /**
   * Establecer errores de validación
   */
  setMedicineFormErrors(errors: Record<string, string>) {
    this.medicineFormSignal.update(state => ({
      ...state,
      hasErrors: Object.keys(errors).length > 0,
      errors
    }));
  }

  /**
   * Establecer mensaje de éxito
   */
  setMedicineFormSuccess(message: string | null) {
    this.medicineFormSignal.update(state => ({
      ...state,
      successMessage: message
    }));
  }

  /**
   * Limpiar estado del formulario
   */
  resetMedicineForm() {
    this.medicineFormSignal.set({
      isSubmitting: false,
      hasErrors: false,
      errors: {},
      successMessage: null
    });
  }

  // ============ USUARIO ============

  /**
   * Establecer estado de envío de formulario de usuario
   */
  setUserFormSubmitting(submitting: boolean) {
    this.userFormSignal.update(state => ({
      ...state,
      isSubmitting: submitting
    }));
  }

  /**
   * Establecer errores de validación de usuario
   */
  setUserFormErrors(errors: Record<string, string>) {
    this.userFormSignal.update(state => ({
      ...state,
      hasErrors: Object.keys(errors).length > 0,
      errors
    }));
  }

  /**
   * Establecer mensaje de éxito de usuario
   */
  setUserFormSuccess(message: string | null) {
    this.userFormSignal.update(state => ({
      ...state,
      successMessage: message
    }));
  }

  /**
   * Limpiar estado del formulario de usuario
   */
  resetUserForm() {
    this.userFormSignal.set({
      isSubmitting: false,
      hasErrors: false,
      errors: {},
      successMessage: null
    });
  }
}
