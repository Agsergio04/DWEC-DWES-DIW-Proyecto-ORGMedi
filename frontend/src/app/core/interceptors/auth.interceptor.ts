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
  const token = localStorage.getItem('authToken');
  const isAuthUrl = req.url.includes('/auth/login') || 
                    req.url.includes('/auth/register') || 
                    req.url.includes('/public');
  
  console.log('[AuthInterceptor] Request to:', req.url, '| Token present:', !!token, '| Auth URL:', isAuthUrl);
  
  if (!token) {
    console.log('[AuthInterceptor] ⚠️  No token found in localStorage - User must login again');
    if (isAuthUrl) {
      console.log('[AuthInterceptor] Auth URL detected, allowing request without token');
    }
    return next(req);
  }

  if (isAuthUrl) {
    console.log('[AuthInterceptor] Auth URL, skipping token injection');
    return next(req);
  }

  console.log('[AuthInterceptor] ✓ Adding Authorization header with token:', token.substring(0, 30) + '...');
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(authReq);
};
