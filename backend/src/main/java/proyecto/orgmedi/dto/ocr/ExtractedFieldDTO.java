package proyecto.orgmedi.dto.ocr;

import lombok.*;

/**
 * DTO para representar un campo extraído con OCR
 * Contiene el valor extraído y su confianza de extracción
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExtractedFieldDTO {
    private String fieldName;  // Nombre del campo (ej: "nombre", "cantidadMg")
    private String extractedValue;  // Valor extraído del OCR
    private Double confidence;  // Confianza de extracción 0-100%
    private String errorMessage;  // Mensaje de error si la extracción falló
}

