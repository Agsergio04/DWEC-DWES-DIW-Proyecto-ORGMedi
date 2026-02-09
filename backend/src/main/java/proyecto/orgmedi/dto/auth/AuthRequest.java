package proyecto.orgmedi.dto.auth;

import jakarta.validation.constraints.NotBlank;

/**
 * AuthRequest - DTO para LOGIN / AUTENTICACIÓN
 * 
 * PROPÓSITO: Transferir credenciales de login del cliente al servidor
 * 
 * USO:
 * 1. POST /api/auth/login con JSON
 * 2. Controlador recibe AuthRequest
 * 3. Se valida contra BD usando PasswordEncoder
 * 4. Si es correcto → genera JWT token
 * 5. Retorna AuthResponse con el token JWT
 * 
 * JWT - JSON Web Token:
 * - Token criptográfico que permite al cliente autenticarse en requests posteriores
 * - Se envía en header: Authorization: Bearer <token>
 * - Contiene información del usuario codificada
 * - Expira después de cierto tiempo (configurado en JwtUtil)
 * 
 * FLUJO LOGIN:
 * 1. Cliente envía usuario + contraseña
 * 2. Servidor verifica con BCrypt hasheado en BD
 * 3. Si valida → crea JWT con JwtUtil
 * 4. Cliente guarda JWT en localStorage
 * 5. Cada request subsecuente envía JWT en header
 * 6. JwtAuthenticationFilter valida el JWT
 * 
 * DIFERENCIA vs RegisterRequest:
 * - RegisterRequest: Crear NUEVA cuenta
 * - AuthRequest: LOGIN en cuenta EXISTENTE
 */
public class AuthRequest {
    /**
     * USUARIO - Identificador de usuario para autenticarse
     * 
     * VALIDACIÓN: Requerido (@NotBlank)
     * 
     * NOTA: En la BD se usa 'usuario' field en la entidad Usuario
     * Es el nombre de usuario, NO el email (aunque se puede usar correo también)
     * 
     * Ejemplo: "juan.perez", "admin", "dr_garcia"
     */
    @NotBlank(message = "El usuario es obligatorio")
    private String usuario;

    /**
     * CONTRASEÑA - Clave de acceso
     * 
     * VALIDACIÓN: Requerido (@NotBlank)
     * 
     * SEGURIDAD:
     * - Se envía en texto plano en esta request (debe ser HTTPS en producción)
     * - Servidor la compara con BCrypt hash almacenado en BD
     * - NUNCA se almacena la contraseña en texto plano
     */
    @NotBlank(message = "La contraseña es obligatoria")
    private String contrasena;

    public String getUsuario() { return usuario; }
    public void setUsuario(String usuario) { this.usuario = usuario; }
    public String getContrasena() { return contrasena; }
    public void setContrasena(String contrasena) { this.contrasena = contrasena; }
}

