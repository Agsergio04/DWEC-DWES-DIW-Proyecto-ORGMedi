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
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { App } from './app/app';
import { routes } from './app/app.routes';
import { authInterceptor } from './app/core/interceptors/auth.interceptor';
import { errorInterceptor } from './app/core/interceptors/error.interceptor';
import { loggingInterceptor } from './app/core/interceptors/logging.interceptor';

async function loadAppConfig() {
  try {
    const resp = await fetch('/assets/app-config.json', { cache: 'no-cache' });
    if (resp.ok) {
      // attach to global so services can read it synchronously after load
      const appConfig = await resp.json() as { baseUrl?: string };
      (window as { APP_CONFIG?: unknown }).APP_CONFIG = appConfig;
      console.info('Loaded runtime config', appConfig);
      return;
    }
    console.warn('Runtime config not found, using build-time environment');
  } catch (e) {
    console.warn('Could not load runtime config, using build-time environment', e);
  }
}

(async () => {
  await loadAppConfig();

  bootstrapApplication(App, {
    providers: [
      provideRouter(
        routes,
        withPreloading(PreloadAllModules) // Precarga todos los componentes lazy en segundo plano
      ),
      provideHttpClient(
        withInterceptors([loggingInterceptor, authInterceptor, errorInterceptor])
      ),
    ],
  }).catch((err) => console.error(err));
})();
