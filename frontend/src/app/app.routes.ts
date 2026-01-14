import { Routes } from '@angular/router';
import { authGuard } from './core/services/auth.guard';
import { pendingChangesGuard } from './core/services/pending-changes.guard';
import { medicinesResolver, medicineDetailResolver } from './core/services/medicines.resolver';
import { profileResolver } from './core/services/profile.resolver';
import { homeResolver } from './core/services/home.resolver';
import { NotFoundPage } from './pages/not-found/not-found';

// ============ RUTAS PRINCIPALES ============
// Cargadas inmediatamente al iniciar la app
export const MAIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home').then(m => m.HomePage),
    data: { 
      breadcrumb: 'Inicio',
      description: 'Página de inicio de ORGMedi'
    },
    resolve: {
      homeData: homeResolver
    }
  },
];

// ============ RUTAS DE AUTENTICACIÓN (LAZY) ============
// Se cargan bajo demanda cuando el usuario navega a ellas
export const AUTH_ROUTES: Routes = [
  {
    path: 'iniciar-sesion',
    loadComponent: () =>
      import('./pages/iniciar-sesion/login').then(m => m.LoginPage),
    data: { 
      chunkName: 'auth-login',
      breadcrumb: 'Iniciar Sesión',
      description: 'Página de login'
    }
  },
  {
    path: 'registrarse',
    loadComponent: () =>
      import('./pages/registrarse/register').then(m => m.RegisterPage),
    data: { 
      chunkName: 'auth-register',
      breadcrumb: 'Registrarse',
      description: 'Página de registro'
    }
  },
];

// ============ RUTAS DE MEDICAMENTOS (LAZY) ============
// Cada subruta genera su propio chunk para optimizar carga
export const MEDICINES_ROUTES: Routes = [
  {
    path: 'medicamentos',
    loadComponent: () =>
      import('./pages/medicines/medicines').then(m => m.MedicinesPage),
    data: { 
      chunkName: 'medicines-list',
      breadcrumb: 'Medicamentos',
      description: 'Listado de medicamentos'
    },
    canActivate: [authGuard],
    resolve: {
      medicines: medicinesResolver
    }
  },
  {
    path: 'medicamentos/crear',
    loadComponent: () =>
      import('./pages/create-medicine/create-medicine').then(m => m.CreateMedicinePage),
    data: { 
      chunkName: 'medicines-create',
      breadcrumb: 'Crear Medicamento',
      description: 'Crear nuevo medicamento'
    },
    canActivate: [authGuard],
    canDeactivate: [pendingChangesGuard]
  },
  {
    path: 'medicamentos/crear-foto',
    loadComponent: () =>
      import('./pages/create-medicine-photo/create-medicine-photo').then(m => m.CreateMedicinePhotoPage),
    data: { 
      chunkName: 'medicines-create-photo',
      breadcrumb: 'Crear desde Foto',
      description: 'Crear medicamento desde fotografía'
    },
    canActivate: [authGuard],
    canDeactivate: [pendingChangesGuard]
  },
  {
    path: 'medicamentos/:id/editar',
    loadComponent: () =>
      import('./pages/edit-medicine/edit-medicine').then(m => m.EditMedicinePage),
    data: { 
      chunkName: 'medicines-edit',
      breadcrumb: 'Editar Medicamento',
      description: 'Editar medicamento existente'
    },
    canActivate: [authGuard],
    canDeactivate: [pendingChangesGuard],
    resolve: {
      medicine: medicineDetailResolver
    }
  },
];

// ============ RUTAS DE UTILIDADES Y DESARROLLO (LAZY) ============
// Componentes de desarrollo y utilidades bajo demanda
export const UTILITY_ROUTES: Routes = [
  {
    path: 'calendario',
    loadComponent: () =>
      import('./pages/calendar/calendar').then(m => m.CalendarPage),
    data: { 
      chunkName: 'utils-calendar',
      breadcrumb: 'Calendario',
      description: 'Calendario de medicamentos'
    }
  },
  {
    path: 'guia-estilos',
    loadComponent: () =>
      import('./pages/guia-estilos/style-guide').then(m => m.StyleGuidePage),
    data: { 
      chunkName: 'utils-styleguide',
      breadcrumb: 'Guía de Estilos',
      description: 'Guía de estilos de la aplicación'
    }
  },
];

// ============ RUTAS DE PERFIL (LAZY) ============
// Perfil de usuario bajo demanda
export const PROFILE_ROUTES: Routes = [
  {
    path: 'perfil',
    loadComponent: () =>
      import('./pages/profile/profile').then(m => m.ProfilePage),
    data: { 
      chunkName: 'user-profile',
      breadcrumb: 'Perfil',
      description: 'Perfil del usuario'
    },
    canActivate: [authGuard],
    canDeactivate: [pendingChangesGuard],
    resolve: {
      profile: profileResolver
    }
  },
];

// ============ CONSOLIDACIÓN DE RUTAS ============
// Ordenadas por relevancia: principales > auth > medicamentos > perfil > utilidades > 404
export const routes: Routes = [
  ...MAIN_ROUTES,
  ...AUTH_ROUTES,
  ...MEDICINES_ROUTES,
  ...PROFILE_ROUTES,
  ...UTILITY_ROUTES,
  // Ruta wildcard (debe ir siempre al final)
  { 
    path: '**', 
    loadComponent: () =>
      import('./pages/not-found/not-found').then(m => m.NotFoundPage),
    data: { 
      chunkName: 'error-404',
      breadcrumb: 'No Encontrado'
    }
  }
];
