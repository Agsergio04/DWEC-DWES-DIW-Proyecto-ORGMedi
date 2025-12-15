package proyecto.orgmedi.dominio;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.util.List;
import java.time.LocalDate;
import static org.junit.jupiter.api.Assertions.*;

class GestorMedicamentosTest {
    private GestorMedicamentos gestor;
    private Medicamento medicamento1;
    private Medicamento medicamento2;

    @BeforeEach
    void setUp() {
        gestor = new GestorMedicamentos();
        medicamento1 = Medicamento.builder()
                .nombre("Paracetamol")
                .cantidadMg(500)
                .fechaInicio(LocalDate.parse("2025-01-01"))
                .fechaFin(LocalDate.parse("2025-01-10"))
                .color("Blanco")
                .frecuencia(2)
                .build();
        medicamento2 = Medicamento.builder()
                .nombre("Ibuprofeno")
                .cantidadMg(400)
                .fechaInicio(LocalDate.parse("2025-02-01"))
                .fechaFin(LocalDate.parse("2025-02-10"))
                .color("Rojo")
                .frecuencia(3)
                .build();
    }

    @Test
    void testAgregarMedicamento() {
        gestor.agregarMedicamento(medicamento1);
        assertTrue(gestor.listarMedicamentos().contains(medicamento1));
    }

    @Test
    void testEliminarMedicamento() {
        gestor.agregarMedicamento(medicamento1);
        gestor.eliminarMedicamento(medicamento1);
        assertFalse(gestor.listarMedicamentos().contains(medicamento1));
    }

    @Test
    void testListarMedicamentos() {
        gestor.agregarMedicamento(medicamento1);
        gestor.agregarMedicamento(medicamento2);
        List<Medicamento> lista = gestor.listarMedicamentos();
        assertEquals(2, lista.size());
        assertTrue(lista.contains(medicamento1));
        assertTrue(lista.contains(medicamento2));
    }
}
