package proyecto.orgmedi.service;

import proyecto.orgmedi.dominio.Usuario;
import proyecto.orgmedi.repo.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import proyecto.orgmedi.error.NotFoundException;
import proyecto.orgmedi.error.ConflictException;
import proyecto.orgmedi.error.BadRequestException;

import java.util.List;
import java.util.Optional;

/**
 * Servicio UsuarioService - Gestión de usuarios del sistema
 * 
 * PROPÓSITO: Centralizar la lógica de negocio para operaciones con usuarios.
 * Este servicio actúa como intermediario entre los controladores (que reciben peticiones HTTP)
 * y la base de datos (a través del UsuarioRepository).
 * 
 * RESPONSABILIDADES:
 * - Crear nuevos usuarios (con validaciones)
 * - Buscar usuarios (por ID, por correo, etc.)
 * - Actualizar información de usuarios
 * - Eliminar usuarios
 * - Validar que correos sean únicos
 * - Manejar errores y excepciones personalizadas
 * 
 * PATRÓN: Service Layer - Separación de responsabilidades
 * La lógica está aquí, no en los controladores
 */
@Service // Anotación de Spring que marca esto como servicio reutilizable
@SuppressWarnings("null") // Suprime advertencias sobre valores null
public class UsuarioService implements IUsuarioService {
    
    // ============ ATRIBUTOS =============
    
    /**
     * Dependencia inyectada: UsuarioRepository
     * Se utiliza para acceder a datos en la BD (buscar, guardar, eliminar)
     */
    private final UsuarioRepository usuarioRepository;

    /**
     * Constructor con inyección de dependencia
     * Spring automáticamente proporciona una instancia de UsuarioRepository
     */
    @Autowired
    public UsuarioService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    // ============ MÉTODOS DE BÚSQUEDA =============
    
    /**
     * Obtiene TODOS los usuarios del sistema
     * 
     * RETORNO: Lista con todos los usuarios (puede estar vacía)
     * EXCEPCIONES: Ninguna
     */
    public List<Usuario> findAll() {
        return usuarioRepository.findAll();
    }

    /**
     * Busca un usuario por su ID (de forma opcional)
     * 
     * PARÁMETRO: id - El ID del usuario a buscar
     * RETORNO: Optional<Usuario>
     *   - Si existe: Optional.of(usuario)
     *   - Si no existe: Optional.empty()
     * 
     * USO: usuario.ifPresent(...) o usuario.orElse(null)
     */
    public Optional<Usuario> findById(Long id) {
        return usuarioRepository.findById(id);
    }

