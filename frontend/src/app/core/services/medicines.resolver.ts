import { inject } from '@angular/core';
import { ResolveFn, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { catchError, of, map, timeout } from 'rxjs';

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
 * Resolver para medicamentos
 * Precarga la lista de medicamentos antes de activar la ruta
 * En una aplicación real, esto llamaría a un servicio HTTP
 */
export const medicinesResolver: ResolveFn<Medicine[]> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  // Aquí iría una llamada HTTP real a un API
  // Por ahora retornamos los medicamentos desde un servicio local
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
  // En una app real, esto sería: return inject(MedicineService).getMedicines()
  return new Promise<Medicine[]>((resolve, reject) => {
    setTimeout(() => {
      // Simular error aleatorio 10% de las veces (descomentar para probar)
      // if (Math.random() < 0.1) {
      //   reject(new Error('Error simulado al cargar medicamentos'));
      // }
      resolve(medicines);
    }, 300); // Pequeña simulación de latencia de red
  }).catch((error) => {
    console.error('Error cargando medicamentos:', error);
    // Redirigir a inicio si hay error
    const router = inject(Router);
    router.navigate(['/'], {
      state: { error: 'No se pudieron cargar los medicamentos' }
    });
    return [];
  });
};

/**
 * Resolver para medicamento individual por ID
 * Precarga un medicamento específico antes de activar la ruta de edición
 * Si no existe, redirige a /medicamentos
 */
export const medicineDetailResolver: ResolveFn<Medicine | null> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const router = inject(Router);
  const id = route.paramMap.get('id');

  if (!id) {
    console.warn('No ID proporcionado para medicamento');
    router.navigate(['/medicamentos'], {
      state: { error: 'ID de medicamento inválido' }
    });
    return null;
  }

  // Simulamos la búsqueda del medicamento
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
    console.warn(`Medicamento con ID ${id} no encontrado`);
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
    console.error('Error cargando detalle de medicamento:', error);
    router.navigate(['/medicamentos'], {
      state: { error: 'Error al cargar medicamento' }
    });
    return null;
  });
};
