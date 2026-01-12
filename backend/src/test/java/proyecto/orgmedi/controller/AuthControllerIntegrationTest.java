package proyecto.orgmedi.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;
import proyecto.orgmedi.repo.UsuarioRepository;
import proyecto.orgmedi.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
public class AuthControllerIntegrationTest {
    @Autowired
    private MockMvc mockMvc;
    @MockBean
    private UsuarioRepository usuarioRepository;
    @MockBean
    private JwtUtil jwtUtil;
    @MockBean
    private PasswordEncoder passwordEncoder;
    @Autowired
    private ObjectMapper objectMapper;

    // ...resto del código del test...
}
