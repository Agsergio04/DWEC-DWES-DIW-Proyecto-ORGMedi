package proyecto.orgmedi.error;

import org.springframework.http.HttpStatus;

/**
 * BadRequestException - Error 400 (Bad Request)
 * 
 * QUÉ SIGNIFICA: El cliente envió una petición inválida
 * HTTP STATUS: 400 Bad Request
 * 
 * CUÁNDO USARLA:
 * - Datos inválidos o malformados
 * - Campos requeridos vacíos
 * - Validaciones fallidas en DTOs
 * - Formato incorrecto (ej: email sin @)
 * 
 * EJEMPLOS DE USO:
 * if (medicamento.getNombre() == null || medicamento.getNombre().isBlank()) {
 *     throw new BadRequestException("El nombre del medicamento es requerido");
 * }
 * 
 * RESPUESTA AL CLIENTE:
 * HTTP 400
 * {
 *   "error": "El nombre del medicamento es requerido",
 *   "status": 400
 * }
 */
public class BadRequestException extends ApiException {
    public BadRequestException(String message) {
        super(message, HttpStatus.BAD_REQUEST);
    }
}

