package proyecto.orgmedi.service.validation;

import proyecto.orgmedi.dominio.Medicamento;
import proyecto.orgmedi.error.BadRequestException;

/**
 * Estrategia de validación básica de medicamentos
 */
public class BasicMedicamentoValidation implements MedicamentoValidationStrategy {
    
    @Override
    public void validate(Medicamento medicamento) {
        if (medicamento == null) {
            throw new BadRequestException("El medicamento no puede ser nulo");
        }
        
        if (medicamento.getNombre() == null || medicamento.getNombre().isBlank()) {
            throw new BadRequestException("El nombre del medicamento es requerido");
        }
        
        if (medicamento.getCantidadMg() == null || medicamento.getCantidadMg() <= 0) {
            throw new BadRequestException("La cantidad en mg debe ser mayor a 0");
        }
        
        if (medicamento.getFrecuencia() == null || medicamento.getFrecuencia() <= 0) {
            throw new BadRequestException("La frecuencia debe ser mayor a 0");
        }
    }
    
    @Override
    public String getNombre() {
        return "BASIC_VALIDATION";
    }
}
