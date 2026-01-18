package proyecto.orgmedi.error;

import org.springframework.http.HttpStatus;

/**
 * Excepción para errores en el procesamiento OCR
 */
public class OcrProcessingException extends ApiException {
    public OcrProcessingException(String message) {
        super(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    public OcrProcessingException(String message, Throwable cause) {
        super(message, cause, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}

