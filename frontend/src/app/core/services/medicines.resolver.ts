import { inject } from '@angular/core';
import { ResolveFn, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { catchError, of, timeout } from 'rxjs';

// Interface para medicamentos (movida desde medicine-card)
export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  description?: string;
  startDate: string;
  endDate: string;
  quantity: number;
  remainingDays: number;
  photo?: string;
}

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
export const medicinesResolver: ResolveFn<Medicine[]> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  // En producción, inyectar MedicineService real:
  // const service = inject(MedicineService);
  // return service.getMedicines().pipe(
  //   timeout(5000),
  //   catchError(err => { ... })
  // );

  // Datos simulados (para desarrollo)
  const medicines: Medicine[] = [
    {
      id: '1',
      name: 'Amoxicilina',
      dosage: '500mg',
      frequency: '3 veces al día',
      description: 'Tomar con agua',
      startDate: '2026-01-01',
      endDate: '2026-02-01',
      quantity: 21,
      remainingDays: 22
    },
    {
      id: '2',
      name: 'Ibuprofeno',
      dosage: '400mg',
      frequency: 'Cada 6-8 horas',
      description: 'Tomar con alimentos',
      startDate: '2025-12-15',
      endDate: '2026-01-15',
      quantity: 30,
      remainingDays: 6
    },
    {
      id: '3',
      name: 'Paracetamol',
      dosage: '500mg',
      frequency: 'Cada 4-6 horas',
      startDate: '2025-11-01',
      endDate: '2025-12-31',
      quantity: 0,
      remainingDays: 0
    },
    {
      id: '4',
      name: 'Omeprazol',
      dosage: '20mg',
      frequency: 'Una vez al día',
      description: 'Tomar por la mañana',
      startDate: '2026-01-01',
      endDate: '2026-04-01',
      quantity: 90,
      remainingDays: 91
    },
    {
      id: '5',
      name: 'Loratadina',
      dosage: '10mg',
      frequency: 'Una vez al día',
      startDate: '2026-01-08',
      endDate: '2026-02-08',
      quantity: 31,
      remainingDays: 31
    }
  ];

  // Simulamos una carga asíncrona que podría fallar
  return new Promise<Medicine[]>((resolve, reject) => {
    setTimeout(() => {
      // Simular error aleatorio 10% de las veces (descomentar para probar)
      // if (Math.random() < 0.1) {
      //   reject(new Error('Error simulado al cargar medicamentos'));
      // }
      resolve(medicines);
    }, 300); // Pequeña simulación de latencia de red
  }).catch((error) => {
    console.error('[Resolver] Error cargando medicamentos:', error);
    // Redirigir a inicio si hay error
    const router = inject(Router);
    router.navigate(['/'], {
      state: { error: 'No se pudieron cargar los medicamentos. Intenta nuevamente.' }
    });
    return [];
  });
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
export const medicineDetailResolver: ResolveFn<Medicine | null> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const router = inject(Router);
  const id = route.paramMap.get('id');

  // ============ VALIDACIÓN DE ID ============
  if (!id) {
    console.warn('[medicineDetailResolver] No ID proporcionado para medicamento');
    router.navigate(['/medicamentos'], {
      state: { error: 'ID de medicamento inválido' }
    });
    return null;
  }

  // ============ DATOS SIMULADOS ============
  // En producción: const service = inject(MedicineService);
  // return service.getById(id).pipe(
  //   timeout(5000),
  //   catchError(err => { ... })
  // );

  const medicines: Medicine[] = [
    {
      id: '1',
      name: 'Amoxicilina',
      dosage: '500mg',
      frequency: '3 veces al día',
      description: 'Tomar con agua',
      startDate: '2026-01-01',
      endDate: '2026-02-01',
      quantity: 21,
      remainingDays: 22
    },
    {
      id: '2',
      name: 'Ibuprofeno',
      dosage: '400mg',
      frequency: 'Cada 6-8 horas',
      description: 'Tomar con alimentos',
      startDate: '2025-12-15',
      endDate: '2026-01-15',
      quantity: 30,
      remainingDays: 6
    },
    {
      id: '3',
      name: 'Paracetamol',
      dosage: '500mg',
      frequency: 'Cada 4-6 horas',
      startDate: '2025-11-01',
      endDate: '2025-12-31',
      quantity: 0,
      remainingDays: 0
    },
    {
      id: '4',
      name: 'Omeprazol',
      dosage: '20mg',
      frequency: 'Una vez al día',
      description: 'Tomar por la mañana',
      startDate: '2026-01-01',
      endDate: '2026-04-01',
      quantity: 90,
      remainingDays: 91
    },
    {
      id: '5',
      name: 'Loratadina',
      dosage: '10mg',
      frequency: 'Una vez al día',
      startDate: '2026-01-08',
      endDate: '2026-02-08',
      quantity: 31,
      remainingDays: 31
    }
  ];

  const medicine = medicines.find((m) => m.id === id);

  if (!medicine) {
    console.warn(`[Resolver] Medicamento con ID ${id} no encontrado`);
    router.navigate(['/medicamentos'], {
      state: { error: `Medicamento con ID ${id} no existe` }
    });
    return null;
  }

  // Simulamos latencia de carga
  return new Promise<Medicine | null>((resolve) => {
    setTimeout(() => {
      resolve(medicine);
    }, 300);
  }).catch((error) => {
    console.error('[Resolver] Error cargando detalle de medicamento:', error);
    router.navigate(['/medicamentos'], {
      state: { error: 'Error al cargar medicamento. Intenta nuevamente.' }
    });
    return null;
  });
};
