package proyecto.orgmedi.error;

import org.springframework.http.HttpStatus;

/**
 * Excepción para datos OCR inválidos o no recuperables
 */
public class InvalidOcrDataException extends ApiException {
    public InvalidOcrDataException(String message) {
        super(message, HttpStatus.BAD_REQUEST);
    }

    public InvalidOcrDataException(String message, Throwable cause) {
        super(message, cause, HttpStatus.BAD_REQUEST);
    }
}

