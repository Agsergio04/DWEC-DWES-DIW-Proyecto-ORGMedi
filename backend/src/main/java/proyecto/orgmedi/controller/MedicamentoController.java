package proyecto.orgmedi.controller;

import jakarta.validation.Valid;
import proyecto.orgmedi.dominio.Medicamento;
import proyecto.orgmedi.dominio.Usuario;
import proyecto.orgmedi.dominio.GestorMedicamentos;
import proyecto.orgmedi.service.MedicamentoService;
import proyecto.orgmedi.service.GestorMedicamentosService;
import proyecto.orgmedi.dto.medicamento.MedicamentoDTO;
import proyecto.orgmedi.repo.UsuarioRepository;
import proyecto.orgmedi.security.SecurityUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.Statement;

@RestController
@RequestMapping("/api/medicamentos")
public class MedicamentoController {
    private final MedicamentoService medicamentoService;
    private final GestorMedicamentosService gestorMedicamentosService;
    private final UsuarioRepository usuarioRepository;

    @Autowired
    public MedicamentoController(MedicamentoService medicamentoService, 
                                GestorMedicamentosService gestorMedicamentosService,
                                UsuarioRepository usuarioRepository) {
        this.medicamentoService = medicamentoService;
        this.gestorMedicamentosService = gestorMedicamentosService;
        this.usuarioRepository = usuarioRepository;
    }

    @Autowired
    private DataSource dataSource;

    /**
     * Obtiene todos los medicamentos del usuario autenticado
     */
    @GetMapping
    public List<Medicamento> getAllMedicamentos() {
        Usuario usuario = SecurityUtil.getCurrentUser(usuarioRepository);
        GestorMedicamentos gestor = usuario.getGestorMedicamentos();
        if (gestor == null) {
            return List.of();
        }
        return gestor.getMedicamentos();
    }

    /**
     * Obtiene un medicamento específico del usuario autenticado
     */
    @GetMapping("/{id}")
    public ResponseEntity<Medicamento> getMedicamentoById(@PathVariable Long id) {
        Usuario usuario = SecurityUtil.getCurrentUser(usuarioRepository);
        GestorMedicamentos gestor = usuario.getGestorMedicamentos();
        
        if (gestor == null) {
            return ResponseEntity.notFound().build();
        }
        
        Medicamento medicamento = gestor.getMedicamentos().stream()
                .filter(m -> m.getId().equals(id))
                .findFirst()
                .orElse(null);
        
        if (medicamento == null) {
            return ResponseEntity.notFound().build();
        }
        
        return ResponseEntity.ok(medicamento);
    }

