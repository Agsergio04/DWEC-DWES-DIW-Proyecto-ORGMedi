package proyecto.orgmedi.dominio;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Registro de consumo de medicamentos por fecha y hora específica
 * Permite saber qué medicamentos se han consumido en cada hora de cada día
 */
@Entity
@Table(name = "consumo_registros", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"usuario_id", "medicamento_id", "fecha", "hora"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConsumoRegistro {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medicamento_id", nullable = false)
    private Medicamento medicamento;
    
    @Column(nullable = false)
    private LocalDate fecha;
    
    @Column(nullable = false)
    private LocalTime hora;
    
    @Column(nullable = false)
    private Boolean consumido;
    
    @Column(name = "created_at")
    private Long createdAt;
    
    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = System.currentTimeMillis();
        }
    }
}
