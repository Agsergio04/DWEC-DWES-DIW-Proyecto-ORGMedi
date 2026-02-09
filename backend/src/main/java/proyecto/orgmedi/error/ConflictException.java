package proyecto.orgmedi.error;

import org.springframework.http.HttpStatus;

/**
 * ConflictException - Error 409 (Conflict)
 * 
 * QUÉ SIGNIFICA: Hay un conflicto con el estado actual del recurso
 * HTTP STATUS: 409 Conflict
 * 
 * CUÁNDO USARLA:
 * - Correo ya registrado
 * - Duplicación de datos únicos (UNIQUE constraints)
 * - Intento de crear algo que ya existe
 * 
 * EJEMPLOS DE USO:
 * if (usuarioRepository.existsByCorreo(usuario.getCorreo())) {
 *     throw new ConflictException("Ese correo ya está registrado");
 * }
 * 
 * RESPUESTA AL CLIENTE:
 * HTTP 409
 * {
 *   "error": "Ese correo ya está registrado",
 *   "status": 409
 * }
 */
public class ConflictException extends ApiException {
    public ConflictException(String message) {
        super(message, HttpStatus.CONFLICT);
    }
}

