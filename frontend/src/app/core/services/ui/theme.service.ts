import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * Tipo de tema
 * - 'light': Tema claro (siempre)
 * - 'dark': Tema oscuro (siempre)
 * - 'system': Sigue la preferencia del sistema operativo
 */
export type AppTheme = 'light' | 'dark' | 'system';

/**
 * Servicio de Temas (Light/Dark Mode)
 * ==================================
 * 
 * Gestiona el tema de la aplicación (claro/oscuro) con estas capacidades:
 * 
 *  **Persistencia**: Guarda la preferencia en localStorage
 *  **Preferencia del Sistema**: Lee la preferencia del SO (Windows, macOS, Linux)
 *  **Observable**: Los componentes reciben cambios en tiempo real
 *  **Toggle Automático**: Cambiar fácilmente entre temas
 *  **Sincronización**: Si el SO cambia, la app también se adapta (modo system)
 * 
 * Flujo de inicialización:
 * 1. Detecta si hay preferencia guardada en localStorage
 * 2. Si no hay, detecta la preferencia del sistema
 * 3. Aplica el tema estableciendo data-theme en el HTML root
 * 
 * @example
 * // En un componente
 * constructor(private themeService: ThemeService) {}
 * 
 * // Obtener tema actual
 * currentTheme = this.themeService.getTheme();
 * 
 * // Cambiar tema
 * this.themeService.setTheme('dark');
 * 
 * // Toggle entre claro y oscuro
 * this.themeService.toggleTheme();
 * 
 * // Suscribirse a cambios
 * this.themeService.theme$.subscribe(theme => {
 *   console.log('Nuevo tema:', theme);
 * });
 */
@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  /** Clave para guardar la preferencia en localStorage */
  private readonly storageKey = 'orgmedi-theme';
  
  /** Media query para detectar cambios de preferencia del sistema */
  private mediaQuery: MediaQueryList | null = null;
  
  /** Listener para cambios de preferencia del sistema */
  private mqListener: ((this: MediaQueryList, ev: MediaQueryListEvent) => any) | null = null;
  
  /** Observable que emite el tema actual */
  private themeSubject = new BehaviorSubject<AppTheme>('light');
  
  /** Observable público: suscribirse para recibir cambios de tema */
  readonly theme$ = this.themeSubject.asObservable();

  constructor() {
    this.init();
  }

  /**
   * Inicializa el servicio
   * 
   * Qué hace:
   * 1. Intenta recuperar la preferencia guardada en localStorage
   * 2. Si no hay preferencia guardada, detecta la del sistema
   * 3. Aplica el tema inicial
   */
  init(): void {
    const saved = localStorage.getItem(this.storageKey) as AppTheme | null;

    if (saved === 'light' || saved === 'dark' || saved === 'system') {
      this.applyTheme(saved);
      this.themeSubject.next(saved);
      return;
    }

    // No hay preferencia guardada: detectar preferencia del sistema
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial: AppTheme = prefersDark ? 'dark' : 'light';
    this.applyTheme(initial);
    this.themeSubject.next(initial);
  }

  /**
   * Establece el tema manualmente
   * 
   * - Guarda la preferencia en localStorage
   * - Aplica el tema (cambia data-theme en el HTML)
   * - Notifica a todos los suscriptores
   * 
   * @param theme - El tema a aplicar: 'light', 'dark' o 'system'
   */
  setTheme(theme: AppTheme): void {
    localStorage.setItem(this.storageKey, theme);
    this.applyTheme(theme);
    this.themeSubject.next(theme);
  }

  /**
   * Alterna entre temas
   * 
   * - Si está en 'dark' → cambia a 'light'
   * - Si está en 'light' → cambia a 'dark'
   * - Si está en 'system' → cambia al opuesto de la preferencia actual del SO
   */
  toggleTheme(): void {
    const current = this.themeSubject.getValue();
    if (current === 'dark') {
      this.setTheme('light');
    } else if (current === 'light') {
      this.setTheme('dark');
    } else {
      // si está en system, togglear según el valor computado ahora
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.setTheme(prefersDark ? 'light' : 'dark');
    }
  }

  /**
   * Obtiene el tema actual
   * @returns El tema actual: 'light', 'dark' o 'system'
   */
  getTheme(): AppTheme {
    return this.themeSubject.getValue();
  }

  /**
   * Aplica el tema estableciendo atributo en el HTML
   * 
   * Qué hace:
   * 1. Si es 'light' o 'dark': establece data-theme en el root HTML
   * 2. Si es 'system': escucha cambios de preferencia del SO
   *    - Si el usuario cambia SO tema → app se adapta automáticamente
   * 
   * Los estilos CSS leen el atributo data-theme para aplicar colores
   * 
   * @param theme - El tema a aplicar
   * @private
   */
  private applyTheme(theme: AppTheme): void {
    // Limpiar listener anterior (evitar memory leaks)
    if (this.mediaQuery && this.mqListener) {
      try {
        this.mediaQuery.removeEventListener('change', this.mqListener);
      } catch (e) {
        // IE fallback
        this.mediaQuery.removeListener(this.mqListener as any);
      }
      this.mediaQuery = null;
      this.mqListener = null;
    }

    const root = document.documentElement;

    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
    } else if (theme === 'light') {
      root.setAttribute('data-theme', 'light');
    } else {
      // system: escuchar cambios del SO
      this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const applySystem = (mq: MediaQueryList) => {
        if (mq.matches) {
          root.setAttribute('data-theme', 'dark');
        } else {
          root.setAttribute('data-theme', 'light');
        }
      };

      // aplicar ahora
      applySystem(this.mediaQuery);

      // mantener en escucha: si el usuario cambia su preferencia del SO
      this.mqListener = (e: MediaQueryListEvent) => applySystem(e.currentTarget as unknown as MediaQueryList);
      try {
        this.mediaQuery.addEventListener('change', this.mqListener);
      } catch (e) {
        // Safari/older: addListener
        this.mediaQuery.addListener(this.mqListener as any);
      }
    }
  }
}

