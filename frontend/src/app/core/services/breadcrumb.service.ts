import { Injectable } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { BehaviorSubject, filter } from 'rxjs';

/**
 * Interface para las migas de pan (breadcrumbs)
 */
export interface Breadcrumb {
  label: string;
  url: string;
}

/**
 * Servicio para generar breadcrumbs dinámicos basados en la ruta actual
 * Se suscribe a NavigationEnd eventos y construye el árbol de rutas activas
 */
@Injectable({ providedIn: 'root' })
export class BreadcrumbService {
  private readonly _breadcrumbs$ = new BehaviorSubject<Breadcrumb[]>([]);
  readonly breadcrumbs$ = this._breadcrumbs$.asObservable();

  constructor(private router: Router, private route: ActivatedRoute) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        const breadcrumbs: Breadcrumb[] = [];
        
        // Siempre añade el inicio como primer breadcrumb
        breadcrumbs.push({ label: 'Inicio', url: '/' });
        
        // Construye el resto de breadcrumbs desde la ruta raíz
        this.buildCrumbs(this.route.root, '', breadcrumbs);
        
        this._breadcrumbs$.next(breadcrumbs);
      });
  }

  /**
   * Construye recursivamente el árbol de breadcrumbs desde las rutas activas
   * @param route Ruta actual
   * @param url URL acumulada
   * @param crumbs Array de breadcrumbs a llenar
   */
  private buildCrumbs(
    route: ActivatedRoute,
    url: string,
    crumbs: Breadcrumb[]
  ): void {
    const children = route.children;

    if (!children || !children.length) {
      return;
    }

    for (const child of children) {
      // Construir la URL del segmento de ruta actual
      const routeSegments = child.snapshot.url.map(segment => segment.path);
      
      if (routeSegments.length > 0) {
        const routeURL = routeSegments.join('/');
        url += `/${routeURL}`;

        // Obtener la etiqueta del breadcrumb de los datos de la ruta
        const label = child.snapshot.data['breadcrumb'] as string | undefined;

        // Si la ruta tiene un breadcrumb configurado, añadirlo al array
        if (label) {
          crumbs.push({ label, url });
        }
      }

      // Recursivamente procesar las rutas hijas
      this.buildCrumbs(child, url, crumbs);
    }
  }
}
