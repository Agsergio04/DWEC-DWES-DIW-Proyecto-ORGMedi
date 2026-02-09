package proyecto.orgmedi.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import proyecto.orgmedi.dominio.Usuario;
import proyecto.orgmedi.repo.UsuarioRepository;
import proyecto.orgmedi.error.UnauthorizedException;

/**
 * SecurityUtil - UTILIDAD PARA OBTENER EL USUARIO AUTENTICADO
 * 
 * QUÉ PROBLEMA RESUELVE:
 * - Cuando un servlet/controlador necesita saber quién es el usuario autenticado
 * - "Dame el usuario que hizo este request"
 * - Es información que necesitamos constantemente
 * 
 * QUÉ ES SecurityContextHolder:
 * - Sistema global de Spring Security
 * - Almacena la autenticación del usuario actual
 * - HILO-LOCAL: cada hilo HTTP tiene su propia autenticación
 * - Flujo actual: JwtRequestFilter guarda Authentication → SecurityContextHolder
 * - Esta clase la LEE desde SecurityContextHolder
 * 
 * FLUJO COMPLETO:
 * 
 * 1. REQUEST LLEGA
 * 2. JwtRequestFilter valida JWT
 * 3. JwtRequestFilter GUARDA en SecurityContextHolder:
 *    Authentication auth = new UsernamePasswordAuthenticationToken(..., correo)
 *    SecurityContextHolder.getContext().setAuthentication(auth)
 * 4. El request llega al controlador
 * 5. Controlador llama SecurityUtil.getCurrentUserEmail()
 * 6. SecurityUtil LEE desde SecurityContextHolder.getContext().getAuthentication()
 * 7. Se obtiene correo = "juan@example.com"
 * 
 * IMPORTANTE:
 * - NO es static: es una clase utilidad
 * - Métodos estáticos (static) para llamar sin instancia
 * - Spring NO lo instancia como @Service
 * - Se usa directamente: SecurityUtil.getCurrentUserEmail()
 */
public class SecurityUtil {
    
    /**
     * getCurrentUserEmail - OBTIENE EL CORREO DEL USUARIO AUTENTICADO
     * 
     * RETORNA: String con el correo (ej: "juan@example.com")
     * LANZA: UnauthorizedException si no hay usuario autenticado
     * 
     * CÓMO FUNCIONA:
     * 
     * 1. Obtiene Authentication desde SecurityContextHolder
     *    Authentication auth = SecurityContextHolder.getContext().getAuthentication()
     * 
     * 2. Verifica que no sea null y que esté autenticado
     *    if (authentication == null || !authentication.isAuthenticated())
     *        → Lanza excepción "Usuario no autenticado"
     * 
     * 3. El Object principal contiene el correo
     *    - JwtRequestFilter almacena el correo como principal
     *    - new UsernamePasswordAuthenticationToken(correo, password, roles)
     *    - getPrincipal() devuelve el correo
     * 
     * 4. Valida que principal sea un String (es el correo)
     *    if (principal instanceof String)
     *        → Retorna el String (correo del usuario)
     * 
     * 5. Si no es String, lanza excepción
     *    No debería pasar nunca si todo está bien configurado
     * 
     * USO EN CONTROLADOR:
     * 
     *    @PostMapping("/api/medicamentos")
     *    public ResponseEntity<?> crearMedicamento(@RequestBody MedicamentoDTO dto) {
     *        String correo = SecurityUtil.getCurrentUserEmail();  // "juan@example.com"
     *        Usuario usuario = usuarioRepository.findByCorreo(correo);
     *        // ... crear medicamento para este usuario
     *    }
     * 
     * CASOS DE ERROR:
     * - Si request no tiene JWT valido
     *   → JwtRequestFilter no llama a SecurityContextHolder.setAuthentication()
     *   → getAuthentication() retorna null
     *   → Lanza UnauthorizedException("Usuario no autenticado")
     *   → Frontend recibe 401 Unauthorized
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
     * getCurrentUser - OBTIENE LA ENTIDAD Usuario DESDE LA BASE DE DATOS
     * 
     * @param usuarioRepository: Inyeccin del repositorio de Usuario
     * @return: Entity Usuario con todos los datos (id, correo, nombre, contraseña, etc)
     * @throws UnauthorizedException: Si no hay usuario autenticado o no existe en BD
     * 
     * DIFERENCIA CON getCurrentUserEmail():
     * - getCurrentUserEmail() → Solo retorna String "juan@example.com"
     * - getCurrentUser() → Retorna la entity completa Usuario
     * 
     * FLUJO:
     * 
     * 1. Obtiene el correo del usuario autenticado
     *    String correo = getCurrentUserEmail()  // Puede lanzar UnauthorizedException
     * 
     * 2. Busca el usuario en la BD
     *    usuarioRepository.findByCorreo(correo)
     *    → Return Optional<Usuario>
     * 
     * 3. Si existe (Optional.of)
     *    → orElseThrow() retorna el Usuario
     * 
     * 4. Si no existe (Optional.empty)
     *    → orElseThrow() lanza exception
     *    → "UnauthorizedException: Usuario no encontrado"
     * 
     * QUÉ PODER TIENE EL OBJETO RETORNADO:
     * 
     * Usuario usuario = SecurityUtil.getCurrentUser(usuarioRepository);
     * 
     * Ahora tengo acceso a:
     * - usuario.getId()            // ID en BD
     * - usuario.getCorreo()        // Email
     * - usuario.getNombre()        // Nombre completo
     * - usuario.getPassword()      // Hash de contraseña (no usar directamente)
     * - usuario.getMedicamentos()  // Relación: List<Medicamento>
     * - usuario.getGestores()      // Relación: List<GestorMedicamentos>
     * 
     * USO EN SERVICE:
     * 
     *    @PostMapping("/api/medicamentos")
     *    public ResponseEntity<?> crearMedicamento(
     *        @RequestBody MedicamentoDTO dto,
     *        UsuarioRepository usuarioRepo) {
     *        
     *        Usuario usuario = SecurityUtil.getCurrentUser(usuarioRepo);
     *        
     *        Medicamento med = new Medicamento();
     *        med.setNombre(dto.getNombre());
     *        med.setUsuario(usuario);  // Asigna el usuario autenticado
     *        
     *        medicamentoRepository.save(med);
     *        
     *        return ResponseEntity.ok(med);
     *    }
     * 
     * CASOS DE ERROR:
     * 1. Sin JWT: UnauthorizedException (de getCurrentUserEmail)
     * 2. BD inconsistente: UnauthorizedException "Usuario no encontrado"
     *    (El JWT es valido pero el usuario no existe en BD - raro)
     */
    public static Usuario getCurrentUser(UsuarioRepository usuarioRepository) {
        String correo = getCurrentUserEmail();
        return usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new UnauthorizedException("Usuario no encontrado"));
    }
}
