package proyecto.orgmedi.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.io.Decoders;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import io.jsonwebtoken.io.DecodingException;

import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * JwtUtil - Gestor de JWT (JSON Web Tokens) para autenticación
 * 
 * PROPÓSITO: Crear, validar y extraer información de tokens JWT
 * 
 * QUÉ ES JWT:
 * - Token criptográfico que contiene información del usuario
 * - Formato: header.payload.signature (3 partes separadas por puntos)
 * - NO se puede modificar sin que la firma sea inválida
 * - NO se puede desencriptar (está FIRMADO, no encriptado)
 * - Expira después del tiempo configurado
 * 
 * FLUJO DE AUTENTICACIÓN CON JWT:
 * 1. Usuario hace POST /api/auth/login con credenciales
 * 2. AuthController verifica el login
 * 3. Si es válido → JwtUtil.generateToken() crear JWT
 * 4. Frontend guarda JWT en localStorage
 * 5. Frontend envía JWT en header: Authorization: Bearer <token>
 * 6. JwtRequestFilter valida el JWT con JwtUtil.validateToken()
 * 7. Si es válido → extrae el correo con JwtUtil.extractCorreo()
 * 8. Se autentica el usuario en el contexto de seguridad
 * 9. Request continúa hacia el controlador
 * 
 * SI JWT EXPIRA:
 * - JwtRequestFilter lo detecta en validateToken()
 * - Retorna 401 Unauthorized
 * - Frontend debe pedir nuevo token (hacer login de nuevo)
 * 
 * CONFIGURACIÓN:
 * - jwt.secret: Clave secreta para firmar (en application.properties)
 * - jwt.expiration: Tiempo de expiración en milisegundos (default: 24 horas)
 */
@Component
public class JwtUtil {
    /**
     * CLAVE SECRETA para firmar los tokens
     * - Se inyecta desde application.properties (jwt.secret)
     * - NO se debe poner en código, debe venir de variable de entorno en producción
     * - Es lo que hace que un JWT sea ÑINI (no modificable)
     * - Si la clave cambia, TODOS los tokens se vuelven inválidos
     */
    private final SecretKey key;
    
    /**
     * DURACIÓN DEL TOKEN en milisegundos
     * - Se inyecta desde application.properties (jwt.expiration)
     * - Default: 86400000 ms = 24 horas
     * - Após este tiempo, el token expirado no se acepta
     */
    private final long expirationMs;

    /**
     * CONSTRUCTOR - Inicializa la clave de firma
     * 
     * @param secret: String con la clave secreta (desde application.properties)
     * @param expirationMs: Tiempo de expiración en milisegundos
     * 
     * PROCESAMIENTO:
     * 1. Intenta decodificar como BASE64 (estándar en producción)
     * 2. Si falla, usa el string como UTF-8 (para desarrollo local)
     * 3. Genera una SecretKey con HMAC-SHA para firmar
     */
    public JwtUtil(@Value("${jwt.secret:clave_secreta_demo_clave_mucho_mas_larga_0123456789}") String secret,
                   @Value("${jwt.expiration:86400000}") long expirationMs) {
        byte[] keyBytes;
        try {
            keyBytes = Decoders.BASE64.decode(secret);
        } catch (IllegalArgumentException | DecodingException ex) {
            keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        }
        this.key = Keys.hmacShaKeyFor(keyBytes);
        this.expirationMs = expirationMs;
    }

    /**
     * generateToken - CREA un nuevo JWT para un usuario
     * 
     * @param correo: EMAIL del usuario que se va a autenticar
     * @return: JWT token en formato String (header.payload.signature)
     * 
     * CONTENIDO DEL TOKEN:
     * - subject: El correo del usuario
     * - issuedAt: Fecha de creación (ej: 2026-02-09 20:00:00)
     * - expiration: Fecha de expiración (ej: 2026-02-10 20:00:00 si expira en 24h)
     * - signature: Firma criptográfica con la clave secreta
     * 
     * FLUJO:
     * 1. Usuario login correctamente
     * 2. AuthController llama generateToken(usuario.getCorreo())
     * 3. Se crea el JWT
     * 4. Se retorna en AuthResponse
     * 5. Frontend lo guarda en localStorage
     * 
     * EJEMPLO VISUAL:
     * generateToken("juan@example.com")
     * |
     * v
     * eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
     * eyJzdWIiOiJqdWFuQGV4YW1wbGUuY29tIiwiaWF0IjoxNjQ5MDAwMDAwLCJleHAiOjE2NDkwODY0MDB9.
     * SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
     */
    public String generateToken(String correo) {
        Date now = new Date();
        Date exp = new Date(now.getTime() + expirationMs);

        return Jwts.builder()
                .subject(correo)
                .issuedAt(now)
                .expiration(exp)
                .signWith(key)
                .compact();
    }

    /**
     * extractCorreo - EXTRAE el email del usuario desde un JWT
     * 
     * @param token: JWT token para extraer el subject de
     * @return: El correo (email) del usuario
     * 
     * FLUJO:
     * 1. Token llega en header Authorization: Bearer <token>
     * 2. JwtRequestFilter extrae el token y lo pasa al JwtUtil
     * 3. JwtUtil.extractCorreo(token) → obtiene el correo
     * 4. Con el correo, se instancia la autenticación
     * 5. El usuario puede acceder a los endpoints protegidos
     * 
     * EXCEPCIONES:
     * - Lanza JwtException si el token es inválido
     * - Lanza JwtException si el token ha expirado
     * - Lanza IllegalArgumentException si el token es null/vacío
     * 
     * NOTA: Este método SOLO se llama después de validar con validateToken()
     */
    public String extractCorreo(String token) {
        Claims claims = getClaims(token);
        return claims.getSubject();
    }

    /**
     * validateToken - VALIDA que un JWT sea válido
     * 
     * @param token: JWT token a validar
     * @return: true si es válido, false si es inválido o expiró
     * 
     * VALIDACIONES:
     * 1. Verifica que la FIRMA sea correcta (con la clave secreta)
     *    - Si alguien modificó el token → firma inválida → false
     * 2. Verifica que NO haya EXPIRADO
     *    - Si la fecha actual > expiration → false
     * 3. Verifica que el formato sea correcto (header.payload.signature)
     *    - Si el token no tiene 3 partes → false
     * 
     * FLUJO:
     * 1. Cliente envía: Authorization: Bearer <token>
     * 2. JwtRequestFilter llama validateToken(token)
     * 3. Si return true → el usuario se autentica
     * 4. Si return false → se retorna 401 Unauthorized
     * 
     * CASOS DE FALSO:
     * - Token modificado: firma no coincide
     * - Token expirado: fecha > fecha de expiración
     * - Token corrupto: formato inválido
     * - Token con clave diferente: fue generado con otra clave
     */
    public boolean validateToken(String token) {
        try {
            getClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException ex) {
            return false;
        }
    }

    /**
     * getClaims - PARSEA Y VALIDA un JWT (interno)
     * 
     * PROPÓSITO: Método privado que hace el trabajo pesado
     * 
     * PASOS:
     * 1. Crea un parser de JWT
     * 2. Verifica la firma con la clave secreta
     * 3. Parse el token
     * 4. Extrae el payload (Claims)
     * 
     * EXCEPCIONES POSIBLES:
     * - JwtException: Token inválido, expirado, o firma falsa
     * - IllegalArgumentException: Token null o formato incorrecto
     * 
     * Los llamadores (extractCorreo, validateToken) manejan estas excepciones
     */
    private Claims getClaims(String token) {
        try {

            return Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (JwtException | IllegalArgumentException ex) {

            throw ex;
        }
    }
}
