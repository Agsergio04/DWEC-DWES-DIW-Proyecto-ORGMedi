package proyecto.orgmedi.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import proyecto.orgmedi.dominio.Medicamento;
import proyecto.orgmedi.dto.medicamento.MedicamentoDTO;
import proyecto.orgmedi.error.ConflictException;
import proyecto.orgmedi.error.NotFoundException;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class MedicamentoServiceTest {

    @Mock
    private proyecto.orgmedi.repo.MedicamentoRepository medicamentoRepository;

    @InjectMocks
    private MedicamentoService medicamentoService;

    @Test
    void createMedicamento_success_withDto() {
        MedicamentoDTO dto = MedicamentoDTO.builder()
                .nombre("Paracetamol")
                .cantidadMg(500)
                .fechaInicio(LocalDate.parse("2025-01-01"))
                .fechaFin(LocalDate.parse("2025-01-10"))
                .color("Blanco")
                .frecuencia(2)
                .build();

        Medicamento m = new Medicamento();
        m.setNombre(dto.getNombre());
        m.setCantidadMg(dto.getCantidadMg());
        m.setFechaInicio(dto.getFechaInicio());
        m.setFechaFin(dto.getFechaFin());
        m.setColor(dto.getColor());
        m.setFrecuencia(dto.getFrecuencia());

        when(medicamentoRepository.findById(dto.getNombre())).thenReturn(Optional.empty());
        when(medicamentoRepository.save(any(Medicamento.class))).thenReturn(m);

        Medicamento saved = medicamentoService.createMedicamento(dto);
        assertNotNull(saved);
        assertEquals("Paracetamol", saved.getNombre());
        verify(medicamentoRepository).save(any(Medicamento.class));
    }

    @Test
    void createMedicamento_conflict() {
        Medicamento m = new Medicamento();
        m.setNombre("Ibuprofen");
        when(medicamentoRepository.findById(m.getNombre())).thenReturn(Optional.of(m));

        assertThrows(ConflictException.class, () -> medicamentoService.createMedicamento(m));
    }

    @Test
    void getByNombreOrThrow_notFound() {
        when(medicamentoRepository.findById("X")).thenReturn(Optional.empty());
        assertThrows(NotFoundException.class, () -> medicamentoService.getByNombreOrThrow("X"));
    }

    @Test
    void deleteByNombreOrThrow_success() {
        Medicamento m = new Medicamento();
        m.setNombre("Aspirina");
        when(medicamentoRepository.findById("Aspirina")).thenReturn(Optional.of(m));

        assertDoesNotThrow(() -> medicamentoService.deleteByNombreOrThrow("Aspirina"));
        verify(medicamentoRepository).deleteById("Aspirina");
    }
}
