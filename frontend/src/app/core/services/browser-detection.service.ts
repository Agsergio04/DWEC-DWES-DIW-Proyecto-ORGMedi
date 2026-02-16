import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface BrowserInfo {
  name: string;
  version: string;
  isChromium: boolean;
  isAvast: boolean;
  isEdge: boolean;
  isChrome: boolean;
  isFirefox: boolean;
  isSafari: boolean;
}

/**
 * Servicio para detectar el navegador en el que se ejecuta la aplicación
 * Proporciona información sobre compatibilidad y optimizaciones
 * 
 * Navegadores soportados:
 * - Avast Secure Browser
 * - Google Chrome
 * - Microsoft Edge
 * - Mozilla Firefox
 * - Safari
 * - Brave
 * - Opera
 */
@Injectable({
  providedIn: 'root'
})
export class BrowserDetectionService {
  private browserInfo$ = new BehaviorSubject<BrowserInfo>(this.detectBrowser());

  constructor() {
    this.logBrowserInfo();
  }

  /**
   * Obtiene la información del navegador como Observable
   */
  getBrowserInfo(): Observable<BrowserInfo> {
    return this.browserInfo$.asObservable();
  }

  /**
   * Obtiene la información actual del navegador
   */
  getCurrentBrowserInfo(): BrowserInfo {
    return this.browserInfo$.value;
  }

  /**
   * Verifica si el navegador es Avast Secure Browser
   */
  isAvastBrowser(): boolean {
    return this.browserInfo$.value.isAvast;
  }

  /**
   * Verifica si el navegador es Chromium-based
   */
  isChromiumBased(): boolean {
    return this.browserInfo$.value.isChromium;
  }

  /**
   * Detecta el navegador analizando el user agent
   */
  private detectBrowser(): BrowserInfo {
    const ua = navigator.userAgent.toLowerCase();
    const browserInfo: BrowserInfo = {
      name: 'Unknown',
      version: 'Unknown',
      isChromium: false,
      isAvast: false,
      isEdge: false,
      isChrome: false,
      isFirefox: false,
      isSafari: false
    };

    // Detectar Avast Secure Browser
    if (ua.includes('avast') || ua.includes('avg secure browser')) {
      browserInfo.name = 'Avast Secure Browser';
      browserInfo.isAvast = true;
      browserInfo.isChromium = true;
      browserInfo.version = this.extractVersion(ua, /avast[/\s]([0-9.]+)/);
    }
    // Detectar Microsoft Edge (debe estar antes que Chrome)
    else if (ua.includes('edg/')) {
      browserInfo.name = 'Microsoft Edge';
      browserInfo.isEdge = true;
      browserInfo.isChromium = true;
      browserInfo.version = this.extractVersion(ua, /edg[/\s]([0-9.]+)/);
    }
    // Detectar Google Chrome
    else if (ua.includes('chrome') && !ua.includes('chromium')) {
      browserInfo.name = 'Google Chrome';
      browserInfo.isChrome = true;
      browserInfo.isChromium = true;
      browserInfo.version = this.extractVersion(ua, /chrome[/\s]([0-9.]+)/);
    }
    // Detectar Chromium genérico
    else if (ua.includes('chromium') || ua.includes('crios')) {
      browserInfo.name = 'Chromium';
      browserInfo.isChromium = true;
      browserInfo.version = this.extractVersion(ua, /chromium[/\s]([0-9.]+)/);
    }
    // Detectar Mozilla Firefox
    else if (ua.includes('firefox')) {
      browserInfo.name = 'Mozilla Firefox';
      browserInfo.isFirefox = true;
      browserInfo.version = this.extractVersion(ua, /firefox[/\s]([0-9.]+)/);
    }
    // Detectar Safari
    else if (ua.includes('safari') && !ua.includes('chrome')) {
      browserInfo.name = 'Safari';
      browserInfo.isSafari = true;
      browserInfo.version = this.extractVersion(ua, /version[/\s]([0-9.]+)/);
    }

    return browserInfo;
  }

  /**
   * Extrae la versión del navegador del user agent
   */
  private extractVersion(ua: string, regex: RegExp): string {
    const match = ua.match(regex);
    return match ? match[1] : 'Unknown';
  }

  /**
   * Registra la información del navegador en la consola
   */
  private logBrowserInfo(): void {
    const info = this.browserInfo$.value;
    console.group('🌐 Browser Detection');
    console.groupEnd();
  }

  /**
   * Obtiene capacidades del navegador para optimización
   */
  getBrowserCapabilities(): {
    supportsWebP: boolean;
    supportsWebGL: boolean;
    supportsServiceWorker: boolean;
    maxLocalStorage: number;
  } {
    return {
      supportsWebP: this.supportsWebP(),
      supportsWebGL: this.supportsWebGL(),
      supportsServiceWorker: 'serviceWorker' in navigator,
      maxLocalStorage: this.getLocalStorageSize()
    };
  }

  /**
   * Verifica soporte para WebP
   */
  private supportsWebP(): boolean {
    try {
      const canvas = document.createElement('canvas');
      return canvas.toDataURL('image/webp').includes('image/webp');
    } catch {
      return false;
    }
  }

  /**
   * Verifica soporte para WebGL
   */
  private supportsWebGL(): boolean {
    try {
      const canvas = document.createElement('canvas');
      return !!(
        (window as any).WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
      );
    } catch {
      return false;
    }
  }

  /**
   * Estima el tamaño disponible de localStorage
   */
  private getLocalStorageSize(): number {
    try {
      let size = 0;
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          size += localStorage[key].length + key.length;
        }
      }
      return size;
    } catch {
      return 0;
    }
  }
}
