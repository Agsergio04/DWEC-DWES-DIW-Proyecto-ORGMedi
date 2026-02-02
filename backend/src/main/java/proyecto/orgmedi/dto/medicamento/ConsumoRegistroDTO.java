package proyecto.orgmedi.dto.medicamento;

import lombok.*;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDate;
import java.time.LocalTime;

/**
 * DTO para registrar el consumo de un medicamento en una fecha y hora específica
 * Permite marcar independientemente cada toma de un medicamento
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConsumoRegistroDTO {
    private Long id;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate fecha;
    
    @JsonFormat(pattern = "HH:mm")
    private LocalTime hora;
    
    private Long medicamentoId;
    private String medicamentoNombre;
    private Boolean consumido;
}
