package proyecto.orgmedi.error;

import org.springframework.http.HttpStatus;

/**
 * UnauthorizedException - Error 401 (Unauthorized)
 * 
 * QUÉ SIGNIFICA: Autenticación fallida o usuario no identificado
 * HTTP STATUS: 401 Unauthorized
 * 
 * CUÁNDO USARLA:
 * - JWT inválido o expirado
 * - Usuario no autenticado
 * - Contraseña incorrecta
 * - Sesión expirada
 * 
 * EJEMPLOS DE USO:
 * String correo = SecurityUtil.getCurrentUserEmail();
 * // Si no hay JWT válido, lanza aquí:
 * // UnauthorizedException("Usuario no autenticado")
 * 
 * En JwtRequestFilter:
 * if (!jwtUtil.validateToken(token)) {
 *     throw new UnauthorizedException("Token inválido o expirado");
 * }
 * 
 * RESPUESTA AL CLIENTE:
 * HTTP 401
 * {
 *   "error": "Token inválido o expirado",
 *   "status": 401
 * }
 */
public class UnauthorizedException extends ApiException {
    public UnauthorizedException(String message) {
        super(message, HttpStatus.UNAUTHORIZED);
    }
}

