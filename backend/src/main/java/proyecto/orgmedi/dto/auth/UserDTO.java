package proyecto.orgmedi.dto.auth;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDTO {
    /**
     * ID del usuario
     */
    private Long id;
    
    /**
     * CORREO - Dirección de email (renombrado a "email" en JSON)
     * El @JsonProperty("email") hace que en el JSON aparezca como "email"
     * en lugar de "correo"
     * 
     * Esto permite que el frontend espere "email" mientras internamente
     * usamos "correo"
     */
    @JsonProperty("email")
    private String correo;
    
    /**
     * USUARIO - Nombre del usuario (renombrado a "name" en JSON)
     * El @JsonProperty("name") hace que sea "name" en la respuesta JSON
     */
    @JsonProperty("name")
    private String usuario;
}
