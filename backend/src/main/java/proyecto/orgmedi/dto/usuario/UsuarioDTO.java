package proyecto.orgmedi.dto.usuario;

import lombok.*;

/**
 * UsuarioDTO - DTO para transferir datos básicos del usuario
 * 
 * PROPÓSITO: Devolver información del usuario sin datos sensibles
 * 
 * DIFERENCIA vs Usuario Entity:
 * - Entity Usuario: Tiene contraseña, GestorMedicamentos, etc (dato completo)
 * - UsuarioDTO: Solo datos públicos (id, correo, usuario) SIN contraseña
 * 
 * SEGURIDAD:
 * - NUNCA se devuelve la contraseña al cliente
 * - NUNCA se devuelve la contraseña en respuestas HTTP
 * - Solo se usa internamente para autenticación
 * 
 * USO:
 * 1. GET /api/usuarios/{id} → Retorna UsuarioDTO
 * 2. GET /api/auth/me → Retorna UsuarioDTO del usuario autenticado
 * 3. GET /api/usuarios (listar todos) → Lista[UsuarioDTO]
 * 
 * CICLO DE CONVERSIÓN:
 * - BD (Usuario Entity) → UsuarioDTO → JSON Response
 * - Responsabilidad: UsuarioService.toDto(usuario) hace la conversión
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UsuarioDTO {
    /**
     * ID - Identificador único del usuario en BD
     */
    private Long id;
    
    /**
     * CORREO - Email del usuario
     * - Es el identificador principal
     * - Debe ser Único en el sistema
     * - Usado para login o recuperación de contraseña
     */
    private String correo;
    
    /**
     * USUARIO - Nombre de usuario para mostrar
     * - Display name del usuario
     * - Used in UI para identificar al usuario
     * - Ejemplo: "Juan Pérez", "Dr. Juan"  
     */
    private String usuario;
}

