import { inject } from '@angular/core';
import { ResolveFn, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

/**
 * Interface para el perfil de usuario
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
 * Resolver para el perfil del usuario
 * Precarga los datos del perfil antes de activar la ruta de perfil
 * En caso de error, redirige a /medicamentos con mensaje de error
 * En una aplicación real, esto llamaría a un servicio HTTP con autenticación
 */
export const profileResolver: ResolveFn<UserProfile | null> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const router = inject(Router);
  // En una aplicación real, aquí inyectaríamos un UserService o AuthService
  // const authService = inject(AuthService);
  // const userService = inject(UserService);
  
  // Verificar que el usuario esté autenticado
  // const currentUser = authService.currentUser$.pipe(
  //   take(1),
  //   switchMap(user => {
  //     if (!user) {
  //       router.navigate(['/iniciar-sesion']);
  //       return of(null);
  //     }
  //     return userService.getProfile(user.id).pipe(
  //       timeout(5000), // timeout de 5s
  //       catchError(error => {
  //         console.error('Error cargando perfil:', error);
  //         router.navigate(['/medicamentos'], {
  //           state: { error: 'No se pudo cargar el perfil' }
  //         });
  //         return of(null);
  //       })
  //     );
  //   })
  // );
  // return currentUser;

  // Por ahora, retornamos datos de ejemplo
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

  // Simulamos una carga asíncrona con error controlado
  return new Promise<UserProfile | null>((resolve, reject) => {
    setTimeout(() => {
      // Simular error aleatorio 10% de las veces (descomentar para probar)
      // if (Math.random() < 0.1) {
      //   reject(new Error('Error simulado al cargar perfil'));
      // }
      resolve(mockProfile);
    }, 300); // Pequeña simulación de latencia de red
  }).catch((error) => {
    console.error('Error cargando perfil:', error);
    router.navigate(['/medicamentos'], {
      state: { error: 'No se pudo cargar el perfil del usuario' }
    });
    return null;
  });
};
