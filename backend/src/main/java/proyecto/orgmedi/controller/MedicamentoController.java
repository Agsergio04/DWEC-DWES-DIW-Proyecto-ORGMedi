package proyecto.orgmedi.controller;

import jakarta.validation.Valid;
import proyecto.orgmedi.dominio.Medicamento;
import proyecto.orgmedi.dominio.Usuario;
import proyecto.orgmedi.dominio.GestorMedicamentos;
import proyecto.orgmedi.service.MedicamentoService;
import proyecto.orgmedi.service.GestorMedicamentosService;
import proyecto.orgmedi.service.ConsumoRegistroService;
import proyecto.orgmedi.dto.medicamento.MedicamentoDTO;
import proyecto.orgmedi.dto.medicamento.MedicamentosPorFechaDTO;
import proyecto.orgmedi.dto.medicamento.ConsumoRegistroDTO;
import proyecto.orgmedi.repo.UsuarioRepository;
import proyecto.orgmedi.security.SecurityUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Autowired;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.Statement;

@RestController
@RequestMapping("/api/medicamentos")
@Tag(name = "Medicamentos", description = "Endpoints para gestión de medicamentos")
@SecurityRequirement(name = "Bearer Authentication")
public class MedicamentoController {
    private final MedicamentoService medicamentoService;
    private final GestorMedicamentosService gestorMedicamentosService;
    private final UsuarioRepository usuarioRepository;
    private final ConsumoRegistroService consumoRegistroService;

    @Autowired
    public MedicamentoController(MedicamentoService medicamentoService, 
                                GestorMedicamentosService gestorMedicamentosService,
                                UsuarioRepository usuarioRepository,
                                ConsumoRegistroService consumoRegistroService) {
        this.medicamentoService = medicamentoService;
        this.gestorMedicamentosService = gestorMedicamentosService;
        this.usuarioRepository = usuarioRepository;
        this.consumoRegistroService = consumoRegistroService;
    }

    @Autowired
    private DataSource dataSource;

    /**
     * Obtiene todos los medicamentos del usuario autenticado
     */
    @GetMapping
    @Operation(summary = "Listar medicamentos", description = "Obtiene todos los medicamentos del usuario autenticado")
    @ApiResponse(responseCode = "200", description = "Lista de medicamentos obtenida correctamente")
    public List<Medicamento> getAllMedicamentos() {
        Usuario usuario = SecurityUtil.getCurrentUser(usuarioRepository);
        GestorMedicamentos gestor = usuario.getGestorMedicamentos();
        if (gestor == null) {
            return List.of();
        }
        return gestor.getMedicamentos();
    }

