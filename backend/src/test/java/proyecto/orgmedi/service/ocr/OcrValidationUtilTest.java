package proyecto.orgmedi.service.ocr;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Pruebas unitarias para OcrValidationUtil
 */
@DisplayName("OcrValidationUtil Tests")
class OcrValidationUtilTest {

    @Test
    @DisplayName("Validar nombre válido")
    void testIsValidNombreValid() {
        assertTrue(OcrValidationUtil.isValidNombre("Ibuprofeno"));
        assertTrue(OcrValidationUtil.isValidNombre("Paracetamol"));
        assertTrue(OcrValidationUtil.isValidNombre("Ácido Acetilsalicílico"));
    }

    @Test
    @DisplayName("Rechazar nombre inválido")
    void testIsValidNombreInvalid() {
        assertFalse(OcrValidationUtil.isValidNombre(""));
        assertFalse(OcrValidationUtil.isValidNombre("  "));
        assertFalse(OcrValidationUtil.isValidNombre("Ab")); // Menos de 3 caracteres
        assertFalse(OcrValidationUtil.isValidNombre("Ibu123")); // Contiene números
    }

    @Test
    @DisplayName("Extraer cantidad en mg")
    void testExtractCantidadMg() {
        assertEquals(400, OcrValidationUtil.extractCantidadMg("Ibuprofeno 400 mg"));
        assertEquals(500, OcrValidationUtil.extractCantidadMg("500mg"));
        assertEquals(1000, OcrValidationUtil.extractCantidadMg("1000 miligramos"));
        assertNull(OcrValidationUtil.extractCantidadMg("sin dosis"));
    }

    @Test
    @DisplayName("Calcular confianza de cantidad")
    void testCalculateCantidadConfidence() {
        assertEquals(100.0, OcrValidationUtil.calculateCantidadConfidence("400 mg"));
        assertEquals(50.0, OcrValidationUtil.calculateCantidadConfidence("400"));
        assertEquals(0.0, OcrValidationUtil.calculateCantidadConfidence(""));
    }

    @Test
    @DisplayName("Extraer fecha válida")
    void testExtractFechaValid() {
        LocalDate fecha = OcrValidationUtil.extractFecha("15/01/2024");
        assertNotNull(fecha);
        assertEquals(15, fecha.getDayOfMonth());
        assertEquals(1, fecha.getMonthValue());
        assertEquals(2024, fecha.getYear());

        // Formato alternativo
        fecha = OcrValidationUtil.extractFecha("15-01-2024");
        assertNotNull(fecha);

        // Año de 2 dígitos
        fecha = OcrValidationUtil.extractFecha("15/01/24");
        assertNotNull(fecha);
        assertEquals(2024, fecha.getYear());
    }

    @Test
    @DisplayName("Rechazar fecha inválida")
    void testExtractFechaInvalid() {
        assertNull(OcrValidationUtil.extractFecha("32/01/2024")); // Día inválido
        assertNull(OcrValidationUtil.extractFecha("15/13/2024")); // Mes inválido
        assertNull(OcrValidationUtil.extractFecha("texto sin fecha"));
    }

    @Test
    @DisplayName("Extraer color")
    void testExtractColor() {
        assertEquals("blanco", OcrValidationUtil.extractColor("Tableta color blanco"));
        assertEquals("rojo", OcrValidationUtil.extractColor("píldora roja"));
        assertEquals("azul", OcrValidationUtil.extractColor("AZUL"));
        assertNull(OcrValidationUtil.extractColor("color plateado"));
    }

    @Test
    @DisplayName("Extraer frecuencia")
    void testExtractFrecuencia() {
        assertEquals(3, OcrValidationUtil.extractFrecuencia("Tomar 3 veces al día"));
        assertEquals(2, OcrValidationUtil.extractFrecuencia("2 dosis"));
        assertEquals(1, OcrValidationUtil.extractFrecuencia("1 cada día"));
        assertNull(OcrValidationUtil.extractFrecuencia("tomar regularmente"));
    }

    @Test
    @DisplayName("Validar medicamento completo")
    void testIsValidMedicamento() {
        assertTrue(OcrValidationUtil.isValidMedicamento(
                "Ibuprofeno",
                400,
                LocalDate.of(2024, 1, 15),
                LocalDate.of(2024, 12, 31),
                "blanco",
                3
        ));

        assertFalse(OcrValidationUtil.isValidMedicamento(
                "Ibu", // Nombre corto pero válido
                0, // Cantidad inválida
                LocalDate.of(2024, 1, 15),
                LocalDate.of(2024, 12, 31),
                "blanco",
                3
        ));

        assertFalse(OcrValidationUtil.isValidMedicamento(
                "Ibuprofeno",
                400,
                LocalDate.of(2024, 12, 31),
                LocalDate.of(2024, 1, 15), // Fecha fin anterior a inicio
                "blanco",
                3
        ));
    }

    @Test
    @DisplayName("Calcular confianza de fecha")
    void testCalculateFechaConfidence() {
        assertEquals(100.0, OcrValidationUtil.calculateFechaConfidence("15/01/2024"));
        assertEquals(30.0, OcrValidationUtil.calculateFechaConfidence("15"));
        assertEquals(0.0, OcrValidationUtil.calculateFechaConfidence(""));
    }

    @Test
    @DisplayName("Calcular confianza de color")
    void testCalculateColorConfidence() {
        assertEquals(100.0, OcrValidationUtil.calculateColorConfidence("blanco"));
        assertEquals(0.0, OcrValidationUtil.calculateColorConfidence("plateado"));
        assertEquals(0.0, OcrValidationUtil.calculateColorConfidence(""));
    }

    @Test
    @DisplayName("Calcular confianza de frecuencia")
    void testCalculateFrecuenciaConfidence() {
        assertEquals(100.0, OcrValidationUtil.calculateFrecuenciaConfidence("3 veces"));
        assertEquals(50.0, OcrValidationUtil.calculateFrecuenciaConfidence("3"));
        assertEquals(0.0, OcrValidationUtil.calculateFrecuenciaConfidence(""));
    }
}

