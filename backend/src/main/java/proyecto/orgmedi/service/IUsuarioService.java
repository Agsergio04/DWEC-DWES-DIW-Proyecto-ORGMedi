package proyecto.orgmedi.service;

import proyecto.orgmedi.dominio.Usuario;

import java.util.List;
import java.util.Optional;

/**
 * Interfaz para servicio de gestión de usuarios
 * Cumple con Interface Segregation Principle (ISP)
 */
public interface IUsuarioService {
    
    List<Usuario> findAll();
    
    Optional<Usuario> findById(Long id);
    
    Usuario getByIdOrThrow(Long id);
    
    Optional<Usuario> findByCorreo(String correo);
    
    Usuario createUsuario(Usuario usuario);
    
    Usuario updateUsuario(Long id, Usuario usuario);
    
    void deleteUsuario(Long id);
    
    boolean usuarioExistePorCorreo(String correo);
}
