/**
 * INICIALIZACIÓN DEL TEMA (DARK/LIGHT MODE)
 * ============================================
 * Se ejecuta ANTES de que Angular arrange para evitar flash de tema incorrecto
 * 
 * Orden de prioridad:
 * 1. Tema guardado en localStorage
 * 2. Preferencia del SO (dark mode o light mode)
 * 3. Default: light mode
 */
const __THEME_STORAGE_KEY = 'orgmedi-theme';
(() => {
  try {
    // Obtener tema guardado del localStorage
    const stored = localStorage.getItem(__THEME_STORAGE_KEY);
    let initial: 'dark' | 'light';
    
    // Paso 1: Comprobar si hay tema guardado
    if (stored === 'dark' || stored === 'light') {
      initial = stored as 'dark' | 'light';
    } 
    // Paso 2: Usar preferencia del SO si no hay guardado
    else if (window.matchMedia) {
      initial = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } 
    // Paso 3: Default a light mode si no funciona matchMedia
    else {
      initial = 'light';
    }

    // Aplicar el tema al elemento raíz del documento
    if (initial === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  } catch (e) {
    // Capturar errores de localStorage o matchMedia y continuar sin fallar
    // Esto puede ocurrir en navegadores privados o con restricciones de permisos
  }
})();

/**
 * IMPORTACIONES PRINCIPALES
 * Angular core: bootstrapApplication, routing, HTTP client
 * Componente raíz: App
 * Rutas: configuración de todas las rutas de la aplicación
 * Interceptors: auth, error handling, logging para todas las peticiones HTTP
 */
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { App } from './app/app';
import { routes } from './app/app.routes';
import { authInterceptor } from './app/core/interceptors/auth.interceptor';
import { errorInterceptor } from './app/core/interceptors/error.interceptor';

/**
 * CARGA DE CONFIGURACIÓN EN TIEMPO DE EJECUCIÓN
 * ================================================
 * Intenta cargar app-config.json que contiene la URL base de la API
 * Si no encuentra el archivo, Angular usará el environment.ts del build
 * 
 * @async
 * @returns {Promise<void>}
 */
async function loadAppConfig() {
  try {
    // Fetch sincrónico del archivo de configuración sin caché
    const resp = await fetch('/assets/app-config.json', { cache: 'no-cache' });
    if (resp.ok) {
      // Parsear como JSON y guardar en window como variable global
      // Los servicios pueden acceder a window.APP_CONFIG sincronamente después de cargar
      const appConfig = await resp.json() as { baseUrl?: string };
      (window as { APP_CONFIG?: unknown }).APP_CONFIG = appConfig;
      console.info(' Configuración de runtime cargada:', appConfig);
      return;
    }
    console.warn(' Archivo de configuración no encontrado, usando environment del build');
  } catch (e) {
    // Si falla el fetch, continuar usando la configuración del build (environment.ts)
    console.warn(' No se pudo cargar configuración de runtime, usando environment del build', e);
  }
}

/**
 * BOOTSTRAP DE LA APLICACIÓN
 * ===========================
 * IIFE asíncrona para:
 * 1. Cargar configuración en tiempo de ejecución
 * 2. Iniciar Angular con configuración de providers
 */
(async () => {
  // 1. Cargar configuración en tiempo de ejecución (baseUrl, etc)
  await loadAppConfig();

  // 2. Arrancar Angular con configuración de DI providers
  bootstrapApplication(App, {
    providers: [
      // Router: Configurar sistema de rutas con preload de módulos lazy
      provideRouter(
        routes,
        // Precargar todos los componentes lazy en segundo plano después de la naveg inicial
        // Esto mejora la experiencia si el usuario navega a otras rutas después
        withPreloading(PreloadAllModules)
      ),
      // HTTP Client: Configurar cliente HTTP con interceptors en orden
      // ORDEN IMPORTANTE:
      // 1. authInterceptor - Agregar token JWT al header
      // 2. errorInterceptor - Capturar y manejar errores HTTP
      provideHttpClient(
        withInterceptors([authInterceptor, errorInterceptor])
      ),
    ],
  }).catch((err) => console.error(' Error crítico en bootstrap:', err));
})();
