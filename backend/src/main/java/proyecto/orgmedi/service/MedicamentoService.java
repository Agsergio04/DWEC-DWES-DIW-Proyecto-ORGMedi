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
public class MedicamentoService {
    private final MedicamentoRepository medicamentoRepository;

    @Autowired
    public MedicamentoService(MedicamentoRepository medicamentoRepository) {
        this.medicamentoRepository = medicamentoRepository;
    }

    public List<Medicamento> findAll() {
        return medicamentoRepository.findAll();
    }

    public Optional<Medicamento> findByNombre(String nombre) {
        return medicamentoRepository.findById(nombre);
    }

    public Medicamento getByNombreOrThrow(String nombre) {
        return medicamentoRepository.findById(nombre)
                .orElseThrow(() -> new NotFoundException("Medicamento no encontrado"));
    }

    public Medicamento createMedicamento(Medicamento medicamento) {
        if (medicamento.getNombre() == null || medicamento.getNombre().isBlank()) {
            throw new BadRequestException("Nombre inválido");
        }
        if (medicamentoRepository.findById(medicamento.getNombre()).isPresent()) {
            throw new ConflictException("Medicamento ya existe");
        }
        return medicamentoRepository.save(medicamento);
    }

    // create from DTO
    public Medicamento createMedicamento(MedicamentoDTO dto) {
        if (dto.getNombre() == null || dto.getNombre().isBlank()) {
            throw new BadRequestException("Nombre inválido");
        }
        if (medicamentoRepository.findById(dto.getNombre()).isPresent()) {
            throw new ConflictException("Medicamento ya existe");
        }
        Medicamento m = fromDto(dto);
        return medicamentoRepository.save(m);
    }

    public Medicamento updateMedicamento(String nombre, Medicamento medicamento) {
        if (medicamentoRepository.findById(nombre).isEmpty()) {
            throw new NotFoundException("Medicamento no encontrado");
        }
        medicamento.setNombre(nombre);
        return medicamentoRepository.save(medicamento);
    }

    // update from DTO
    public Medicamento updateMedicamento(String nombre, MedicamentoDTO dto) {
        if (medicamentoRepository.findById(nombre).isEmpty()) {
            throw new NotFoundException("Medicamento no encontrado");
        }
        Medicamento m = fromDto(dto);
        m.setNombre(nombre);
        return medicamentoRepository.save(m);
    }

    public void deleteByNombreOrThrow(String nombre) {
        if (medicamentoRepository.findById(nombre).isEmpty()) {
            throw new NotFoundException("Medicamento no encontrado");
        }
        medicamentoRepository.deleteById(nombre);
    }

    // mapper DTO <-> entity
    public Medicamento fromDto(MedicamentoDTO dto) {
        Medicamento m = new Medicamento();
        m.setNombre(dto.getNombre());
        m.setCantidadMg(dto.getCantidadMg());
        m.setFechaInicio(dto.getFechaInicio());
        m.setFechaFin(dto.getFechaFin());
        m.setColor(dto.getColor());
        m.setFrecuencia(dto.getFrecuencia());
        return m;
    }

    public MedicamentoDTO toDto(Medicamento m) {
        MedicamentoDTO dto = new MedicamentoDTO();
        dto.setNombre(m.getNombre());
        dto.setCantidadMg(m.getCantidadMg());
        dto.setFechaInicio(m.getFechaInicio());
        dto.setFechaFin(m.getFechaFin());
        dto.setColor(m.getColor());
        dto.setFrecuencia(m.getFrecuencia());
        return dto;
    }

    public Medicamento save(Medicamento medicamento) {
        return medicamentoRepository.save(medicamento);
    }

    public void deleteByNombre(String nombre) {
        medicamentoRepository.deleteById(nombre);
    }
}
