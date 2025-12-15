package proyecto.orgmedi.dominio;

import jakarta.persistence.*;
import lombok.*;
import proyecto.orgmedi.error.BadRequestException;
import proyecto.orgmedi.error.ConflictException;
import proyecto.orgmedi.error.NotFoundException;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "gestor_medicamentos")
public class GestorMedicamentos {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "usuario_id", nullable = false, unique = true)
    private Usuario usuario;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "gestor_id")
    private java.util.List<Medicamento> medicamentos = new java.util.ArrayList<>();

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        GestorMedicamentos that = (GestorMedicamentos) o;
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    // Métodos utilitarios para gestionar medicamentos
    public void agregarMedicamento(Medicamento medicamento) {
        if (medicamento == null) {
            throw new BadRequestException("Medicamento inválido");
        }
        // Comprobar por nombre para evitar duplicados
        boolean exists = medicamentos.stream()
                .anyMatch(m -> m.getNombre() != null && m.getNombre().equals(medicamento.getNombre()));
        if (exists) {
            throw new ConflictException("Ya existe un medicamento con ese nombre");
        }
        medicamentos.add(medicamento);
    }

    public void eliminarMedicamento(Medicamento medicamento) {
        if (medicamento == null) {
            throw new BadRequestException("Medicamento inválido");
        }
        boolean removed = medicamentos.removeIf(m -> {
            if (m.getNombre() == null) return false;
            return m.getNombre().equals(medicamento.getNombre());
        });
        if (!removed) {
            throw new NotFoundException("Medicamento no encontrado");
        }
    }

    public java.util.List<Medicamento> listarMedicamentos() {
        return new java.util.ArrayList<>(medicamentos);
    }
}
