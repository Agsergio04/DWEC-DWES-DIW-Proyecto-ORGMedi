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

@Service
public class UsuarioService {
    private final UsuarioRepository usuarioRepository;

    @Autowired
    public UsuarioService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public List<Usuario> findAll() {
        return usuarioRepository.findAll();
    }

    public Optional<Usuario> findById(Long id) {
        return usuarioRepository.findById(id);
    }

    // Lanza NotFoundException si no existe
    public Usuario getByIdOrThrow(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));
    }

    public Optional<Usuario> findByCorreo(String correo) {
        return usuarioRepository.findByCorreo(correo);
    }

    // Crea un usuario o lanza ConflictException si el correo ya existe
    public Usuario createUsuario(Usuario usuario) {
        if (usuario.getCorreo() == null || usuario.getCorreo().isBlank()) {
            throw new BadRequestException("Correo inválido");
        }
        if (usuarioRepository.existsByCorreo(usuario.getCorreo())) {
            throw new ConflictException("Correo ya registrado");
        }
        return usuarioRepository.save(usuario);
    }

    public Usuario save(Usuario usuario) {
        return usuarioRepository.save(usuario);
    }

    // Actualiza o lanza NotFoundException
    public Usuario updateUsuario(Long id, Usuario usuario) {
        if (usuarioRepository.findById(id).isEmpty()) {
            throw new NotFoundException("Usuario no encontrado");
        }
        usuario.setId(id);
        return usuarioRepository.save(usuario);
    }

    public void deleteById(Long id) {
        usuarioRepository.deleteById(id);
    }

    public void deleteByIdOrThrow(Long id) {
        if (usuarioRepository.findById(id).isEmpty()) {
            throw new NotFoundException("Usuario no encontrado");
        }
        usuarioRepository.deleteById(id);
    }

    public boolean existsByCorreo(String correo) {
        return usuarioRepository.existsByCorreo(correo);
    }
}
