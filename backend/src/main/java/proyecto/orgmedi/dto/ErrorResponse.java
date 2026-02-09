package proyecto.orgmedi.dto;

/**
 * ErrorResponse - DTO para respuestas de ERROR
 * 
 * PROPÓSITO: Devolver errores de forma estructurada al cliente
 * 
 * USO EN EXCEPTIONES:
 * - BadRequestException → ErrorResponse("Campo requerido", "BAD_REQUEST")
 * - NotFoundException → ErrorResponse("Usuario no encontrado", "NOT_FOUND")
 * - ConflictException → ErrorResponse("Email ya registrado", "CONFLICT")
 * - UnauthorizedException → ErrorResponse("Credenciales inválidas", "UNAUTHORIZED")
 * 
 * RESPUESTA HTTP:
 * HTTP 400 Bad Request
 * Content-Type: application/json
 * {
 *   "error": "El correo debe ser válido",
 *   "code": "INVALID_EMAIL"
 * }
 * 
 * USO EN FRONTEND:
 * - error: Mensaje para mostrar al usuario
 * - code: Código único para manejo según tipo (i18n, logging)
 */
public class ErrorResponse {
    private String error;
    private String code;

    public ErrorResponse() {}

    public ErrorResponse(String error) {
        this.error = error;
    }

    public ErrorResponse(String error, String code) {
        this.error = error;
        this.code = code;
    }

    public String getError() { return error; }
    public void setError(String error) { this.error = error; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
}

