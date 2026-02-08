package proyecto.orgmedi.service.validation;

import proyecto.orgmedi.dominio.Medicamento;

/**
 * Interfaz para estrategia de validación de medicamentos
 * Implementa Strategy Pattern para validaciones
 * Permite agregar nuevas validaciones sin modificar código existente (OCP)
 */
public interface MedicamentoValidationStrategy {
    
    /**
     * Valida un medicamento
     * @param medicamento medicamento a validar
     * @throws IllegalArgumentException si la validación falla
     */
    void validate(Medicamento medicamento);
    
    /**
     * Obtiene el nombre de la estrategia
     */
    String getNombre();
}
