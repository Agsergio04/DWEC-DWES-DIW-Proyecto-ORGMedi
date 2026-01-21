package proyecto.orgmedi.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import proyecto.orgmedi.dominio.Notification;
import proyecto.orgmedi.dominio.Usuario;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    @Query("SELECT n FROM Notification n WHERE n.usuario = :usuario ORDER BY n.createdAt DESC")
    List<Notification> findByUsuario(@Param("usuario") Usuario usuario);
    
    @Query("SELECT n FROM Notification n WHERE n.usuario = :usuario AND n.read = false ORDER BY n.createdAt DESC")
    List<Notification> findUnreadByUsuario(@Param("usuario") Usuario usuario);
    
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.usuario = :usuario AND n.read = false")
    long countUnreadByUsuario(@Param("usuario") Usuario usuario);
}
