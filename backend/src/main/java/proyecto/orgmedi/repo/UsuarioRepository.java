package proyecto.orgmedi.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import proyecto.orgmedi.dominio.Usuario;

import java.util.Optional;

/**
 * UsuarioRepository - Repositorio para acceder a datos de Usuarios
 * 
 * PROPÓSITO: Interfaz Spring Data JPA que proporciona operaciones CRUD para Usuario
 * 
 * EXTENSIÓN: Extends JpaRepository<Usuario, Long>
 * - Usuario = Entity a gestionar
 * - Long = Tipo de la clave primaria (id)
 * 
 * MÉTODOS HEREDADOS (automáticos de JpaRepository):
 * - save(usuario) - Guardar/actualizar
 * - findById(id) - Buscar por ID
 * - findAll() - Obtener todos
 * - delete(usuario) - Eliminar
 * - deleteById(id) - Eliminar por ID
 * - count() - Contar usuarios
 * - existsById(id) - Verificar existencia por ID
 * 
 * MÉTODOS CUSTOMIZADOS:
 * Los métodos siguientes se generan automáticamente según convención Spring Data:
 * - findByCorreo() - Buscar por email (campo UNIQUE)
 * - findByUsuario() - Buscar por nombre de usuario
 * - existsByCorreo() - Verificar si correo ya existe
 * 
 * GENERACIÓN DE MÉTODOS:
 * Spring Data analiza el nombre del método y genera automáticamente:
 * findBy<Campo> → WHERE <campo> = ?
 * existsBy<Campo> → SELECT COUNT(*) FROM Usuario WHERE <campo> = ?
 * 
 * USO EN SERVICIOS:
 * @Autowired
 * private UsuarioRepository usuarioRepository;
 * 
 * // Verificar que correo sea Único antes de registrar
 * if (usuarioRepository.existsByCorreo(correo)) {
 *   throw new ConflictException("Email ya registrado");
 * }
 * 
 * // Buscar usuario para login
 * Usuario usuario = usuarioRepository.findByUsuario(username)
 *   .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));
 * 
 * // Verificar email Único
 * Optional<Usuario> existe = usuarioRepository.findByCorreo(email);
 */
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    /**
     * Buscar usuario por CORREO (email)
     * 
     * PATRÓN: findBy<Campo>
     * Spring Data genera automáticamente el SQL:
     * SELECT * FROM usuario WHERE correo = ?
     * 
     * RETORNO: Optional<Usuario>
     * - Si encuentra: Optional con el usuario
     * - Si NO encuentra: Optional vacío
     * 
     * VALIDACIÓN IMPORTANTE:
     * El correo es UNIQUE en la BD, por lo que:
     * - Siempre retorna 0 o 1 resultado
     * - ÚSELO para verificar antes de registrar
     * 
     * EJEMPLO:
     * usuarioRepository.findByCorreo("juan@example.com")
     *   .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));
     * 
     * @param correo Email a buscar
     * @return Optional con el usuario si existe
     */
    Optional<Usuario> findByCorreo(String correo);
    
    /**
     * Buscar usuario por NOMBRE DE USUARIO
     * 
     * PATRÓN: findBy<Campo>
     * SQL generado: SELECT * FROM usuario WHERE usuario = ?
     * 
     * RETORNO: Optional<Usuario>
     * 
     * USO:
     * - Login: Buscar usuario por nombre/usuario para autenticación
     * - Verificar disponibilidad de username
     * 
     * EJEMPLO:
     * Optional<Usuario> user = usuarioRepository.findByUsuario("juan.perez");
     * if (user.isPresent()) {
     *   // Validar contraseña
     * } else {
     *   throw new UnauthorizedException("Credenciales inválidas");
     * }
     * 
     * @param usuario Nombre de usuario a buscar
     * @return Optional con el usuario encontrado
     */
    Optional<Usuario> findByUsuario(String usuario);
    
    /**
     * Verificar si un CORREO ya existe en la BD
     * 
     * PATRÓN: existsBy<Campo>
     * SQL generado: SELECT COUNT(*) FROM usuario WHERE correo = ?
     * 
     * RETORNO: boolean
     * - true: El correo ya está registrado
     * - false: El correo está disponible
     * 
     * USO:
     * - VALIDAR durante REGISTRO: No permitir correos duplicados
     * - Mostrar error: "Este correo ya está registrado"
     * 
     * VENTAJA SOBRE findByCorreo():
     * - Más eficiente: Solo retorna un boolean
     * - No necesita cargar toda la entidad Usuario
     * - Es un COUNT(*), no un SELECT *
     * 
     * EJEMPLO:
     * if (usuarioRepository.existsByCorreo(correoBuscado)) {
     *   throw new ConflictException("El correo ya está registrado");
     * }
     * // Continuamos con registro
     * usuarioRepository.save(nuevoUsuario);
     * 
     * @param correo Email a verificar
     * @return true si ya existe, false si disponible
     */
    boolean existsByCorreo(String correo);
}
