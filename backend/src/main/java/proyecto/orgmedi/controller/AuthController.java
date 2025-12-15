package proyecto.orgmedi.controller;


import proyecto.orgmedi.dto.auth.AuthRequest;
import proyecto.orgmedi.dto.auth.AuthResponse;
import proyecto.orgmedi.dominio.Usuario;
import proyecto.orgmedi.repo.UsuarioRepository;
import proyecto.orgmedi.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import jakarta.validation.Valid;
import proyecto.orgmedi.error.UnauthorizedException;

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
    private JwtUtil jwtUtil;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findByCorreo(request.getCorreo());
        if (usuarioOpt.isEmpty()) {
            logger.warn("Login failed for correo={}", request.getCorreo());
            throw new UnauthorizedException("Credenciales inválidas");
        }

        Usuario usuario = usuarioOpt.get();
        String stored = usuario.getContrasena();

        // Si stored es null o request contrasena es null -> no autorizado
        if (stored == null || request.getContrasena() == null) {
            logger.warn("Login failed (null password) for correo={}", request.getCorreo());
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
            logger.warn("Login failed for correo={} (bad credentials)", request.getCorreo());
            throw new UnauthorizedException("Credenciales inválidas");
        }

        String token = jwtUtil.generateToken(request.getCorreo());
        logger.info("Login success for correo={}", request.getCorreo());
        return ResponseEntity.ok(new AuthResponse(token));
    }

    @PostMapping("/rehash")
    public ResponseEntity<?> rehashPassword(@Valid @RequestBody AuthRequest request) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findByCorreo(request.getCorreo());
        if (usuarioOpt.isEmpty()) {
            logger.warn("Rehash failed for correo={}", request.getCorreo());
            throw new UnauthorizedException("Credenciales inválidas");
        }
        Usuario usuario = usuarioOpt.get();
        String stored = usuario.getContrasena();
        String raw = request.getContrasena();
        if (stored == null || raw == null) {
            logger.warn("Rehash failed (null password) for correo={}", request.getCorreo());
            throw new UnauthorizedException("Credenciales inválidas");
        }
        boolean isBCrypt = stored.startsWith("$2a$") || stored.startsWith("$2b$") || stored.startsWith("$2y$");
        boolean matches = isBCrypt ? passwordEncoder.matches(raw, stored) : Objects.equals(stored, raw);
        if (!matches) {
            logger.warn("Rehash failed for correo={} (bad credentials)", request.getCorreo());
            throw new UnauthorizedException("Credenciales inválidas");
        }
        // Si la contraseña ya está hasheada, simplemente responde OK
        if (isBCrypt) {
            logger.info("Rehash skipped (already hashed) for correo={}", request.getCorreo());
            return ResponseEntity.ok().build();
        }
        // Si no está hasheada, la hasheamos y guardamos
        String hashed = passwordEncoder.encode(raw);
        usuario.setContrasena(hashed);
        usuarioRepository.save(usuario);
        logger.info("Rehash success for correo={}", request.getCorreo());
        return ResponseEntity.ok().build();
    }
}
