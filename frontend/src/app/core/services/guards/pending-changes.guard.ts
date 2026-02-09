import { CanDeactivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { FormGroup } from '@angular/forms';

/**
 * INTERFAZ: PendingChangesComponent
 * 
 * Define el contrato que deben cumplir los componentes que tengan formularios protegidos.
 * Permite al guard acceder a:
 * - form: FormGroup (para detectar cambios mediante form.dirty)
 * - hasPendingChanges(): Método personalizado para lógica adicional de validación
 */
export interface PendingChangesComponent {
  form?: FormGroup;
  hasPendingChanges?(): boolean;
}

/**
 * GUARD: pendingChangesGuard
 * 
 * PROPÓSITO:
 * Protege contra la pérdida accidental de datos. Previene que el usuario navegue
 * a otra página si hay cambios sin guardar en un formulario. Funciona como un
 * "guardián de salida" (canDeactivate) que valida antes de abandonar una ruta.
 * 
 * DESCRIPCIÓN TÉCNICA:
 * - Tipo: CanDeactivateFn (guard de desactivación de ruta)
 * - Comprueba si un formulario tiene cambios pendientes
 * - Si detecta cambios, muestra un diálogo de confirmación
 * - Solo permite la navegación si el usuario confirma
 * 
 * FLUJO DE EJECUCIÓN:
 * 1. Usuario abre formulario (ej: editar medicamento)
 * 2. Usuario realiza cambios en los campos (form.dirty = true)
 * 3. Usuario intenta navegar a otra ruta (ingresa URL, clic en menú, etc)
 * 4. Angular ejecuta el guard antes de completar la navegación
 * 5. Guard detecta form.dirty === true y muestra confirmación
 * 6. Usuario elige:
 *    - "Aceptar" → Permite navegación sin guardar (datos perdidos)
 *    - "Cancelar" → Bloquea navegación, usuario permanece en formulario
 * 
 * PARÁMETROS DEL GUARD:
 * - component: PendingChangesComponent - Componente siendo abandonado
 * - currentRoute: ActivatedRouteSnapshot - Información de ruta actual
 * - currentState: RouterStateSnapshot - Estado actual del router
 * - nextState: RouterStateSnapshot - Estado del router después de navegar
 * 
 * RETORNA:
 * - true: Permite navegación
 * - false: Bloquea navegación
 * 
 * LÓGICA DE VERIFICACIÓN (en orden):
 * 1. Si el componente implementa hasPendingChanges() → usarla
 * 2. Si no hay formulario → permitir navegación
 * 3. Si formulario está limpio (sin cambios) → permitir navegación
 * 4. Si hay cambios → mostrar dialog y permitir solo si confirma
 * 
 * USO EN RUTAS:
 * @example
 * const routes: Routes = [
 *   {
 *     path: 'medicamentos/:id/editar',
 *     component: EditMedicineComponent,
 *     canDeactivate: [pendingChangesGuard]  // ← Activa el guard
 *   }
 * ];
 * 
 * IMPLEMENTACIÓN EN COMPONENTE:
 * @example
 * export class EditMedicineComponent implements PendingChangesComponent {
 *   // Opción 1: Usar FormGroup estándar
 *   form = new FormGroup({
 *     nombre: new FormControl(''),
 *     dosis: new FormControl('')
 *   });
 * 
 *   // Opción 2: Implementar lógica personalizada
 *   hasPendingChanges(): boolean {
 *     return this.form.dirty || this.hasUnsavedImages;
 *   }
 * }
 * 
 * CASOS DE USO:
 * ✓ Formularios de edición largos
 * ✓ Crear nuevos registros
 * ✓ Formularios con validaciones complejas
 * ✓ Guarda automática de borradores
 * 
 * NOTAS IMPORTANTES:
 * - El guard solo previene navegación, no guarda datos automáticamente
 * - Usa window.confirm() para compatibilidad (simple pero efectivo)
 * - El usuario puede cerrar la pestaña sin confirmación (comportamiento del navegador)
 * - Para mejor UX, considera usar un Modal/Dialog en lugar de window.confirm()
 */
export const pendingChangesGuard: CanDeactivateFn<PendingChangesComponent> = (
  component: PendingChangesComponent,
  currentRoute: ActivatedRouteSnapshot,
  currentState: RouterStateSnapshot,
  nextState: RouterStateSnapshot
) => {
  /**
   * PASO 1: Verificar si el componente implementa validación personalizada
   * Si hasPendingChanges() retorna true, pedir confirmación
   */
  if (component.hasPendingChanges && component.hasPendingChanges()) {
    return askUserToConfirm();
  }

  /**
   * PASO 2: Verificar si el componente tiene un formulario
   * Si no hay formulario, no hay cambios que proteger
   */
  if (!component.form) {
    return true;
  }

  /**
   * PASO 3: Verificar si el formulario tiene cambios sin guardar
   * form.dirty === false significa que ningún campo ha sido modificado
   * En este caso, es seguro permitir la navegación
   */
  if (!component.form.dirty) {
    return true;
  }

  /**
   * PASO 4: Formulario tiene cambios pendientes
   * Mostrar diálogo de confirmación y permitir navegación solo si confirma
   */
  return askUserToConfirm();
};

/**
 * FUNCIÓN AUXILIAR: askUserToConfirm
 * 
 * Muestra un diálogo de advertencia al usuario mediante window.confirm()
 * 
 * PARÁMETRO: ninguno
 * 
 * RETORNA:
 * - true: Usuario hace clic en "Aceptar" (permite navegación)
 * - false: Usuario hace clic en "Cancelar" (bloquea navegación)
 * 
 * ALTERNATIVAS MEJORES (para UI/UX):
 * - Usar MatDialog de Angular Material
 * - Usar ng-dialog para diálogos personalizados
 * - Implementar confirmación con Toast notification
 */
function askUserToConfirm(): boolean {
  const message = ' Hay cambios sin guardar.\n\n¿Estás seguro de que quieres salir?';
  return window.confirm(message);
}
