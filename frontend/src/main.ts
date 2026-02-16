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
 * Angular core: bootstrapApplication
 * Componente raíz: App
 * Configuración: appConfig con routing, HTTP, interceptors
 */
import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { appConfig } from './app/app.config';

/**
 * CARGA DE CONFIGURACIÓN EN TIEMPO DE EJECUCIÓN (NO BLOQUEANTE)
 * ================================================================
 * Carga app-config.json en segundo plano DESPUÉS del bootstrap.
 * No bloquea FCP/LCP. Los servicios acceden a window.APP_CONFIG cuando esté disponible.
 */
function loadAppConfigAsync(): void {
  fetch('/assets/app-config.json', { cache: 'no-cache' })
    .then(resp => {
      if (resp.ok) return resp.json();
      return null;
    })
    .then(config => {
      if (config) {
        (window as { APP_CONFIG?: unknown }).APP_CONFIG = config;
      }
    })
    .catch(() => {
      // Si falla, se usa environment.ts del build
    });
}

/**
 * BOOTSTRAP DE LA APLICACIÓN
 * ===========================
 * 1. Iniciar Angular con appConfig (SelectivePreloading, interceptors, etc.)
 * 2. Cargar configuración runtime en segundo plano (no bloquea render)
 */
loadAppConfigAsync();
bootstrapApplication(App, appConfig)
  .catch((err) => console.error('Error crítico en bootstrap:', err));
