package proyecto.orgmedi.error;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;
import proyecto.orgmedi.controller.UsuarioController;
import proyecto.orgmedi.service.UsuarioService;
import org.springframework.http.MediaType;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import proyecto.orgmedi.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.mockito.Mockito.when;
import static org.mockito.ArgumentMatchers.anyLong;

@WebMvcTest(controllers = UsuarioController.class)
@AutoConfigureMockMvc(addFilters = false)
public class GlobalExceptionHandlerTest {
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

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UsuarioService usuarioService;

    @Test
    void notFoundIsMappedToJson() throws Exception {
        when(usuarioService.getByIdOrThrow(anyLong())).thenThrow(new NotFoundException("Usuario no encontrado"));

        mockMvc.perform(MockMvcRequestBuilders.get("/api/usuarios/1")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(MockMvcResultMatchers.status().isNotFound())
                .andExpect(MockMvcResultMatchers.jsonPath("$.error").value("Usuario no encontrado"));
    }
}
