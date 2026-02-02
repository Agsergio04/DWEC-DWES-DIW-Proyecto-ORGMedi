package proyecto.orgmedi.dto.medicamento;

import lombok.*;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDate;

/**
 * DTO que representa un medicamento con su hora de toma específica
 * Utilizado cuando un medicamento se muestra múltiples veces en un día
 * (por ejemplo, un medicamento que se toma cada 8 horas)
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicamentoConHoraDTO {
    private Long id;
    private String nombre;
    private Integer cantidadMg;
    private String horaInicio;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate fechaInicio;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate fechaFin;
    private String color;
    private Integer frecuencia;
    private Boolean consumed;
    
    /**
     * Hora específica en la que se debe tomar este medicamento (HH:mm)
     * En un mismo día puede haber múltiples entradas del mismo medicamento
     * con diferentes displayTime según su frecuencia
     */
    private String displayTime;
}
