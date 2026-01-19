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
  
  const logData = {
    hasToken: !!token,
    isAuthUrl,
    url: req.url,
    tokenLength: token ? token.length : 0,
    timestamp: new Date().toISOString()
  };
  
  console.log('[AuthInterceptor] Request to:', req.url, '| Token present:', !!token, '| Auth URL:', isAuthUrl);
  
  if (!token || isAuthUrl) {
    if (!token) console.log('[AuthInterceptor] No token found in localStorage');
    if (isAuthUrl) console.log('[AuthInterceptor] Auth URL, skipping token injection');
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
