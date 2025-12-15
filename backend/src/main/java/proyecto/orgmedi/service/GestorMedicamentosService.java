package proyecto.orgmedi.service;

import proyecto.orgmedi.dominio.GestorMedicamentos;
import proyecto.orgmedi.repo.GestorMedicamentosRepository;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.Optional;
import proyecto.orgmedi.error.NotFoundException;

@Service
public class GestorMedicamentosService {
    private final GestorMedicamentosRepository gestorMedicamentosRepository;

    @Autowired
    public GestorMedicamentosService(GestorMedicamentosRepository gestorMedicamentosRepository) {
        this.gestorMedicamentosRepository = gestorMedicamentosRepository;
    }

    public List<GestorMedicamentos> findAll() {
        return gestorMedicamentosRepository.findAll();
    }

    public Optional<GestorMedicamentos> findById(Long id) {
        return gestorMedicamentosRepository.findById(id);
    }

    public GestorMedicamentos getByIdOrThrow(Long id) {
        return gestorMedicamentosRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Gestor no encontrado"));
    }

    public GestorMedicamentos createGestor(GestorMedicamentos gestor) {
        // Si fuera necesario comprobar unicidad por usuario, se podría hacer aquí
        return gestorMedicamentosRepository.save(gestor);
    }

    public GestorMedicamentos updateGestor(Long id, GestorMedicamentos gestor) {
        if (gestorMedicamentosRepository.findById(id).isEmpty()) {
            throw new NotFoundException("Gestor no encontrado");
        }
        gestor.setId(id);
        return gestorMedicamentosRepository.save(gestor);
    }

    public void deleteByIdOrThrow(Long id) {
        if (gestorMedicamentosRepository.findById(id).isEmpty()) {
            throw new NotFoundException("Gestor no encontrado");
        }
        gestorMedicamentosRepository.deleteById(id);
    }

    public GestorMedicamentos save(GestorMedicamentos gestor) {
        return gestorMedicamentosRepository.save(gestor);
    }

    public void deleteById(Long id) {
        gestorMedicamentosRepository.deleteById(id);
    }
}
