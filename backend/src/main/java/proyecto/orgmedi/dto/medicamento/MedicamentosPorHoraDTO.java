package proyecto.orgmedi.dto.medicamento;

import lombok.*;
import java.util.List;

/**
 * DTO que agrupa medicamentos por hora
 * Representa todos los medicamentos que se deben tomar a una hora específica
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicamentosPorHoraDTO {
    /**
     * Hora en formato HH:mm
     */
    private String hora;
    
    /**
     * Lista de medicamentos que se deben tomar a esta hora
     */
    private List<MedicamentoConHoraDTO> medicamentos;
}
