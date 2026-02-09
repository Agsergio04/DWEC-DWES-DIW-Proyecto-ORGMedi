package proyecto.orgmedi.dto.medicamento;

import lombok.*;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDate;
import java.util.List;

/**
 * MedicamentosPorFechaDTO - DTO PRINCIPAL para obtener medicamentos por fecha
 * 
 * PROPÓSITO: Respuesta completa y estructurada de TODOS los medicamentos de un usuario
 * para una fecha específica, AGRUPADOS POR HORA
 * 
 * Este es el DTO RAÍZ que contiene toda la información necesaria para mostrar
 * el cronograma de medicamentos de UN DÍA
 * 
 * ESTRUCTURA JERÁRQUICA:
 * MedicamentosPorFechaDTO (nivel 1: fecha completa)
 *   └─ gruposPorHora: List<MedicamentosPorHoraDTO> (nivel 2: horas del día)
 *        └─ medicamentos: List<MedicamentoConHoraDTO> (nivel 3: meds individuales)
 * 
 * EJEMPLO - RESPUESTA JSON para 2026-02-10:
 * {
 *   "fecha": "2026-02-10",
 *   "totalMedicamentos": 5,
 *   "gruposPorHora": [
 *     {
 *       "hora": "08:00",
 *       "medicamentos": [
 *         {
 *           "id": 1,
 *           "nombre": "Amoxicilina 500mg",
 *           "cantidadMg": 500,
 *           "horaInicio": "08:00",
 *           "fechaInicio": "2026-02-01",
 *           "fechaFin": "2026-02-20",
 *           "color": "#FF5733",
 *           "frecuencia": 8,
 *           "consumed": false,
 *           "displayTime": "08:00"
 *         }
 *       ]
 *     },
 *     {
 *       "hora": "16:00",
 *       "medicamentos": [...]
 *     }
 *   ]
 * }
 * 
 * VENTAJAS DE ESTA ESTRUCTURA:
 * 1. Frontend NO necesita hacer cálculos
 * 2. Todos los datos ya están organizados por hora
 * 3. Fácil iterar en la UI: for each hour → for each med
 * 4. El totalMedicamentos es para UI (ej: "5 tomas hoy")
 * 
 * USO:
 * GET /api/medicamentos/por-fecha?usuarioId=1&fecha=2026-02-10
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
