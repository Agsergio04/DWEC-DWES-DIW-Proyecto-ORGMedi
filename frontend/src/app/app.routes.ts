import { Routes } from '@angular/router';
import { authGuard } from './core/services/auth.guard';
import { pendingChangesGuard } from './core/services/pending-changes.guard';
import { medicinesResolver, medicineDetailResolver } from './core/services/medicines.resolver';
import { profileResolver } from './core/services/profile.resolver';

// Rutas principales (carga inmediata)
const MAIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home').then(m => m.HomePage),
    data: { 
      preload: true, // Precarga opcional
      breadcrumb: 'Inicio'
    }
  },
];

// Rutas de autenticación (carga perezosa)
const AUTH_ROUTES: Routes = [
  {
    path: 'iniciar-sesion',
    loadComponent: () =>
      import('./pages/iniciar-sesion/login').then(m => m.LoginPage),
    data: { 
      chunkName: 'iniciar-sesion',
      breadcrumb: 'Iniciar Sesión'
    }
  },
  {
    path: 'registrarse',
    loadComponent: () =>
      import('./pages/registrarse/register').then(m => m.RegisterPage),
    data: { 
      chunkName: 'registrarse',
      breadcrumb: 'Registrarse'
    }
  },
];

// Rutas de medicamentos (carga perezosa)
const MEDICINES_ROUTES: Routes = [
  {
    path: 'medicamentos',
    loadComponent: () =>
      import('./pages/medicines/medicines').then(m => m.MedicinesPage),
    data: { 
      chunkName: 'medicamentos',
      breadcrumb: 'Medicamentos'
    },
    canActivate: [authGuard], // Requiere autenticación
    resolve: {
      medicines: medicinesResolver // Precarga los medicamentos
    }
  },
  {
    path: 'medicamentos/crear',
    loadComponent: () =>
      import('./pages/create-medicine/create-medicine').then(m => m.CreateMedicinePage),
    data: { 
      chunkName: 'crear-medicamento',
      breadcrumb: 'Crear Medicamento'
    },
    canActivate: [authGuard],
    canDeactivate: [pendingChangesGuard] // Protege cambios sin guardar
  },
  {
    path: 'medicamentos/crear-foto',
    loadComponent: () =>
      import('./pages/create-medicine-photo/create-medicine-photo').then(m => m.CreateMedicinePhotoPage),
    data: { 
      chunkName: 'crear-foto-medicamento',
      breadcrumb: 'Crear desde Foto'
    },
    canActivate: [authGuard],
    canDeactivate: [pendingChangesGuard] // Protege cambios sin guardar
  },
  {
    path: 'medicamentos/:id/editar',
    loadComponent: () =>
      import('./pages/edit-medicine/edit-medicine').then(m => m.EditMedicinePage),
    data: { 
      chunkName: 'editar-medicamento',
      breadcrumb: 'Editar Medicamento'
    },
    canActivate: [authGuard],
    canDeactivate: [pendingChangesGuard], // Protege cambios sin guardar
    resolve: {
      medicine: medicineDetailResolver // Precarga el medicamento específico
    }
  },
];

// Rutas de utilidades y desarrollo (carga perezosa)
const UTILITY_ROUTES: Routes = [
  {
    path: 'calendario',
    loadComponent: () =>
      import('./pages/calendar/calendar').then(m => m.CalendarPage),
    data: { 
      chunkName: 'calendario',
      breadcrumb: 'Calendario'
    }
  },
  {
    path: 'guia-estilos',
    loadComponent: () =>
      import('./pages/guia-estilos/style-guide').then(m => m.StyleGuidePage),
    data: { 
      chunkName: 'guia-estilos',
      breadcrumb: 'Guía de Estilos'
    }
  },
  {
    path: 'demostracion',
    loadComponent: () =>
      import('./pages/demostracion/demo').then(m => m.DemoPage),
    data: { 
      chunkName: 'demostracion',
      breadcrumb: 'Demostración'
    }
  },
];

// Rutas de perfil (carga perezosa)
const PROFILE_ROUTES: Routes = [
  {
    path: 'perfil',
    loadComponent: () =>
      import('./pages/profile/profile').then(m => m.ProfilePage),
    data: { 
      chunkName: 'perfil',
      breadcrumb: 'Perfil'
    },
    canActivate: [authGuard], // Requiere autenticación
    canDeactivate: [pendingChangesGuard], // Protege cambios sin guardar
    resolve: {
      profile: profileResolver // Precarga el perfil del usuario
    }
  },
];

// Rutas consolidadas con estrategia de carga perezosa
export const routes: Routes = [
  ...MAIN_ROUTES,
  ...AUTH_ROUTES,
  ...MEDICINES_ROUTES,
  ...UTILITY_ROUTES,
  ...PROFILE_ROUTES,
  // Ruta wildcard (debe ir al final)
  { path: '**', redirectTo: '' }
];
