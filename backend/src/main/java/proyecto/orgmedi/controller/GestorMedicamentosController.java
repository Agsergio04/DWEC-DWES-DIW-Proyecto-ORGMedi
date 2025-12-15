package proyecto.orgmedi.controller;

import jakarta.validation.Valid;
import proyecto.orgmedi.dominio.GestorMedicamentos;
import proyecto.orgmedi.service.GestorMedicamentosService;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import proyecto.orgmedi.error.NotFoundException;
import proyecto.orgmedi.error.ConflictException;

import java.util.List;

@RestController
@RequestMapping("/api/gestores")
public class GestorMedicamentosController {
    private final GestorMedicamentosService gestorMedicamentosService;

    @Autowired
    public GestorMedicamentosController(GestorMedicamentosService gestorMedicamentosService) {
        this.gestorMedicamentosService = gestorMedicamentosService;
    }

    @GetMapping
    public List<GestorMedicamentos> getAllGestores() {
        return gestorMedicamentosService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<GestorMedicamentos> getGestorById(@PathVariable Long id) {
        GestorMedicamentos g = gestorMedicamentosService.getByIdOrThrow(id);
        return ResponseEntity.ok(g);
    }

    @PostMapping
    public ResponseEntity<GestorMedicamentos> createGestor(@Valid @RequestBody GestorMedicamentos gestor) {
        GestorMedicamentos saved = gestorMedicamentosService.createGestor(gestor);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<GestorMedicamentos> updateGestor(@PathVariable Long id, @Valid @RequestBody GestorMedicamentos gestor) {
        GestorMedicamentos updated = gestorMedicamentosService.updateGestor(id, gestor);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGestor(@PathVariable Long id) {
        gestorMedicamentosService.deleteByIdOrThrow(id);
        return ResponseEntity.noContent().build();
    }
}