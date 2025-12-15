package proyecto.orgmedi.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.SignatureAlgorithm;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import io.jsonwebtoken.io.DecodingException;

import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {
    // La clave y la expiración se inyectan desde application.properties o variables de entorno
    private final SecretKey key;
    private final long expirationMs;

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

    // Genera un JWT con subject = correo
    public String generateToken(String correo) {
        Date now = new Date();
        Date exp = new Date(now.getTime() + expirationMs);

        return Jwts.builder()
                .setSubject(correo)
                .setIssuedAt(now)
                .setExpiration(exp)
                .signWith(key)
                .compact();
    }

    // Extrae el correo (subject) de un token; lanza JwtException si es inválido/expirado
    public String extractCorreo(String token) {
        Claims claims = getClaims(token);
        return claims.getSubject();
    }

    // Comprueba si el token es válido (firma correcta y no expirado)
    public boolean validateToken(String token) {
        try {
            getClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException ex) {
            return false;
        }
    }

    private Claims getClaims(String token) {
        try {

            return Jwts.parser()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (JwtException | IllegalArgumentException ex) {

            throw ex;
        }
    }
}
