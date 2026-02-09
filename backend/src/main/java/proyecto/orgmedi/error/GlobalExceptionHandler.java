package proyecto.orgmedi.error;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import proyecto.orgmedi.dto.ApiErrorResponse;

/**
 * GlobalExceptionHandler - MANEJADOR GLOBAL DE EXCEPCIONES
 * 
 * PROPOSITO: Capturar todas las excepciones lanzadas y convertirlas a respuestas HTTP JSON
 * 
 * @RestControllerAdvice:
 * - Anotacion de Spring que marca esta clase como manejadora global
 * - Se aplica a TODOS los Controllers de la aplicacion
 * - Evita try-catch en cada endpoint
 * 
 * FLUJO DE UNA EXCEPCION:
 * 1. Controlador lanza excepcion (ej: BadRequestException)
 * 2. Spring intercepta
 * 3. Busca @ExceptionHandler que maneje ese tipo
 * 4. GlobalExceptionHandler.handleApiException() procesa
 * 5. Retorna ResponseEntity<JSON> con status HTTP correcto
 * 6. Cliente recibe error formateado
 * 
 * EJEMPLO:
 * POST /api/medicamentos con datos invalidos
 *   → BadRequestException lanzada
 *   → handleApiException() captura
 *   → Retorna: HTTP 400 {"error": "Campo requerido"}
 */
@RestControllerAdvice
public class GlobalExceptionHandler {
    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /**
     * handleApiException - MANEJADOR PARA EXCEPCIONES API PERSONALIZADAS
     * 
     * PARAMETRO: ex - La excepcion de API lanzada (BadRequest, NotFound, etc.)
     * RETORNO: ResponseEntity con cuerpo JSON de error
     * 
     * FLUJO:
     * 1. Recibe la excepcion (ej: BadRequestException)
     * 2. Extrae el mensaje y el HTTP status
     * 3. Crea objeto ApiErrorResponse con el mensaje
     * 4. Retorna ResponseEntity con el status HTTP correcto
     * 
     * EJEMPLOS DE EXCEPCIONES MANEJADAS:
     * - BadRequestException → HTTP 400
     * - NotFoundException → HTTP 404
     * - UnauthorizedException → HTTP 401
     * - ConflictException → HTTP 409
     * - InternalServerErrorException → HTTP 500
     * 
     * RESPUESTA FINAL:
     * {
     *   "error": "El mensaje de error desde la excepcion",
     *   "timestamp": "2026-02-09T20:00:00Z",
     *   "status": 400/404/401/409/500
     * }
     */
    @ExceptionHandler(ApiException.class)
    @SuppressWarnings("null")
    public ResponseEntity<ApiErrorResponse> handleApiException(ApiException ex) {
        logger.warn("API exception: {} - {}", ex.getStatus(), ex.getMessage());
        ApiErrorResponse body = new ApiErrorResponse(ex.getMessage());
        return ResponseEntity.status(ex.getStatus()).body(body);
    }

    /**
     * handleUnexpected - MANEJADOR PARA EXCEPCIONES INESPERADAS
     * 
     * PROPOSITO: Capturar excepciones que NO son ApiException
     * (errores no anticipados del servidor)
     * 
     * PARAMETRO: ex - Cualquier excepcion no manejada
     * RETORNO: ResponseEntity con HTTP 500 (error interno servidor)
     * 
     * CASOS:
     * - NullPointerException
     * - SQLException inesperada
     * - IOException
     * - Cualquier RuntimeException no capturada
     * 
     * RESPUESTA FINAL:
     * HTTP 500
     * {
     *   "error": "Error interno del servidor",
     *   "timestamp": "2026-02-09T20:00:00Z",
     *   "status": 500
     * }
     * 
     * NOTA: Se registra el stack trace completo en logs del servidor
     * para debugging
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleUnexpected(Exception ex) {
        logger.error("Unexpected exception", ex);
        ApiErrorResponse body = new ApiErrorResponse("Error interno del servidor");
        return ResponseEntity.status(500).body(body);
    }
}
