package proyecto.orgmedi.dto.medicamento;

import lombok.*;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDate;
import java.time.LocalTime;

/**
 * ConsumoRegistroDTO - DTO para registros de consumo de medicamentos
 * 
 * CONCEPTO CLAVE - PLANIFICACIÓN vs REGISTRO:
 * 
 * MEDICAMENTO = PLAN (Amoxicilina 08:00, cada 8h, del 1-8 febrero)
 * CONSUMO REGISTRO = CADA TOMA ESPECÍFICA (1-feb 08:00, 1-feb 16:00, etc.)
 * 
 * EJEMPLO VISUAL:
 * +------ Medicamento (Plan) ------+
 * | Amoxicilina 500mg             |
 * | Inicio: 08:00                 |
 * | Frecuencia: 8 horas           |
 * | Fechas: 1-8 febrero           |
 * +-------------------------------+
 *            |
 *            | (Genera automáticamente)
 *            v
 * +---- ConsumoRegistros (Tomas) ----+
 * | 1-feb 08:00 - consumido: false  |
 * | 1-feb 16:00 - consumido: false  |
 * | 1-feb 00:00 - consumido: true   |
 * | 2-feb 08:00 - consumido: false  |
 * | ...
 * +----------------------------------+
 * 
 * PROPÓSITO:
 * 1. Registrar cada toma programada
 * 2. Marcar si se tomó o no (control de adherencia)
 * 3. Historial de cumplimiento del usuario
 * 4. A partir de cambios en medicamento, estos registros se regeneran
 * 
 * USO EN ENDPOINTS:
 * - GET /api/consumo/{usuarioId}/{fecha} → Lista de registros para esa fecha
 * - PUT /api/consumo/{id} → Marcar como consumido/no consumido
 * - GET /api/consumo/historial → Historial completo del usuario
 * 
 * IMPORTANTE:
 * - No se crean a mano, se generan automáticamente cuando se crea medicamento
 * - Si cambias medicamento (frecuencia, horas) → se regeneran estos registros
 * - Permite hacer tracking de cumplimiento del tratamiento
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConsumoRegistroDTO {
    /**
     * ID - Identificador único del registro de consumo en BD
     */
    private Long id;
    
    /**
     * FECHA - Fecha en la que se debe tomar (o se tomó) el medicamento
     * Formato: yyyy-MM-dd (ej: "2026-02-10")
     * 
     * Esta es la fecha COMPLETA de la toma, no solo referencia al medicamento
     * Ejemplo: Si medicamento es Amoxicilina cada 8h desde el 1 febrero:
     *   1-feb 08:00 - Consumo registro 1
     *   1-feb 16:00 - Consumo registro 2
     *   2-feb 00:00 - Consumo registro 3 (MISMA MEDICINA, OTRO DÍA/HORA)
     */
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate fecha;
    
    /**
     * HORA - Hora exacta en la que se debe tomar la dosis
     * Formato: HH:mm (ej: "08:00", "14:30")
     * 
     * CONCATENACIÓN FECHA + HORA:
     * fecha=2026-02-10 + hora=08:00 = Toma el 10-feb a las 8 de la mañana
     * 
     * UNICIDAD:
     * La combinación (usuarioId, medicamentoId, fecha, hora) es única
     * No puede haber dos registros de consumo exactamente a la misma hora
     * del mismo medicamento del mismo usuario
     */
    @JsonFormat(pattern = "HH:mm")
    private LocalTime hora;
    
    /**
     * MEDICAMENTO ID - Referencia al medicamento de este registro
     * Permite saber qué medicamento se deve tomar en esta fecha/hora
     */
    private Long medicamentoId;
    
    /**
     * MEDICAMENTO NOMBRE - Nombre descriptivo para mostrar en UI
     * Ejemplo: "Amoxicilina 500mg"
     * Se denormaliza aquí para no hacer join en cada consulta
     */
    private String medicamentoNombre;
    
    /**
     * CONSUMIDO - Flag que indica si el usuario ya tomó esta dosis
     * - true = Ya se tomó
     * - false = Aún no se toma (o no se tomó)
     * 
     * USO:
     * 1. Cliente puede marcar al tomar: PUT /api/consumo/{id} (consumido=true)
     * 2. Permite trackear adherencia (% de tomas completadas)
     * 3. Historial muestra cuáles se tomaron y cuáles no
     */
    private Boolean consumido;
}
