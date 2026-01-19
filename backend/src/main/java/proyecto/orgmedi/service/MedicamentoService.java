package proyecto.orgmedi.service;

import proyecto.orgmedi.dominio.Medicamento;
import proyecto.orgmedi.repo.MedicamentoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import proyecto.orgmedi.error.NotFoundException;
import proyecto.orgmedi.error.ConflictException;
import proyecto.orgmedi.error.BadRequestException;
import proyecto.orgmedi.dto.medicamento.MedicamentoDTO;

import java.util.List;
import java.util.Optional;

@Service
@SuppressWarnings("null")
public class MedicamentoService {
    private final MedicamentoRepository medicamentoRepository;

    @Autowired
    public MedicamentoService(MedicamentoRepository medicamentoRepository) {
        this.medicamentoRepository = medicamentoRepository;
    }

    public List<Medicamento> findAll() {
        return medicamentoRepository.findAll();
    }

    public Optional<Medicamento> findById(Long id) {
        return medicamentoRepository.findById(id);
    }

    public Medicamento getByIdOrThrow(Long id) {
        return medicamentoRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Medicamento no encontrado"));
    }

    public Medicamento createMedicamento(Medicamento medicamento) {
        if (medicamento.getNombre() == null || medicamento.getNombre().isBlank()) {
            throw new BadRequestException("Nombre inválido");
        }
        return medicamentoRepository.save(medicamento);
    }

    // create from DTO
    public Medicamento createMedicamento(MedicamentoDTO dto) {
        if (dto.getNombre() == null || dto.getNombre().isBlank()) {
            throw new BadRequestException("Nombre inválido");
        }
        Medicamento m = fromDto(dto);
        return medicamentoRepository.save(m);
    }

    public Medicamento updateMedicamento(Long id, Medicamento medicamento) {
        if (medicamentoRepository.findById(id).isEmpty()) {
            throw new NotFoundException("Medicamento no encontrado");
        }
        medicamento.setId(id);
        return medicamentoRepository.save(medicamento);
    }

    // update from DTO
    public Medicamento updateMedicamento(Long id, MedicamentoDTO dto) {
        if (medicamentoRepository.findById(id).isEmpty()) {
            throw new NotFoundException("Medicamento no encontrado");
        }
        Medicamento m = fromDto(dto);
        m.setId(id);
        return medicamentoRepository.save(m);
    }

    public void deleteByIdOrThrow(Long id) {
        if (medicamentoRepository.findById(id).isEmpty()) {
            throw new NotFoundException("Medicamento no encontrado");
        }
        medicamentoRepository.deleteById(id);
    }

    // mapper DTO <-> entity
    public Medicamento fromDto(MedicamentoDTO dto) {
        Medicamento m = new Medicamento();
        if (dto.getId() != null) {
            m.setId(dto.getId());
        }
        m.setNombre(dto.getNombre());
        m.setCantidadMg(dto.getCantidadMg());
        m.setHoraInicio(dto.getHoraInicio());
        m.setFechaInicio(dto.getFechaInicio());
        m.setFechaFin(dto.getFechaFin());
        m.setColor(dto.getColor());
        m.setFrecuencia(dto.getFrecuencia());
        return m;
    }

    public MedicamentoDTO toDto(Medicamento m) {
        MedicamentoDTO dto = new MedicamentoDTO();
        dto.setId(m.getId());
        dto.setNombre(m.getNombre());
        dto.setCantidadMg(m.getCantidadMg());
        dto.setHoraInicio(m.getHoraInicio());
        dto.setFechaInicio(m.getFechaInicio());
        dto.setFechaFin(m.getFechaFin());
        dto.setColor(m.getColor());
        dto.setFrecuencia(m.getFrecuencia());
        return dto;
    }

    public Medicamento save(Medicamento medicamento) {
        return medicamentoRepository.save(medicamento);
    }

    @Deprecated(since = "2.0", forRemoval = true)
    public void deleteByNombre(String nombre) {
        // Deprecated: use deleteByIdOrThrow(Long) instead
    }
}
