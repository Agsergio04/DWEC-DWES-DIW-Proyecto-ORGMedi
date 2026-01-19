package proyecto.orgmedi.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import proyecto.orgmedi.dominio.Medicamento;
import proyecto.orgmedi.dto.medicamento.MedicamentoDTO;
import proyecto.orgmedi.error.BadRequestException;
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
    @SuppressWarnings("null")
    void createMedicamento_success_withDto() {
        MedicamentoDTO dto = MedicamentoDTO.builder()
                .nombre("Paracetamol")
                .cantidadMg(500)
                .horaInicio("08:00")
                .fechaInicio(LocalDate.parse("2025-01-01"))
                .fechaFin(LocalDate.parse("2025-01-10"))
                .color("Blanco")
                .frecuencia(2)
                .build();

        Medicamento m = new Medicamento();
        m.setNombre(dto.getNombre());
        m.setCantidadMg(dto.getCantidadMg());
        m.setHoraInicio(dto.getHoraInicio());
        m.setFechaInicio(dto.getFechaInicio());
        m.setFechaFin(dto.getFechaFin());
        m.setColor(dto.getColor());
        m.setFrecuencia(dto.getFrecuencia());

        when(medicamentoRepository.save(any(Medicamento.class))).thenReturn(m);

        Medicamento saved = medicamentoService.createMedicamento(dto);
        assertNotNull(saved);
        assertEquals("Paracetamol", saved.getNombre());
        verify(medicamentoRepository).save(any(Medicamento.class));
    }

    @Test
    @SuppressWarnings("null")
    void createMedicamento_conflict() {
        Medicamento m = new Medicamento();
        m.setNombre("Ibuprofen");

        assertThrows(BadRequestException.class, () -> medicamentoService.createMedicamento(m));
    }

    @Test
    void getByIdOrThrow_notFound() {
        when(medicamentoRepository.findById(999L)).thenReturn(Optional.empty());
        assertThrows(NotFoundException.class, () -> medicamentoService.getByIdOrThrow(999L));
    }

    @Test
    void deleteByIdOrThrow_success() {
        Medicamento m = new Medicamento();
        m.setId(1L);
        m.setNombre("Aspirina");
        when(medicamentoRepository.findById(1L)).thenReturn(Optional.of(m));

        assertDoesNotThrow(() -> medicamentoService.deleteByIdOrThrow(1L));
        verify(medicamentoRepository).deleteById(1L);
    }
}
