import { ApplicationConfig, provideBrowserGlobalErrorListeners, APP_INITIALIZER } from '@angular/core';
import { provideRouter, withPreloading, PreloadAllModules, withViewTransitions } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { loggingInterceptor } from './core/interceptors/logging.interceptor';
import { BrowserDetectionService } from './core/services/browser-detection.service';

import { Header } from './components/layout/header/header';
import { Main } from './components/layout/main/main';
import { Footer } from './components/layout/footer/footer';

/**
 * Inicializador para el servicio de detección de navegadores
 */
export function initBrowserDetection(browserService: BrowserDetectionService) {
  return () => {
    const browserInfo = browserService.getCurrentBrowserInfo();
    
    // Aplicar optimizaciones específicas del navegador
    if (browserInfo.isAvast) {
      // Optimizaciones para Avast Secure Browser
      document.documentElement.setAttribute('data-browser', 'avast');
    } else if (browserInfo.isEdge) {
      document.documentElement.setAttribute('data-browser', 'edge');
    } else if (browserInfo.isChrome) {
      document.documentElement.setAttribute('data-browser', 'chrome');
    } else if (browserInfo.isFirefox) {
      document.documentElement.setAttribute('data-browser', 'firefox');
    } else if (browserInfo.isSafari) {
      document.documentElement.setAttribute('data-browser', 'safari');
    }
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    BrowserDetectionService,
    {
      provide: APP_INITIALIZER,
      useFactory: initBrowserDetection,
      deps: [BrowserDetectionService],
      multi: true
    },
    provideRouter(
      routes,
      withPreloading(PreloadAllModules), // Precarga todos los componentes lazy en segundo plano
      withViewTransitions() // Habilita transiciones suaves entre vistas y preservación del scroll
    ),
    provideHttpClient(
      withInterceptors([authInterceptor, errorInterceptor, loggingInterceptor])
    )
  ]
};
