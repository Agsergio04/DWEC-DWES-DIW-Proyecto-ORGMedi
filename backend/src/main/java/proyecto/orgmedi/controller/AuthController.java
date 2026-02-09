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
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Objects;

import java.util.Optional;

/**
 * Controlador AuthController - Endpoints de autenticación y autorización
 * 
 * PROPÓSITO: Manejar registro, login, cambio de contraseña y autorización de usuarios.
 * Es el "guardián" del sistema que verifica quién intenta entrar y genera tokens JWT.
 * 
 * ENDPOINTS PRINCIPALES:
 * - POST /api/auth/register       → Crear nueva cuenta
 * - POST /api/auth/login          → Obtener token JWT
 * - POST /api/auth/change-password → Cambiar contraseña
 * - GET /api/auth/me              → Obtener datos del usuario actual
 * 
 * SEGURIDAD:
 * - Las contraseñas se guardan HASHEADAS con BCrypt (no en texto plano)
 * - Los tokens JWT autentican peticiones futuras
 * - Se valida que correos sean únicos
 * 
 * FLUJO TÍPICO:
 * 1. Usuario se registra: POST /api/auth/register
 * 2. Sistema crea usuario + gestorMedicamentos + token JWT
 * 3. Usuario usa token en headers para acceder a otros endpoints
 * 4. En cada petición, el token se verifica para autorizar acceso
 */
@RestController
@RequestMapping("/api/auth")
@Tag(name = "Autenticación", description = "Endpoints de autenticación y gestión de usuarios")
public class AuthController {
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    
    // ============ DEPENDENCIAS INYECTADAS =============
    
    @Autowired
    private UsuarioRepository usuarioRepository; // Acceso a datos de usuarios
    @Autowired
    private GestorMedicamentosRepository gestorMedicamentosRepository; // Acceso a gestores
    @Autowired
    private JwtUtil jwtUtil; // Generación y validación de tokens JWT
    @Autowired
    private PasswordEncoder passwordEncoder; // Hash/validación de contraseñas con BCrypt

    // ============ ENDPOINT: LOGIN =============
    
