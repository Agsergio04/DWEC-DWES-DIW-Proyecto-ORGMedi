package proyecto.orgmedi.service;

import proyecto.orgmedi.dominio.ConsumoRegistro;
import proyecto.orgmedi.dto.medicamento.ConsumoRegistroDTO;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Interfaz para servicio de gestión de consumos
 * Cumple con Interface Segregation Principle (ISP)
 */
public interface IConsumoRegistroService {
    
    List<ConsumoRegistro> findAll();
    
    Optional<ConsumoRegistro> findById(Long id);
    
    ConsumoRegistro getByIdOrThrow(Long id);
    
    ConsumoRegistro createConsumo(ConsumoRegistro consumo);
    
    ConsumoRegistro updateConsumo(Long id, ConsumoRegistro consumo);
    
    void deleteConsumo(Long id);
    
    List<ConsumoRegistroDTO> getConsumosPorDia(Long usuarioId, LocalDate fecha);
    
    List<ConsumoRegistro> getConsumosDelDia(Long usuarioId, LocalDate fecha);
    
    void marcarConsumido(Long consumoId);
    
    void desmarcarConsumido(Long consumoId);
}
