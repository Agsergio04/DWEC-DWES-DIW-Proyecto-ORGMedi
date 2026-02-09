package proyecto.orgmedi.dominio;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

/**
 * Entidad Usuario - Representa un usuario del sistema
 * 
 * PROPÓSITO: Un usuario es una persona que se registra en OrgMedi
 * para gestionar sus medicamentos de forma organizada.
 * 
 * RESPONSABILIDADES:
 * - Autenticarse en el sistema con usuario y contraseña
 * - Mantener su información personal (email, usuario, contraseña)
 * - Tener un gestor de medicamentos asociado (GestorMedicamentos)
 * - Recibir notificaciones del sistema
 * 
 * RELACIONES:
 * - 1:1 con GestorMedicamentos (cada usuario tiene UN gestor)
 * - 1:N con Medicamento (a través del gestor)
 * - 1:N con Notificación (puede recibir múltiples notificaciones)
 */
@Getter // Genera getters para todos los atributos
@Setter // Genera setters para todos los atributos
@NoArgsConstructor // Constructor vacío (sin parámetros)
@AllArgsConstructor // Constructor con todos los parámetros
@Builder // Patrón Builder para crear objetos de forma más clara
@Entity // Indica que es una entidad de BD (tabla)
@Table(name = "usuarios") // Especifica el nombre de la tabla en BD
public class Usuario {
    
    // ============ ATRIBUTOS =============
    
    /**
     * ID único del usuario (clave primaria)
     * Se genera automáticamente por la BD (auto-incremento)
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Correo electrónico del usuario
     * VALIDACIONES:
     * - No puede estar vacío (@NotBlank)
     * - Debe ser un email válido (@Email)
     * - Debe ser único en la BD (unique = true) - no puede haber dos usuarios con el mismo correo
     * - No puede ser NULL (nullable = false)
     * 
     * EJEMPLO: usuario@example.com
     */
    @NotBlank(message = "El correo es obligatorio")
    @Email(message = "El correo debe ser válido")
    @Column(nullable = false, unique = true)
    private String correo;

    /**
     * Nombre de usuario para hacer login
     * Este es el nombre que se usa en el formulario de login (puede ser diferente del correo)
     * VALIDACIONES:
     * - No puede estar vacío (@NotBlank)
     * - No puede ser NULL (nullable = false)
     * 
     * EJEMPLO: juan.garcia o usuario123
     */
    @NotBlank(message = "El usuario es obligatorio")
    @Column(nullable = false)
    private String usuario;

    /**
     * Contraseña del usuario (hasheada con algoritmo BCrypt)
     * SEGURIDAD: IMPORTANTE - La contraseña se almacena HASHEADA (cifrada), NO en texto plano
     * VALIDACIONES:
     * - No puede estar vacía (@NotBlank)
     * - No puede ser NULL (nullable = false)
     * 
     * EJEMPLO en BD: $2a$10$... (hash de BCrypt)
     */
    @NotBlank(message = "La contraseña es obligatoria")
    @Column(nullable = false)
    private String contrasena;

    /**
     * Relación 1:1 con GestorMedicamentos
     * EXPLICACIÓN: 
     * - Cada usuario tiene EXACTAMENTE UN gestor de medicamentos
     * - El gestor es el contenedor de todos los medicamentos del usuario
     * - Se carga EAGER (ansiosamente) = cuando se carga un Usuario, se carga su GestorMedicamentos
     * - CASCADE.ALL = cuando se elimina un Usuario, se elimina automáticamente su GestorMedicamentos
     * - mappedBy = "usuario" significa que GestorMedicamentos tiene un atributo que apunta a este Usuario
     * 
     * FLUJO: Usuario -> posee -> GestorMedicamentos -> contiene -> Medicamentos
     */
    @OneToOne(mappedBy = "usuario", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private GestorMedicamentos gestorMedicamentos;

    // ============ MÉTODOS ESPECIALES =============
    
    /**
     * Método equals() - Compara dos usuarios
     * NOTA: Solo compara por ID, dos usuarios son iguales si tienen el mismo ID
     * (aunque tengan diferente correo o usuario)
     */
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Usuario usuario1 = (Usuario) o;
        return id != null && id.equals(usuario1.id);
    }

    /**
     * Método hashCode() - Genera un código hash para usar en HashMaps, HashSets, etc.
     */
    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
