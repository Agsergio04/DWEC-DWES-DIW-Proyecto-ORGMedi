import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { tap } from 'rxjs/operators';

/**
 * Interceptor de logging para desarrollo
 * Registra todas las peticiones y respuestas HTTP en la consola con información detallada:
 * - Método y URL de la petición
 * - Tiempo de respuesta en milisegundos
 * - Código de estado y cuerpo de la respuesta
 * - Errores con detalles completos
 * 
 * Este interceptor está pensado solo para desarrollo y debería desactivarse en producción
 * mediante configuración en app.config.ts o con una variable de entorno.
 * 
 * Para desactivar en producción, comenta este interceptor en app.config.ts:
 * provideHttpClient(
 *   withInterceptors([
 *     authInterceptor,
 *     errorInterceptor,
 *     // loggingInterceptor  <-- comentar en producción
 *   ])
 * );
 */
export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  const started = Date.now();
  console.log(`[HTTP] → ${req.method} ${req.urlWithParams}`, {
    headers: req.headers.keys().reduce((acc, key) => {
      acc[key] = req.headers.get(key);
      return acc;
    }, {} as Record<string, string | null>),
    body: req.body
  });

  return next(req).pipe(
    tap({
      next: event => {
        if (event instanceof HttpResponse) {
          const elapsed = Date.now() - started;
          console.log(
            `[HTTP] ← ${req.method} ${req.urlWithParams} ${event.status} (${elapsed} ms)`,
            {
              status: event.status,
              statusText: event.statusText,
              body: event.body
            }
          );
        }
      },
      error: err => {
        const elapsed = Date.now() - started;
        console.error(
          `[HTTP] ✗ ${req.method} ${req.urlWithParams} (${elapsed} ms)`,
          {
            status: err.status,
            error: err.error
          }
        );
      }
    })
  );
};
