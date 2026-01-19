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
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

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
}
