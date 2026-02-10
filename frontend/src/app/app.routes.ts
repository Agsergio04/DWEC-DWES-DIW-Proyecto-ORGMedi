import { Routes } from '@angular/router';
import { authGuard } from './core/services/auth';
import { pendingChangesGuard } from './core/services/guards';
import { medicinesResolver, medicineDetailResolver } from './core/services/resolvers';
import { profileResolver } from './core/services/resolvers';
import { homeResolver } from './core/services/resolvers';
import { NotFoundPage } from './pages/not-found/not-found';

/**
 * CONFIGURACIÓN DE RUTAS - ORGMedi
 * ========================================
 * 
 * La SPA utiliza el sistema de routing modular de Angular con lazy loading.
 * Las rutas se organizan en grupos lógicos para mejor mantenibilidad.
 * 
 * ESTRUCTURA:
 * - AUTH_ROUTES: Autenticación (login, registro)
 * - MEDICINES_ROUTES: Gestión de medicamentos
 * - PROFILE_ROUTES: Perfil de usuario
 * - UTILITY_ROUTES: Utilidades (calendario, guía de estilos)
 * - HOME_ROUTE: Página de inicio (lazy loading)
 * 
 * PATRONES IMPLEMENTADOS:
 * 1. Lazy loading en todas las rutas → Optimización de carga inicial
 * 2. Rutas base simples → /medicamentos
 * 3. Rutas con parámetros → /medicamentos/:id/editar
 * 4. Guards de seguridad → authGuard, pendingChangesGuard
 * 5. Resolvers → Precargar datos antes de activar ruta
 * 6. Breadcrumbs → Navegación contextualizada
 * 
 * GUARDS IMPLEMENTADOS:
 * ==============================
 * - authGuard: Protege rutas autenticadas (login requerido)
 * - pendingChangesGuard: Previene salir con cambios sin guardar
 * - publicGuard: Redirige si ya estás autenticado (login, registro)
 * - adminGuard: Validará permisos de admin (cuando se implemente roles)
 * 
 * Ejemplo de aplicación:
 * { path: 'medicamentos', canActivate: [authGuard], ... }
 * { path: 'crear', canDeactivate: [pendingChangesGuard], ... }
 * { path: 'login', canActivate: [publicGuard], ... }
 * 
 * NAVEGACIÓN PROGRAMÁTICA:
 * ==================================
 * Usar NavigationService para navegar desde componentes:
 * 
 * - Navegación simple: this.nav.goToMedicines()
 * - Con parámetros: this.nav.goToEditMedicine(id)
 * - Query params: this.nav.searchMedicines({ busqueda, categoria })
 * - Fragmentos: this.nav.goToSection([path], 'anchor')
 * - State: this.nav.navigateWithState([path], { data })
 * 
 * Ver: src/app/core/services/navigation.service.ts
 */

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

// ============ RUTAS PRINCIPALES - HOME (LAZY) ============
// Se cargan bajo demanda para optimizar bundle inicial
export const MAIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home').then(m => m.HomePage),
    data: { 
      chunkName: 'main-home',
      breadcrumb: 'Inicio',
      description: 'Página de inicio de ORGMedi'
    },
    resolve: {
      homeData: homeResolver
    }
  },
];

// ============ RUTAS DE MEDICAMENTOS (LAZY) ============
// Cada subruta genera su propio chunk para optimizar carga
// Sigue el patrón: /medicamentos (listado) → /medicamentos/crear-medicamento (crear) → /medicamento/:id/editar-medicamento (editar)
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
    path: 'medicamentos/crear-medicamento',
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
    path: 'medicamento/:id/editar-medicamento',
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
    },
    canActivate: [authGuard],
    resolve: {
      medicines: medicinesResolver
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
  {
    path: 'animaciones',
    loadComponent: () =>
      import('./pages/animations-demo/animations-demo').then(m => m.AnimationsDemoComponent),
    data: { 
      chunkName: 'utils-animations',
      breadcrumb: 'Animaciones',
      description: 'Demostración de animaciones CSS'
    }
  }
];

// ============ RUTAS INFORMATIVAS Y LEGALES (LAZY) ============
// Páginas estáticas de información y términos legales
export const LEGAL_ROUTES: Routes = [
  {
    path: 'cookies',
    loadComponent: () =>
      import('./pages/cookies/cookies').then(m => m.CookiesComponent),
    data: { 
      chunkName: 'legal-cookies',
      breadcrumb: 'Política de Cookies',
      description: 'Información sobre cookies y tecnologías similares'
    }
  },
  {
    path: 'contact',
    loadComponent: () =>
      import('./pages/contact/contact').then(m => m.ContactComponent),
    data: { 
      chunkName: 'legal-contact',
      breadcrumb: 'Contacto',
      description: 'Formulario de contacto y canales de comunicación'
    }
  },
  {
    path: 'privacy-policy',
    loadComponent: () =>
      import('./pages/privacy-policy/privacy-policy').then(m => m.PrivacyPolicyComponent),
    data: { 
      chunkName: 'legal-privacy',
      breadcrumb: 'Política de Privacidad',
      description: 'Política de privacidad y protección de datos'
    }
  },
  {
    path: 'terms-of-service',
    loadComponent: () =>
      import('./pages/terms-of-service/terms-of-service').then(m => m.TermsOfServiceComponent),
    data: { 
      chunkName: 'legal-terms',
      breadcrumb: 'Términos de Servicio',
      description: 'Términos y condiciones de uso del servicio'
    }
  },
  {
    path: 'pagina-practica',
    loadComponent: () =>
      import('./pages/pagina-practica/pagina-practica').then(m => m.PaginaPracticaComponent),
    data: {
      chunkName: 'pagina-practica',
      breadcrumb: 'Pagina de la pracitca',
      description: 'Pagina de la practica realizada el 10 de Febrero de 2025'
    }
  }
];

// ============ RUTAS DE PERFIL CON HIJAS ANIDADAS (LAZY) ============
// Sección de usuario con subrutas usando <router-outlet> interno
// Rutas: /perfil → /perfil/editar (si existe), etc.
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
    // Las subrutas se pueden añadir aquí en el futuro con: children: [...]
  },
];

// ============ CONSOLIDACIÓN DE RUTAS ============
// Ordenadas por relevancia: principales > auth > medicamentos > perfil > utilidades > legales > 404
export const routes: Routes = [
  ...MAIN_ROUTES,
  ...AUTH_ROUTES,
  ...MEDICINES_ROUTES,
  ...PROFILE_ROUTES,
  ...UTILITY_ROUTES,
  ...LEGAL_ROUTES,
  
  // ============ RUTA WILDCARD PARA 404 ============
  // IMPORTANTE: Debe ir SIEMPRE al final de todas las rutas
  // Captura cualquier URL no reconocida y muestra página 404 personalizada
  // Patrón: ** (dos asteriscos) coincide con cualquier ruta no definida
  // Ejemplo: /ruta-inexistente → NotFoundPage
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
