import { Injectable } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { BehaviorSubject, filter } from 'rxjs';

/**
 * INTERFAZ: Breadcrumb
 * ====================
 * Representa una miga de pan individual en la navegación.
 * 
 * @property label - Texto visible de la miga (ej: "Medicamentos", "Editar")
 * @property url - Ruta correspondiente (ej: "/medicamentos", "/medicamentos/123/editar")
 */
export interface Breadcrumb {
  label: string;
  url: string;
}

/**
 * SERVICIO: BreadcrumbService
 * ===========================
 * 
 * Tarea 6: Breadcrumbs Dinámicos
 * 
 * Responsabilidades:
 * 1. Escuchar eventos de navegación (NavigationEnd)
 * 2. Reconstruir el árbol de rutas activas
 * 3. Extraer metadatos `data.breadcrumb` de cada ruta
 * 4. Emitir un array de Breadcrumbs para el componente
 * 
 * Flujo:
 * 1. Usuario navega a /medicamentos/123/editar
 * 2. NavigationEnd evento dispara
 * 3. Service recorre el árbol: root → medicamentos → :id → editar
 * 4. Extrae breadcrumbs de cada ruta: ["Medicamentos", "Editar Medicamento"]
 * 5. Emite via BehaviorSubject
 * 6. Componente se suscribe y renderiza las migas
 * 
 * VENTAJAS:
 * ✅ Automático: no necesita actualización manual en componentes
 * ✅ Reactivo: se actualiza con cada navegación via Observable
 * ✅ Escalable: agregar breadcrumbs es solo añadir data: { breadcrumb: '...' } a rutas
 * ✅ Centralizado: lógica en un lugar, reutilizable en múltiples vistas
 * 
 * USO:
 * ---
 * Inyectar en componente y suscribirse:
 * 
 * export class MiComponente {
 *   breadcrumbs$ = this.breadcrumbService.breadcrumbs$;
 *   
 *   constructor(private breadcrumbService: BreadcrumbService) {}
 * }
 * 
 * O en template con async pipe:
 * 
 * <app-breadcrumb [breadcrumbs]="breadcrumbs$ | async"></app-breadcrumb>
 * 
 * @see breadcrumb.component.ts para el componente de renderizado
 * @see app.routes.ts para los metadatos data: { breadcrumb: '...' }
 * @see app.html para la ubicación del componente <app-breadcrumb>
 */
@Injectable({ providedIn: 'root' })
export class BreadcrumbService {
  
  /**
   * BehaviorSubject que almacena el array actual de breadcrumbs.
   * Siempre tiene un valor (nunca emite undefined).
   * 
   * Inicializa como array vacío [] hasta la primera navegación.
   */
  private readonly _breadcrumbs$ = new BehaviorSubject<Breadcrumb[]>([]);
  
  /**
   * Observable público para que componentes se suscriban.
   * Se actualiza automáticamente cada vez que navega el usuario.
   */
  readonly breadcrumbs$ = this._breadcrumbs$.asObservable();

  constructor(private router: Router, private route: ActivatedRoute) {
    this.initializeBreadcrumbTracking();
  }

  /**
   * Inicializa el tracking de breadcrumbs escuchando NavigationEnd.
   * 
   * FLUJO:
   * 1. router.events emite todos los eventos de navegación
   * 2. filter(event instanceof NavigationEnd) solo captura finalizaciones
   * 3. Se llama buildCrumbs() para reconstruir el árbol activo
   * 4. Se emite el nuevo array via _breadcrumbs$.next()
   * 
   * NOTA: Se ejecuta una única vez en el constructor.
   */
  private initializeBreadcrumbTracking(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        const breadcrumbs: Breadcrumb[] = [];
        
        // Empezamos desde la raíz (ActivatedRoute.root) con URL base vacía
        this.buildCrumbs(this.route.root, '', breadcrumbs);
        
        // Emitir el array actualizado a todos los suscriptores
        this._breadcrumbs$.next(breadcrumbs);
      });
  }

  /**
   * Construye recursivamente el array de breadcrumbs recorriendo el árbol de rutas.
   * 
   * ALGORITMO:
   * 1. Itera sobre child routes (ramas del árbol activo)
   * 2. Para cada ruta: extrae el segmento de URL (ej: "medicamentos", "123", "editar")
   * 3. Si existe, concatena a la URL acumulada (ej: "/medicamentos/123/editar")
   * 4. Lee data.breadcrumb de la ruta (ej: "Editar Medicamento")
   * 5. Si existe label, lo agrega al array
   * 6. Recursivamente procesa hijas de esa ruta
   * 
   * EJEMPLO:
   * Navegación a /medicamentos/123/editar
   * 
   * Árbol:
   * root (data: undefined)
   *   └─ medicamentos (data: { breadcrumb: 'Medicamentos' })
   *       └─ 123 (ID param, no data)
   *           └─ editar (data: { breadcrumb: 'Editar Medicamento' })
   * 
   * Resultado:
   * [
   *   { label: 'Medicamentos', url: '/medicamentos' },
   *   { label: 'Editar Medicamento', url: '/medicamentos/123/editar' }
   * ]
   * 
   * @param route - Nodo actual del árbol ActivatedRoute
   * @param url - URL acumulada hasta ahora
   * @param crumbs - Array que se va completando con breadcrumbs
   * 
   * NOTA: Los parámetros como :id no generan breadcrumbs (no tienen data),
   * solo las rutas con data.breadcrumb explícito se muestran.
   */
  private buildCrumbs(
    route: ActivatedRoute,
    url: string,
    crumbs: Breadcrumb[]
  ): void {
    
    const children: ActivatedRoute[] = route.children;
    
    // Caso base: si no hay hijas, terminar recursión
    if (!children || !children.length) {
      return;
    }

    // Iterar sobre cada ruta hija activa
    for (const child of children) {
      
      // Extraer segmentos URL de este nivel
      // Ejemplo: child.snapshot.url = [UrlSegment('medicamentos')] → 'medicamentos'
      const routeURL = child.snapshot.url.map(segment => segment.path).join('/');
      
      // Si este segmento existe (no es un parámetro :id), concatenarlo
      if (routeURL) {
        url += `/${routeURL}`;
        
        // Leer metadata breadcrumb de esta ruta
        const label = child.snapshot.data['breadcrumb'] as string | undefined;
        
        // Si tiene label, agregarlo al array de migas
        if (label) {
          crumbs.push({
            label: label,
            url: url
          });
        }
      }
      
      // Recursivamente procesar hijas de esta ruta
      this.buildCrumbs(child, url, crumbs);
    }
  }
}
