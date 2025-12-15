package proyecto.orgmedi.security;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class JwtUtilTest {

    @Autowired
    private JwtUtil jwtUtil;

    @Test
    void generateAndValidateToken() {
        String correo = "usuario@ejemplo.com";
        String token = jwtUtil.generateToken(correo);
        assertNotNull(token);

        assertTrue(jwtUtil.validateToken(token));
        String extracted = jwtUtil.extractCorreo(token);
        assertEquals(correo, extracted);
    }
}

