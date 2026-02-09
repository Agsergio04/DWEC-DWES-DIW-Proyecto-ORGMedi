package proyecto.orgmedi.dto.medicamento;

import lombok.*;
import java.util.List;

/**
 * MedicamentosPorHoraDTO - DTO que agrupa medicamentos por hora de toma
 * 
 * PROPÓSITO: Agrupar todos los medicamentos que se deben tomar a UNA HORA ESPECÍFICA
 * 
 * CONTEXTO:
 * En un día puede haber múltiples horas de toma:
 * - 08:00 → varios medicamentos
 * - 12:00 → varios medicamentos
 * - 14:00 → varios medicamentos
 * - 20:00 → varios medicamentos
 * 
 * Este DTO agrupa los que toca a la MISMA HORA
 * 
 * EJEMPLO - 2026-02-10:
 * MedicamentosPorHoraDTO {
 *   hora: "08:00",
 *   medicamentos: [
 *     { id:1, nombre: "Amoxicilina 500mg", displayTime: "08:00" },
 *     { id:2, nombre: "Ibuprofeno 400mg", displayTime: "08:00" }
 *   ]
 * }
 * 
 * MedicamentosPorHoraDTO {
 *   hora: "14:00",
 *   medicamentos: [
 *     { id:1, nombre: "Amoxicilina 500mg", displayTime: "14:00" }
 *   ]
 * }
 * 
 * USO:
 * GET /api/medicamentos/por-fecha?fecha=2026-02-10&hora=08:00
 * Retorna MedicamentosPorHoraDTO con todos los meds de esa hora
 * 
 * EN FRONTEND:
 * Se usan estos grupos para mostrar en la UI:
 * "A las 08:00 tomar: [lista de medicamentos]"
 * "A las 14:00 tomar: [lista de medicamentos]"
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
