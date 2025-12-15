package proyecto.orgmedi.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import proyecto.orgmedi.dominio.Usuario;

import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByCorreo(String correo);
    boolean existsByCorreo(String correo);
}
