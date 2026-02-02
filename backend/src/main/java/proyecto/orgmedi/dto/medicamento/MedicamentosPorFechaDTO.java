package proyecto.orgmedi.dto.medicamento;

import lombok.*;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDate;
import java.util.List;

/**
 * DTO que contiene todos los medicamentos agrupados por hora para una fecha específica
 * Esta es la respuesta principal del nuevo endpoint /api/medicamentos/por-fecha
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicamentosPorFechaDTO {
    /**
     * Fecha de los medicamentos (yyyy-MM-dd)
     */
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate fecha;
    
    /**
     * Medicamentos agrupados por hora (ordenados de menor a mayor hora)
     */
    private List<MedicamentosPorHoraDTO> gruposPorHora;
    
    /**
     * Total de medicamentos para esta fecha (incluyendo duplicados por hora)
     */
    private Integer totalMedicamentos;
}
