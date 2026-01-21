package proyecto.orgmedi.dto.auth;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonCreator;

public class AuthResponse {
    @JsonProperty("token")
    private String token;

    // Constructor vacío requerido por Jackson
    public AuthResponse() {
    }

    @JsonCreator
    public AuthResponse(@JsonProperty("token") String token) {
        this.token = token;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
}