    /**
     * Crea un medicamento para el usuario autenticado
     */
    @PostMapping
    public ResponseEntity<MedicamentoDTO> createMedicamento(@Valid @RequestBody MedicamentoDTO dto) {
        Usuario usuario = SecurityUtil.getCurrentUser(usuarioRepository);
        GestorMedicamentos gestor = usuario.getGestorMedicamentos();
        
        if (gestor == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
        
        Medicamento medicamento = medicamentoService.fromDto(dto);
        gestor.agregarMedicamento(medicamento);
        gestorMedicamentosService.save(gestor);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(medicamentoService.toDto(medicamento));
    }

    /**
     * Actualiza un medicamento del usuario autenticado
     */
    @PutMapping("/{id}")
    public ResponseEntity<MedicamentoDTO> updateMedicamento(@PathVariable Long id, @Valid @RequestBody MedicamentoDTO dto) {
        Usuario usuario = SecurityUtil.getCurrentUser(usuarioRepository);
        GestorMedicamentos gestor = usuario.getGestorMedicamentos();
        
        if (gestor == null) {
            return ResponseEntity.notFound().build();
        }
        
        // Buscar el medicamento en el gestor del usuario
        Medicamento medicamento = gestor.getMedicamentos().stream()
                .filter(m -> m.getId().equals(id))
                .findFirst()
                .orElse(null);
        
        if (medicamento == null) {
            return ResponseEntity.notFound().build();
        }
        
        // Actualizar campos (excepto ID)
        medicamento.setNombre(dto.getNombre());
        medicamento.setCantidadMg(dto.getCantidadMg());
        medicamento.setFechaInicio(dto.getFechaInicio());
        medicamento.setFechaFin(dto.getFechaFin());
        medicamento.setColor(dto.getColor());
        medicamento.setFrecuencia(dto.getFrecuencia());
        // Consumido (estado de UI)
        if (dto.getConsumed() != null) {
            medicamento.setConsumed(dto.getConsumed());
        }
        
        gestorMedicamentosService.save(gestor);
        
        return ResponseEntity.ok(medicamentoService.toDto(medicamento));
    }

    /**
     * Actualiza parcialmente un medicamento (PATCH)
     * Solo actualiza los campos que se envíen (no null)
     */
    @PatchMapping("/{id}")
    public ResponseEntity<MedicamentoDTO> patchMedicamento(@PathVariable Long id, @RequestBody MedicamentoDTO dto) {
        Usuario usuario = SecurityUtil.getCurrentUser(usuarioRepository);
        GestorMedicamentos gestor = usuario.getGestorMedicamentos();
        
        if (gestor == null) {
            return ResponseEntity.notFound().build();
        }
        
        // Buscar el medicamento en el gestor del usuario
        Medicamento medicamento = gestor.getMedicamentos().stream()
                .filter(m -> m.getId().equals(id))
                .findFirst()
                .orElse(null);
        
        if (medicamento == null) {
            return ResponseEntity.notFound().build();
        }
        
        // Actualizar solo los campos que se envíen (no null)
        if (dto.getNombre() != null && !dto.getNombre().isBlank()) {
            medicamento.setNombre(dto.getNombre());
        }
        if (dto.getCantidadMg() != null) {
            medicamento.setCantidadMg(dto.getCantidadMg());
        }
        if (dto.getHoraInicio() != null && !dto.getHoraInicio().isBlank()) {
            medicamento.setHoraInicio(dto.getHoraInicio());
        }
        if (dto.getFechaInicio() != null) {
            medicamento.setFechaInicio(dto.getFechaInicio());
        }
        if (dto.getFechaFin() != null) {
            medicamento.setFechaFin(dto.getFechaFin());
        }
        if (dto.getColor() != null && !dto.getColor().isBlank()) {
            medicamento.setColor(dto.getColor());
        }
        if (dto.getFrecuencia() != null) {
            medicamento.setFrecuencia(dto.getFrecuencia());
        }
        // Consumido (estado de UI)
        if (dto.getConsumed() != null) {
            medicamento.setConsumed(dto.getConsumed());
        }
        
        gestorMedicamentosService.save(gestor);
        
        return ResponseEntity.ok(medicamentoService.toDto(medicamento));
    }

    /**
     * Elimina un medicamento del usuario autenticado
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMedicamento(@PathVariable Long id) {
        Usuario usuario = SecurityUtil.getCurrentUser(usuarioRepository);
        GestorMedicamentos gestor = usuario.getGestorMedicamentos();
        
        if (gestor == null) {
            return ResponseEntity.notFound().build();
        }
        
        boolean removed = gestor.getMedicamentos().removeIf(m -> m.getId().equals(id));
        
        if (!removed) {
            return ResponseEntity.notFound().build();
        }
        
        gestorMedicamentosService.save(gestor);
        return ResponseEntity.noContent().build();
    }

    /**
     * Extrae datos de medicamento desde una foto usando OCR
     * @param image - Archivo de imagen del medicamento
     * @return ResponseEntity con los datos extraídos
     */
    @PostMapping("/extract-ocr")
    public ResponseEntity<Map<String, String>> extractOcr(@RequestParam("image") MultipartFile image) {
        try {
            if (image.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "La imagen no puede estar vacía"));
            }

            System.out.println("[OCR] Procesando imagen: " + image.getOriginalFilename());
            System.out.println("[OCR] Tamaño: " + image.getSize() + " bytes");

            // Aquí iría la integración con Tesseract u otro servicio OCR
            // Por ahora, retornamos datos simulados
            Map<String, String> ocrData = new HashMap<>();
            ocrData.put("nombre", "Medicamento OCR Detectado");
            ocrData.put("dosage", "500mg");
            ocrData.put("frecuencia", "2 veces al día");
            ocrData.put("horaInicio", "08:00");
            ocrData.put("cantidad", "30");
            ocrData.put("descripcion", "Datos extraídos de la foto del prospecto");
            ocrData.put("fechaInicio", "2024-01-01");

            return ResponseEntity.ok(ocrData);
        } catch (Exception e) {
            System.err.println("[OCR Error] " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Error al procesar la imagen: " + e.getMessage()));
        }
    }

    /**
     * Endpoint temporal para agregar la columna `consumed` en la tabla `medicamentos`.
     * Uso: POST /api/medicamentos/debug/add-consumed-column
     */
    @PostMapping("/debug/add-consumed-column")
    public ResponseEntity<Map<String, String>> addConsumedColumn() {
        try (Connection conn = dataSource.getConnection(); Statement stmt = conn.createStatement()) {
            stmt.executeUpdate("ALTER TABLE medicamentos ADD COLUMN consumed BOOLEAN DEFAULT FALSE");
            return ResponseEntity.ok(Map.of("result", "column added"));
        } catch (Exception e) {
            System.err.println("[DB] Error adding column: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }
}
