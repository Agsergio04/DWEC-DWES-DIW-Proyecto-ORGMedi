package proyecto.orgmedi.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Bean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.beans.factory.annotation.Autowired;
import proyecto.orgmedi.dto.auth.AuthRequest;
import proyecto.orgmedi.dominio.Usuario;
import proyecto.orgmedi.repo.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import proyecto.orgmedi.security.JwtUtil;

import java.util.Optional;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
public class AuthControllerRehashTest {
    @Autowired
    private MockMvc mockMvc;
    @MockBean
    private UsuarioRepository usuarioRepository;
    @MockBean
    private PasswordEncoder passwordEncoder;
    @Autowired
    private ObjectMapper objectMapper;

    @TestConfiguration
    static class JwtUtilTestConfig {
        @Bean
        public JwtUtil jwtUtil() {
            return org.mockito.Mockito.mock(JwtUtil.class);
        }
        @Bean
        public PasswordEncoder passwordEncoder() {
            return org.mockito.Mockito.mock(PasswordEncoder.class);
        }
    }

    @Test
    void rehashPassword_whenValidRequest_returnsOk() throws Exception {
        AuthRequest request = new AuthRequest();
        request.setCorreo("test@mail.com");
        request.setContrasena("oldpass");
        Usuario usuario = Usuario.builder().correo("test@mail.com").contrasena("oldpass").build();
        when(usuarioRepository.findByCorreo("test@mail.com")).thenReturn(Optional.of(usuario));
        when(passwordEncoder.encode("oldpass")).thenReturn("hashedoldpass");
        Usuario usuarioHasheado = Usuario.builder().correo("test@mail.com").contrasena("hashedoldpass").build();
        when(usuarioRepository.save(any(Usuario.class))).thenReturn(usuarioHasheado);
        mockMvc.perform(post("/api/auth/rehash")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }
}
