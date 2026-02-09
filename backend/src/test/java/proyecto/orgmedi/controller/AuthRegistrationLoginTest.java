package proyecto.orgmedi.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

import proyecto.orgmedi.dto.auth.RegisterRequest;
import proyecto.orgmedi.dto.auth.AuthRequest;
import proyecto.orgmedi.repo.UsuarioRepository;

/**
 * Test de integración para verificar que:
 * 1. Un usuario se registra correctamente
 * 2. El usuario se guarda en la base de datos
 * 3. Se puede hacer login con las credenciales registradas
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@SuppressWarnings("null")
public class AuthRegistrationLoginTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    @Test
    public void testRegistroYLogin() throws Exception {
        // Datos para el registro
        RegisterRequest registerRequest = new RegisterRequest();
        registerRequest.setCorreo("usuario.integracion@test.com");
        registerRequest.setUsuario("usuariotest");
        registerRequest.setContrasena("password123");
        
        // 1. Hacer registro
        MvcResult registerResult = mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)))
            .andExpect(status().isCreated())  // 201
            .andExpect(jsonPath("$.token").isNotEmpty())
            .andReturn();
        
        System.out.println("✓ Registro exitoso - Status: 201");
        String registroToken = objectMapper.readTree(registerResult.getResponse().getContentAsString()).get("token").asText();
        System.out.println("  Token de registro: " + registroToken.substring(0, 50) + "...");
        
        // 2. Verificar que el usuario está en la base de datos
        var usuarioGuardado = usuarioRepository.findByUsuario("usuariotest");
        assert usuarioGuardado.isPresent() : "Usuario no fue guardado en la BD";
        System.out.println("✓ Usuario encontrado en BD: " + usuarioGuardado.get().getCorreo());
        
        // 3. Hacer login con las credenciales registradas
        AuthRequest loginRequest = new AuthRequest();
        loginRequest.setUsuario("usuariotest");
        loginRequest.setContrasena("password123");
        
        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
            .andExpect(status().isOk())  // 200
            .andExpect(jsonPath("$.token").isNotEmpty())
            .andReturn();
        
        System.out.println("✓ Login exitoso - Status: 200");
        String loginToken = objectMapper.readTree(loginResult.getResponse().getContentAsString()).get("token").asText();
        System.out.println("  Token de login: " + loginToken.substring(0, 50) + "...");
        
        // 4. Verificar que el token de login y registro son diferentes (son tokens nuevos)
        assert !registroToken.equals(loginToken) : "Los tokens deberían ser diferentes";
        System.out.println("✓ Tokens son diferentes (esperado)");
        
        System.out.println("\n✅ PRUEBA COMPLETA: Registro → BD → Login");
    }
    
    @Test
    public void testLoginConCredencialesInvalidas() throws Exception {
        // Primero registrar un usuario
        RegisterRequest registerRequest = new RegisterRequest();
        registerRequest.setCorreo("usuario.invalido@test.com");
        registerRequest.setUsuario("usuarioinvalido");
        registerRequest.setContrasena("correctPassword");
        
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)))
            .andExpect(status().isCreated());
        
        // Intentar login con contraseña incorrecta
        AuthRequest loginRequest = new AuthRequest();
        loginRequest.setUsuario("usuarioinvalido");
        loginRequest.setContrasena("wrongPassword");
        
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
            .andExpect(status().isUnauthorized())  // 401
            .andExpect(jsonPath("$.error").value("Credenciales inválidas"));
        
        System.out.println("✓ Login rechazado correctamente con contraseña incorrecta");
    }
    
    @Test
    public void testRegistroDuplicado() throws Exception {
        // Datos para el registro
        RegisterRequest registerRequest = new RegisterRequest();
        registerRequest.setCorreo("usuario.duplicado@test.com");
        registerRequest.setUsuario("usuariodup");
        registerRequest.setContrasena("password123");
        
        // Primer registro
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)))
            .andExpect(status().isCreated());
        
        System.out.println("✓ Primer registro exitoso");
        
        // Segundo registro con mismo correo
        RegisterRequest registerRequest2 = new RegisterRequest();
        registerRequest2.setCorreo("usuario.duplicado@test.com");
        registerRequest2.setUsuario("usuariodup2");
        registerRequest2.setContrasena("password123");
        
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest2)))
            .andExpect(status().isUnauthorized())  // 401
            .andExpect(jsonPath("$.error").value("El correo ya está registrado"));
        
        System.out.println("✓ Segundo registro rechazado (correo duplicado)");
    }
}
