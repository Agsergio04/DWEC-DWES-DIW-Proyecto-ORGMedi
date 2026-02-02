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
 * Repositorio para registros de consumo de medicamentos
 * Permite persistir y consultar el consumo de medicamentos por fecha y hora
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
