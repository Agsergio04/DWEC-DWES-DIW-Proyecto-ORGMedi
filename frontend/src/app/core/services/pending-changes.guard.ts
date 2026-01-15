import { CanDeactivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { FormGroup } from '@angular/forms';

/**
 * Interfaz que deben cumplir los componentes con formularios protegidos
 */
export interface PendingChangesComponent {
  form?: FormGroup;
  hasPendingChanges?(): boolean;
}

/**
 * Guard funcional: Previene navegación si hay cambios sin guardar
 * 
 * Flujo:
 * 1. Usuario está en un formulario y realiza cambios
 * 2. Usuario intenta navegar a otra ruta
 * 3. El guard detecta que form.dirty === true
 * 4. Muestra un diálogo de confirmación
 * 5. Si cancela, se bloquea la navegación
 * 6. Si confirma, se permite la navegación (sin guardar)
 * 
 * @example
 * { 
 *   path: 'medicamentos/:id/editar',
 *   component: EditMedicineComponent,
 *   canDeactivate: [pendingChangesGuard]
 * }
 * 
 * // En el componente:
 * export class EditMedicineComponent implements PendingChangesComponent {
 *   form = new FormGroup({ ... });
 * }
 */
export const pendingChangesGuard: CanDeactivateFn<PendingChangesComponent> = (
  component: PendingChangesComponent,
  currentRoute: ActivatedRouteSnapshot,
  currentState: RouterStateSnapshot,
  nextState: RouterStateSnapshot
) => {
  // Si el componente tiene un método personalizado, usarlo
  if (component.hasPendingChanges && component.hasPendingChanges()) {
    return askUserToConfirm();
  }

  // Si no hay formulario, permitir navegación
  if (!component.form) {
    return true;
  }

  // Si el formulario está limpio (sin cambios), permitir navegación
  if (!component.form.dirty) {
    return true;
  }

  // Si hay cambios sin guardar, pedir confirmación
  return askUserToConfirm();
};

/**
 * Mostrar diálogo de confirmación personalizado
 */
function askUserToConfirm(): boolean {
  const message = '⚠️ Hay cambios sin guardar.\n\n¿Estás seguro de que quieres salir?';
  return window.confirm(message);
}
