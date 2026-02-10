package proyecto.orgmedi.dominio;

import java.sql.Array;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;

import jakarta.persistence.*;
import lombok.*;
import proyecto.orgmedi.error.BadRequestException;
import proyecto.orgmedi.error.ConflictException;
import proyecto.orgmedi.error.NotFoundException;

/**
 * Entidad GestorMedicamentos - Contenedor centralizado de medicamentos de un usuario
 * 
 * PROPÓSITO: Es el "armario de medicinas" virtual de un usuario. 
 * Cuando un usuario se registra, se crea automáticamente un GestorMedicamentos 
 * que almacena TODOS sus medicamentos.
 * 
 * ANALOGÍA REAL:
 * - Usuario (Juan) tiene un GestorMedicamentos (el armario de medicinas de Juan)
 * - El GestorMedicamentos contiene varios Medicamentos (los frascos en el armario)
 * 
 * RELACIONES:
 * - 1:1 con Usuario (cada usuario tiene EXACTAMENTE UN gestor)
 * - 1:N con Medicamento (un gestor puede contener múltiples medicamentos)
 * 
 * RESPONSABILIDADES:
 * - Almacenar y organizar medicamentos del usuario
 * - Permitir agregar/eliminar medicamentos
 * - Listar todos los medicamentos del usuario
 */
@Getter // Getters automáticos
@Setter // Setters automáticos
@NoArgsConstructor // Constructor vacío
@AllArgsConstructor // Constructor con todos los parámetros
@Builder // Patrón Builder
@Entity // Es una entidad de BD
@Table(name = "gestor_medicamentos") // Nombre de la tabla
public class GestorMedicamentos {
    
    // ============ ATRIBUTOS =============
    
    /**
     * ID único del GestorMedicamentos (clave primaria)
     * Auto-incrementado por la BD
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Relación 1:1 con Usuario
     * EXPLICACIÓN:
     * - A CADA usuario le corresponde UN (y solo uno) GestorMedicamentos
     * - Cuando se crea un usuario, se crea automáticamente su gestor
     * - Cuando se elimina un usuario, se elimina su gestor (cascade)
     * - unique = true garantiza que no hay dos gestores para un mismo usuario
     */
    @OneToOne
    @JoinColumn(name = "usuario_id", nullable = false, unique = true)
    private Usuario usuario;

    /**
     * Lista de medicamentos del usuario
     * EXPLICACIÓN:
     * - Uno a Muchos: UN gestor puede contener VARIOS medicamentos
     * - cascade = CascadeType.ALL: si se elimina el gestor, se eliminan todos sus medicamentos
     * - orphanRemoval = true: si un medicamento se dedeja de la lista, se elimina de la BD
     * - JoinColumn "gestor_id": la relación se establece mediante la columna gestor_id en medicamentos
     * 
     * LISTA VACÍA POR DEFECTO: Al crear un nuevo GestorMedicamentos, la lista está vacía
     */
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "gestor_id")
    @Builder.Default
    private java.util.List<Medicamento> medicamentos = new java.util.ArrayList<>();

    // ============ MÉTODOS =============
    
    /**
     * Comparación: dos gestores son iguales si tienen el mismo ID
     */
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        GestorMedicamentos that = (GestorMedicamentos) o;
        return id != null && id.equals(that.id);
    }

    /**
     * Hash code para usar en colecciones
     */
    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    // ============ MÉTODOS PARA GESTIONAR MEDICAMENTOS =============
    
    /**
     * Agrega un medicamento a la lista del GestorMedicamentos
     * 
     * PROCEDIMIENTO:
     * 1. Valida que el medicamento no sea null
     * 2. Comprueba que no exista otro medicamento con el mismo nombre (evita duplicados)
     * 3. Si pasa todas las validaciones, lo agrega a la lista
     * 
     * EXCEPCIONES:
     * - BadRequestException: si el medicamento es null
     * - ConflictException: si ya existe un medicamento con ese nombre
     * 
     * EJEMPLO:
     * Gestor.agregarMedicamento(medicamento) → OK
     * Gestor.agregarMedicamento(medicamento) → ERROR (ya existe)
     * Gestor.agregarMedicamento(null) → ERROR (inválido)
     */
    public void agregarMedicamento(Medicamento medicamento) {
        // Validar que el medicamento no sea null
        if (medicamento == null) {
            throw new BadRequestException("Medicamento inválido");
        }
        
        // Comprobar por nombre para evitar duplicados
        // busca en la lista si existe algún medicamento con el mismo nombre
        boolean exists = medicamentos.stream()
                .anyMatch(m -> m.getNombre() != null && m.getNombre().equals(medicamento.getNombre()));
        
        if (exists) {
            throw new ConflictException("Ya existe un medicamento con ese nombre");
        }
        
        // Si pasó todas las validaciones, se agrega
        medicamentos.add(medicamento);
    }

    /**
     * Elimina un medicamento de la lista del GestorMedicamentos por nombre
     * 
     * PROCEDIMIENTO:
     * 1. Valida que el medicamento no sea null
     * 2. Busca y elimina el medicamento con el mismo nombre de la lista
     * 3. Si no lo encuentra, lanza una excepción
     * 
     * EXCEPCIONES:
     * - BadRequestException: si el medicamento es null
     * - NotFoundException: si el medicamento no existe en la lista
     * 
     * EJEMPLO:
     * Gestor.eliminarMedicamento(medicamento) → OK (se elimina)
     * Gestor.eliminarMedicamento(medicamento) → ERROR (no existe)
     */
    public void eliminarMedicamento(Medicamento medicamento) {
        // Validar que el medicamento no sea null
        if (medicamento == null) {
            throw new BadRequestException("Medicamento inválido");
        }
        
        // removeIf: intenta eliminar el medicamento con el mismo nombre
        // Devuelve true si se eliminó, false si no estaba
        boolean removed = medicamentos.removeIf(m -> {
            if (m.getNombre() == null) return false;
            return m.getNombre().equals(medicamento.getNombre());
        });
        
        if (!removed) {
            throw new NotFoundException("Medicamento no encontrado");
        }
    }

    /**
     * Retorna una copia de la lista de medicamentos
     * Se devuelve una COPIA (new ArrayList) en lugar del original,
     * para prevenir que modifiquen la lista desde fuera
     */
    public java.util.List<Medicamento> listarMedicamentos() {
        return new java.util.ArrayList<>(medicamentos);
    }

    

    /**
     * Devuelve la cantidad de medicamentos que tenga dicho 
     * gestor de Medicamentos. 
     */

    @GetMapping("/{id}")
    public Integer cantidadMedicamentosConsumidos(
        Long id
    ){
        var cantidad  = 0;
        for (Medicamento medicamento : this.medicamentos) {

            if(medicamento != null){
                cantidad = cantidad + 1 ;
            }
        }
        return cantidad;
    }
}
