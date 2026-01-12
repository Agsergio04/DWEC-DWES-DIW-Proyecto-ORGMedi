import { CanDeactivateFn } from '@angular/router';
import { FormGroup } from '@angular/forms';

/**
 * Interfaz que deben cumplir los componentes con formularios
 */
export interface FormComponent {
  form: FormGroup;
}

/**
 * Guard funcional que previene la navegación si hay cambios sin guardar
 * Se usa para formularios que tienen cambios pendientes (dirty)
 */
export const pendingChangesGuard: CanDeactivateFn<FormComponent> = (
  component: FormComponent,
  currentRoute,
  currentState,
  nextState
) => {
  // Si no hay formulario, permite la navegación
  if (!component.form) {
    return true;
  }

  // Si el formulario está limpio (sin cambios), permite la navegación
  if (!component.form.dirty) {
    return true;
  }

  // Si hay cambios sin guardar, muestra un diálogo de confirmación
  const message = 'Hay cambios sin guardar. ¿Estás seguro de que quieres salir?';
  return confirm(message);
};
