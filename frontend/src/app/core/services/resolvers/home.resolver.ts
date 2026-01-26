import { inject } from '@angular/core';
import { ResolveFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

/**
 * Interface para datos iniciales de la página de inicio
 * Simula un wrapper con estado loading para manejo de carga asíncrona
 */
export interface HomeData {
  stats: {
    totalMedicines: number;
    activeMedicines: number;
    expiringMedicines: number;
    upcomingDoses: number;
  };
  welcomeMessage: string;
}

/**
 * Resolver para precarga de datos iniciales de la página de inicio
 * Simula una carga asíncrona con latencia y posibles errores
 * En producción, esto llamaría a endpoints HTTP reales
 */
export const homeResolver: ResolveFn<HomeData | null> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
  ) => {
  // Datos simulados que vendrían de un API en producción
  const mockHomeData: HomeData = {
    stats: {
      totalMedicines: 5,
      activeMedicines: 4,
      expiringMedicines: 1,
      upcomingDoses: 3
    },
    welcomeMessage: '¡Bienvenido a ORGMedi! Gestiona tus medicamentos de forma segura y ordenada.'
  };

  // Simulamos una carga asíncrona de 300ms (como si consultara un API)
  return new Promise<HomeData | null>((resolve, reject) => {
    setTimeout(() => {
      // Simular error aleatorio 5% de las veces (descomentar para probar)
      // if (Math.random() < 0.05) {
      //   reject(new Error('Error simulado al cargar datos de inicio'));
      // }
      resolve(mockHomeData);
    }, 300);
  }).catch((error) => {
    console.error('Error cargando datos de inicio:', error);
    // En caso de error, aún así retornamos datos por defecto para que
    // la página pueda mostrar algo en lugar de fallar completamente
    return {
      stats: {
        totalMedicines: 0,
        activeMedicines: 0,
        expiringMedicines: 0,
        upcomingDoses: 0
      },
      welcomeMessage: 'Error al cargar datos. Por favor recarga la página.'
    };
  });
};
