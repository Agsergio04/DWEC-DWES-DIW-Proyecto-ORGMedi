package proyecto.orgmedi.service.ocr;

import lombok.extern.slf4j.Slf4j;
import net.sourceforge.tess4j.Tesseract;
import net.sourceforge.tess4j.TesseractException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import proyecto.orgmedi.dto.ocr.ExtractedFieldDTO;
import proyecto.orgmedi.dto.ocr.OcrResponseDTO;
import proyecto.orgmedi.error.OcrProcessingException;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.time.LocalDate;
import java.util.*;

/**
 * Servicio para procesamiento OCR de imágenes de prospectos de medicamentos
 */
@Slf4j
@Service
public class OcrService {

    @Value("${ocr.tessdata-path:}")
    private String tessdataPath;

    /**
     * Procesa una imagen y extrae datos de medicamentos
     * @param file Archivo de imagen cargado
     * @return OcrResponseDTO con datos extraídos y confianza
     */
    public OcrResponseDTO processImage(MultipartFile file) {
        log.info("Iniciando procesamiento OCR para archivo: {}", file.getOriginalFilename());

        try {
            // Validar archivo
            validateFile(file);

            // Obtener texto de la imagen
            String rawText = extractTextFromImage(file);
            log.debug("Texto OCR extraído: {}", rawText);

            if (rawText == null || rawText.trim().isEmpty()) {
                throw new OcrProcessingException("No se pudo extraer texto de la imagen");
            }

            // Procesar texto y extraer campos
            return parseAndExtractFields(rawText);

        } catch (OcrProcessingException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error procesando OCR", e);
            throw new OcrProcessingException("Error procesando imagen: " + e.getMessage(), e);
        }
    }

    /**
     * Extrae texto de la imagen usando Tesseract OCR
     */
    private String extractTextFromImage(MultipartFile file) throws IOException, TesseractException {
        BufferedImage bufferedImage = ImageIO.read(file.getInputStream());
        if (bufferedImage == null) {
            throw new OcrProcessingException("No se pudo leer la imagen");
        }

        Tesseract tesseract = new Tesseract();

        // Configurar ruta de tessdata si está disponible
        if (tessdataPath != null && !tessdataPath.isEmpty()) {
            tesseract.setDatapath(tessdataPath);
        }

        // Configurar idioma español + inglés para mejor reconocimiento
        tesseract.setLanguage("spa+eng");

        // Mejorar la calidad de OCR
        tesseract.setTessVariable("user_defined_dpi", "300");

        return tesseract.doOCR(bufferedImage);
    }

    /**
     * Analiza el texto extraído y obtiene campos individuales
     */
    private OcrResponseDTO parseAndExtractFields(String rawText) {
        OcrResponseDTO response = new OcrResponseDTO();
        response.setRawText(rawText);

        Map<String, Double> confidenceMap = new HashMap<>();
        List<ExtractedFieldDTO> problemFields = new ArrayList<>();

        // Extraer nombre del medicamento
        String nombre = extractNombre(rawText);
        response.setNombre(nombre);
        Double nombreConfidence = nombre != null ? 100.0 : calculateNombreConfidence(rawText);
        confidenceMap.put("nombre", nombreConfidence);
        if (nombreConfidence < 80) {
            problemFields.add(ExtractedFieldDTO.builder()
                    .fieldName("nombre")
                    .extractedValue(nombre)
                    .confidence(nombreConfidence)
                    .errorMessage("No se pudo extraer el nombre del medicamento con claridad")
                    .build());
        }

        // Extraer cantidad en mg
        Integer cantidadMg = OcrValidationUtil.extractCantidadMg(rawText);
        response.setCantidadMg(cantidadMg);
        Double cantidadConfidence = OcrValidationUtil.calculateCantidadConfidence(rawText);
        confidenceMap.put("cantidadMg", cantidadConfidence);
        if (cantidadConfidence < 80) {
            problemFields.add(ExtractedFieldDTO.builder()
                    .fieldName("cantidadMg")
                    .extractedValue(cantidadMg != null ? cantidadMg.toString() : null)
                    .confidence(cantidadConfidence)
                    .errorMessage("No se pudo extraer la cantidad en mg con claridad")
                    .build());
        }

        // Extraer fechas
        LocalDate fechaInicio = OcrValidationUtil.extractFecha(rawText);
        response.setFechaInicio(fechaInicio != null ? fechaInicio.toString() : null);
        Double fechaInicioConfidence = OcrValidationUtil.calculateFechaConfidence(rawText);
        confidenceMap.put("fechaInicio", fechaInicioConfidence);
        if (fechaInicioConfidence < 80) {
            problemFields.add(ExtractedFieldDTO.builder()
                    .fieldName("fechaInicio")
                    .extractedValue(fechaInicio != null ? fechaInicio.toString() : null)
                    .confidence(fechaInicioConfidence)
                    .errorMessage("No se pudo extraer la fecha de inicio con claridad")
                    .build());
        }

        // Para fecha fin, buscar una fecha posterior a la inicial
        LocalDate fechaFin = extractFechaFin(rawText, fechaInicio);
        response.setFechaFin(fechaFin != null ? fechaFin.toString() : null);
        Double fechaFinConfidence = fechaFin != null ? 100.0 : 0.0;
        confidenceMap.put("fechaFin", fechaFinConfidence);
        if (fechaFinConfidence < 80) {
            problemFields.add(ExtractedFieldDTO.builder()
                    .fieldName("fechaFin")
                    .extractedValue(fechaFin != null ? fechaFin.toString() : null)
                    .confidence(fechaFinConfidence)
                    .errorMessage("No se pudo extraer la fecha de fin con claridad")
                    .build());
        }

        // Extraer color
        String color = OcrValidationUtil.extractColor(rawText);
        response.setColor(color);
        Double colorConfidence = OcrValidationUtil.calculateColorConfidence(rawText);
        confidenceMap.put("color", colorConfidence);
        if (colorConfidence < 80) {
            problemFields.add(ExtractedFieldDTO.builder()
                    .fieldName("color")
                    .extractedValue(color)
                    .confidence(colorConfidence)
                    .errorMessage("No se pudo extraer el color con claridad")
                    .build());
        }

        // Extraer frecuencia
        Integer frecuencia = OcrValidationUtil.extractFrecuencia(rawText);
        response.setFrecuencia(frecuencia);
        Double frecuenciaConfidence = OcrValidationUtil.calculateFrecuenciaConfidence(rawText);
        confidenceMap.put("frecuencia", frecuenciaConfidence);
        if (frecuenciaConfidence < 80) {
            problemFields.add(ExtractedFieldDTO.builder()
                    .fieldName("frecuencia")
                    .extractedValue(frecuencia != null ? frecuencia.toString() : null)
                    .confidence(frecuenciaConfidence)
                    .errorMessage("No se pudo extraer la frecuencia con claridad")
                    .build());
        }

        response.setConfidenceByField(confidenceMap);
        response.setOverallConfidence(calculateOverallConfidence(confidenceMap));
        response.setProblemFields(problemFields);

        return response;
    }

