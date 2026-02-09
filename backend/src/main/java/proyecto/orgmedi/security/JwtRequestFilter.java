package proyecto.orgmedi.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.lang.NonNull;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;

/**
 * JwtRequestFilter - FILTRO DE SEGURIDAD para validar JWT en cada request
 * 
 * CONCEPTOS CLAVE:
 * - OncePerRequestFilter: Se ejecuta UNA VEZ por request HTTP
 * - Intercepta TODOS los requests (excepto /api/auth y puertas públicas)
 * - Valida el JWT si existe
 * - Autentica al usuario en el contexto de seguridad
 * 
 * FLUJO DE UN REQUEST PROTEGIDO:
 * 
 * 1. CLIENTE envía request:
 *    GET /api/medicamentos/1
 *    Headers:
 *      Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
 * 
 * 2. FILTRO intercepta el request:
 *    - Revisa si la URI es pública (/api/auth, /actuator)
 *    - Si es pública → salta el filtro, deja pasar
 *    - Si es privada → busca header Authorization
 * 
 * 3. VALIDA EL JWT:
 *    - Busca header Authorization
 *    - Extrae token después de "Bearer "
 *    - Llama jwtUtil.validateToken(token)
 *    - Si expiró o tiene firma mala → log de warning
 * 
 * 4. EXTRAE EL EMAIL:
 *    - Si válido → jwtUtil.extractCorreo(token)
 *    - Obtiene el email del usuario
 * 
 * 5. AUTENTICA EN CONTEXTO:
 *    - Crea UsernamePasswordAuthenticationToken con el email
 *    - Lo almacena en SecurityContextHolder
 *    - Los controladores pueden acceder con SecurityUtil.getCurrentUserEmail()
 * 
 * 6. DEJA PASAR O RECHAZA:
 *    - Si autenticación OK → chain.doFilter() → request continua
 *    - Si falla → no se autentica → controlador rechaza (401)
 * 
 * RUTAS PÓBLICAS (no requieren JWT):
 * - /api/auth/register: Crear nueva cuenta
 * - /api/auth/login: Login
 * - /api/auth/change-password: Cambio de contraseña
 * - /actuator/health: Health check
 * 
 * RUTAS PRIVADAS (requieren JWT válido):
 * - /api/medicamentos
 * - /api/usuarios
 * - /api/consumo
 * - TODO lo demás
 */
@Component
public class JwtRequestFilter extends OncePerRequestFilter {
    /**
     * LOGGER para registrar eventos de seguridad
     * Útil para:
     * - Debugging de problemas de autenticación
     * - Auditoría (quién intentó acceder, cuándo)
     * - Detectar intentos de acceso no autorizado
     */
    private static final Logger logger = LoggerFactory.getLogger(JwtRequestFilter.class);
    
    /**
     * JwtUtil para validar y extraer tokens
     */
    private final JwtUtil jwtUtil;
    
    public JwtRequestFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    /**
     * METODO PRINCIPAL - Ejecuta el filtro en cada request
     * 
     * FLUJO PASO A PASO:
     * 
     * 1. OBTIENE LA URI DEL REQUEST
     *    final String requestUri = request.getRequestURI();
     *    Ej: "/api/medicamentos/1" o "/api/auth/login"
     * 
     * 2. VERIFICA SI ES RUTA PÓBLICA
     *    if (requestUri.startsWith("/api/auth") || ...)
     *    Si es pública → salta todo el filtro
     *    Esto permite login/registro sin autenticación
     * 
     * 3. OBTIENE HEADER AUTHORIZATION
     *    final String authHeader = request.getHeader("Authorization");
     *    Ej: "Bearer eyJhbGciOiJIUzI1NiIs..."
     * 
     * 4. BUSCA TOKEN EN HEADER
     *    if (authHeader != null && authHeader.startsWith("Bearer "))
     *    Formato debe ser: "Bearer " + token
     *    Extrae los 7 caracteres ("Bearer ") → jwt = substring(7)
     * 
     * 5. VALIDA EL TOKEN
     *    jwtUtil.validateToken(jwt) → verifica firma y no expirado
     * 
     * 6. EXTRAE EL EMAIL
     *    correo = jwtUtil.extractCorreo(jwt)
     *    Si validación falló → no se ejecuta esta línea
     * 
     * 7. AUTENTICA EN EL CONTEXTO
     *    if (correo != null && SecurityContextHolder...)
     *    Crea token de autenticación
     *    Lo almacena en SecurityContextHolder
     *    Ahora el request es AUTENTICADO
     * 
     * 8. CONTINUA CON EL SIGUIENTE FILTRO
     *    chain.doFilter(request, response)
     *    Pasa el request al siguiente filtro o al controlador
     * 
     * SI FALLO EN ALGUNO PUNTOS:
     * - No se autentica → correo = null
     * - El controlador o @PreAuthorize rechaza el request
     * - Retorna 401 Unauthorized
     */
    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull FilterChain chain)
            throws ServletException, IOException {
        final String requestUri = request.getRequestURI();
        
        // Ignorar rutas públicas (auth y actuator)
        if (requestUri.startsWith("/api/auth") || requestUri.startsWith("/actuator")) {
            logger.debug("[JwtRequestFilter] Skipping JWT validation for public endpoint: " + requestUri);
            chain.doFilter(request, response);
            return;
        }

        final String authHeader = request.getHeader("Authorization");
        String correo = null;
        String jwt;

        logger.debug("[JwtRequestFilter] Processing request to: " + requestUri);
        logger.debug("[JwtRequestFilter] Authorization header: " + (authHeader != null ? "present" : "missing"));

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            jwt = authHeader.substring(7);
            logger.debug("[JwtRequestFilter] Token found, validating...");
            // Validar token primero y luego extraer el subject
            if (jwtUtil.validateToken(jwt)) {
                try {
                    correo = jwtUtil.extractCorreo(jwt);
                    logger.debug("[JwtRequestFilter] ✓ Token valid, extracted correo: " + correo);
                } catch (Exception e) {
                    logger.error("[JwtRequestFilter] Error extracting correo from token: " + e.getMessage());
                }
            } else {
                logger.warn("[JwtRequestFilter] Token validation failed");
            }
        } else {
            logger.debug("[JwtRequestFilter] No Bearer token found");
        }

        if (correo != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            logger.info("[JwtRequestFilter] Setting authentication for correo: " + correo);
            UsernamePasswordAuthenticationToken authToken =
                    new UsernamePasswordAuthenticationToken(correo, null, null);
            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authToken);
        }
        chain.doFilter(request, response);
    }
}
