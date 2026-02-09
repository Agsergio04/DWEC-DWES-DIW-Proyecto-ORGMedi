package proyecto.orgmedi.dominio;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

import java.time.LocalDate;

/**
 * Entidad Medicamento - Representa un medicamento que un usuario debe tomar
 * 
 * PROPÓSITO: Almacenar la información de los medicamentos que un usuario debe consumir,
 * incluyendo detalles como dosis, horarios, duración del tratamiento, etc.
 * 
 * EJEMPLO REAL:
 * Medicamento: Amoxicilina
 * - Cantidad: 500 mg por dosis
 * - Frecuencia: Cada 8 horas (3 veces al día)
 * - Inicio: 2024-02-01 a las 08:00
 * - Fin: 2024-02-08 (7 días de tratamiento)
 * - Generaría recordatorios para: 08:00, 16:00, 00:00 todos los días de 1 a 8 de febrero
 * 
 * RELACIONES:
 * - N:1 con Usuario (varios medicamentos pertenecen a un usuario)
 * - N:1 con ConsumoRegistro (registro de cuándo se tomó)
 */
@Getter // Getters automáticos
@Setter // Setters automáticos
@NoArgsConstructor // Constructor vacío
@AllArgsConstructor // Constructor con todos los parámetros
@Builder // Patrón Builder
@Entity // Es una entidad de BD
@Table(name = "medicamentos") // Nombre de la tabla
public class Medicamento {
    
    // ============ ATRIBUTOS =============
    
    /**
     * ID único del medicamento (clave primaria)
     * Auto-incrementado por la BD
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Nombre del medicamento (debe ser único en la BD)
     * VALIDACIONES:
     * - No puede estar vacío (@NotBlank)
     * - Debe ser único (no puede haber dos medicamentos con el mismo nombre)
     * 
     * EJEMPLO: "Amoxicilina", "Paracetamol", "Ibuprofeno"
     */
    @NotBlank(message = "El nombre es obligatorio")
    @Column(nullable = false, unique = true)
    private String nombre;

    /**
     * Cantidad en miligramos por dosis (la cantidad que toma de una vez)
     * VALIDACIONES:
     * - No puede ser null (@NotNull)
     * - Debe ser mayor que 0 (validado en el setter)
     * 
     * EJEMPLO: 500 (significa 500 mg)
     */
    @NotNull(message = "La cantidad es obligatoria")
    @Column(nullable = false)
    private Integer cantidadMg;

    /**
     * Fecha en la que COMIENZA el tratamiento
     * FORMATO: yyyy-MM-dd (ejemplo: 2024-02-01)
     * VALIDACIONES:
     * - No puede ser null (@NotNull)
     * - El sistema generará recordatorios desde esta fecha
     */
    @NotNull(message = "La fecha de inicio es obligatoria")
    @Column(nullable = false)
    @JsonFormat(pattern = "yyyy-MM-dd") // Formato para JSON
    private LocalDate fechaInicio;

    /**
     * Hora DEL DÍA en la que comienza la primera dosis
     * FORMATO: HH:mm (ejemplo: "08:00", "14:30")
     * VALIDACIONES:
     * - No puede ser null (@NotNull)
     * - Se usa en combinación con frecuencia para generar todos los horarios
     * 
     * EJEMPLO: Si horaInicio="08:00" y frecuencia=8 (cada 8 horas):
     * Los horarios serían: 08:00, 16:00, 00:00 (siguiente día)
     */
    @NotNull(message = "La hora de inicio es obligatoria")
    @Column(nullable = false)
    private String horaInicio;

    /**
     * Fecha en la que TERMINA el tratamiento
     * FORMATO: yyyy-MM-dd (ejemplo: 2024-02-08)
     * VALIDACIONES:
     * - No puede ser null (@NotNull)
     * - El sistema generará recordatorios ANTES de esta fecha (hasta el último día)
     */
    @NotNull(message = "La fecha de fin es obligatoria")
    @Column(nullable = false)
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate fechaFin;

