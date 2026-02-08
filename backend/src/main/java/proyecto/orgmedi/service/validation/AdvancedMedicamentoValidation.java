package proyecto.orgmedi.service.validation;

import proyecto.orgmedi.dominio.Medicamento;
import proyecto.orgmedi.error.BadRequestException;
import java.time.LocalDate;

/**
 * Estrategia de validación avanzada que incluye validación de fechas
 */
public class AdvancedMedicamentoValidation implements MedicamentoValidationStrategy {
    
    private final MedicamentoValidationStrategy basicValidation;
    
    public AdvancedMedicamentoValidation() {
        this.basicValidation = new BasicMedicamentoValidation();
    }
    
    @Override
    public void validate(Medicamento medicamento) {
        // Primero aplicar validación básica
        basicValidation.validate(medicamento);
        
        // Luego validaciones avanzadas
        if (medicamento.getFechaInicio() == null) {
            throw new BadRequestException("La fecha de inicio es requerida");
        }
        
        if (medicamento.getFechaFin() == null) {
            throw new BadRequestException("La fecha de fin es requerida");
        }
        
        if (medicamento.getFechaInicio().isAfter(medicamento.getFechaFin())) {
            throw new BadRequestException("La fecha de inicio no puede ser posterior a la fecha de fin");
        }
        
        if (medicamento.getFechaInicio().isBefore(LocalDate.now())) {
            throw new BadRequestException("La fecha de inicio no puede ser en el pasado");
        }
        
        if (medicamento.getHoraInicio() == null || medicamento.getHoraInicio().isBlank()) {
            throw new BadRequestException("La hora de inicio es requerida");
        }
    }
    
    @Override
    public String getNombre() {
        return "ADVANCED_VALIDATION";
    }
}
