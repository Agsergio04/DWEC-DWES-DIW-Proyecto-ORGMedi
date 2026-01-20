package proyecto.orgmedi.dto.medicamento;

import lombok.*;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicamentoDTO {
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
}
