import { inject } from '@angular/core';
import { ResolveFn, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

/**
 * INTERFAZ: UserProfile
 * 
 * Define la estructura del perfil de usuario.
 * Contiene datos personales, médicos y de contacto del doctor.
 */
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  medicalConditions?: string[];
  allergies?: string[];
  doctorName?: string;
  doctorContact?: string;
}

/**
 * RESOLVER: profileResolver
 * 
 * ¿QUÉ HACE?
 * Carga los datos del PERFIL DEL USUARIO antes de mostrar la página de perfil.
 * 
 * FLUJO:
 * Usuario navega a /perfil
 *        ↓
 * profileResolver carga datos (máx 5s)
 *        ↓
 * Si éxito → Muestra página con datos de perfil
 * Si error → Redirige a /medicamentos con error
 * 
 * DATOS QUE CARGA:
 * - Nombre, email, teléfono
 * - Fecha de nacimiento
 * - Condiciones médicas (hipertensión, diabetes, etc)
 * - Alergias (penicilina, aspirina, etc)
 * - Datos del doctor (nombre, contacto)
 * 
 * NOTA:
 * Actualmente usa datos simulados (mockProfile).
 * En producción, llamaría a UserService.getProfile(userId)
 * 
 * SEGURIDAD EN PRODUCCIÓN:
 * - Verificar que usuario esté autenticado
 * - Si no → redirigir a /iniciar-sesion
 * - Si sí → cargar perfil del usuario autenticado
 */
export const profileResolver: ResolveFn<UserProfile | null> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const router = inject(Router);
  
  /**
   * EN PRODUCCIÓN, AQUÍ IRÍA:
   * 
   * const authService = inject(AuthService);
   * const userService = inject(UserService);
   * 
   * return authService.currentUser$.pipe(
   *   take(1),
   *   switchMap(user => {
   *     if (!user) {
   *       router.navigate(['/iniciar-sesion']);
   *       return of(null);
   *     }
   *     return userService.getProfile(user.id).pipe(
   *       timeout(5000),
   *       catchError(error => {
   *         console.error('Error cargando perfil:', error);
   *         router.navigate(['/medicamentos'], {
   *           state: { error: 'No se pudo cargar el perfil' }
   *         });
   *         return of(null);
   *       })
   *     );
   *   })
   * );
   */

  /**
   * DATOS SIMULADOS
   * Reemplazar con datos reales del API cuando esté disponible
   */
  const mockProfile: UserProfile = {
    id: '1',
    name: 'Juan Pérez García',
    email: 'juan.perez@example.com',
    phone: '+34 612 345 678',
    dateOfBirth: '1990-05-15',
    medicalConditions: ['Hipertensión', 'Diabetes tipo 2'],
    allergies: ['Penicilina', 'Aspirin'],
    doctorName: 'Dra. María González López',
    doctorContact: '+34 91 123 4567'
  };

  /**
   * CARGA ASÍNCRONA SIMULADA
   * En producción, esto sería una llamada HTTP real
   */
  return new Promise<UserProfile | null>((resolve, reject) => {
    setTimeout(() => {
      /**
       * SIMULACIÓN DE ERROR (30% de probabilidad)
       * Descomenta para probar manejo de errores:
       */
      // if (Math.random() < 0.1) {
      //   reject(new Error('Error simulado al cargar perfil'));
      // }
      
      // Resuelve con los datos del mock
      resolve(mockProfile);
    }, 300); // Simula latencia de red (300ms)
  }).catch((error) => {
    /**
     * MANEJO DE ERRORES
     * Si falla la carga, redirige a medicamentos con mensaje de error
     */
    console.error('Error cargando perfil:', error);
    router.navigate(['/medicamentos'], {
      state: { error: 'No se pudo cargar el perfil del usuario' }
    });
    return null;
  });
};
