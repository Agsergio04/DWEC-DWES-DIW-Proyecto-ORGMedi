import { inject } from '@angular/core';
import { ResolveFn, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { catchError, of, timeout } from 'rxjs';
import { MedicineService } from '../../../data/medicine.service';
import { MedicineViewModel } from '../../../data/models/medicine.model';

/**
 * RESOLVER: medicinesResolver
 * ===========================
 * 
 * Tarea 5: Resolvers - Precargar datos antes de activar la ruta
 * 
 * Flujo:
 * 1. Usuario navega a /medicamentos
 * 2. Angular ejecuta medicinesResolver ANTES de renderizar MedicinesPage
 * 3. El resolver carga la lista de medicamentos
 * 4. Solo cuando completa, se activa la ruta y se renderiza el componente
 * 5. MedicinesPage recibe datos en route.data (nunca null)
 * 
 * Ventajas:
 * ✅ El componente SIEMPRE tiene datos (si la ruta se activó)
 * ✅ Loading unificado: spinner global, no en cada componente
 * ✅ Manejo de errores: redirige automáticamente si falla
 * ✅ UX mejorada: no hay saltos visuales ni parpadeos
 * 
 * Desventajas:
 * ⚠️ Si el resolver es lento, retarda la navegación
 * ⚠️ Si falla, se redirige (no se ve el componente)
 * 
 * @see docs/RESOLVERS.md para documentación completa
 * @see app.routes.ts para uso en rutas
 * @see medicines.ts para lectura de datos en componente
 */
export const medicinesResolver: ResolveFn<MedicineViewModel[]> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const service = inject(MedicineService);
  const router = inject(Router);

  return service.getAll().pipe(
    timeout(5000),
    catchError((err) => {
      console.error('[medicinesResolver] Error cargando medicamentos:', err);
      router.navigate(['/'], {
        state: { error: 'No se pudieron cargar los medicamentos. Intenta nuevamente.' }
      });
      return of([]);
    })
  );
};

/**
 * RESOLVER: medicineDetailResolver
 * ================================
 * 
 * Tarea 5: Resolvers - Precargar medicamento por ID
 * 
 * Flujo:
 * 1. Usuario navega a /medicamentos/123/editar
 * 2. Angular extrae el ID (123) de los parámetros de ruta
 * 3. El resolver lo busca en el backend
 * 4. Si existe → lo resuelve y renderiza EditMedicineComponent con datos
 * 5. Si NO existe → redirige a /medicamentos con mensaje de error
 * 
 * Ventajas:
 * ✅ El componente no necesita validar si existe el medicamento
 * ✅ Si el ID es inválido, se redirige automáticamente
 * ✅ Carga unificada: no hay carrera entre componente y servicio
 * 
 * Flujo de Error:
 * /medicamentos/999/editar (no existe)
 *   → medicineDetailResolver busca
 *   → NO encuentra
 *   → router.navigate(['/medicamentos'], { state: { error: '...' } })
 *   → MedicinesPage lee el error de navigation.extras.state
 *   → Usuario ve lista con mensaje de error
 * 
 * @see docs/RESOLVERS.md para documentación completa
 * @see app.routes.ts para uso en rutas
 * @see edit-medicine.ts para lectura de datos en componente
 */
export const medicineDetailResolver: ResolveFn<MedicineViewModel | null> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const router = inject(Router);
  const service = inject(MedicineService);
  const id = route.paramMap.get('id');

  // ============ VALIDACIÓN DE ID ============
  if (!id) {
    console.warn('[medicineDetailResolver] No ID proporcionado para medicamento');
    router.navigate(['/medicamentos'], {
      state: { error: 'ID de medicamento inválido' }
    });
    return of(null);
  }

  // ============ USAR SERVICIO REAL ============
  return service.getById(id).pipe(
    timeout(5000),
    catchError((err) => {
      console.error(`[medicineDetailResolver] Error cargando medicamento ${id}:`, err);
      router.navigate(['/medicamentos'], {
        state: { error: 'Error al cargar medicamento. Intenta nuevamente.' }
      });
      return of(null);
    })
  );
};
