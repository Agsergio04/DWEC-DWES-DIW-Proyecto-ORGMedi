package proyecto.orgmedi.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ChangePasswordRequest {
    @NotBlank(message = "El correo es obligatorio")
    @Email(message = "El correo debe tener un formato válido")
    private String correoActual;

    @NotBlank(message = "La contraseña actual es obligatoria")
    private String contrasenaActual;

    @NotBlank(message = "La nueva contraseña es obligatoria")
    @Size(min = 8, message = "La nueva contraseña debe tener al menos 8 caracteres")
    private String contrasenanueva;

    public String getCorreoActual() { return correoActual; }
    public void setCorreoActual(String correoActual) { this.correoActual = correoActual; }
    
    public String getContrasenaActual() { return contrasenaActual; }
    public void setContrasenaActual(String contrasenaActual) { this.contrasenaActual = contrasenaActual; }
    
    public String getContrasenanueva() { return contrasenanueva; }
    public void setContrasenanueva(String contrasenanueva) { this.contrasenanueva = contrasenanueva; }
}
