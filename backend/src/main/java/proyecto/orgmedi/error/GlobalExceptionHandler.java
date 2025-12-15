package proyecto.orgmedi.error;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import proyecto.orgmedi.dto.ApiErrorResponse;

/**
 * Maneja las excepciones del paquete de errores y convierte a respuestas HTTP con cuerpo JSON.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {
    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ApiErrorResponse> handleApiException(ApiException ex) {
        logger.warn("API exception: {} - {}", ex.getStatus(), ex.getMessage());
        ApiErrorResponse body = new ApiErrorResponse(ex.getMessage());
        return ResponseEntity.status(ex.getStatus()).body(body);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleUnexpected(Exception ex) {
        logger.error("Unexpected exception", ex);
        ApiErrorResponse body = new ApiErrorResponse("Error interno del servidor");
        return ResponseEntity.status(500).body(body);
    }
}
