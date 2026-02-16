/**
 * INTERCEPTOR DE AUTENTICACIÓN
 * =============================
 * Inyecta el JWT (JSON Web Token) en el header Authorization de TODAS las peticiones HTTP
 * excepto en rutas públicas (login, registro, público).
 * 
 * FLUJO:
 * 1. Usuario hace petición HTTP (ej: GET /medicamentos)
 * 2. Este interceptor intercepta ANTES de enviar
 * 3. Lee token de localStorage
 * 4. Si es ruta pública (login, registro), envía sin token
 * 5. Si hay token, lo añade en header: Authorization: Bearer <token>
 * 6. Envía la petición al servidor con el token
 * 7. El backend valida el token y devuelve respuesta
 * 
 * RUTAS PÚBLICAS (sin requieren token):
 * - /auth/login
 * - /auth/register
 * - /public/*
 * 
 * IMPORTANTE:
 * - El token viene de login() en auth.service.ts
 * - Si no hay token, el usuario no está autenticado
 * - El servidor devuelve 401 si el token es inválido
 * - El errorInterceptor maneja errores 401 (redirige a login)
 * 
 * ESTRUCTURA DEL JWT:
 * Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
 *                      ^^^^^^^ header   ^^^^^^^^^^ payload ^^^^^^^^ signature
 */

import { HttpInterceptorFn, HttpRequest } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next) => {
  // 1. Obtener token del localStorage
  const token = localStorage.getItem('authToken');
  
  // 2. Detectar si es una ruta pública que no necesita token
  const isAuthUrl = req.url.includes('/auth/login') || 
                    req.url.includes('/auth/register') || 
                    req.url.includes('/public');
  // No hay token - el usuario no está autenticado
  if (!token) {
    return next(req);
  }

  // Es una ruta pública - no añadir token aunque exista
  if (isAuthUrl) {
    return next(req);
  }

  // 3. Añadir token en el header Authorization: Bearer <token>
  // clone() crea una copia de la petición sin modificar la original
  const authReq = req.clone({
    setHeaders: {
      // Formato estándar: "Bearer <token>"
      Authorization: `Bearer ${token}`
    }
  });

  // 4. Enviar la petición modificada al siguiente interceptor o servidor
  return next(authReq);
};
