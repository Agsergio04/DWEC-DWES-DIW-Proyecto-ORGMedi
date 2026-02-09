/**
 * IMPORTACIONES
 * Componentes: Layout (Header, Footer, Breadcrumb)
 * Servicios: Router para navegación, ThemeService para dark/light mode
 * Angular: signal (reactividad), RouterOutlet para renderizar componentes de ruta
 */
import { Component, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Header } from './components/layout/header/header';
import { Footer } from './components/layout/footer/footer';
import { ToastComponent } from './shared/toast.component';
import { BreadcrumbComponent } from './shared/breadcrumb.component';
import { ThemeService } from './core/services/ui';

/**
 * COMPONENTE RAÍZ DE LA APLICACIÓN
 * =================================
 * @selector app-root - Element usado en index.html
 * @standalone - Componente sin módulo (recomendado en Angular 14+)
 * @imports - Componentes importados directamente en este componente
 * 
 * Estructura:
 * - <app-header></app-header> - Barra superior (solo si no es ruta de auth)
 * - <router-outlet></router-outlet> - Renderiza el componente de la ruta actual
 * - <app-breadcrumb></app-breadcrumb> - Navegación de breadcrumbs (solo si no es ruta de auth)
 * - <app-footer></app-footer> - Pie de página
 * 
 * El layout se OCULTA en rutas de autenticación (login, registro) para mejor UX
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,      // Para renderizar componentes de ruta
    Header,            // Barra superior
    Footer,            // Pie de página
    BreadcrumbComponent // Navegación breadcrumb
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  /** Título de la aplicación - reactivo con signal */
  protected readonly title = signal('ORGMedi');

  /**
   * Constructor con inyección de dependencias
   * @param router - Servicio de enrutado Angular
   * @param themeService - Servicio para cambiar entre tema oscuro y claro
   */
  constructor(private router: Router, private themeService: ThemeService) {}

  /**
   * Determina si la URL actual es una ruta de autenticación
   * Se usa para ocultar header/footer/breadcrumb en login y registro
   * @returns true si está en /iniciar-sesion o /registrarse
   */
  isAuthRoute(): boolean {
    const url = this.router.url || '';
    return url.startsWith('/iniciar-sesion') || url.startsWith('/registrarse');
  }
}
