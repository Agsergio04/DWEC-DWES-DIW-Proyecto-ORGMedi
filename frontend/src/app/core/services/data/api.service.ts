import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

/**
 * SERVICIO API - CAPA DE DATOS
 * ============================
 * 
 * Responsabilidad:
 * Centralizar TODAS las peticiones HTTP hacia el backend
 * Proporcionar métodos y utilidades reutilizables para CRUD
 * 
 * ARQUITECTURA:
 * 
 *  Frontend (Componentes)
 *       ↓
 *  MedicineService, UserService (Servicios de dominio)
 *       ↓
 *  ApiService (Este archivo - Capa HTTP)
 *       ↓
 *  HttpClient (Angular)
 *       ↓
 *  Backend REST API
 * 
 * VENTAJAS:
 * - Cambios en API global → Modificar solo este servicio
 * - Reutilización de código HTTP común
 * - Tipado genérico para todas las operaciones
 * - Manejo uniforme de errores
 * - Soporte para múltiples tipos de respuesta (JSON, Blob, texto)
 * - Manejo de FormData para uploads de archivos
 * - Construcción de params y headers dinámicos
 * 
 * CONFIGURACIÓN DE URL:
 * ======================
 * La URL base se obtiene en este orden de prioridad:
 * 1. window.APP_CONFIG.apiUrl (configuración en runtime desde app-config.json)
 * 2. environment.apiUrl (configuración en tiempo de build desde environment.ts)
 * 
 * Esto permite cambiar la URL sin recompilar la aplicación.
 * 
 * PATRÓN DE USO:
 * 
 * // En un servicio de dominio
 * @Injectable({ providedIn: 'root' })
 * export class ProductService {
 *   constructor(
 *     private api: ApiService  // ← Inyectar ApiService
 *   ) {}
 *   
 *   getProducts(): Observable<Product[]> {
 *     return this.api.get<Product[]>('productos');  // ← Usar ApiService
 *   }
 * }
 * 
 * MÉTODOS DISPONIBLES:
 * ====================
 * GET:
 *   - get<T>(endpoint) - GET básico
 *   - getWithParams<T>(endpoint, params) - GET con query params
 *   - getWithHeaders<T>(endpoint, headers) - GET con headers personalizados
 *   - getBlob(endpoint) - Descargar archivo
 *   - getText(endpoint) - Obtener texto plano
 * 
 * CRUD:
 *   - post<T>(endpoint, body) - POST (crear)
 *   - put<T>(endpoint, body) - PUT (reemplazar)
 *   - patch<T>(endpoint, body) - PATCH (actualizar parcial)
 *   - delete<T>(endpoint) - DELETE (eliminar)
 * 
 * ESPECIALIZADOS:
 *   - postFormData<T>(endpoint, formData) - POST con archivos
 *   - extractOcr<T>(formData) - Extrae texto de imagen de medicamento
 * 
 * UTILIDADES:
 *   - buildParams(params) - Construye HttpParams
 *   - buildHeaders(headers) - Construye HttpHeaders
 *
 * EJEMPLO COMPLETO:
 * 
 * // Obtener medicamentos con filtros
 * this.api.getWithParams<Medicine[]>('medicamentos', {
 *   page: 1,       
 *   pageSize: 10,  // Parámetros automáticamente codificados
 *   status: 'active'
 * }).subscribe(medicines => console.log(medicines));
 * 
 * // POST con manejo de error
 * this.api.post<Medicine>('medicamentos', newMedicine).pipe(
 *   tap(created => console.log('Creado:', created)),
 *   catchError(err => {
 *     console.error('Error:', err);
 *     return throwError(() => new Error('No se pudo crear'));
 *   })
 * ).subscribe();
 * 
 * // Subir archivo
 * const formData = new FormData();
 * formData.append('archivo', file);
 * formData.append('nombre', 'medicina.jpg');
 * this.api.postFormData<OcrResult>('medicamentos/extract-ocr', formData)
 *   .subscribe(result => console.log(result.ocrText));
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  
  /**
   * URL BASE de la API
   * Se obtiene de:
   * 1. window.APP_CONFIG.apiUrl (configuración en runtime)
   * 2. environment.apiUrl (configuración en build)
   * 
   * Ejemplo: http://localhost:8080
   * IMPORTANTE: NO incluir /api al final
   */
  private readonly baseUrl = (window as any)?.APP_CONFIG?.apiUrl ?? environment.apiUrl;

  /**
   * GET - OBTENER DATOS
   * ===================
   * 
   * Método genérico para peticiones GET con tipado seguro.
   * 
   * @template T - Tipo genérico de la respuesta
   * @param endpoint - Ruta relativa (sin /api prefix, ejemplo: 'medicamentos')
   * @param options - Opciones opcionales (headers, params, etc)
   * @returns Observable tipado con los datos de respuesta
   * 
   * FLUJO HTTP:
   * GET /api/medicamentos → ApiService → HttpClient → Backend → 200 + JSON
   * 
   * EJEMPLO:
   * ```typescript
   * this.api.get<Medicine[]>('medicamentos')
   *   .subscribe(medicines => console.log(medicines));
   * ```
   */
  get<T>(endpoint: string, options?: object): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/api/${endpoint}`, options)
      .pipe(catchError(this.handleError));
  }

  /**
   * POST - CREAR RECURSO
   * ====================
   * 
   * Crear un nuevo recurso en el servidor.
   * Automáticamente convierte la respuesta de texto a JSON si es necesario.
   * 
   * @template T - Tipo genérico del recurso creado
   * @param endpoint - Ruta relativa (ejemplo: 'medicamentos')
   * @param body - Datos a enviar (se convierte a JSON automáticamente)
   * @param options - Opciones adicionales
   * @returns Observable tipado con el recurso creado
   * 
   * FLUJO HTTP:
   * POST /api/medicamentos { nombre, dosis, etc } → Backend → 201 + recurso creado
   * 
   * IMPORTANTE:
   * - El body se envía como JSON
   * - El header Content-Type se establece automáticamente
   * - Se aplica el método requestAsJson para convertir texto a JSON
   * 
   * EJEMPLO:
   * ```typescript
   * const newMedicine = { nombre: 'Paracetamol', cantidadMg: 500 };
   * this.api.post<Medicine>('medicamentos', newMedicine)
   *   .subscribe(created => console.log('Creado:', created));
   * ```
   */
  post<T>(endpoint: string, body: unknown, options?: object): Observable<T> {
    return this.requestAsJson<T>('POST', endpoint, body, options);
  }

  /**
   * PUT - ACTUALIZAR COMPLETO
   * ==========================
   * 
   * Reemplazar completamente un recurso en el servidor.
   * TODOS los campos del recurso deben estar presentes en el body.
   * 
   * IMPORTANTE: Usar PATCH para actualizaciones parciales
   * 
   * @template T - Tipo genérico del recurso actualizado
   * @param endpoint - Ruta relativa (ejemplo: 'medicamentos/5')
   * @param body - Datos completos (reemplaza todo el recurso)
   * @param options - Opciones adicionales
   * @returns Observable tipado con el recurso actualizado
   * 
   * FLUJO HTTP:
   * PUT /api/medicamentos/5 { nombre, dosis, frecuencia, ... } → Backend → 200 + recurso actualizado
   * 
   * DIFERENCIA PUT vs PATCH:
   * PUT:   Reemplazar TODO el recurso (campos obligatorios)
   * PATCH: Actualizar SOLO los campos que cambiaron (campos opcionales)
   * 
   * EJEMPLO:
   * ```typescript
   * const updated = { nombre: 'Paracetamol 500', cantidadMg: 500, ... };  // TODOS los campos
   * this.api.put<Medicine>('medicamentos/5', updated)
   *   .subscribe(result => console.log('Actualizado:', result));
   * ```
   */
  put<T>(endpoint: string, body: unknown, options?: object): Observable<T> {
    return this.requestAsJson<T>('PUT', endpoint, body, options);
  }

  /**
   * PATCH - ACTUALIZAR PARCIAL
   * ===========================
   * 
   * Actualizar solo los campos que cambiaron en un recurso.
   * Más eficiente que PUT cuando hay pocos cambios.
   * 
   * @template T - Tipo genérico del recurso actualizado
   * @param endpoint - Ruta relativa (ejemplo: 'medicamentos/5')
   * @param body - Solo los campos que se actualizan (campos opcionales)
   * @param options - Opciones adicionales
   * @returns Observable tipado con el recurso actualizado
   * 
   * FLUJO HTTP:
   * PATCH /api/medicamentos/5 { nombre: 'Nuevo nombre' } → Backend → 200 + recurso
   * 
   * VENTAJAS:
   * - Enviar menos datos
   * - El servidor combina automáticamente con datos existentes
   * - Más seguro (no sobrescribir campos accidentalmente)
   * 
   * EJEMPLO:
   * ```typescript
   * const changes = { nombre: 'Ibuprofeno' };  // Solo cambio el nombre
   * this.api.patch<Medicine>('medicamentos/5', changes)
   *   .subscribe(result => console.log('Actualizado:', result));
   * ```
   */
  patch<T>(endpoint: string, body: unknown, options?: object): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}/api/${endpoint}`, body, options)
      .pipe(catchError(this.handleError));
  }

  /**
   * DELETE - ELIMINAR RECURSO
   * ==========================
   * 
   * Eliminar/borrar un recurso del servidor.
   * 
   * @template T - Tipo genérico de la respuesta (normalmente void)
   * @param endpoint - Ruta relativa (ejemplo: 'medicamentos/5')
   * @param options - Opciones adicionales
   * @returns Observable con la respuesta del servidor
   * 
   * FLUJO HTTP:
   * DELETE /api/medicamentos/5 → Backend → 204 (sin contenido) o 200
   * 
   * NOTA:
   * La mayoría de APIs devuelven 204 NO CONTENT (sin body)
   * Algunos devuelven 200 con un JSON de confirmación
   * 
   * EJEMPLO:
   * ```typescript
   * this.api.delete<void>('medicamentos/5')
   *   .subscribe(() => console.log('Eliminado'));
   * ```
   */
  delete<T>(endpoint: string, options?: object): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}/api/${endpoint}`, options)
      .pipe(catchError(this.handleError));
  }

  /**
   * POST CON FORMDATA - SUBIDA DE ARCHIVOS
   * =======================================
   * 
   * Enviar archivos al servidor usando FormData.
   * IMPORTANTE: NO establecer manualmente Content-Type
   * El navegador lo hace automáticamente para multipart/form-data
   * 
   * @template T - Tipo genérico de la respuesta
   * @param endpoint - Ruta relativa (ejemplo: 'medicamentos/upload')
   * @param formData - FormData con archivos y campos
   * @param options - Opciones adicionales (NO incluir Content-Type)
   * @returns Observable tipado con la respuesta
   * 
   * CONSTRUCCIÓN DEL FORMDATA:
   * ```typescript
   * const formData = new FormData();
   * formData.append('imagen', fileInput.files[0]);     // Archivo
   * formData.append('nombre', 'medicamento.jpg');      // Campo de texto
   * formData.append('medicamentoId', '123');          // Campo numérico
   * this.api.postFormData<OcrResult>('medicamentos/extract-ocr', formData);
   * ```
   * 
   * FLUJO HTTP:
   * POST /api/medicamentos/upload
   * Content-Type: multipart/form-data (automático)
   * [archivo binario + campos]
   * → Backend → 200 + respuesta
   * 
   * CASOS DE USO:
   * - Subir fotos de medicamentos
   * - Subir documentos (recetas, etc)
   * - Enviar archivos con metadatos
   * 
   * EJEMPLO:
   * ```typescript
   * const file = this.fileInput.nativeElement.files[0];
   * const formData = new FormData();
   * formData.append('arquivo', file);
   * formData.append('id', '123');
   * 
   * this.api.postFormData<OcrResult>('medicamentos/extract-ocr', formData)
   *   .subscribe(
   *     result => console.log('OCR extraído:', result.text),
   *     err => console.error('Error en upload:', err)
   *   );
   * ```
   */
  postFormData<T>(endpoint: string, formData: FormData, options?: object): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/api/${endpoint}`, formData, options)
      .pipe(catchError(this.handleError));
  }

  /**
   * GET CON QUERY PARAMETERS
   * =========================
   * 
   * Petición GET con parámetros de búsqueda, filtros y paginación.
   * Los parámetros se codifican automáticamente en la URL.
   * 
   * @template T - Tipo genérico de la respuesta
   * @param endpoint - Ruta relativa (ejemplo: 'medicamentos')
   * @param params - Objeto con pares clave-valor de parámetros
   * @returns Observable tipado con los datos
   * 
   * CONSTRUCCIÓN DE URL:
   * endpoint: 'medicamentos'
   * params: { page: 1, pageSize: 10, status: 'active' }
   * URL resultante: /api/medicamentos?page=1&pageSize=10&status=active
   * 
   * CARACTERÍSTICAS:
   * - Parámetros nulos/undefined se ignoran automáticamente
   * - Valores se convierten automáticamente a string
   * - La codificación URL se hace automáticamente (%20 para espacios, etc)
   * 
   * CASOS DE USO:
   * - Búsqueda y filtros
   * - Paginación
   * - Ordenamiento
   * - Ranges de fechas
   * 
   * EJEMPLO:
   * ```typescript
   * this.api.getWithParams<Medicine[]>('medicamentos', {
   *   page: 1,
   *   pageSize: 20,
   *   status: 'active',
   *   fechaDesde: '2024-01-01',
   *   sortBy: 'nombre',
   *   sortOrder: 'asc'
   * }).subscribe(medicines => console.log(medicines));
   * 
   * // Búsqueda con término
   * const term = 'paracetamol';
   * this.api.getWithParams<Medicine[]>('medicamentos', {
   *   search: term,
   *   limit: 10
   * }).subscribe(results => console.log(results));
   * ```
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
   * GET CON HEADERS PERSONALIZADOS
   * ===============================
   * 
   * Petición GET con headers adicionales personalizados.
   * Útil para APIs que requieren headers especiales.
   * 
   * @template T - Tipo genérico de la respuesta
   * @param endpoint - Ruta relativa
   * @param customHeaders - Objeto con headers adicionales
   * @param options - Opciones adicionales
   * @returns Observable tipado con los datos
   * 
   * NOTA IMPORTANTE:
   * Los headers de autenticación (Authorization) se agregan automáticamente
   * por el authInterceptor, NO necesitan ser agregados manualmente aquí.
   * 
   * CASOS DE USO PARA HEADERS PERSONALIZADOS:
   * - Accept-Language personalizado
   * - X-Custom-Header para versiones de API
   * - If-None-Match para validación de caché
   * 
   * EJEMPLO:
   * ```typescript
   * this.api.getWithHeaders<any>('medicamentos', {
   *   'Accept-Language': 'es-ES',
   *   'X-API-Version': 'v2'
   * }).subscribe(data => console.log(data));
   * ```
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
   * GET BLOB - DESCARGAR ARCHIVO BINARIO
   * ====================================
   * 
   * Descargar un archivo (PDF, imagen, ZIP, etc) como Blob binario.
   * 
   * @param endpoint - Ruta relativa (ejemplo: 'medicamentos/5/informe.pdf')
   * @param options - Opciones adicionales
   * @returns Observable<Blob> - El contenido binario del archivo
   * 
   * CASOS DE USO:
   * - Descargar PDFs
   * - Descargar imágenes
   * - Descargar archivos comprimidos
   * 
   * EJEMPLO:
   * ```typescript
   * this.api.getBlob('medicamentos/5/informe.pdf')
   *   .subscribe(blob => {
   *     // Crear link de descarga
   *     const url = window.URL.createObjectURL(blob);
   *     const link = document.createElement('a');
   *     link.href = url;
   *     link.download = 'informe.pdf';
   *     link.click();
   *     window.URL.revokeObjectURL(url);
   *   });
   * ```
   */
  getBlob(endpoint: string, options?: object): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/api/${endpoint}`, {
      ...options,
      responseType: 'blob'
    }).pipe(catchError(this.handleError));
  }

  /**
   * GET TEXT - OBTENER TEXTO PLANO
   * ===============================
   * 
   * Obtener respuesta como texto plano (no JSON).
   * Útil para archivos de texto, CSV, XML, etc.
   * 
   * @param endpoint - Ruta relativa
   * @param options - Opciones adicionales
   * @returns Observable<string> - Contenido como texto
   * 
   * EJEMPLO:
   * ```typescript
   * this.api.getText('medicamentos/export.csv')
   *   .subscribe(csvText => {
   *     console.log(csvText); // Contenido del archivo CSV
   *   });
   * ```
   */
  getText(endpoint: string, options?: object): Observable<string> {
    return this.http.get(`${this.baseUrl}/api/${endpoint}`, {
      ...options,
      responseType: 'text'
    }).pipe(catchError(this.handleError));
  }

  /**
   * CONVERTIDOR TEXTO A JSON (INTERNO)
   * ==================================
   * 
   * Método PRIVADO que convierte respuestas de texto a JSON.
   * Se usa internamente en post, put, patch para soportar servidores
   * que devuelven respuestas como texto en lugar de JSON.
   * 
   * PROBLEMA QUE RESUELVE:
   * Algunos servidores Java/Spring devuelven:
   * - Status: 200
   * - Content-Type: text/plain
   * - Body: {"token": "abc123"} (como texto, no JSON)
   * 
   * Angular espera Content-Type: application/json
   * Por eso necesitamos convertir manualmente.
   * 
   * @private
   * @template T - Tipo de salida
   * @param method - Método HTTP (POST, PUT, PATCH, DELETE, GET)
   * @param endpoint - Ruta relativa
   * @param body - Cuerpo de la petición
   * @param options - Opciones adicionales
   * @returns Observable<T> - Respuesta convertida a JSON
   */
  private requestAsJson<T>(method: 'POST'|'PUT'|'PATCH'|'DELETE'|'GET', endpoint: string, body?: unknown, options?: object): Observable<T> {
    const url = `${this.baseUrl}/api/${endpoint}`;
    return this.http.request('' + method, url, {
      body,
      ...(options || {}),
      responseType: 'text' as 'json'
    }).pipe(
      map((text: any) => {
        if (typeof text === 'string') {
          try {
            return JSON.parse(text) as T;
          } catch {
            // not JSON — return raw text (casted)
            return text as unknown as T;
          }
        }
        // already an object
        return text as T;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * CONSTRUIR HTTP PARAMS (UTILIDAD)
   * ==================================
   * 
   * Utilidad para construir HttpParams manualmente.
   * Filtros automáticos de valores nulos/undefined/vacíos.
   * 
   * @param params - Objeto con pares clave-valor
   * @returns HttpParams - Objeto HttpParams construido
   * 
   * NOTA: Esta utilidad se usa internamente en getWithParams()
   * Generalmente no es necesario usarla directamente.
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
   * CONSTRUIR HTTP HEADERS (UTILIDAD)
   * ==================================
   * 
   * Utilidad para construir HttpHeaders manualmente.
   * Itera sobre un objeto de headers y los agrega a HttpHeaders.
   * 
   * @param headers - Objeto con pares clave-valor de headers
   * @returns HttpHeaders - Objeto HttpHeaders construido
   * 
   * NOTA: Esta utilidad se usa internamente en getWithHeaders()
   */
  buildHeaders(headers: Record<string, string>): HttpHeaders {
    let httpHeaders = new HttpHeaders();
    
    Object.entries(headers).forEach(([key, value]) => {
      httpHeaders = httpHeaders.set(key, value);
    });
    
    return httpHeaders;
  }

  /**
   * EXTRAER OCR DE IMAGEN
   * =====================
   * 
   * Especialización de postFormData para extraer texto de imágenes de medicamentos.
   * Utiliza la ruta de endpoint específica para OCR.
   * 
   * @template T - Tipo de resultado (típicamente OcrResult)
   * @param formData - FormData con la imagen del medicamento
   * @returns Observable<T> - Resultado con texto extraído
   * 
   * EJEMPLO:
   * ```typescript
   * const formData = new FormData();
   * formData.append('imagen', fotoMedicamento);
   * 
   * this.api.extractOcr<OcrResult>(formData)
   *   .subscribe(result => {
   *     console.log('Texto extraído:', result.text);
   *   });
   * ```
   */
  extractOcr<T>(formData: FormData): Observable<T> {
    return this.postFormData<T>('medicamentos/extract-ocr', formData);
  }

  /**
   * MANEJO CENTRALIZADO DE ERRORES HTTP
   * ====================================
   * 
   * Método PRIVADO que:n   * 1. Registra cada error HTTP en la consola con detalles
   * 2. Propaga el error para que los servicios lo controlen
   * 3. El errorInterceptor hablará con el usuario (toast)
   * 
   * INFORMACIÓN REGISTRADA:
   * - message: Mensaje de error
   * - status: Código HTTP (404, 500, etc)
   * - url: URL que falló
   * - body: Respuesta del servidor
   * 
   * IMPORTANTE:
   * Este método solo registra y propaga.
   * El manejo amigable al usuario (toast) lo hace el errorInterceptor.
   * 
   * @private
   * @param error - Error HTTP de Angular
   * @returns Observable que siempre falla con throwError()
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
