package proyecto.orgmedi.dominio;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Entidad ConsumoRegistro - Registro de cada toma de medicamento planificada
 * 
 * PROPÓSITO: Guardar CADA VEZ que un medicamento debe ser tomado (planificado)
 * y rastrear si fue consumido o no.
 * 
 * EJEMPLO REAL:
 * Si creamos un medicamento "Amoxicilina":
 * - Fecha inicio: 2024-02-01
 * - Fecha fin: 2024-02-08
 * - Hora inicio: 08:00
 * - Frecuencia: 8 horas
 * 
 * El sistema genera automáticamente ConsumoRegistros:
 * - 2024-02-01 08:00 (no consumido)
 * - 2024-02-01 16:00 (no consumido)
 * - 2024-02-01 00:00 (next día, no consumido)
 * - ... (uno por cada toma hasta 2024-02-08)
 * 
 * FLUJO:
 * 1. Usuario crea medicamento
 * 2. Sistema genera automáticamente ConsumoRegistros (uno por cada toma planificada)
 * 3. Usuario marca como consumido cuando toma el medicamento
 * 4. Sistema registra en BD: {usuario, medicamento, fecha, hora, consumido=true}
 * 
 * RELACIONES:
 * - N:1 con Usuario (muchos registros pueden pertenecer a un usuario)
 * - N:1 con Medicamento (muchos registros pueden apuntar el mismo medicamento)
 * 
 * RESTRICCIÓN ÚNICA: No puede haber dos registros iguales
 * (mismo usuario, medicamento, fecha y hora)
 */
@Entity
@Table(
    name = "consumo_registros", 
    // Esta restricción ÚNICA evita duplicados: no puede haber dos registros
    // del mismo usuario, para el mismo medicamento, en la misma fecha y hora
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"usuario_id", "medicamento_id", "fecha", "hora"})
    }
)
@Getter // Getters automáticos
@Setter // Setters automáticos
@NoArgsConstructor // Constructor vacío
@AllArgsConstructor // Constructor con todos los parámetros
@Builder // Patrón Builder
public class ConsumoRegistro {
    
    // ============ ATRIBUTOS =============
    
    /**
     * ID único del registro (clave primaria)
     * Auto-incrementado por la BD
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    /**
     * Referencia al usuario al que pertenece este registro
     * EXPLICACIÓN:
     * - Muchos registros pueden pertenecer a un usuario
     * - Se cargan LAZY (perezoso) = solo cuando se accede explícitamente
     * - FetchType.LAZY mejora el rendimiento evitando cargar todo innecesariamente
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;
    
    /**
     * Referencia al medicamento que este registro describe
     * EXPLICACIÓN:
     * - Un registro siempre está asociado a UN medicamento
     * - Se cargan LAZY = solo cuando se accede explícitamente
     * - Permite saber QUÉ medicamento debe ser tomado en esta toma
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medicamento_id", nullable = false)
    private Medicamento medicamento;
    
    /**
     * Fecha en que debe/debería tomarse el medicamento
     * FORMATO: yyyy-MM-dd (ejemplo: 2024-02-01)
     * EJEMPLO: Si el medicamento es del 1 al 8 de febrero, habrá registros para
     *          cada día: 2024-02-01, 2024-02-02, ..., 2024-02-08
     */
    @Column(nullable = false)
    private LocalDate fecha;
    
    /**
     * Hora en que debe/debería tomarse el medicamento
     * FORMATO: HH:mm (ejemplo: 08:00, 16:00)
     * EJEMPLO: Si horaInicio=08:00 y frecuencia=8, las horas son: 08:00, 16:00, 00:00
     */
    @Column(nullable = false)
    private LocalTime hora;
    
    /**
     * Flag (bandera) que indica si el medicamento fue consumido en esta toma
     * VALORES:
     * - null/false → No consumido
     * - true → Consumido
     * 
     * Se usa para rastrear qué tomas se completaron y cuáles faltaron
     * Permite al usuario ver un historial "tomé esto" o "esto se olvidó"
     */
    @Column(nullable = false)
    private Boolean consumido;
    
    /**
     * Timestamp de creación del registro (milisegundos desde 1970)
     * Se calcula automáticamente cuando se crea el registro con @PrePersist
     */
    @Column(name = "created_at")
    private Long createdAt;
    
    // ============ MÉTODOS DE CICLO DE VIDA =============
    
    /**
     * Método que se ejecuta ANTES de insertar el registro en la BD
     * Asegura que todos los registros tengan un timestamp de creación
     * Se ejecuta automáticamente solo una vez
     */
    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = System.currentTimeMillis(); // Tiempo actual en milisegundos
        }
    }
}
