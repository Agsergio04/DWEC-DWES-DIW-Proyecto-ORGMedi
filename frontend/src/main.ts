// Aplicar tema inicial antes de arrancar Angular
const __THEME_STORAGE_KEY = 'orgmedi-theme';
(() => {
  try {
    const stored = localStorage.getItem(__THEME_STORAGE_KEY);
    let initial: 'dark' | 'light';
    if (stored === 'dark' || stored === 'light') {
      initial = stored as 'dark' | 'light';
    } else if (window.matchMedia) {
      initial = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      initial = 'light';
    }

    if (initial === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  } catch (e) {
    // si falla el acceso a localStorage o matchMedia, no hacer nada
    // console.warn('Could not initialize theme before bootstrap', e);
  }
})();

import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { App } from './app/app';
import { routes } from './app/app.routes';

bootstrapApplication(App, {
  providers: [
    provideRouter(
      routes,
      withPreloading(PreloadAllModules) // Precarga todos los componentes lazy en segundo plano
    ),
    provideHttpClient(),
  ],
}).catch((err) => console.error(err));
