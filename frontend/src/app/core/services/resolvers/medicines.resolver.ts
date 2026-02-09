import { inject } from '@angular/core';
import { ResolveFn, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { catchError, of, timeout } from 'rxjs';
import { MedicineService } from '../../../data/medicine.service';
import { MedicineViewModel } from '../../../data/models/medicine.model';

/**
 * RESOLVER: medicinesResolver
 * 
 * ¿QUÉ HACE?
 * Carga la lista COMPLETA de medicamentos ANTES de mostrar la página.
 * 
 * FLUJO:
 * Usuario navega a /medicamentos
 *        ↓
 * medicinesResolver carga lista (máx 5 segundos)
 *        ↓
 * Si éxito → Muestra página con datos
 * Si error → Redirige a home con mensaje de error
 * 
 * DATOS QUE RETORNA:
 * Array de medicamentos: [{ id, nombre, dosis, frecuencia, ... }, ...]
 * 
 * VENTAJAS:
 *  Página siempre tiene datos cuando se muestra
 *  No hay pantalla vacía esperando carga
 *  Manejo de errores centralizado
 * 
 * TIMEOUT:
 * Si tarda más de 5 segundos → cancela y redirige a home
 */
export const medicinesResolver: ResolveFn<MedicineViewModel[]> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const service = inject(MedicineService);
  const router = inject(Router);

  return service.getAll().pipe(
    // Cancela si tarda más de 5 segundos
    timeout(5000),
    // Si hay error
    catchError((err) => {
      console.error('[medicinesResolver] Error cargando medicamentos:', err);
      // Redirige a home con mensaje de error
      router.navigate(['/'], {
        state: { error: 'No se pudieron cargar los medicamentos. Intenta nuevamente.' }
      });
      // Retorna array vacío
      return of([]);
    })
  );
};

/**
 * RESOLVER: medicineDetailResolver
 * 
 * ¿QUÉ HACE?
 * Carga UN MEDICAMENTO ESPECÍFICO por su ID antes de mostrar página de edición.
 * 
 * FLUJO:
 * Usuario navega a /medicamentos/123/editar
 *        ↓
 * Extrae ID 123 de la URL
 *        ↓
 * medicineDetailResolver busca medicamento con ID 123
 *        ↓
 * Si existe → Muestra página de edición con datos
 * Si NO existe → Redirige a /medicamentos con error
 * 
 * VALIDACIONES:
 * 1. Verifica que haya ID en la URL
 * 2. Si no → redirige con error "ID inválido"
 * 3. Si sí → busca medicamento en API
 * 4. Si falla → redirige con error "No encontrado"
 * 
 * Por ejemplo:
 *  /medicamentos/5/editar → ID existe, carga el medicamento
 *  /medicamentos/999/editar → ID no existe, redirige con error
 *  /medicamentos/abc/editar → ID inválido, redirige con error
 */
export const medicineDetailResolver: ResolveFn<MedicineViewModel | null> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const router = inject(Router);
  const service = inject(MedicineService);
  
  // Extrae el ID de la URL (ej: en /medicamentos/5/editar → obtiene "5")
  const id = route.paramMap.get('id');

  /**
   * PASO 1: Validar que exista ID
   */
  if (!id) {
    console.warn('[medicineDetailResolver] No ID proporcionado para medicamento');
    // Redirige a medicamentos con error
    router.navigate(['/medicamentos'], {
      state: { error: 'ID de medicamento inválido' }
    });
    return of(null);
  }

  /**
   * PASO 2: Buscar medicamento por ID
   * Espera máximo 5 segundos
   * Si hay error, redirige
   */
  return service.getById(id).pipe(
    // Timeout de 5 segundos
    timeout(5000),
    // Manejo de errores
    catchError((err) => {
      console.error(`[medicineDetailResolver] Error cargando medicamento ${id}:`, err);
      // Redirige a medicamentos con error
      router.navigate(['/medicamentos'], {
        state: { error: 'Error al cargar medicamento. Intenta nuevamente.' }
      });
      return of(null);
    })
  );
};
