import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Interceptor de autenticación
 * Añade el token JWT a todas las peticiones HTTP que no sean públicas.
 * El token se obtiene de localStorage y se añade en el header Authorization.
 * 
 * Rutas públicas que no requieren token:
 * - /auth/login
 * - /auth/register
 * - /public/*
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('auth_token');

  // No añadir token a rutas públicas
  const isAuthUrl = req.url.includes('/auth/login') || 
                    req.url.includes('/auth/register') || 
                    req.url.includes('/public');
  
  if (!token || isAuthUrl) {
    return next(req);
  }

  // Clonar la petición añadiendo el header de autorización
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(authReq);
};
