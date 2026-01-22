package proyecto.orgmedi.controller;


import proyecto.orgmedi.dto.auth.AuthRequest;
import proyecto.orgmedi.dto.auth.AuthResponse;
import proyecto.orgmedi.dto.auth.RegisterRequest;
import proyecto.orgmedi.dto.auth.ChangePasswordRequest;
import proyecto.orgmedi.dto.auth.UserDTO;
import proyecto.orgmedi.dominio.Usuario;
import proyecto.orgmedi.dominio.GestorMedicamentos;
import proyecto.orgmedi.repo.UsuarioRepository;
import proyecto.orgmedi.repo.GestorMedicamentosRepository;
import proyecto.orgmedi.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import jakarta.validation.Valid;
import proyecto.orgmedi.error.UnauthorizedException;
import proyecto.orgmedi.error.ConflictException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Objects;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    @Autowired
    private UsuarioRepository usuarioRepository;
    @Autowired
    private GestorMedicamentosRepository gestorMedicamentosRepository;
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping(value = "/login", produces = "application/json")
    @Transactional
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findByUsuario(request.getUsuario());
        if (usuarioOpt.isEmpty()) {
            logger.warn("Login failed for usuario={}", request.getUsuario());
            throw new UnauthorizedException("Credenciales inválidas");
        }

        Usuario usuario = usuarioOpt.get();
        String stored = usuario.getContrasena();

        // Si stored es null o request contrasena es null -> no autorizado
        if (stored == null || request.getContrasena() == null) {
            logger.warn("Login failed (null password) for usuario={}", request.getUsuario());
            throw new UnauthorizedException("Credenciales inválidas");
        }

        boolean matches;
        // Detectar si stored parece un hash BCrypt (empieza por $2a$/$2b$/$2y$)
        if (stored.startsWith("$2a$") || stored.startsWith("$2b$") || stored.startsWith("$2y$")) {
            matches = passwordEncoder.matches(request.getContrasena(), stored);
        } else {
            // stored no está hasheado — comparar en texto plano (legacy)
            matches = Objects.equals(stored, request.getContrasena());
            if (matches) {
                // Re-hash y guardar de forma segura
                String hashed = passwordEncoder.encode(request.getContrasena());
                usuario.setContrasena(hashed);
                usuarioRepository.save(usuario);
            }
        }

        if (!matches) {
            logger.warn("Login failed for usuario={} (bad credentials)", request.getUsuario());
            throw new UnauthorizedException("Credenciales inválidas");
        }

        String token = jwtUtil.generateToken(usuario.getCorreo());
        logger.info("Login success for usuario={}", request.getUsuario());
        
        // Crear respuesta con token explícitamente
        AuthResponse response = new AuthResponse();
        response.setToken(token);
        
        logger.info("✓ ENVIANDO RESPUESTA LOGIN: {}", token.substring(0, Math.min(20, token.length())));
        
        return ResponseEntity.ok()
                .header("Content-Type", "application/json")
                .body(response);
    }

    @PostMapping(value = "/register", produces = "application/json", consumes = "application/json")
    @Transactional
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        // Verificar si el correo ya existe
        if (usuarioRepository.findByCorreo(request.getCorreo()).isPresent()) {
            logger.warn("Register failed: email already exists for correo={}", request.getCorreo());
            throw new ConflictException("El correo ya está registrado");
        }

        // Verificar si el usuario ya existe
        if (usuarioRepository.findByUsuario(request.getUsuario()).isPresent()) {
            logger.warn("Register failed: username already exists for usuario={}", request.getUsuario());
            throw new ConflictException("El usuario ya está registrado");
        }

        // Hash de la contraseña
        String hashedPassword = passwordEncoder.encode(request.getContrasena());

        // Crear nuevo usuario
        Usuario usuario = new Usuario();
        usuario.setCorreo(request.getCorreo());
        usuario.setUsuario(request.getUsuario());
        usuario.setContrasena(hashedPassword);

        // Guardar en la BD
        Usuario savedUsuario = usuarioRepository.save(usuario);
        
        // Crear gestor de medicamentos automáticamente para el nuevo usuario
        GestorMedicamentos gestor = new GestorMedicamentos();
        gestor.setUsuario(savedUsuario);
        gestor.setMedicamentos(new java.util.ArrayList<>());
        GestorMedicamentos savedGestor = gestorMedicamentosRepository.save(gestor);
        
        // Establecer la relación bidireccional
        savedUsuario.setGestorMedicamentos(savedGestor);
        usuarioRepository.save(savedUsuario);
        
        logger.info("Register success for correo={}", request.getCorreo());

        // Generar token JWT
        String token = jwtUtil.generateToken(request.getCorreo());
        logger.info("✓ TOKEN GENERADO EN REGISTER: {}", token.substring(0, Math.min(20, token.length())));
        
        // Crear respuesta con token
        AuthResponse response = new AuthResponse();
        response.setToken(token);
        
        logger.info("✓ ENVIANDO RESPUESTA REGISTER: {}", response.getToken().substring(0, Math.min(20, response.getToken().length())));
        
        // Retornar 201 CREATED con el token en el body
        return ResponseEntity.status(HttpStatus.CREATED)
                .header("Content-Type", "application/json")
                .body(response);
    }

    @PostMapping("/rehash")
    public ResponseEntity<?> rehashPassword(@Valid @RequestBody AuthRequest request) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findByUsuario(request.getUsuario());
        if (usuarioOpt.isEmpty()) {
            logger.warn("Rehash failed for usuario={}", request.getUsuario());
            throw new UnauthorizedException("Credenciales inválidas");
        }
        Usuario usuario = usuarioOpt.get();
        String stored = usuario.getContrasena();
        String raw = request.getContrasena();
        if (stored == null || raw == null) {
            logger.warn("Rehash failed (null password) for usuario={}", request.getUsuario());
            throw new UnauthorizedException("Credenciales inválidas");
        }
        boolean isBCrypt = stored.startsWith("$2a$") || stored.startsWith("$2b$") || stored.startsWith("$2y$");
        boolean matches = isBCrypt ? passwordEncoder.matches(raw, stored) : Objects.equals(stored, raw);
        if (!matches) {
            logger.warn("Rehash failed for usuario={} (bad credentials)", request.getUsuario());
            throw new UnauthorizedException("Credenciales inválidas");
        }
        // Si la contraseña ya está hasheada, simplemente responde OK
        if (isBCrypt) {
            logger.info("Rehash skipped (already hashed) for usuario={}", request.getUsuario());
            return ResponseEntity.ok().build();
        }
        // Si no está hasheada, la hasheamos y guardamos
        String hashed = passwordEncoder.encode(raw);
        usuario.setContrasena(hashed);
        usuarioRepository.save(usuario);
        logger.info("Rehash success for usuario={}", request.getUsuario());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/change-password")
    @Transactional
    public ResponseEntity<?> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        // Buscar usuario por correo
        Optional<Usuario> usuarioOpt = usuarioRepository.findByCorreo(request.getCorreoActual());
        if (usuarioOpt.isEmpty()) {
            logger.warn("Change password failed: user not found for correo={}", request.getCorreoActual());
            throw new UnauthorizedException("Usuario no encontrado");
        }

        Usuario usuario = usuarioOpt.get();
        String stored = usuario.getContrasena();

        // Validar contraseña actual
        if (stored == null || request.getContrasenaActual() == null) {
            logger.warn("Change password failed (null password) for correo={}", request.getCorreoActual());
            throw new UnauthorizedException("Contraseña inválida");
        }

        boolean isBCrypt = stored.startsWith("$2a$") || stored.startsWith("$2b$") || stored.startsWith("$2y$");
        boolean matches = isBCrypt ? 
            passwordEncoder.matches(request.getContrasenaActual(), stored) : 
            Objects.equals(stored, request.getContrasenaActual());

        if (!matches) {
            logger.warn("Change password failed (wrong password) for correo={}", request.getCorreoActual());
            throw new UnauthorizedException("Contraseña actual incorrecta");
        }

        // Hash de la nueva contraseña
        String hashedNewPassword = passwordEncoder.encode(request.getContrasenanueva());
        usuario.setContrasena(hashedNewPassword);
        usuarioRepository.save(usuario);

        logger.info("Password changed successfully for correo={}", request.getCorreoActual());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            logger.warn("Get current user failed: missing or invalid Authorization header");
            throw new UnauthorizedException("Token no proporcionado");
        }

        String token = authHeader.substring(7);
        String correo = jwtUtil.extractCorreo(token);
        
        if (correo == null) {
            logger.warn("Get current user failed: invalid token");
            throw new UnauthorizedException("Token inválido");
        }

        Optional<Usuario> usuarioOpt = usuarioRepository.findByCorreo(correo);
        if (usuarioOpt.isEmpty()) {
            logger.warn("Get current user failed: user not found for correo={}", correo);
            throw new UnauthorizedException("Usuario no encontrado");
        }

        Usuario usuario = usuarioOpt.get();
        UserDTO userDTO = UserDTO.builder()
            .id(usuario.getId())
            .correo(usuario.getCorreo())
            .usuario(usuario.getUsuario())
            .build();

        logger.info("Get current user success for correo={}", correo);
        return ResponseEntity.ok(userDTO);
    }
}
