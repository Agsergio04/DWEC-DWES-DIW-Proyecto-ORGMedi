package proyecto.orgmedi.service;

import proyecto.orgmedi.dominio.Medicamento;
import proyecto.orgmedi.dto.medicamento.MedicamentoDTO;
import proyecto.orgmedi.dto.medicamento.MedicamentosPorFechaDTO;
import proyecto.orgmedi.dto.medicamento.MedicamentosPorHoraDTO;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Interfaz para servicio de gestión de medicamentos
 * Cumple con Interface Segregation Principle (ISP)
 */
public interface IMedicamentoService {
    
    List<Medicamento> findAll();
    
    Optional<Medicamento> findById(Long id);
    
    Medicamento getByIdOrThrow(Long id);
    
    Medicamento createMedicamento(Medicamento medicamento);
    
    Medicamento updateMedicamento(Long id, Medicamento medicamento);
    
    void deleteMedicamento(Long id);
    
    List<MedicamentoDTO> getMedicamentosPorUsuario(Long usuarioId);
    
    MedicamentosPorFechaDTO getMedicamentosPorFecha(Long usuarioId, LocalDate fecha);
    
    MedicamentosPorHoraDTO getMedicamentosPorHora(Long usuarioId, LocalDate fecha, String hora);
}
