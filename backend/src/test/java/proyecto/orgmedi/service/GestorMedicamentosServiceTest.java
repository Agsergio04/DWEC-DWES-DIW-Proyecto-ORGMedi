package proyecto.orgmedi.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import proyecto.orgmedi.dominio.GestorMedicamentos;
import proyecto.orgmedi.error.NotFoundException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class GestorMedicamentosServiceTest {

    @Mock
    private proyecto.orgmedi.repo.GestorMedicamentosRepository gestorRepo;

    @InjectMocks
    private GestorMedicamentosService gestorService;

    @Test
    void getByIdOrThrow_notFound() {
        when(gestorRepo.findById(2L)).thenReturn(Optional.empty());
        assertThrows(NotFoundException.class, () -> gestorService.getByIdOrThrow(2L));
    }

    @Test
    void deleteByIdOrThrow_success() {
        GestorMedicamentos g = new GestorMedicamentos();
        g.setId(5L);
        when(gestorRepo.findById(5L)).thenReturn(Optional.of(g));

        assertDoesNotThrow(() -> gestorService.deleteByIdOrThrow(5L));
        verify(gestorRepo).deleteById(5L);
    }
}

