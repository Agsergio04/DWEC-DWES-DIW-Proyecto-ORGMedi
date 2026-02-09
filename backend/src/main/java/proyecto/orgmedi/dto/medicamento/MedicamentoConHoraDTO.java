package proyecto.orgmedi.dto.medicamento;

import lombok.*;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDate;

/**
 * MedicamentoConHoraDTO - DTO para medicamento + hora específica de toma
 * 
 * PROPÓSITO: Representar UN MEDICAMENTO EN UNA HORA ESPECÍFICA DEL DÍA
 * 
 * CONTEXTO - UN medicamento puede aparecer MÚLTIPLES VECES en un día:
 * 
 * EJEMPLO - Amoxicilina cada 8 horas en un día:
 * +-- 2026-02-10 --+
 * | 08:00 → MedicamentoConHoraDTO (id=1, displayTime=\"08:00\")\n * | 16:00 → MedicamentoConHoraDTO (id=1, displayTime=\"16:00\")\n * | 00:00 → MedicamentoConHoraDTO (id=1, displayTime=\"00:00\")\n * +----------------+\n * \n * NOTA: Es el MISMO medicamento (mismo id=1) pero con DIFERENTES displayTime\n * \n * USO EN RESPUESTA:\n * GET /api/medicamentos/por-fecha?fecha=2026-02-10\n * Devuelve una lista de MedicamentoConHoraDTO, cada uno con su hora de toma\n * \n * DIFERENCIA CON MedicamentoDTO:\n * - MedicamentoDTO: Datos básicos del medicamento (sin hora)\n * - MedicamentoConHoraDTO: Igual pero + displayTime para la hora de toma\n * \n * EL CAMPO displayTime ES LA DIFERENCIA CLAVE:\n * Sin displayTime: ¿Cuándo debo tomar este medicamento?\n * Con displayTime: Sé exactamente que a las 08:00, 16:00, y 00:00\n */
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
     * DISPLAY TIME - LA HORA ESPECÍFICA PARA HOY
     * 
     * Este es el campo DIFERENCIADOR de MedicamentoConHoraDTO
     * 
     * EJEMPLO:
     * Amoxicilina cada 8h en 2026-02-10:
     * - 08:00 → displayTime=\"08:00\"
     * - 16:00 → displayTime=\"16:00\"
     * - 00:00 (= 24:00 del día anterior) → displayTime=\"00:00\"
     * 
     * USO EN FRONTEND:
     * Grouped by hora:
     * {
     *   \"hora\": \"08:00\",
     *   \"medicamentos\": [
     *     {id: 1, nombre: \"Amoxicilina\", displayTime: \"08:00\"},
     *     {id: 2, nombre: \"Ibuprofeno\", displayTime: \"08:00\"}
     *   ]
     * }
     * 
     * El frontend muestra todas las tomas de HOY ordenadas por esta hora
     */
    private String displayTime;
}
