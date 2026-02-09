package proyecto.orgmedi.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import proyecto.orgmedi.dominio.Notification;
import proyecto.orgmedi.dominio.Usuario;

import java.util.List;

/**
 * NotificationRepository - Repositorio para acceder a datos de Notificaciones
 * 
 * PROPÓSITO: Interfaz Spring Data JPA para CRUD de Notification
 * Proporciona acceso a la capa de persistencia para notificaciones del sistema
 * 
 * CARACTERÍSTICAS ESPECIALES:
 * - Usa @Query (JPQL) para customizar consultas
 * - Tiene métodos para filtrar por usuario
 * - Distingue entre notificaciones leídas y sin leer
 * - Ordena por fecha (más recientes primero)
 * 
 * MÉTODOS HEREDADOS:
 * - save(notification) - Crear/actualizar
 * - findById(id) - Obtener por ID
 * - findAll() - Obtener todas (NO RECOMENDADO - muchas)
 * - delete(notification) - Eliminar
 * - deleteById(id) - Eliminar por ID
 * 
 * RELACIONES:
 * - Notification N:1 Usuario (muchas notifs para un usuario)
 */
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    @Query("SELECT n FROM Notification n WHERE n.usuario = :usuario ORDER BY n.createdAt DESC")
    List<Notification> findByUsuario(@Param("usuario") Usuario usuario);
    
    @Query("SELECT n FROM Notification n WHERE n.usuario = :usuario AND n.read = false ORDER BY n.createdAt DESC")
    List<Notification> findUnreadByUsuario(@Param("usuario") Usuario usuario);
    
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.usuario = :usuario AND n.read = false")
    long countUnreadByUsuario(@Param("usuario") Usuario usuario);
}
