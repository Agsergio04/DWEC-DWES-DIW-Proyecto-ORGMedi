import { Injectable } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { BehaviorSubject, filter } from 'rxjs';

/**
 * Interface para las migas de pan (breadcrumbs)
 * @property label - Texto visible del breadcrumb
 * @property url - Ruta a la que navega al hacer clic
 */
export interface Breadcrumb {
  label: string;
  url: string;
}

/**
 * Servicio de Breadcrumbs Dinámicos
 * 
 * Genera automáticamente migas de pan basadas en la ruta actual de la aplicación.
 * 
 * Funcionalidades:
 * - Escucha cambios de navegación y actualiza los breadcrumbs en tiempo real
 * - Construye el árbol de rutas de forma jerárquica
 * - Soporta labels dinámicas con parámetros: "Editar {{medicineName}}"
 * - Siempre comienza con "Inicio" como primer breadcrumb
 * 
 * Uso:
 * - Inyectar el servicio en un componente
 * - Suscribirse a breadcrumbs$ para obtener la lista de breadcrumbs actuales
 * - Configurar data.breadcrumb en las rutas de Angular para las labels
 */
@Injectable({ providedIn: 'root' })
export class BreadcrumbService {
  /**
   * Observable que emite la lista de breadcrumbs cada vez que la ruta cambia
   */
  private readonly _breadcrumbs$ = new BehaviorSubject<Breadcrumb[]>([]);
  readonly breadcrumbs$ = this._breadcrumbs$.asObservable();

  constructor(private router: Router, private route: ActivatedRoute) {
    // Escuchar cambios de navegación
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
   * Construye recursivamente los breadcrumbs recorriendo el árbol de rutas
   * 
   * Qué hace:
   * 1. Recorre cada ruta hija y extrae su segmento de URL
   * 2. Obtiene la label del breadcrumb desde data.breadcrumb configurado en las rutas
   * 3. Interpola parámetros dinámicos si la label los contiene
   * 4. Agrega el breadcrumb a la lista si tiene label
   * 5. Continúa recursivamente con las rutas hijas
   * 
   * @param route - Ruta actual siendo procesada
   * @param url - URL acumulada hasta el momento
   * @param crumbs - Array de breadcrumbs a llenar
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
        // Configurada en Angular router data: { breadcrumb: '...' }
        let label = child.snapshot.data['breadcrumb'] as string | undefined;

        // Si la label contiene parámetros dinámicos {{param}}, reemplazarlos
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
   * Reemplaza placeholders dinámicos en las labels
   * 
   * Ejemplo: "Editar {{medicineName}}" → "Editar Amoxicilina"
   * 
   * Busca patrones {{nombreVariable}} y los reemplaza con:
   * - Parámetros de ruta (params): {{id}}
   * - Datos de ruta (data): {{medicineName}}
   * 
   * @param label - Label con posibles placeholders {{variable}}
   * @param params - Parámetros de la ruta activa (ej: {id: '123'})
   * @param data - Datos configurados en la ruta (ej: {medicineName: 'Amoxicilina'})
   * @returns Label con los placeholders reemplazados por los valores reales
   */
  private interpolateLabel(label: string, params: any, data: any): string {
    let result = label;

    // Reemplazar {{param}} con el valor del parámetro de ruta
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
