package proyecto.orgmedi.dto.medicamento;

import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicamentoDTO {
    private Long id;
    private String nombre;
    private int cantidadMg;
    private String horaInicio;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private String color;
    private int frecuencia;
}
