package proyecto.orgmedi.controller;

import jakarta.validation.Valid;
import proyecto.orgmedi.dominio.Medicamento;
import proyecto.orgmedi.service.MedicamentoService;
import proyecto.orgmedi.dto.medicamento.MedicamentoDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

@RestController
@RequestMapping("/api/medicamentos")
public class MedicamentoController {
    private final MedicamentoService medicamentoService;

    @Autowired
    public MedicamentoController(MedicamentoService medicamentoService) {
        this.medicamentoService = medicamentoService;
    }

    @GetMapping
    public List<Medicamento> getAllMedicamentos() {
        return medicamentoService.findAll();
    }

    @GetMapping("/{nombre}")
    public ResponseEntity<Medicamento> getMedicamentoByNombre(@PathVariable String nombre) {
        Medicamento m = medicamentoService.getByNombreOrThrow(nombre);
        return ResponseEntity.ok(m);
    }

    @PostMapping
    public ResponseEntity<MedicamentoDTO> createMedicamento(@Valid @RequestBody MedicamentoDTO dto) {
        Medicamento created = medicamentoService.createMedicamento(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(medicamentoService.toDto(created));
    }

    @PutMapping("/{nombre}")
    public ResponseEntity<MedicamentoDTO> updateMedicamento(@PathVariable String nombre, @Valid @RequestBody MedicamentoDTO dto) {
        Medicamento updated = medicamentoService.updateMedicamento(nombre, dto);
        return ResponseEntity.ok(medicamentoService.toDto(updated));
    }

    @DeleteMapping("/{nombre}")
    public ResponseEntity<Void> deleteMedicamento(@PathVariable String nombre) {
        medicamentoService.deleteByNombreOrThrow(nombre);
        return ResponseEntity.noContent().build();
    }
}
