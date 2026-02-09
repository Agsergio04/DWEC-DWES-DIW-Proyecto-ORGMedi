package proyecto.orgmedi.controller;

import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.mock.mockito.MockBean;
import proyecto.orgmedi.repo.UsuarioRepository;
import proyecto.orgmedi.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
public class AuthControllerIntegrationTest {
    @MockBean
    private UsuarioRepository usuarioRepository;
    @MockBean
    private JwtUtil jwtUtil;
    @MockBean
    private PasswordEncoder passwordEncoder;

    // ...resto del código del test...
}
