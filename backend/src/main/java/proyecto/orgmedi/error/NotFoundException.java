package proyecto.orgmedi.error;

import org.springframework.http.HttpStatus;

/**
 * NotFoundException - Error 404 (Not Found)
 * 
 * QUÉ SIGNIFICA: El recurso solicitado no existe en la BD
 * HTTP STATUS: 404 Not Found
 * 
 * CUÁNDO USARLA:
 * - Usuario no existe
 * - Medicamento no existe
 * - Recurso fue eliminado
 * - ID proporcionado no corresponde a nada
 * 
 * EJEMPLOS DE USO:
 * public Usuario getByIdOrThrow(Long id) {
 *     return usuarioRepository.findById(id)
 *         .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));
 * }
 * 
 * RESPUESTA AL CLIENTE:
 * HTTP 404
 * {
 *   "error": "Usuario no encontrado",
 *   "status": 404
 * }
 */
public class NotFoundException extends ApiException {
    public NotFoundException(String message) {
        super(message, HttpStatus.NOT_FOUND);
    }
}

