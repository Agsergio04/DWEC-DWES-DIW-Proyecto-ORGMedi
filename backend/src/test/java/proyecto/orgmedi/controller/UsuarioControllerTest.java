package proyecto.orgmedi.controller;

import proyecto.orgmedi.dominio.Usuario;
import proyecto.orgmedi.service.UsuarioService;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;
import org.junit.jupiter.api.extension.ExtendWith;

@ExtendWith(MockitoExtension.class)
class UsuarioControllerTest {
    @Mock
    private UsuarioService usuarioService;
    @InjectMocks
    private UsuarioController usuarioController;

    @Test
    void getUsuarioById_returnsUsuario() {
        Usuario usuario = Usuario.builder().id(1L).correo("test@mail.com").usuario("test").contrasena("1234").build();
        when(usuarioService.getByIdOrThrow(1L)).thenReturn(usuario);
        ResponseEntity<Usuario> response = usuarioController.getUsuarioById(1L);
        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getCorreo()).isEqualTo("test@mail.com");
    }
}

