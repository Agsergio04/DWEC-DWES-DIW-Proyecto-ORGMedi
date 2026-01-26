import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

/**
 * Servicio API base
 * Centraliza la configuración de URL base y maneja errores de forma genérica.
 * 
 * DESCRIPCIÓN:
 * Este servicio encapsula toda la lógica de peticiones HTTP hacia el backend.
 * Proporciona métodos para GET, POST, PUT, PATCH, DELETE y operaciones especiales
 * como subida de archivos y descargas.
 * 
 * CARACTERÍSTICAS:
 * - Gestión centralizada de URL base y endpoints
 * - Manejo uniforme de errores HTTP
 * - Utilidades para parámetros y headers personalizados
 * - Soporte para FormData, Blobs y respuestas de texto
 * - Tipado genérico para todas las operaciones
 * 
 * TODOS LOS SERVICIOS DE DOMINIO deben delegar en este servicio para mantener
 * consistencia y facilitar cambios en la configuración global.
 * 
 * EJEMPLO DE USO:
 * @Injectable({ providedIn: 'root' })
 * export class ProductService {
 *   constructor(private api: ApiService) {}
 *   getProducts() {
 *     return this.api.get<Product[]>('products');
 *   }
 * }
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  /**
   * GET genérico
   * @param endpoint - Ruta del endpoint (sin /api)
   * @param options - Opciones adicionales (headers, params, etc.)
   */
  get<T>(endpoint: string, options?: object): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/api/${endpoint}`, options)
      .pipe(catchError(this.handleError));
  }

  /**
   * POST genérico para crear recursos
   * @param endpoint - Ruta del endpoint
   * @param body - Cuerpo de la petición
   * @param options - Opciones adicionales
   */
  post<T>(endpoint: string, body: unknown, options?: object): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/api/${endpoint}`, body, options)
      .pipe(catchError(this.handleError));
  }

  /**
   * PUT genérico para actualizar recursos completos
   * @param endpoint - Ruta del endpoint
   * @param body - Cuerpo de la petición
   * @param options - Opciones adicionales
   */
  put<T>(endpoint: string, body: unknown, options?: object): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/api/${endpoint}`, body, options)
      .pipe(catchError(this.handleError));
  }

  /**
   * PATCH genérico para actualizaciones parciales
   * @param endpoint - Ruta del endpoint
   * @param body - Cuerpo de la petición (datos parciales)
   * @param options - Opciones adicionales
   */
  patch<T>(endpoint: string, body: unknown, options?: object): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}/api/${endpoint}`, body, options)
      .pipe(catchError(this.handleError));
  }

  /**
   * DELETE genérico para eliminar recursos
   * @param endpoint - Ruta del endpoint
   * @param options - Opciones adicionales
   */
  delete<T>(endpoint: string, options?: object): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}/api/${endpoint}`, options)
      .pipe(catchError(this.handleError));
  }

  /**
   * POST con FormData para subida de archivos
   * No se debe incluir Content-Type; el navegador lo establece automáticamente
   * @param endpoint - Ruta del endpoint
   * @param formData - FormData con archivos y campos
   * @param options - Opciones adicionales (sin Content-Type)
   */
  postFormData<T>(endpoint: string, formData: FormData, options?: object): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/api/${endpoint}`, formData, options)
      .pipe(catchError(this.handleError));
  }

  /**
   * GET con query params para filtros y paginación
   * @param endpoint - Ruta del endpoint
   * @param params - Objeto con parámetros de consulta
   */
  getWithParams<T>(endpoint: string, params: Record<string, string | number | boolean>): Observable<T> {
    let httpParams = new HttpParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    });

    return this.http.get<T>(`${this.baseUrl}/api/${endpoint}`, { params: httpParams })
      .pipe(catchError(this.handleError));
  }

  /**
   * GET con headers personalizados
   * @param endpoint - Ruta del endpoint
   * @param customHeaders - Objeto con headers adicionales
   * @param options - Opciones adicionales
   */
  getWithHeaders<T>(
    endpoint: string, 
    customHeaders: Record<string, string>,
    options?: object
  ): Observable<T> {
    let headers = new HttpHeaders();
    
    Object.entries(customHeaders).forEach(([key, value]) => {
      headers = headers.set(key, value);
    });

    return this.http.get<T>(`${this.baseUrl}/api/${endpoint}`, { ...options, headers })
      .pipe(catchError(this.handleError));
  }

  /**
   * GET para descargar archivos (Blob)
   * @param endpoint - Ruta del endpoint
   * @param options - Opciones adicionales
   */
  getBlob(endpoint: string, options?: object): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/api/${endpoint}`, {
      ...options,
      responseType: 'blob'
    }).pipe(catchError(this.handleError));
  }

  /**
   * GET para descargar texto plano
   * @param endpoint - Ruta del endpoint
   * @param options - Opciones adicionales
   */
  getText(endpoint: string, options?: object): Observable<string> {
    return this.http.get(`${this.baseUrl}/api/${endpoint}`, {
      ...options,
      responseType: 'text'
    }).pipe(catchError(this.handleError));
  }

  /**
   * Construye HttpParams desde un objeto
   * Utilidad para crear params manualmente
   */
  buildParams(params: Record<string, string | number | boolean>): HttpParams {
    let httpParams = new HttpParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    });
    
    return httpParams;
  }

  /**
   * Construye HttpHeaders desde un objeto
   * Utilidad para crear headers manualmente
   */
  buildHeaders(headers: Record<string, string>): HttpHeaders {
    let httpHeaders = new HttpHeaders();
    
    Object.entries(headers).forEach(([key, value]) => {
      httpHeaders = httpHeaders.set(key, value);
    });
    
    return httpHeaders;
  }

  /**
   * Extrae datos OCR de una imagen de medicamento
   * @param formData - FormData con la imagen
   */
  extractOcr<T>(formData: FormData): Observable<T> {
    return this.postFormData<T>('medicamentos/extract-ocr', formData);
  }

  /**
   * Manejo centralizado de errores HTTP
   * Registra el error y propaga un error formateado
   */
  private handleError(error: any) {
    // Log detallado para depuración local: muestra status, url y body si están presentes
    try {
      console.error('HTTP error (detailed):', {
        message: error?.message,
        status: error?.status,
        url: error?.url ?? error?.request?.url,
        body: error?.error
      });
    } catch (logErr) {
      // En caso de que el objeto de error no sea serializable
      console.error('HTTP error (fallback):', error);
    }

    return throwError(() => error);
  }
}
