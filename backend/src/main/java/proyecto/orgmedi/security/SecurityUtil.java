package proyecto.orgmedi.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import proyecto.orgmedi.dominio.Usuario;
import proyecto.orgmedi.repo.UsuarioRepository;
import proyecto.orgmedi.error.UnauthorizedException;

/**
 * Utilidad para obtener información del usuario autenticado desde el contexto de seguridad
 */
public class SecurityUtil {
    
    /**
     * Obtiene el correo del usuario autenticado
     */
    public static String getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new UnauthorizedException("Usuario no autenticado");
        }
        
        Object principal = authentication.getPrincipal();
        if (principal instanceof String) {
            return (String) principal;
        }
        
        throw new UnauthorizedException("No se pudo obtener el correo del usuario");
    }
    
    /**
     * Obtiene el usuario autenticado desde el repositorio
     */
    public static Usuario getCurrentUser(UsuarioRepository usuarioRepository) {
        String correo = getCurrentUserEmail();
        return usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new UnauthorizedException("Usuario no encontrado"));
    }
}
