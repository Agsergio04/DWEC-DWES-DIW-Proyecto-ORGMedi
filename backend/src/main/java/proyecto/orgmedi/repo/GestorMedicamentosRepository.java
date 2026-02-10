package proyecto.orgmedi.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import proyecto.orgmedi.dominio.GestorMedicamentos;
import java.util.Optional;

/**
 * GestorMedicamentosRepository - Repositorio para acceder a datos del Gestor de Medicamentos
 * 
 * PROPÓSITO: Interfaz Spring Data JPA para operaciones CRUD sobre GestorMedicamentos
 * 
 * CONCEPTO:
 * - GestorMedicamentos es un contenedor 1:1 con Usuario
 * - Cada usuario tiene exactamente UN GestorMedicamentos
 * - El gestor contiene TODOS los medicamentos del usuario (relación 1:N)
 * 
 * DIAGRAMA RELACIONAL:
 * Usuario (1) ←→ (1) GestorMedicamentos (1) ←→ (N) Medicamento
 * 
 * MÉTODOS HEREDADOS (de JpaRepository<GestorMedicamentos, Long>):
 * - save(gestor) - Guardar/actualizar un gestor
 * - findById(id) - Obtener un gestor por su ID
 * - findAll() - Obtener todos los gestores (NO usar en producción)
 * - delete(gestor) - Eliminar un gestor
 * - deleteById(id) - Eliminar un gestor por ID
 * - count() - Contar total de gestores
 * - existsById(id) - Verificar si existe un gestor
 * 
 * GENÉTICAMENTE IMPORTANTE:
 * Cuando se elimina un Usuario:
 * - Se ELIMINA automáticamente su GestorMedicamentos (CascadeType.ALL)
 * - Se ELIMINAN automáticamente todos sus Medicamentos
 * - Se ELIMINAN automáticamente todos los ConsumoRegistros
 * 
 * FLUJO DE CREACIÓN:
 * 1. Usuario se registra: POST /api/auth/register
 * 2. AuthController crea nuevo Usuario
 * 3. AuthController crea nuevo GestorMedicamentos asociado
 * 4. usuarioRepository.save(usuario) → persiste todo
 * 
 * USO EN SERVICIOS:
 * No se usa mucho directamente porque se accede a través de Usuario
 * 
 * EJEMPLO:
 * GestorMedicamentos gestor = new GestorMedicamentos();
 * gestor.setUsuario(usuario);
 * gestorRepository.save(gestor);
 */
public interface GestorMedicamentosRepository extends JpaRepository<GestorMedicamentos, Long> {
    /**
     * Buscar el GestorMedicamentos asociado a un Usuario
     * 
     * SQL: SELECT * FROM gestor_medicamentos WHERE usuario_id = ?
     * 
     * @param usuarioId ID del usuario propietario
     * @return Optional con el gestor si existe
     */
    Optional<GestorMedicamentos> findByUsuarioId(Long usuarioId);


    /**
     * Buscan en el GestorMedicamentos asociado al usuario si este
     * posee medicamentso creados 
     * @param usuarioId
     * @return Optional en caso de que el usuario tenga medicamentos creados
     */

    GestorMedicamentos cantidadMedicamentosConsumidos(Long usuarioId);
}
