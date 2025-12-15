package proyecto.orgmedi.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import proyecto.orgmedi.dominio.GestorMedicamentos;

public interface GestorMedicamentosRepository extends JpaRepository<GestorMedicamentos, Long> {

}