    /**
     * Color para mostrar el medicamento en la interfaz de usuario
     * VALIDACIONES:
     * - No puede estar vacío (@NotBlank)
     * 
     * FORMATO: Código hexadecimal (ejemplo: "#FF5733", "#3498db")
     * PROPÓSITO: Diferenciar visualmente los medicamentos en el calendario
     */
    @NotBlank(message = "El color es obligatorio")
    @Column(nullable = false)
    private String color;

    /**
     * Frecuencia: cada cuántas HORAS se debe tomar el medicamento
     * VALIDACIONES:
     * - No puede ser null (@NotNull)
     * - Debe ser mayor que 0 (validado en el setter)
     * 
     * EJEMPLOS:
     * - frecuencia = 6  → Cada 6 horas (4 veces al día)
     * - frecuencia = 8  → Cada 8 horas (3 veces al día)
     * - frecuencia = 12 → Cada 12 horas (2 veces al día)
     * - frecuencia = 24 → Cada 24 horas (1 vez al día)
     * 
     * CÁLCULO: El sistema genera automáticamente todos los horarios sumando
     * la frecuencia a la horaInicio hasta llegar a fechaFin
     */
    @NotNull(message = "La frecuencia es obligatoria")
    @Column(nullable = false)
    private Integer frecuencia;

    /**
     * Flag (bandera) que indica si el medicamento ya fue consumido hoy
     * Por defecto es false (no consumido)
     * Se usa principalmente en la interfaz para marcar visualmente lo que ya se tomó
     */
    @Column(nullable = false)
    @Builder.Default
    private Boolean consumed = false;
    
    /**
     * Relación N:1 con Usuario
     * EXPLICACIÓN:
     * - Muchos medicamentos pueden pertenecer a UN usuario
     * - Un usuario puede tener varios medicamentos
     * - FetchType.LAZY = Se carga solo si se accede explícitamente (mejor rendimiento)
     * - El usuario_id se guarda en la columna "usuario_id" de esta tabla
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;
    
    // ============ MÉTODOS ÚTILES =============
    
    /**
     * Cambia la cantidad en miligramos del medicamento
     * VALIDACIÓN: Solo permite cambios a valores mayores que 0
     */
    public void cambiarCantidadMg(Integer nuevaCantidad) {
        if (nuevaCantidad != null && nuevaCantidad > 0) {
            this.cantidadMg = nuevaCantidad;
        }
    }

    /**
     * Cambia la fecha de inicio del medicamento
     * Cuando cambia la fecha de inicio, es posible que se deban regenerar los ConsumoRegistros
     */
    public void cambiarFechaInicio(LocalDate nuevaFecha) {
        if (nuevaFecha != null) {
            this.fechaInicio = nuevaFecha;
        }
    }

    /**
     * Cambia la hora de inicio del medicamento
     * Cuando cambia la hora, todos los recordatorios cambiarán (se regeneran)
     */
    public void cambiarHoraInicio(String nuevaHora) {
        if (nuevaHora != null && !nuevaHora.isBlank()) {
            this.horaInicio = nuevaHora;
        }
    }

    /**
     * Cambia la fecha de fin del medicamento
     * Cuando cambia la fecha de fin, hay menos o más días de tratamiento
     */
    public void cambiarFechaFin(LocalDate nuevaFecha) {
        if (nuevaFecha != null) {
            this.fechaFin = nuevaFecha;
        }
    }

    /**
     * Cambia el color del medicamento (para la interfaz)
     */
    public void cambiarColor(String nuevoColor) {
        if (nuevoColor != null && !nuevoColor.isBlank()) {
            this.color = nuevoColor;
        }
    }

    /**
     * Cambia la frecuencia de toma del medicamento
     * VALIDACIÓN: Solo permite cambios a valores mayores que 0
     */
    public void cambiarFrecuencia(Integer nuevaFrecuencia) {
        if (nuevaFrecuencia != null && nuevaFrecuencia > 0) {
            this.frecuencia = nuevaFrecuencia;
        }
    }

    /**
     * Comparación: dos medicamentos son iguales si tienen el mismo nombre
     */
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Medicamento that = (Medicamento) o;
        return nombre != null && nombre.equals(that.nombre);
    }

    /**
     * Hash code para usar en colecciones (HashMap, HashSet, etc.)
     */
    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
