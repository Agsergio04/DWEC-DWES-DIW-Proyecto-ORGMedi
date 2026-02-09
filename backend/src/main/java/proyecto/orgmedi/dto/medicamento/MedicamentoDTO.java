package proyecto.orgmedi.dto.medicamento;

import lombok.*;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDate;

/**
 * DTO (Data Transfer Object) para Medicamento
 * 
 * PROPÓSITO: Transferir información de medicamentos entre capas
 * - Request: Crear o actualizar medicamentos desde el frontend
 * - Response: Devolver medicamentos al frontend en formato JSON
 * 
 * DIFERENCIA vs Entidad:
 * - Medicamento.java = ENTIDAD de BD (con relaciones JPA)
 * - MedicamentoDTO = DATOS SIMPLES sin relaciones (solo campos básicos)
 * 
 * CAMPOS:
 * - id: Identificador único del medicamento
 * - nombre: Nombre del medicamento (ej: "Amoxicilina 500mg")
 * - cantidadMg: Dosis en miligramos (ej: 500)
 * - horaInicio: Hora de la primera toma (formato HH:mm, ej: "08:00")
 * - fechaInicio: Fecha cuando empieza la medicación
 * - fechaFin: Fecha cuando termina la medicación
 * - color: Color para UI (ej: "#FF5733") para distinguir medicamentos visualmente
 * - frecuencia: Cada cuántas horas se toma (ej: 8 = cada 8 horas)
 * - consumed: Boolean indicando si se ha consumido (para tracking)
 * 
 * EJEMPLO DE USO:
 * POST /api/medicamentos
 * {
 *   "nombre": "Amoxicilina",
 *   "cantidadMg": 500,
 *   "horaInicio": "08:00",
 *   "fechaInicio": "2026-02-10",
 *   "fechaFin": "2026-02-17",
 *   "color": "#FF5733",
 *   "frecuencia": 8,
 *   "consumed": false
 * }
 * 
 * CICLO DE CONVERSIÓN:
 * 1. Frontend envía JSON → MedicamentoDTO
 * 2. Controlador recibe MedicamentoDTO
 * 3. Servicio: medicamentoService.fromDto(dto) → Medicamento (entidad)
 * 4. Se guarda en BD
 * 5. Al devolver: Medicamento → medicamentoService.toDto(medicamento) → MedicamentoDTO → JSON
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicamentoDTO {
    /**
     * Identificador único asignado por la base de datos
     */
    private Long id;
    
    /**
     * Nombre descriptivo del medicamento
     * Ej: "Amoxicilina 500mg", "Ibuprofeno 400mg"
     */
    private String nombre;
    
    /**
     * Dosis del medicamento en miligramos
     * Ej: 500 = 500mg por toma
     */
    private Integer cantidadMg;
    
    /**
     * Hora de la PRIMERA toma en formato HH:mm
     * Ej: "08:00" significa la primera dosis a las 8 de la mañana
     * A partir de aquí se calculan todas las tomas futuras según frecuencia
     */
    private String horaInicio;
    
    /**
     * Fecha en que COMIENZA el medicamento
     * Todas las tomas se generan a partir de esta fecha
     * Formato: yyyy-MM-dd (ej: "2026-02-10")
     */
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate fechaInicio;
    
    /**
     * Fecha en que TERMINA el medicamento
     * No se generan tomas después de esta fecha
     * Formato: yyyy-MM-dd (ej: "2026-02-17")
     */
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate fechaFin;
    
    /**
     * Color hexadecimal para mostrar en UI (#RRGGBB)
     * Permite al usuario visualizar diferentes medicamentos con colores distintos
     * Ej: "#FF5733" (naranja), "#33FF57" (verde)
     */
    private String color;
    
    /**
     * FRECUENCIA en HORAS entre tomas
     * Ej: 8 = cada 8 horas → 3 tomas/día
     *     6 = cada 6 horas → 4 tomas/día
     *     12 = cada 12 horas → 2 tomas/día
     * 
     * CÁLCULO DE TOMAS:
     * 1. Primera toma: fechaInicio a horaInicio
     * 2. Segunda toma: Primera toma + frecuencia horas
     * 3. Tercera toma: Segunda toma + frecuencia horas
     * ... hasta que supere fechaFin
     */
    private Integer frecuencia;
    
    /**
     * Flag para marcar si el medicamento ha sido consumido
     * Se usa en el historial para tracking de cumplimiento
     */
    private Boolean consumed;
}
