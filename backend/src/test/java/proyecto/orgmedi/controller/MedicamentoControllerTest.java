package proyecto.orgmedi.controller;

import proyecto.orgmedi.dominio.Medicamento;
import proyecto.orgmedi.service.MedicamentoService;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.http.ResponseEntity;
import java.time.LocalDate;

@ExtendWith(MockitoExtension.class)
class MedicamentoControllerTest {
    @Mock
    private MedicamentoService medicamentoService;
    @InjectMocks
    private MedicamentoController medicamentoController;

    @Test
    void getMedicamentoById_returnsMedicamento() {
        Medicamento m = Medicamento.builder()
            .id(1L)
            .nombre("Paracetamol")
            .cantidadMg(500)
            .horaInicio("08:00")
            .fechaInicio(LocalDate.now())
            .fechaFin(LocalDate.now().plusDays(10))
            .color("blanco")
            .frecuencia(2)
            .build();
        when(medicamentoService.getByIdOrThrow(1L)).thenReturn(m);
        ResponseEntity<Medicamento> response = medicamentoController.getMedicamentoById(1L);
        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).isEqualTo(m);
    }
}
