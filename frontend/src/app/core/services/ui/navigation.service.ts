import { Injectable, inject } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';

/**
 * NavigationService - Servicio centralizado de navegación programática
 * ===================================================================
 * 
 * Proporciona métodos para navegación programática con distintos patrones:
 * 1. Navegación absoluta → goHome(), goToMedicines()
 * 2. Navegación con parámetros → editMedicine(id)
 * 3. Query params y filtros → searchMedicines(categoria, page)
 * 4. State (datos en memoria) → goToCheckout(data)
 * 5. Fragmentos (#) → goToSection(fragment)
 * 
 * Ventajas de centralizar la navegación:
 * - Código DRY: No repetir .navigate() en cada componente
 * - Mantenibilidad: Cambios centralizados
 * - Consistencia: Mismas rutas en toda la app
 */
@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private router = inject(Router);

  // ============ NAVEGACIÓN ABSOLUTA SIMPLE ============
  
  /** Ir a la página de inicio */
  goHome(): Promise<boolean> {
    return this.router.navigate(['/']);
  }

  /** Ir al listado de medicamentos */
  goToMedicines(): Promise<boolean> {
    return this.router.navigate(['/medicamentos']);
  }

  /** Ir a crear medicamento */
  goToCreateMedicine(): Promise<boolean> {
    return this.router.navigate(['/medicamentos/crear-medicamento']);
  }

  /** Ir a crear medicamento desde foto */
  goToCreateMedicinePhoto(): Promise<boolean> {
    return this.router.navigate(['/medicamentos/crear-foto']);
  }

  /** Ir al perfil */
  goToProfile(): Promise<boolean> {
    return this.router.navigate(['/perfil']);
  }

  /** Ir a login */
  goToLogin(): Promise<boolean> {
    return this.router.navigate(['/iniciar-sesion']);
  }

  /** Ir a registro */
  goToRegister(): Promise<boolean> {
    return this.router.navigate(['/registrarse']);
  }

  /** Ir a calendario */
  goToCalendar(): Promise<boolean> {
    return this.router.navigate(['/calendario']);
  }

  // ============ NAVEGACIÓN CON PARÁMETROS DE RUTA (:id) ============

  /**
   * Editar medicamento
   * Ruta: /medicamento/:id/editar-medicamento
   * @param medicineId ID del medicamento a editar
   */
  goToEditMedicine(medicineId: string | number): Promise<boolean> {
    return this.router.navigate(['/medicamento', medicineId, 'editar-medicamento']);
  }

  // ============ NAVEGACIÓN CON QUERY PARAMS (busqueda, filtros, paginación) ============

  /**
   * Buscar medicamentos con filtros
   * Ruta: /medicamentos?busqueda=paracetamol&categoria=antiinflamatorio&page=1
   * 
   * @param filters Objeto con filtros
   * @example
   * navigationService.searchMedicines({
   *   busqueda: 'aspirina',
   *   categoria: 'analgésicos',
   *   page: 2
   * })
   */
  searchMedicines(filters: {
    busqueda?: string;
    categoria?: string;
    page?: number;
  }): Promise<boolean> {
    return this.router.navigate(['/medicamentos'], {
      queryParams: filters,
      queryParamsHandling: 'merge' // Preserva otros query params existentes
    });
  }

  /**
   * Navegar manteniendo query params existentes
   * @param path Ruta destino
   * @param newParams Nuevos query params a añadir
   * @example
   * // Si actual es /medicamentos?page=2
   * // Resultado: /medicamentos?page=2&categoria=vitaminas
   * navigatePreservingParams(['/medicamentos'], { categoria: 'vitaminas' })
   */
  navigatePreservingParams(
    commands: any[],
    newParams: Record<string, any>
  ): Promise<boolean> {
    return this.router.navigate(commands, {
      queryParams: newParams,
      queryParamsHandling: 'merge'
    });
  }

  // ============ NAVEGACIÓN CON FRAGMENTOS (#anchor) ============

  /**
   * Navegar a una sección específica de la página
   * Ruta: /medicamentos#detalles
   * 
   * @param route Ruta
   * @param fragment ID del elemento o sección
   * @example
   * goToSection(['/medicamentos'], 'lista')
   * // → /medicamentos#lista (scroll automático a #lista)
   */
  goToSection(commands: any[], fragment: string): Promise<boolean> {
    return this.router.navigate(commands, { fragment });
  }

  // ============ NAVEGACIÓN CON STATE (datos en memoria) ============

  /**
   * Navegar pasando datos en memoria (no visibles en URL)
   * Útil para pasar objetos complejos sin exponerlos en la URL
   * 
   * @param commands Ruta destino
   * @param state Objeto con datos a pasar
   * @param options Opciones adicionales (replaceUrl, etc)
   * 
   * @example
   * const medicine = { id: 1, nombre: 'Aspirina', ... };
   * navigateWithState(['/medicamentos', 'crear'], { medicine });
   * 
   * // En destino:
   * // const navigation = router.getCurrentNavigation();
   * // const medicine = navigation?.extras.state?.['medicine'];
   */
  navigateWithState(
    commands: any[],
    state: Record<string, any>,
    options?: Partial<NavigationExtras>
  ): Promise<boolean> {
    return this.router.navigate(commands, {
      state,
      ...options
    });
  }

  /**
   * Ir a crear medicamento pasando un medicamento preexistente como plantilla
   * 
   * @param medicineTemplate Datos del medicamento como plantilla
   */
  goToCreateMedicineFromTemplate(medicineTemplate: any): Promise<boolean> {
    return this.router.navigate(['/medicamentos/crear-medicamento'], {
      state: { template: medicineTemplate }
    });
  }

  // ============ NAVEGACIÓN AVANZADA CON NAVIGATIONEXTRAS ============

  /**
   * Navegar sin añadir entrada al historial (para redirects, login)
   * replaceUrl: true → sustituye la entrada actual en el historial
   * 
   * @param commands Ruta destino
   * @example
   * // Usuario no autenticado es redirigido a login sin poder volver atrás
   * navigateReplacingHistory(['/iniciar-sesion'])
   */
  navigateReplacingHistory(commands: any[]): Promise<boolean> {
    return this.router.navigate(commands, { replaceUrl: true });
  }

  /**
   * Navegar sin cambiar la URL visible (experimental)
   * skipLocationChange: true → la navegación no aparece en el browser
   * Nota: Usar con moderación, puede confundir a usuarios
   */
  navigateWithoutUrl(commands: any[]): Promise<boolean> {
    return this.router.navigate(commands, {
      skipLocationChange: true
    });
  }

  /**
   * Navegar usando todas las opciones (máxima flexibilidad)
   * 
   * @param commands Ruta
   * @param extras Todas las opciones de NavigationExtras
   */
  navigate(
    commands: any[],
    extras?: NavigationExtras
  ): Promise<boolean> {
    return this.router.navigate(commands, extras);
  }

  // ============ UTILIDADES ============

  /**
   * Volver a la página anterior (como botón back)
   * Usa el historial del navegador
   */
  goBack(): void {
    window.history.back();
  }

  /**
   * Ir adelante en el historial
   */
  goForward(): void {
    window.history.forward();
  }

  /**
   * Recargar la página actual
   */
  reload(): void {
    window.location.reload();
  }

  /**
   * Obtener la URL actual
   */
  getCurrentUrl(): string {
    return this.router.url;
  }
}
