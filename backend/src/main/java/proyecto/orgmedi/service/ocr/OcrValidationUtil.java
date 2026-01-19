package proyecto.orgmedi.service.ocr;

import java.time.LocalDate;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Utilidad para validar y extraer datos usando expresiones regulares
 * Calcula confianza de extracción basada en calidad de coincidencia
 */
public class OcrValidationUtil {

    // Patrones regex para cada tipo de campo
    private static final Pattern NOMBRE_PATTERN = Pattern.compile("^[a-zA-ZáéíóúñÁÉÍÓÚÑ\\s\\-]+$");
    private static final Pattern CANTIDAD_MG_PATTERN = Pattern.compile("\\b(\\d{1,5})\\s*(?:mg|mgr|miligramos?)\\b", Pattern.CASE_INSENSITIVE);
    private static final Pattern FECHA_PATTERN = Pattern.compile("(\\d{1,2})[/-](\\d{1,2})[/-](\\d{2,4})");
    private static final Pattern COLORES_PATTERN = Pattern.compile("\\b(rojo|azul|verde|blanco|negro|amarillo|rosa|naranja|morado|gris|marrón|beige)\\b", Pattern.CASE_INSENSITIVE);
    private static final Pattern FRECUENCIA_PATTERN = Pattern.compile("\\b(\\d{1,3})\\s*(?:veces?|cada|dosis|tomas?)\\b", Pattern.CASE_INSENSITIVE);

    /**
     * Valida que un nombre sea válido (solo letras, espacios y guiones)
     */
    public static boolean isValidNombre(String nombre) {
        if (nombre == null || nombre.trim().isEmpty()) {
            return false;
        }
        return NOMBRE_PATTERN.matcher(nombre.trim()).matches() && nombre.trim().length() >= 3;
    }

    /**
     * Extrae cantidad en mg usando regex
     * Retorna el número o null si no encuentra coincidencia válida
     */
    public static Integer extractCantidadMg(String text) {
        if (text == null) return null;
        Matcher matcher = CANTIDAD_MG_PATTERN.matcher(text);
        if (matcher.find()) {
            try {
                return Integer.parseInt(matcher.group(1));
            } catch (NumberFormatException e) {
                return null;
            }
        }
        return null;
    }

    /**
     * Calcula confianza para cantidad en mg
     * 100% si se encuentra con patrón exacto, 50% si se encuentra un número suelto
     */
    public static Double calculateCantidadConfidence(String text) {
        if (text == null || text.trim().isEmpty()) {
            return 0.0;
        }
        if (CANTIDAD_MG_PATTERN.matcher(text).find()) {
            return 100.0;
        }
        // Buscar números sueltos como fallback
        if (Pattern.compile("\\d{1,5}").matcher(text).find()) {
            return 50.0;
        }
        return 0.0;
    }

    /**
     * Extrae fecha en formato dd/MM/yyyy
     */
    public static LocalDate extractFecha(String text) {
        if (text == null) return null;
        Matcher matcher = FECHA_PATTERN.matcher(text);
        if (matcher.find()) {
            try {
                int day = Integer.parseInt(matcher.group(1));
                int month = Integer.parseInt(matcher.group(2));
                int year = Integer.parseInt(matcher.group(3));

                // Ajustar año si es de 2 dígitos
                if (year < 100) {
                    year = year < 50 ? year + 2000 : year + 1900;
                }

                // Validar que el día y mes sean válidos
                if (day < 1 || day > 31 || month < 1 || month > 12) {
                    return null;
                }

                return LocalDate.of(year, month, day);
            } catch (Exception e) {
                return null;
            }
        }
        return null;
    }

    /**
     * Calcula confianza para fecha
     */
    public static Double calculateFechaConfidence(String text) {
        if (text == null || text.trim().isEmpty()) {
            return 0.0;
        }
        if (extractFecha(text) != null) {
            return 100.0;
        }
        // Si contiene números pero no es fecha válida
        if (Pattern.compile("\\d").matcher(text).find()) {
            return 30.0;
        }
        return 0.0;
    }

    /**
     * Extrae color del medicamento
     */
    public static String extractColor(String text) {
        if (text == null) return null;
        Matcher matcher = COLORES_PATTERN.matcher(text.toLowerCase());
        if (matcher.find()) {
            return matcher.group(1);
        }
        return null;
    }

    /**
     * Calcula confianza para color
     */
    public static Double calculateColorConfidence(String text) {
        if (text == null || text.trim().isEmpty()) {
            return 0.0;
        }
        if (extractColor(text) != null) {
            return 100.0;
        }
        return 0.0;
    }

    /**
     * Extrae frecuencia de toma
     */
    public static Integer extractFrecuencia(String text) {
        if (text == null) return null;
        Matcher matcher = FRECUENCIA_PATTERN.matcher(text);
        if (matcher.find()) {
            try {
                return Integer.parseInt(matcher.group(1));
            } catch (NumberFormatException e) {
                return null;
            }
        }
        return null;
    }

    /**
     * Calcula confianza para frecuencia
     */
    public static Double calculateFrecuenciaConfidence(String text) {
        if (text == null || text.trim().isEmpty()) {
            return 0.0;
        }
        if (FRECUENCIA_PATTERN.matcher(text).find()) {
            return 100.0;
        }
        // Buscar números sueltos como fallback
        if (Pattern.compile("\\d{1,3}").matcher(text).find()) {
            return 50.0;
        }
        return 0.0;
    }

    /**
     * Valida que todos los campos sean válidos
     */
    public static boolean isValidMedicamento(String nombre, Integer cantidadMg, LocalDate fechaInicio,
                                             LocalDate fechaFin, String color, Integer frecuencia) {
        return isValidNombre(nombre) &&
               cantidadMg != null && cantidadMg > 0 &&
               fechaInicio != null && fechaFin != null && fechaInicio.isBefore(fechaFin) &&
               color != null && !color.trim().isEmpty() &&
               frecuencia != null && frecuencia > 0;
    }
}