    /**
     * Obtiene todos los medicamentos agrupados por hora para una fecha específica
     * 
     * Endpoint: GET /api/medicamentos/por-fecha?fecha=yyyy-MM-dd
     * Ejemplo: GET /api/medicamentos/por-fecha?fecha=2024-12-25
     * 
     * Respuesta:
     * {
     *   "fecha": "2024-12-25",
     *   "gruposPorHora": [
     *     {
     *       "hora": "08:00",
     *       "medicamentos": [...]
     *     },
     *     {
     *       "hora": "16:00",
     *       "medicamentos": [...]
     *     }
     *   ],
     *   "totalMedicamentos": 5
     * }
     */
    @GetMapping("/por-fecha")
    @Operation(summary = "Listar medicamentos por fecha agrupados por hora", 
               description = "Obtiene todos los medicamentos del usuario para una fecha específica, agrupados por hora de toma")
    @ApiResponse(responseCode = "200", description = "Medicamentos agrupados por hora obtenidos correctamente")
    @ApiResponse(responseCode = "400", description = "Formato de fecha inválido")
    public ResponseEntity<MedicamentosPorFechaDTO> getMedicamentosPorFecha(
            @RequestParam(name = "fecha") String fechaStr) {
        try {
            // Parsear la fecha del parámetro (esperado formato yyyy-MM-dd)
            DateTimeFormatter formatter = DateTimeFormatter.ISO_LOCAL_DATE;
            LocalDate fecha = LocalDate.parse(fechaStr, formatter);

            // Obtener usuario autenticado
            Usuario usuario = SecurityUtil.getCurrentUser(usuarioRepository);
            GestorMedicamentos gestor = usuario.getGestorMedicamentos();
            
            if (gestor == null) {
                return ResponseEntity.ok(MedicamentosPorFechaDTO.builder()
                        .fecha(fecha)
                        .gruposPorHora(List.of())
                        .totalMedicamentos(0)
                        .build());
            }

            // Obtener medicamentos del gestor y agruparlos por hora para la fecha
            List<Medicamento> medicamentos = gestor.getMedicamentos();
            System.out.println("[MedicamentoController - getMedicamentosPorFecha] Fecha solicitada: " + fecha);
            System.out.println("[MedicamentoController - getMedicamentosPorFecha] Total medicamentos: " + medicamentos.size());
            for (Medicamento m : medicamentos) {
                System.out.println("[MedicamentoController - getMedicamentosPorFecha] - " + m.getNombre() + 
                                 " | horaInicio: " + m.getHoraInicio() + 
                                 " | frecuencia: " + m.getFrecuencia() +
                                 " | fechaInicio: " + m.getFechaInicio() +
                                 " | fechaFin: " + m.getFechaFin());
            }
            MedicamentosPorFechaDTO resultado = medicamentoService.getMedicamentosPorFecha(medicamentos, fecha);

            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            System.err.println("[MedicamentoController] Error parsing date or fetching medicines: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
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

    /**
     * Registra o actualiza el consumo de un medicamento en una fecha y hora específica
     * POST /api/medicamentos/{id}/consumo?fecha=yyyy-MM-dd&hora=HH:mm&consumido=true
     */
    @PostMapping("/{id}/consumo")
    @Operation(summary = "Registrar consumo de medicamento", description = "Marca una toma específica de un medicamento como consumida")
    @ApiResponse(responseCode = "200", description = "Consumo registrado correctamente")
    @ApiResponse(responseCode = "404", description = "Medicamento no encontrado")
    public ResponseEntity<ConsumoRegistroDTO> registrarConsumo(
        @PathVariable Long id,
        @RequestParam String fecha,
        @RequestParam String hora,
        @RequestParam Boolean consumido
    ) {
        try {
            System.out.println("[MedicamentoController] registrarConsumo - id: " + id + ", fecha: " + fecha + ", hora: " + hora + ", consumido: " + consumido);
            ConsumoRegistroDTO resultado = consumoRegistroService.registrarConsumo(id, fecha, hora, consumido);
            System.out.println("[MedicamentoController] Consumo registrado exitosamente: " + resultado);
            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            System.err.println("[MedicamentoController] Error al registrar consumo: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Obtiene todos los consumos registrados para un usuario en una fecha
     * GET /api/medicamentos/consumos?fecha=yyyy-MM-dd
     */
    @GetMapping("/consumos")
    @Operation(summary = "Obtener consumos del día", description = "Obtiene todos los registros de consumo para una fecha específica")
    @ApiResponse(responseCode = "200", description = "Consumos obtenidos correctamente")
    public ResponseEntity<List<ConsumoRegistroDTO>> obtenerConsumosDelDia(
        @RequestParam String fecha
    ) {
        try {
            List<ConsumoRegistroDTO> consumos = consumoRegistroService.obtenerConsumosDelDia(fecha);
            return ResponseEntity.ok(consumos);
        } catch (Exception e) {
            System.err.println("[MedicamentoController] Error al obtener consumos: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Obtiene el estado de consumo para un medicamento en una fecha y hora específicas
     * GET /api/medicamentos/{id}/consumo?fecha=yyyy-MM-dd&hora=HH:mm
     */
    @GetMapping("/{id}/consumo")
    @Operation(summary = "Obtener consumo específico", description = "Obtiene el estado de consumo de un medicamento en una fecha y hora específica")
    @ApiResponse(responseCode = "200", description = "Consumo obtenido correctamente")
    @ApiResponse(responseCode = "404", description = "Registro no encontrado")
    public ResponseEntity<ConsumoRegistroDTO> obtenerConsumo(
        @PathVariable Long id,
        @RequestParam String fecha,
        @RequestParam String hora
    ) {
        try {
            return consumoRegistroService.obtenerConsumo(id, fecha, hora)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
        } catch (Exception e) {
            System.err.println("[MedicamentoController] Error al obtener consumo: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
