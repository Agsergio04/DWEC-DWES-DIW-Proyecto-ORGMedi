import { inject } from '@angular/core';
import { ResolveFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Router } from '@angular/router';

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
  //     return userService.getProfile(user.id);
  //   }),
  //   catchError(error => {
  //     console.error('Error cargando perfil:', error);
  //     router.navigate(['/medicamentos']);
  //     return of(null);
  //   })
  // );

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

  // Simulamos una carga asíncrona
  return new Promise<UserProfile | null>((resolve) => {
    setTimeout(() => {
      resolve(mockProfile);
    }, 300); // Pequeña simulación de latencia de red
  }).catch((error) => {
    console.error('Error cargando perfil:', error);
    router.navigate(['/medicamentos']);
    return null;
  });
};
