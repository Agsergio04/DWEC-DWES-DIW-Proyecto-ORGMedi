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

@Component
public class JwtRequestFilter extends OncePerRequestFilter {
    private static final Logger logger = LoggerFactory.getLogger(JwtRequestFilter.class);
    private final JwtUtil jwtUtil;
    
    public JwtRequestFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

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
