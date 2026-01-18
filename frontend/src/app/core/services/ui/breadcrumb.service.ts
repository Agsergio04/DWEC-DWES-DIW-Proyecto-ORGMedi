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
 * Soporta parámetros dinámicos en las labels (ej: "Editar {{medicina}}")
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
        let label = child.snapshot.data['breadcrumb'] as string | undefined;

        // Si la label contiene parámetros dinámicos, reemplazarlos
        if (label) {
          label = this.interpolateLabel(label, child.snapshot.params, child.snapshot.data);
          crumbs.push({ label, url });
        }
      }

      // Recursivamente procesar las rutas hijas
      this.buildCrumbs(child, url, crumbs);
    }
  }

  /**
   * Interpola placeholders en la label con valores de parámetros o data
   * Ej: "Editar {{medicineName}}" → "Editar Amoxicilina"
   * @param label La label con posibles placeholders
   * @param params Los parámetros de ruta
   * @param data Los datos de la ruta
   * @returns La label con los placeholders reemplazados
   */
  private interpolateLabel(label: string, params: any, data: any): string {
    let result = label;

    // Reemplazar {{param}} con el valor del parámetro
    if (params) {
      Object.keys(params).forEach(key => {
        const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
        result = result.replace(regex, params[key]);
      });
    }

    // Reemplazar {{data.field}} con el valor del data
    if (data) {
      Object.keys(data).forEach(key => {
        const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
        result = result.replace(regex, data[key]);
      });
    }

    return result;
  }
}
