package proyecto.orgmedi.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * RegisterRequest - DTO para REGISTRO de nuevos usuarios
 * 
 * PROPÓSITO: Transferir datos de registro desde el cliente al controlador
 * - Validar que los datos sean correctos
 * - Crear una nueva cuenta de usuario en el sistema
 * 
 * USO EN FLUJO:
 * 1. Frontend envía: POST /api/auth/register con JSON
 * 2. Controlador recibe RegisterRequest
 * 3. Se validan las restricciones (@Email, @Size, @NotBlank)
 * 4. AuthController crea nuevo Usuario en BD
 * 5. Se genera JWT token
 * 6. Retorna AuthResponse con el token
 * 
 * VALIDACIONES:
 * - correo: Debe ser email válido y ÚNICO en el sistema
 * - usuario: Entre 2 y 50 caracteres
 * - contraseña: Mínimo 8 caracteres (se recomienda mayor complejidad en producción)
 * 
 * EJEMPLO JSON:
 * {
 *   "correo": "juan@example.com",
 *   "usuario": "juanperez",
 *   "contrasena": "MiPassword123!"
 * }
 */
public class RegisterRequest {
    /**
     * CORREO - Email del usuario (principal identificador)
     * 
     * VALIDACIONES:
     * - Requerido (@NotBlank)
     * - Debe ser email válido (@Email)
     * - DEBE SER Único en el sistema (validado en AuthController)
     * 
     * USO: Identificar al usuario y para recuperación de contraseña
     */
    @NotBlank(message = "El correo es obligatorio")
    @Email(message = "El correo debe tener un formato válido")
    private String correo;

    /**
     * USUARIO - Nombre de usuario para login (display name)
     * 
     * VALIDACIONES:
     * - Requerido (@NotBlank)
     * - Entre 2 y 50 caracteres (@Size)
     * 
     * USO: Mostrar en UI, para identificación secundaria
     * Ejemplo: "juan.perez", "jp_medico", "Dr. Juan"
     */
    @NotBlank(message = "El usuario es obligatorio")
    @Size(min = 2, max = 50, message = "El usuario debe tener entre 2 y 50 caracteres")
    private String usuario;

    /**
     * CONTRASEÑA - Clave de acceso para autenticación
     * 
     * VALIDACIONES:
     * - Requerido (@NotBlank)
     * - Mínimo 8 caracteres (@Size)
     * 
     * SEGURIDAD:
     * - Se NUNCA se almacena en texto plano
     * - Se HASHEA con BCrypt antes de guardar en BD
     * - El hash se puede verificar pero no se puede desencriptar
     * 
     * USO: Autenticar usuario conjuntamente con usuario/correo
     */
    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres")
    private String contrasena;

    public String getCorreo() { return correo; }
    public void setCorreo(String correo) { this.correo = correo; }
    
    public String getUsuario() { return usuario; }
    public void setUsuario(String usuario) { this.usuario = usuario; }
    
    public String getContrasena() { return contrasena; }
    public void setContrasena(String contrasena) { this.contrasena = contrasena; }
}