    /**
     * Extrae el nombre del medicamento (usualmente está al principio o en título)
     */
    private String extractNombre(String text) {
        // Buscar en la primera línea o en líneas que no contengan números
        String[] lines = text.split("\n");
        for (String line : lines) {
            String cleaned = line.trim();
            if (!cleaned.isEmpty() && !cleaned.matches(".*\\d+.*")) {
                // Si la línea no contiene números, probablemente sea el nombre
                if (OcrValidationUtil.isValidNombre(cleaned) && cleaned.length() >= 3) {
                    return cleaned;
                }
            }
        }
        return null;
    }

    /**
     * Calcula confianza para nombre (entre 0 y 100)
     */
    private Double calculateNombreConfidence(String text) {
        String nombre = extractNombre(text);
        if (nombre != null && OcrValidationUtil.isValidNombre(nombre)) {
            return 100.0;
        }
        return 30.0; // Baja confianza si no se puede extraer
    }

    /**
     * Extrae la fecha fin (usualmente una fecha posterior en el texto)
     */
    private LocalDate extractFechaFin(String text, LocalDate fechaInicio) {
        // Buscar todas las fechas en el texto
        String[] parts = text.split("[\\s\\n]+");
        LocalDate lastDate = null;

        for (String part : parts) {
            LocalDate date = OcrValidationUtil.extractFecha(part);
            if (date != null) {
                if (fechaInicio == null || date.isAfter(fechaInicio)) {
                    lastDate = date;
                }
            }
        }

        return lastDate;
    }

    /**
     * Calcula confianza general basada en el promedio de confianzas
     */
    private Double calculateOverallConfidence(Map<String, Double> confidenceMap) {
        if (confidenceMap.isEmpty()) {
            return 0.0;
        }
        return confidenceMap.values().stream()
                .mapToDouble(Double::doubleValue)
                .average()
                .orElse(0.0);
    }

    /**
     * Valida que el archivo sea una imagen válida
     */
    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new OcrProcessingException("El archivo está vacío");
        }

        String contentType = file.getContentType();
        if (contentType == null || !isValidImageType(contentType)) {
            throw new OcrProcessingException("El archivo debe ser una imagen válida (PNG, JPG, GIF)");
        }

        long maxSize = 10 * 1024 * 1024; // 10MB
        if (file.getSize() > maxSize) {
            throw new OcrProcessingException("El archivo excede el tamaño máximo de 10MB");
        }
    }

    /**
     * Verifica que el tipo MIME sea una imagen válida
     */
    private boolean isValidImageType(String contentType) {
        return contentType.startsWith("image/png") ||
               contentType.startsWith("image/jpeg") ||
               contentType.startsWith("image/jpg") ||
               contentType.startsWith("image/gif");
    }
}

