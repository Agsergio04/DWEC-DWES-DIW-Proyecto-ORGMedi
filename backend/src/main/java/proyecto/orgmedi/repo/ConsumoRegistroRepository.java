package proyecto.orgmedi.repo;

import proyecto.orgmedi.dominio.ConsumoRegistro;
import proyecto.orgmedi.dominio.Usuario;
import proyecto.orgmedi.dominio.Medicamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

/**
 * ConsumoRegistroRepository - Repositorio para acceder a registros de consumo
 * 
 * PROPÓSITO: Persistencia y consulta de CADA TOMA individual de medicamento
 * 
 * CONCEPTO CLAVE - REGISTRO vs PLANIFICACIÓN:
 * 
 * Medicamento = PLAN (Amoxicilina 08:00, cada 8h, 1-8 febrero)
 * ConsumoRegistro = CADA TOMA (registro individual de cuándo se toma)
 * 
 * EJEMPLO VISUAL:
 * 1 Medicamento → genera → 21 ConsumoRegistros
 * 
 * RELACIONES:
 * - ConsumoRegistro N:1 Usuario (muchos registros para 1 usuario)
 * - ConsumoRegistro N:1 Medicamento (muchos registros para 1 medicamento)
 * 
 * MÉTODOS HEREDADOS (de JpaRepository):
 * - save(registro) - Guardar nuevo registro de consumo
 * - findById(id) - Obtener un registro por ID
 * - findAll() - Obtener todos (NO USAR - muchos registros)
 * - delete(registro) - Eliminar un registro
 * - deleteById(id) - Eliminar por ID
 * - count() - Contar total de registros
 * 
 * FLUJO DE CREACIÓN DE REGISTROS:
 * 1. Usuario crea Medicamento (POST /api/medicamentos)
 * 2. MedicamentoService calcula todas las tomas
 * 3. Para cada toma: crea un ConsumoRegistro
 * 4. consumoRegistroRepository.save(registro) → persiste
 * 
 * CUANDO CAMBIAR UN MEDICAMENTO:
 * Si cambias frecuencia o horas:
 * 1. Se ELIMINAN todos los ConsumoRegistros antiguos
 * 2. Se calculan nuevos según la nueva planificación
 * 3. Se insertan nuevos registros
 * 
 * CAMPO ÚNICO:
 * (usuario_id, medicamento_id, fecha, hora) = UNIQUE
 * No puede haber 2 registros iguales de la misma toma
 */
@Repository
public interface ConsumoRegistroRepository extends JpaRepository<ConsumoRegistro, Long> {
    /**
     * Obtener todos los consumos registrados para un usuario en una fecha específica
     */
    List<ConsumoRegistro> findByUsuarioAndFecha(Usuario usuario, LocalDate fecha);
    
    /**
     * Obtener un registro específico de consumo
     */
    Optional<ConsumoRegistro> findByUsuarioAndMedicamentoAndFechaAndHora(
        Usuario usuario, 
        Medicamento medicamento, 
        LocalDate fecha, 
        LocalTime hora
    );
    
    /**
     * Obtener registros de consumo para un medicamento en un rango de fechas
     */
    List<ConsumoRegistro> findByMedicamentoAndFechaBetween(
        Medicamento medicamento, 
        LocalDate fechaInicio, 
        LocalDate fechaFin
    );
    
    /**
     * Obtener todos los registros de consumo para un medicamento específico
     */
    List<ConsumoRegistro> findByMedicamentoId(Long medicamentoId);
    
    /**
     * Contar consumos registrados para un usuario en una fecha
     */
    Long countByUsuarioAndFechaAndConsumidoTrue(Usuario usuario, LocalDate fecha);
}
