import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type AppTheme = 'light' | 'dark' | 'system';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly storageKey = 'orgmedi-theme';
  private mediaQuery: MediaQueryList | null = null;
  private mqListener: ((this: MediaQueryList, ev: MediaQueryListEvent) => any) | null = null;
  private themeSubject = new BehaviorSubject<AppTheme>('light');
  readonly theme$ = this.themeSubject.asObservable();

  constructor() {
    this.init();
  }

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

  setTheme(theme: AppTheme): void {
    localStorage.setItem(this.storageKey, theme);
    this.applyTheme(theme);
    this.themeSubject.next(theme);
  }

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

  getTheme(): AppTheme {
    return this.themeSubject.getValue();
  }

  private applyTheme(theme: AppTheme): void {
    // Limpiar listener anterior
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
      root.removeAttribute('data-theme');
    } else {
      // system
      this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const applySystem = (mq: MediaQueryList) => {
        if (mq.matches) {
          root.setAttribute('data-theme', 'dark');
        } else {
          root.removeAttribute('data-theme');
        }
      };

      // aplicar ahora
      applySystem(this.mediaQuery);

      // mantener en escucha
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

