package proyecto.orgmedi.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import proyecto.orgmedi.dominio.Medicamento;

import java.util.List;

/**
 * MedicamentoRepository - Repositorio para acceder a datos de Medicamentos
 * 
 * PROPÓSITO: Interfaz Spring Data JPA para operaciones CRUD sobre Medicamento
 * 
 * MÉTODOS HEREDADOS (de JpaRepository):
 * - save(med) - Guardar/actualizar medicamento
 * - findById(id) - Obtener por ID
 * - findAll() - Obtener todos los medicamentos
 * - delete(med) - Eliminar medicamento
 * - deleteById(id) - Eliminar por ID
 * 
 * RELACIONES:
 * - Medicamento N:1 Usuario (muchos meds para un usuario)
 * - Medicamento 1:N ConsumoRegistro (1 med genera muchos registros)
 */
public interface MedicamentoRepository extends JpaRepository<Medicamento, Long> {
    /**
     * Obtener TODOS los medicamentos de un usuario específico
     * 
     * SQL: SELECT * FROM medicamento WHERE usuario_id = ?
     * 
     * USO:
     * 1. En MedicamentoService para obtener meds de un usuario
     * 2. Al generar ConsumoRegistros
     * 3. En controlador para listar meds del usuario
     * 
     * RETORNO: List<Medicamento>
     * - Si el usuario tiene medicamentos: Lista completa
     * - Si NO tiene medicamentos: Lista vacía (nunca null)
     * 
     * EJEMPLO DE FLUJO:
     * GET /api/medicamentos?usuarioId=1
     *   → medicamentoRepository.findByUsuarioId(1)
     *   → Retorna List<Medicamento>
     *   → Convierte a List<MedicamentoDTO>
     *   → Response JSON
     * 
     * @param usuarioId ID del usuario propietario
     * @return Lista de medicamentos del usuario
     */
    List<Medicamento> findByUsuarioId(Long usuarioId);
}
