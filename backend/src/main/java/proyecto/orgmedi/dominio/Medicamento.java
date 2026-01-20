package proyecto.orgmedi.dominio;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "medicamentos")
public class Medicamento {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El nombre es obligatorio")
    @Column(nullable = false, unique = true)
    private String nombre;

    @NotNull(message = "La cantidad es obligatoria")
    @Column(nullable = false)
    private Integer cantidadMg;

    @NotNull(message = "La fecha de inicio es obligatoria")
    @Column(nullable = false)
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate fechaInicio;

    @NotNull(message = "La hora de inicio es obligatoria")
    @Column(nullable = false)
    private String horaInicio;

    @NotNull(message = "La fecha de fin es obligatoria")
    @Column(nullable = false)
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate fechaFin;

    @NotBlank(message = "El color es obligatorio")
    @Column(nullable = false)
    private String color;

    @NotNull(message = "La frecuencia es obligatoria")
    @Column(nullable = false)
    private Integer frecuencia;

    // Métodos para cambiar un atributo a la vez
    public void cambiarCantidadMg(Integer nuevaCantidad) {
        if (nuevaCantidad != null && nuevaCantidad > 0) {
            this.cantidadMg = nuevaCantidad;
        }
    }

    public void cambiarFechaInicio(LocalDate nuevaFecha) {
        if (nuevaFecha != null) {
            this.fechaInicio = nuevaFecha;
        }
    }

    public void cambiarHoraInicio(String nuevaHora) {
        if (nuevaHora != null && !nuevaHora.isBlank()) {
            this.horaInicio = nuevaHora;
        }
    }

    public void cambiarFechaFin(LocalDate nuevaFecha) {
        if (nuevaFecha != null) {
            this.fechaFin = nuevaFecha;
        }
    }

    public void cambiarColor(String nuevoColor) {
        if (nuevoColor != null && !nuevoColor.isBlank()) {
            this.color = nuevoColor;
        }
    }

    public void cambiarFrecuencia(Integer nuevaFrecuencia) {
        if (nuevaFrecuencia != null && nuevaFrecuencia > 0) {
            this.frecuencia = nuevaFrecuencia;
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Medicamento that = (Medicamento) o;
        return nombre != null && nombre.equals(that.nombre);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
