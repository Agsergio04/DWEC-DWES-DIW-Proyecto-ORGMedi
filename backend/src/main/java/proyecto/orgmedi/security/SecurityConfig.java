package proyecto.orgmedi.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Arrays;

/**
 * SecurityConfig - CONFIGURACIÓN de seguridad de Spring Security
 * 
 * PROPÓSITO: Definir las reglas de seguridad para toda la aplicación
 * 
 * @Configuration: Esta clase define beans de configuración
 * @EnableWebSecurity: Activa Spring Security
 * 
 * QUÉ CONTROLA:
 * 1. Qué request requieren autenticación
 * 2. Cuáles son públicos
 * 3. CORS (Cross-Origin Resource Sharing) - de dónde pueden venir requests
 * 4. CSRF (Cross-Site Request Forgery) - protección contra ataques
 * 5. Gestión de sesiones (stateless con JWT)
 * 6. Cifrado de contraseñas (BCrypt)
 * 
 * FLUJO DE SEGURIDAD:
 * 
 * 1. REQUEST LLEGA
 * 2. SPRING VERIFICA CORS
 * 3. SPRING VERIFICA CSRF
 * 4. JWTFILTER valida token
 * 5. AUTHORIZEHTTPREQUESTS valida permisos
 * 6. Si todoOK → llega al controlador
 * 
 * SIN ESTA CONFIGURACIÓN:
 * - Bearer tokens no funcionarían
 * - No habría protección CORS
 * - Las contraseñas se guardarían en texto plano
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    /**
     * filterChain - CONFIGURA LA CADENA DE FILTROS DE SEGURIDAD
     * 
     * @param http: Objeto para configurar seguridad HTTP
     * @param jwtRequestFilter: Nuestro filtro de JWT
     * @return: SecurityFilterChain configurado
     * 
     * CONFIGURACIONES PRINCIPALES:
     * 
     * 1. CSRF DISABLED
     *    http.csrf(csrf -> csrf.disable())
     *    - Por qué: Usamos JWT, no cookies de sesión
     *    - CSRF es vulnerabilidad con cookies
     *    - JWT es inmune porque se envía en header, no en cookie
     * 
     * 2. CORS HABILITADO
     *    http.cors(cors -> cors.configurationSource(corsConfigurationSource()))
     *    - Permite requests desde frontend en otro puerto/dominio
     *    - Sin esto, navegador bloquearía requests desde localhost:4200
     * 
     * 3. SESIONES STATELESS
     *    http.sessionManagement(session -> session.sessionCreationPolicy(STATELESS))
     *    - No usamos sesiones de servidor (tradicionales)
     *    - Cada request es independiente (JWT autonomo)
     *    - Permite escalability horizontal (multiples servidores)
     * 
     * 4. AUTORRIZACIÓN DE RUTAS
     *    .authorizeHttpRequests(auth -> auth
     *      .requestMatchers("/api/auth/**").permitAll()  // Login/registro público
     *      .anyRequest().authenticated()                  // Todo lo demás requiere JWT
     *    )
     * 
     * 5. AÑADE JWT FILTER
     *    .addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class)
     *    - Ejecuta JwtRequestFilter ANTES que el filtro de usuario/contraseña
     *    - Permite autenticarse con JWT en lugar de usuario/contraseña
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, JwtRequestFilter jwtRequestFilter) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/actuator/health").permitAll()
                .requestMatchers("/actuator/health/**").permitAll()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    // Configuración de CORS
    /**
     * corsConfigurationSource - CONFIGURA CORS (Cross-Origin Requests)
     * 
     * QUÉ ES CORS:
     * - Mecanismo de seguridad del navegador
     * - Por defecto, el navegador bloquea requests a diferente dominio/puerto
     * - Si frontend:4200 hace request a backend:8080 → BLOQUEADO
     * - CORS permite exceptiones
     * 
     * CONFIGURACIÓN:
     * setAllowedOrigins([...]):
     *   Qué dominios pueden hacer requests
     *   Ej:
     *   - "http://localhost:4200" - desarrollo local Angular
     *   - "http://frontend" - en Docker Compose
     *   - "https://orgmedi.onrender.com" - en producción
     * 
     * setAllowedMethods(["GET", "POST", "PUT", "DELETE", ...]):
     *   Qué métodos HTTP se permiten
     * 
     * setAllowedHeaders(["*"]):
     *   Qué headers se permiten
     *   "*" = todos
     * 
     * setAllowCredentials(true):
     *   Si se pueden enviar credenciales (cookies, headers Authorization)
     * 
     * setMaxAge(3600L):
     *   Cuanto tiempo el navegador cachea la respuesta CORS (segundos)
     * 
     * SIN ESTO:
     * Frontend en http://localhost:4200 no podra hacer requests a backend
     * El navegador bloqueara con error "CORS policy blocked"
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(
                // Desarrollo local
                "http://localhost",
                "http://localhost:80",
                "http://localhost:4200",
                "http://localhost:8080",
                "http://127.0.0.1",
                "http://127.0.0.1:80",
                "http://127.0.0.1:4200",
                "http://127.0.0.1:8080",
                // Docker compose interno
                "http://frontend",
                "http://frontend:80",
                "http://frontend:4200",
                // Producción en Render
                "https://dwec-dwes-diw-proyecto-orgmedi.onrender.com"
        ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    // Bean para encriptar/validar contraseñas con BCrypt
    /**
     * passwordEncoder - BEAN PARA ENCRIPTAR CONTRASEÑAS
     * 
     * @return: BCryptPasswordEncoder para hashear contraseñas
     * 
     * QUÉ ES BCRYPT:
     * - Algoritmo de hashing criptográfico para contraseñas
     * - UNIDIRECCIONAL: una vez hasheada, no se puede desencriptar
     * - Con sal (random): mismo password produce diferentes hashes
     * - Lento: resist a fuerza bruta (tarda 0.1-1 segundo por intento)
     * 
     * FLUJO EN REGISTRO:
     * 1. Usuario envía contraseña en texto plano
     * 2. UsuarioService llama: passwordEncoder.encode(password)
     * 3. Se genera hash (ej: "$2a$10$abc123dxyziwjhskjafllasdfja")
     * 4. Se guarda EL HASH en BD, NO la contraseña
     * 
     * FLUJO EN LOGIN:
     * 1. Usuario envía contraseña en texto plano
     * 2. AuthController llama: passwordEncoder.matches(password, hashedPassword)
     * 3. Compara el password contra el hash
     * 4. Si coinciden → match() retorna true
     * 5. Si no coinciden → retorna false (login falla)
     * 
     * NUNCA hacer esto:
     * - NO comparar password == usuario.getPassword() (texto plano)
     * - NO almacenar password en texto plano
     * - NO usar MD5 o SHA (fáciles de romper)
     * 
     * VENTAJA DE BCRYPT:
     * - Incluso si alguien roba la BD, no puede obtener la contraseña
     * - Imposible hacer tabla arcoís (todos los hashes son diferentes)
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}

