package proyecto.orgmedi.dto.auth;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * AuthResponse - DTO de RESPUESTA después de autenticación exitosa
 * 
 * PROPÓSITO: Devolver el JWT token al cliente después de login/registro
 * 
 * USO:
 * 1. Cliente hace POST /api/auth/login con AuthRequest
 * 2. Servidor valida credenciales
 * 3. Si son válidas → genera JWT
 * 4. Respuesta HTTP 200 OK + AuthResponse con el token
 * 
 * JWT TOKEN - JSON Web Token:
 * - Formato: header.payload.signature (3 partes separadas por puntos)
 * - Ejemplo: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWI..."
 * 
 * CONTENIDO DEL TOKEN (payload):
 * - sub: El nombre del usuario (subject)
 * - exp: Fecha de expiración (Epoch timestamp)
 * - token: El JWT completo
 * - iat: Fecha de emisión (issued at)
 * 
 * USO EN CLIENTE:
 * 1. Almacenar en localStorage: localStorage.setItem('token', response.token);
 * 2. Enviar en requests posteriores:
 *    headers: {
 *      'Authorization': 'Bearer ' + token
 *    }
 * 3. JwtAuthenticationFilter valida que sea válido
 * 
 * SEGURIDAD:
 * - El token se VERIFICA pero NO se puede desencriptar (está firmado)
 * - Si el cliente lo modifica, la firma será inválida
 * - Expira después del tiempo configurado (ej: 24 horas)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    /**
     * TOKEN - JWT (JSON Web Token) para autenticación futura
     * 
     * @JsonProperty("token"): Especifica el nombre en el JSON ("útil si el campo
     * Java tiene nombre diferente)
     * 
     * FORMATO: "header.payload.signature"
     * 
     * EJEMPLO:
     * eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
     * eyJzdWIiOiJqdWFuLnBlcmV6IiwiZXhwIjoxNjQ5MjAwMDAwLCJpYXQiOjE2NDkxMTYwMDB9.
     * SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
     * 
     * EL CLIENTE DEBE:
     * 1. Guardar este token en localStorage
     * 2. En cada petición Auth, agregarlo al header:
     *    Authorization: Bearer eyJhbGciOi...
     * 3. El servidor lo valida con JwtUtil.validateToken()
     * 4. Si es válido, permite continuar
     * 5. Si es inválido o expiró, retorna 401 Unauthorized
     */
    @JsonProperty("token")
    private String token;
}

