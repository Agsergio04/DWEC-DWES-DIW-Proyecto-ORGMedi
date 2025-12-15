package proyecto.orgmedi.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import proyecto.orgmedi.dominio.Usuario;
import proyecto.orgmedi.error.ConflictException;
import proyecto.orgmedi.error.NotFoundException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UsuarioServiceTest {

    @Mock
    private proyecto.orgmedi.repo.UsuarioRepository usuarioRepository;

    @InjectMocks
    private UsuarioService usuarioService;

    @Test
    void createUsuario_success() {
        Usuario u = new Usuario();
        u.setCorreo("test@example.com");
        when(usuarioRepository.existsByCorreo(u.getCorreo())).thenReturn(false);
        when(usuarioRepository.save(u)).thenReturn(u);

        Usuario saved = usuarioService.createUsuario(u);
        assertNotNull(saved);
        assertEquals("test@example.com", saved.getCorreo());
        verify(usuarioRepository).save(u);
    }

    @Test
    void createUsuario_conflict() {
        Usuario u = new Usuario();
        u.setCorreo("dup@example.com");
        when(usuarioRepository.existsByCorreo(u.getCorreo())).thenReturn(true);

        assertThrows(ConflictException.class, () -> usuarioService.createUsuario(u));
        verify(usuarioRepository, never()).save(any());
    }

    @Test
    void getByIdOrThrow_notFound() {
        when(usuarioRepository.findById(1L)).thenReturn(Optional.empty());
        assertThrows(NotFoundException.class, () -> usuarioService.getByIdOrThrow(1L));
    }

    @Test
    void updateUsuario_notFound() {
        Usuario u = new Usuario();
        when(usuarioRepository.findById(5L)).thenReturn(Optional.empty());
        assertThrows(NotFoundException.class, () -> usuarioService.updateUsuario(5L, u));
    }

    @Test
    void deleteByIdOrThrow_notFound() {
        when(usuarioRepository.findById(9L)).thenReturn(Optional.empty());
        assertThrows(NotFoundException.class, () -> usuarioService.deleteByIdOrThrow(9L));
    }

    @Test
    void deleteByIdOrThrow_success() {
        Usuario u = new Usuario();
        u.setId(3L);
        when(usuarioRepository.findById(3L)).thenReturn(Optional.of(u));

        assertDoesNotThrow(() -> usuarioService.deleteByIdOrThrow(3L));
        verify(usuarioRepository).deleteById(3L);
    }
}
