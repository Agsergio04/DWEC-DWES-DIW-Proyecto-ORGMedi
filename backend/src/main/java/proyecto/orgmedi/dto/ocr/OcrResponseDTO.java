package proyecto.orgmedi.dto.ocr;

import lombok.*;
import java.util.List;
import java.util.Map;

/**
 * DTO de respuesta del servicio OCR
 * Contiene los datos extraídos con sus niveles de confianza
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OcrResponseDTO {
    private String nombre;  // Nombre del medicamento
    private Integer cantidadMg;  // Cantidad en mg
    private String fechaInicio;  // Fecha de inicio (formato dd/MM/yyyy)
    private String fechaFin;  // Fecha de fin (formato dd/MM/yyyy)
    private String color;  // Color del medicamento
    private Integer frecuencia;  // Frecuencia de toma

    // Confianza de cada campo
    private Map<String, Double> confidenceByField;

    // Confianza general
    private Double overallConfidence;

    // Detalles de campos problemáticos
    private List<ExtractedFieldDTO> problemFields;

    // Texto completo extraído
    private String rawText;
}

