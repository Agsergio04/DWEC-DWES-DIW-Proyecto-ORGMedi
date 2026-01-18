package proyecto.orgmedi.dto.ocr;

import lombok.*;
import java.time.LocalDate;

/**
 * DTO para validación de datos OCR por parte del usuario
 * Usuario puede corregir los valores extraídos antes de guardarse en BD
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OcrValidationDTO {
    private String nombre;  // Nombre del medicamento (corregido por usuario si es necesario)
    private Integer cantidadMg;  // Cantidad en mg
    private LocalDate fechaInicio;  // Fecha de inicio
    private LocalDate fechaFin;  // Fecha de fin
    private String color;  // Color del medicamento
    private Integer frecuencia;  // Frecuencia de toma
}

