package proyecto.orgmedi.error;

import org.springframework.http.HttpStatus;

/**
 * InternalServerErrorException - Error 500 (Internal Server Error)
 * 
 * QUÉ SIGNIFICA: Error no previsto en el servidor
 * HTTP STATUS: 500 Internal Server Error
 * 
 * CUÁNDO USARLA:
 * - Errores de BD inesperados
 * - Excepciones no capturadas
 * - Fallos de lógica interna
 * - Problemas de recursos del servidor
 * 
 * EJEMPLO:
 * try {
 *     // operación que puede fallar
 * } catch (SQLException e) {
 *     throw new InternalServerErrorException("Error al acceder a base de datos");
 * }
 * 
 * RESPUESTA AL CLIENTE:
 * HTTP 500
 * {
 *   "error": "Error al acceder a base de datos",
 *   "status": 500
 * }
 */
public class InternalServerErrorException extends ApiException {
    public InternalServerErrorException(String message) {
        super(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}

