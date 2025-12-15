package proyecto.orgmedi.error;

import org.springframework.http.HttpStatus;

/**
 * Base runtime exception for API errors. Carries an HTTP status to be used by the handler.
 */
public abstract class ApiException extends RuntimeException {
    private final HttpStatus status;

    protected ApiException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }

    protected ApiException(String message, Throwable cause, HttpStatus status) {
        super(message, cause);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}