    /**
     * Busca un usuario por ID, pero LANZA EXCEPCIÓN si no existe
     * 
     * PARÁMETRO: id - El ID del usuario a buscar
     * RETORNO: Usuario (el usuario encontrado)
     * EXCEPCIÓN: NotFoundException si no existe un usuario con ese ID
     * 
     * VENTAJA: No hay que checar Optional, si no existe lanza error automáticamente
     */
    public Usuario getByIdOrThrow(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));
    }

    /**
     * Busca un usuario por su correo electrónico
     * 
     * PARÁMETRO: correo - El email a buscar
     * RETORNO: Optional<Usuario>
     *   - Si existe: Optional.of(usuario)
     *   - Si no existe: Optional.empty()
     */
    public Optional<Usuario> findByCorreo(String correo) {
        return usuarioRepository.findByCorreo(correo);
    }

    // ============ MÉTODOS DE CREACIÓN =============
    
    /**
     * Crea un nuevo usuario con validaciones
     * 
     * PROCEDIMIENTO:
     * 1. Valida que el correo no esté vacío
     * 2. Valida que el correo no exista ya en la BD (único)
     * 3. Si pasa validaciones, guarda en BD
     * 
     * PARÁMETRO: usuario - El usuario a crear
     * RETORNO: Usuario creado (con ID generado por BD)
     * EXCEPCIONES:
     *   - BadRequestException: si correo es null o vacío
     *   - ConflictException: si el correo ya está registrado
     * 
     * EJEMPLO:
     * Usuario nuevo = new Usuario();
     * nuevo.setCorreo("juan@example.com");
     * nuevo.setUsuario("juan");
     * nuevo.setContrasena("$2a$10$...");  // ya hasheada
     * usuarioService.createUsuario(nuevo);  // OK
     */
    public Usuario createUsuario(Usuario usuario) {
        // Validar correo no esté vacío
        if (usuario.getCorreo() == null || usuario.getCorreo().isBlank()) {
            throw new BadRequestException("Correo inválido");
        }
        
        // Validar que el correo sea único (no exista ya)
        if (usuarioRepository.existsByCorreo(usuario.getCorreo())) {
            throw new ConflictException("Correo ya registrado");
        }
        
        // Si pasa validaciones, guardar en BD
        return usuarioRepository.save(usuario);
    }

    /**
     * Guarda un usuario en la BD (puede ser nuevo o actualizado)
     * SIN validaciones adicionales (válido para actualizaciones internas)
     * 
     * PARÁMETRO: usuario - El usuario a guardar
     * RETORNO: Usuario guardado
     */
    public Usuario save(Usuario usuario) {
        return usuarioRepository.save(usuario);
    }

    // ============ MÉTODOS DE ACTUALIZACIÓN =============
    
    /**
     * Actualiza información de un usuario existente
     * 
     * PROCEDIMIENTO:
     * 1. Busca el usuario existente por ID (lanza error si no existe)
     * 2. Solo actualiza campos que no estén vacíos/null
     * 3. Guarda cambios en BD
     * 
     * PARÁMETROS:
     *   - id: ID del usuario a actualizar
     *   - usuario: Objeto con nuevos datos
     * 
     * RETORNO: Usuario actualizado
     * EXCEPCIÓN: NotFoundException si no existe usuario con ese ID
     * 
     * NOTA: Solo actualiza usuarios, correo y contraseña si se proporcionan
     * Campos vacíos/null se ignoran (para evitar sobrescribir con valores basura)
     */
    public Usuario updateUsuario(Long id, Usuario usuario) {
        // Buscar usuario existente (lanza error si no existe)
        Usuario existing = usuarioRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));
        
        // Solo actualizar campos que NO estén vacíos (evita sobrescribir accidentalmente)
        if (usuario.getUsuario() != null && !usuario.getUsuario().isBlank()) {
            existing.setUsuario(usuario.getUsuario());
        }
        if (usuario.getCorreo() != null && !usuario.getCorreo().isBlank()) {
            existing.setCorreo(usuario.getCorreo());
        }
        if (usuario.getContrasena() != null && !usuario.getContrasena().isBlank()) {
            existing.setContrasena(usuario.getContrasena());
        }
        
        // Guardar cambios en BD
        return usuarioRepository.save(existing);
    }

    // ============ MÉTODOS DE ELIMINACIÓN =============
    
    /**
     * Elimina un usuario por su ID (sin validación)
     * NOTA: No valida si existe, solo intenta eliminar
     * 
     * PARÁMETRO: id - ID del usuario a eliminar
     */
    public void deleteById(Long id) {
        usuarioRepository.deleteById(id);
    }

    /**
     * Elimina un usuario por su ID (con validación)
     * 
     * PROCEDIMIENTO:
     * 1. Valida que existe usuario con ese ID
     * 2. Si existe, lo elimina
     * 
     * PARÁMETRO: id - ID del usuario a eliminar
     * EXCEPCIÓN: NotFoundException si no existe
     */
    public void deleteByIdOrThrow(Long id) {
        if (usuarioRepository.findById(id).isEmpty()) {
            throw new NotFoundException("Usuario no encontrado");
        }
        usuarioRepository.deleteById(id);
    }

    // ============ MÉTODOS DE VALIDACIÓN =============
    
    /**
     * Comprueba si existe un usuario con un correo específico
     * 
     * PARÁMETRO: correo - Email a buscar
     * RETORNO: true si existe, false si no
     */
    public boolean existsByCorreo(String correo) {
        return usuarioRepository.existsByCorreo(correo);
    }

    /**
     * Implementación de la interfaz IUsuarioService
     * Mismo que existsByCorreo()
     */
    @Override
    public boolean usuarioExistePorCorreo(String correo) {
        return existsByCorreo(correo);
    }
    
    /**
     * Implementación de la interfaz IUsuarioService
     * Mismo que deleteByIdOrThrow()
     */
    @Override
    public void deleteUsuario(Long id) {
        deleteByIdOrThrow(id);
    }
}