    /**
     * ENDPOINT: POST /api/auth/login
     * 
     * PROPÓSITO: Autenticar un usuario y retornar un token JWT para peticiones futuras
     * 
     * CUERPO JSON:
     * {
     *   "usuario": "juan",              // nombre de usuario
     *   "contrasena": "miPassword123"   // contraseña en texto plano
     * }
     * 
     * PROCEDIMIENTO:
     * 1. Busca el usuario por nombre
     * 2. Valida que la contraseña sea correcta (con BCrypt)
     * 3. Si es correcta, genera un token JWT
     * 4. Retorna el token en JSON
     * 
     * RESPUESTA EXITOSA (200 OK):
     * {
     *   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
     * }
     * 
     * ERRORES:
     * - 401 Unauthorized: Usuario no existe o contraseña incorrecta
     * - 400 Bad Request: Datos inválidos
     * 
     * FLUJO DE SEGURIDAD:
     * - Contraseña se compara sin revelar el hash
     * - Si está en texto plano (legacy), se rehashea automáticamente a BCrypt
     * - Token JWT se crea con el correo del usuario para identificar peticiones futuras
     * 
     * NOTA TÉCNICA:
     * - NoSQL-style flexibility: soporta hashes legacy en texto plano
     * - Detecta si está hasheado comprobando prefijo "$2a$" (BCrypt)
     */
    @PostMapping(value = "/login", produces = "application/json")
    @Transactional // La transacción asegura que cambios se guarden atomáticamente
    @Operation(summary = "Login de usuario", description = "Autentica un usuario y retorna un token JWT")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Login exitoso", 
            content = @Content(schema = @Schema(implementation = AuthResponse.class))),
        @ApiResponse(responseCode = "401", description = "Credenciales inválidas"),
        @ApiResponse(responseCode = "400", description = "Datos de entrada inválidos")
    })
    public ResponseEntity<java.util.Map<String, Object>> login(@Valid @RequestBody AuthRequest request) {
        // 1. Buscar usuario por nombre
        Optional<Usuario> usuarioOpt = usuarioRepository.findByUsuario(request.getUsuario());
        if (usuarioOpt.isEmpty()) {
            logger.warn("Login failed for usuario={}", request.getUsuario());
            throw new UnauthorizedException("Credenciales inválidas");
        }

        Usuario usuario = usuarioOpt.get();
        String stored = usuario.getContrasena(); // Hash guardado en BD

        // 2. Validar que ambas contraseñas existan
        if (stored == null || request.getContrasena() == null) {
            logger.warn("Login failed (null password) for usuario={}", request.getUsuario());
            throw new UnauthorizedException("Credenciales inválidas");
        }

        boolean matches;
        // 3. Detectar si stored está hasheado con BCrypt ($2a$, $2b$, $2y$ = prefijos de BCrypt)
        if (stored.startsWith("$2a$") || stored.startsWith("$2b$") || stored.startsWith("$2y$")) {
            // Hash BCrypt: comparar usando passwordEncoder (valida sin revelar hash)
            matches = passwordEncoder.matches(request.getContrasena(), stored);
        } else {
            // Hash legacy en texto plano: comparar directamente
            matches = Objects.equals(stored, request.getContrasena());
            if (matches) {
                // Oportunidad de seguridad: rehashear y guardar como BCrypt
                String hashed = passwordEncoder.encode(request.getContrasena());
                usuario.setContrasena(hashed);
                usuarioRepository.save(usuario);
            }
        }

        // 4. Si la contraseña no coincide, denegar acceso
        if (!matches) {
            logger.warn("Login failed for usuario={} (bad credentials)", request.getUsuario());
            throw new UnauthorizedException("Credenciales inválidas");
        }

        logger.info("=== LOGIN V2 (2026-01-22 19:50) ===");
        // 5. Generar token JWT con el correo del usuario
        String token = jwtUtil.generateToken(usuario.getCorreo());
        logger.info("Login success for usuario={}", request.getUsuario());
        
        // 6. Retornar token como Map (para asegurar serialización a JSON)
        java.util.Map<String, Object> responseMap = new java.util.HashMap<>();
        responseMap.put("token", token);
        
        logger.info("✓ MAP RESPONSE: {}", responseMap);
        logger.info("✓ ENVIANDO RESPUESTA LOGIN: {}", token.substring(0, Math.min(20, token.length())));
        
        return ResponseEntity.ok()
                .header("Content-Type", "application/json")
                .body(responseMap);
    }

    // ============ ENDPOINT: REGISTER =============
    
    /**
     * ENDPOINT: POST /api/auth/register
     * 
     * PROPÓSITO: Registrar un nuevo usuario en el sistema
     * 
     * CUERPO JSON:
     * {
     *   "usuario": "juan",
     *   "correo": "juan@example.com",
     *   "contrasena": "MiPassword123!"
     * }
     * 
     * PROCEDIMIENTO:
     * 1. Valida que correo sea único
     * 2. Valida que usuario sea único
     * 3. Hashea la contraseña con BCrypt
     * 4. Crea el Usuario
     * 5. Crea automáticamente un GestorMedicamentos para él
     * 6. Genera token JWT
     * 7. Retorna 201 Created con el token
     * 
     * RESPUESTA EXITOSA (201 Created):
     * {
     *   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
     * }
     * 
     * ERRORES:
     * - 409 Conflict: Usuario o correo ya existen
     * - 400 Bad Request: Datos inválidos o faltantes
     * 
     * NOTA IMPORTANTE: Cuando se registra un usuario, se crea AUTOMÁTICAMENTE:
     * - Un Usuario (para autenticación)
     * - Un GestorMedicamentos (para almacenar medicamentos del usuario)
     * 
     * SEGURIDAD:
     * - Contraseña se hashea con BCrypt inmediatamente
     * - Nunca se guarda en texto plano
     * - Token se genera solo después de guardar exitosamente
     */
    @PostMapping(value = "/register", produces = "application/json", consumes = "application/json")
    @Transactional // Asegura que usuario + gestor se crean juntos
    @Operation(summary = "Registro de nuevo usuario", description = "Crea una nueva cuenta y retorna un token JWT")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Usuario registrado exitosamente", 
            content = @Content(schema = @Schema(implementation = AuthResponse.class))),
        @ApiResponse(responseCode = "409", description = "El usuario o correo ya existe"),
        @ApiResponse(responseCode = "400", description = "Datos de entrada inválidos")
    })
    public ResponseEntity<java.util.Map<String, Object>> register(@Valid @RequestBody RegisterRequest request) {
        // 1. Validar que correo sea único
        if (usuarioRepository.findByCorreo(request.getCorreo()).isPresent()) {
            logger.warn("Register failed: email already exists for correo={}", request.getCorreo());
            throw new ConflictException("El correo ya está registrado");
        }

        // 2. Validar que usuario sea único
        if (usuarioRepository.findByUsuario(request.getUsuario()).isPresent()) {
            logger.warn("Register failed: username already exists for usuario={}", request.getUsuario());
            throw new ConflictException("El usuario ya está registrado");
        }

        // 3. Hashear contraseña con BCrypt
        String hashedPassword = passwordEncoder.encode(request.getContrasena());

        // 4. Crear objeto Usuario
        Usuario usuario = new Usuario();
        usuario.setCorreo(request.getCorreo());
        usuario.setUsuario(request.getUsuario());
        usuario.setContrasena(hashedPassword);

        // 5. Guardar usuario en BD (genera ID automáticamente)
        Usuario savedUsuario = usuarioRepository.save(usuario);
        
        // 6. Crear GestorMedicamentos para el usuario automáticamente
        GestorMedicamentos gestor = new GestorMedicamentos();
        gestor.setUsuario(savedUsuario);
        gestor.setMedicamentos(new java.util.ArrayList<>()); // Lista vacía inicialmente
        GestorMedicamentos savedGestor = gestorMedicamentosRepository.save(gestor);
        
        // 7. Establecer relación bidireccional usuario <-> gestor
        savedUsuario.setGestorMedicamentos(savedGestor);
        usuarioRepository.save(savedUsuario);
        
        logger.info("=== REGISTER V2 (2026-01-22 19:50) ===");
        logger.info("Register success for correo={}", request.getCorreo());

        // 8. Generar token JWT con el correo
        String token = jwtUtil.generateToken(request.getCorreo());
        logger.info("✓ TOKEN GENERADO EN REGISTER: {}", token.substring(0, Math.min(20, token.length())));
        
        // 9. Retornar 201 CREATED con el token
        java.util.Map<String, Object> responseMap = new java.util.HashMap<>();
        responseMap.put("token", token);
        
        logger.info("✓ MAP RESPONSE CREATED: {}", responseMap);
        
        return ResponseEntity.status(HttpStatus.CREATED)
                .header("Content-Type", "application/json")
                .body(responseMap);
    }

    // ============ OTROS ENDPOINTS =============
    
    /**
     * ENDPOINT: POST /api/auth/rehash
     * 
     * PROPÓSITO: Rehashear una contraseña en texto plano a BCrypt
     * (para migración de datos legacy)
     */
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

    /**
     * ENDPOINT: POST /api/auth/change-password
     * 
     * PROPÓSITO: Permitir que un usuario autenticado cambie su contraseña
     * 
     * CUERPO JSON:
     * {
     *   "correoActual": "juan@example.com",
     *   "contrasenaActual": "miPassword123",   // contraseña actual (validación)
     *   "contrasenanueva": "miNuevaPassword456"
     * }
     * 
     * PROCEDIMIENTO:
     * 1. Busca usuario por correo
     * 2. Valida que la contraseña actual sea correcta
     * 3. Si es correcta, hashea la nueva y guarda
     * 4. Retorna 200 OK
     * 
     * CÓDIGOS RESPUESTA:
     * - 200 OK: Contraseña cambiada exitosamente
     * - 401 Unauthorized: Contraseña actual incorrecta
     * - 404 Not Found: Usuario no existe
     * 
     * SEGURIDAD:
     * - Valida la contraseña actual antes de permitir cambio
     * - Nueva contraseña se hashea con BCrypt
     * - Se usa contraseña anterior para autenticar, no token JWT
     */
    @PostMapping("/change-password")
    @Transactional
    public ResponseEntity<?> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        // 1. Buscar usuario por correo
        Optional<Usuario> usuarioOpt = usuarioRepository.findByCorreo(request.getCorreoActual());
        if (usuarioOpt.isEmpty()) {
            logger.warn("Change password failed: user not found for correo={}", request.getCorreoActual());
            throw new UnauthorizedException("Usuario no encontrado");
        }

        Usuario usuario = usuarioOpt.get();
        String stored = usuario.getContrasena();

        // 2. Validar que ambas contraseñas existan
        if (stored == null || request.getContrasenaActual() == null) {
            logger.warn("Change password failed (null password) for correo={}", request.getCorreoActual());
            throw new UnauthorizedException("Contraseña inválida");
        }

        // 3. Validar contraseña actual (soportar legacy y BCrypt)
        boolean isBCrypt = stored.startsWith("$2a$") || stored.startsWith("$2b$") || stored.startsWith("$2y$");
        boolean matches = isBCrypt ? 
            passwordEncoder.matches(request.getContrasenaActual(), stored) : 
            Objects.equals(stored, request.getContrasenaActual());

        if (!matches) {
            logger.warn("Change password failed (wrong password) for correo={}", request.getCorreoActual());
            throw new UnauthorizedException("Contraseña actual incorrecta");
        }

        // 4. Hash de la nueva contraseña
        String hashedNewPassword = passwordEncoder.encode(request.getContrasenanueva());
        usuario.setContrasena(hashedNewPassword);
        usuarioRepository.save(usuario);

        logger.info("Password changed successfully for correo={}", request.getCorreoActual());
        return ResponseEntity.ok().build();
    }

    /**
     * ENDPOINT: GET /api/auth/me
     * 
     * PROPÓSITO: Obtener información del usuario autenticado (por token JWT)
     * 
     * HEADER REQUERIDO:
     * Authorization: Bearer {token_jwt}
     * 
     * PROCEDIMIENTO:
     * 1. Extrae token del header Authorization
     * 2. Valida que sea un token Bearer válido
     * 3. Extrae el correo del token
     * 4. Busca usuario por correo
     * 5. Retorna datos del usuario sin información sensible
     * 
     * RESPUESTA EXITOSA (200 OK):
     * {
     *   "id": 1,
     *   "correo": "juan@example.com",
     *   "usuario": "juan"
     * }
     * 
     * ERRORES:
     * - 401 Unauthorized: No hay token o es inválido
     * - 404 Not Found: Usuario no encontrado (token válido pero usuario eliminado)
     * 
     * NOTA: NO retorna la contraseña (política de seguridad)
     */
    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        // 1. Validar que hay header Authorization con Bearer
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            logger.warn("Get current user failed: missing or invalid Authorization header");
            throw new UnauthorizedException("Token no proporcionado");
        }

        // 2. Extraer token sin el prefijo "Bearer "
        String token = authHeader.substring(7);
        
        // 3. Extraer correo del token JWT
        String correo = jwtUtil.extractCorreo(token);
        
        if (correo == null) {
            logger.warn("Get current user failed: invalid token");
            throw new UnauthorizedException("Token inválido");
        }

        // 4. Buscar usuario por correo extraído del token
        Optional<Usuario> usuarioOpt = usuarioRepository.findByCorreo(correo);
        if (usuarioOpt.isEmpty()) {
            logger.warn("Get current user failed: user not found for correo={}", correo);
            throw new UnauthorizedException("Usuario no encontrado");
        }

        Usuario usuario = usuarioOpt.get();
        // 5. Construir DTO sin información sensible (sin contraseña)
        UserDTO userDTO = UserDTO.builder()
            .id(usuario.getId())
            .correo(usuario.getCorreo())
            .usuario(usuario.getUsuario())
            .build();

        logger.info("Get current user success for correo={}", correo);
        return ResponseEntity.ok(userDTO);
    }
}
