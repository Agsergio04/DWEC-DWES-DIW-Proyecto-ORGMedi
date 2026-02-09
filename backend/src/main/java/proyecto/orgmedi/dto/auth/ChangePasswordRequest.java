package proyecto.orgmedi.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * ChangePasswordRequest - DTO para cambiar contraseña
 * 
 * PROPÓSITO: Permitir al usuario autenticado cambiar su contraseña
 * 
 * FLUJO DE CAMBIO DE CONTRASEÑA:
 * 1. Usuario hace POST /api/auth/change-password con request body
 * 2. Controlador verifica que contrasenaActual sea correcta
 * 3. Si coincide → actualiza con contrasenanueva
 * 4. Se rehashea con BCrypt
 * 5. Se guarda en BD
 * 6. Response 200 OK - Cambio exitoso
 * 
 * SEGURIDAD:
 * - Requiere VERIFICACIÓN de contraseña actual (no se puede cambiar sin saberla)
 * - Nueva contraseña se hashea ANTES de guardar
 * - El usuario debe estar AUTENTICADO (con JWT token válido)
 * 
 * EJEMPLO JSON:
 * {
 *   "correoActual": "juan@example.com",
 *   "contrasenaActual": "MiPassword123!",
 *   "contrasenanueva": "NuevaPassword456!"
 * }
 */
public class ChangePasswordRequest {
    /**
     * CORREO ACTUAL - Para identificar al usuario (debe coincidir con JWT)
     */
    @NotBlank(message = "El correo es obligatorio")
    @Email(message = "El correo debe tener un formato válido")
    private String correoActual;

    /**
     * CONTRASEÑA ACTUAL - Verificación de identidad
     * 
     * VALIDACIÓN:
     * - Se compara con BCrypt hash en BD
     * - Si NO coincide → 401 Unauthorized
     * - Esto previene que alguien cambie contraseña si roba el dispositivo
     */
    @NotBlank(message = "La contraseña actual es obligatoria")
    private String contrasenaActual;

    /**
     * CONTRASEÑA NUEVA - La nueva contraseña deseada
     * 
     * VALIDACIóN:
     * - Mínimo 8 caracteres
     * - Se recomienda mayor complejidad en producción
     * 
     * PROCESAMIENTO:
     * - Se hashea con BCrypt
     * - Se guarda el hash, NO la contraseña
     */
    @NotBlank(message = "La nueva contraseña es obligatoria")
    @Size(min = 8, message = "La nueva contraseña debe tener al menos 8 caracteres")
    private String contrasenanueva;

    public String getCorreoActual() { return correoActual; }
    public void setCorreoActual(String correoActual) { this.correoActual = correoActual; }
    
    public String getContrasenaActual() { return contrasenaActual; }
    public void setContrasenaActual(String contrasenaActual) { this.contrasenaActual = contrasenaActual; }
    
    public String getContrasenanueva() { return contrasenanueva; }
    public void setContrasenanueva(String contrasenanueva) { this.contrasenanueva = contrasenanueva; }
}
