package proyecto.orgmedi.controller;

import proyecto.orgmedi.dominio.GestorMedicamentos;
import proyecto.orgmedi.service.GestorMedicamentosService;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.http.ResponseEntity;

@ExtendWith(MockitoExtension.class)
class GestorMedicamentosControllerTest {
    @Mock
    private GestorMedicamentosService gestorMedicamentosService;
    @InjectMocks
    private GestorMedicamentosController gestorMedicamentosController;

    @Test
    void getGestorById_returnsGestorMedicamentos() {
        GestorMedicamentos g = new GestorMedicamentos();
        g.setId(1L);
        when(gestorMedicamentosService.getByIdOrThrow(1L)).thenReturn(g);
        ResponseEntity<GestorMedicamentos> response = gestorMedicamentosController.getGestorById(1L);
        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).isEqualTo(g);
    }
}

