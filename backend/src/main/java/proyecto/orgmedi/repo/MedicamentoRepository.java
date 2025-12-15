package proyecto.orgmedi.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import proyecto.orgmedi.dominio.Medicamento;

public interface MedicamentoRepository extends JpaRepository<Medicamento, String> {

}
