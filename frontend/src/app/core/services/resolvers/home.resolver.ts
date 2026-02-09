import { inject } from '@angular/core';
import { ResolveFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

/**
 * INTERFAZ: HomeData
 * 
 * Define la estructura de datos que necesita la página inicial.
 * Contiene:
 * - stats: Estadísticas de medicamentos (totales, activos, próximos a expirar, dosis pendientes)
 * - welcomeMessage: Mensaje de bienvenida para el usuario
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
 * RESOLVER: homeResolver
 * 
 * ¿QUÉ HACE?
 * Carga datos ANTES de navegar a la página de inicio.
 * Asegura que los datos estén listos cuando el usuario vea la página.
 * 
 * ¿POR QUÉ ES ÚTIL?
 * Sin resolver: Usuario navega → página carga → luego se cargan datos → parpadeo/retraso
 * Con resolver: Datos cargan primero → usuario ve página completa al llegar
 * 
 * FLUJO DE EJECUCIÓN:
 * 1. Usuario intenta navegar a /home
 * 2. Angular ejecuta homeResolver (antes de mostrar la página)
 * 3. Resolver carga datos (simula espera de 300ms)
 * 4. Si funciona → datos listos, se muestra página
 * 5. Si hay error → datos por defecto (evita que la página falle)
 * 
 * DATOS QUE CARGA:
 * - totalMedicines: Total de medicamentos registrados
 * - activeMedicines: Medicamentos activos/vigentes
 * - expiringMedicines: Próximos a vencer
 * - upcomingDoses: Tomas pendientes hoy
 * 
 * NOTA: Actualmente usa datos simulados (mockHomeData).
 * En producción, llamaría a un API HTTP real.
 */
export const homeResolver: ResolveFn<HomeData | null> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
  ) => {
  /**
   * DATOS SIMULADOS
   * En producción sería: this.http.get('/api/home').toPromise()
   */
  const mockHomeData: HomeData = {
    stats: {
      totalMedicines: 5,
      activeMedicines: 4,
      expiringMedicines: 1,
      upcomingDoses: 3
    },
    welcomeMessage: '¡Bienvenido a ORGMedi! Gestiona tus medicamentos de forma segura y ordenada.'
  };

  /**
   * CARGA ASÍNCRONA
   * Crea una Promise que resuelve datos después de 300ms
   * Simula latencia de una petición HTTP real
   */
  return new Promise<HomeData | null>((resolve, reject) => {
    setTimeout(() => {
      // Opcional: simular error aleatorio (5% de probabilidad)
      // Descomenta para probar manejo de errores:
      // if (Math.random() < 0.05) {
      //   reject(new Error('Error simulado al cargar datos de inicio'));
      // }
      
      // Resuelve con los datos (éxito)
      resolve(mockHomeData);
    }, 300);
  }).catch((error) => {
    /**
     * MANEJO DE ERRORES
     * Si falla la carga, retorna datos por defecto (todos en 0)
     * Permite que la página se muestre aunque fallen los datos
     */
    console.error('Error cargando datos de inicio:', error);
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
