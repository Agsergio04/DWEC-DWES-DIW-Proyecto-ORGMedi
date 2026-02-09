package proyecto.orgmedi.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import proyecto.orgmedi.dominio.Notification;
import proyecto.orgmedi.dominio.Usuario;
import proyecto.orgmedi.dto.NotificationDTO;
import proyecto.orgmedi.repo.NotificationRepository;
import proyecto.orgmedi.repo.UsuarioRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class NotificationService {
    
    private final NotificationRepository notificationRepository;
    private final UsuarioRepository usuarioRepository;
    
    /**
     * Obtener todas las notificaciones del usuario autenticado
     */
    @Transactional(readOnly = true)
    public List<NotificationDTO> getNotificationsByUser(Long usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId).orElse(null);
        if (usuario == null) return List.of();
        
        return notificationRepository.findByUsuario(usuario).stream()
         .map(this::convertToDTO)
         .collect(Collectors.toList());
    }
    
    /**
     * Obtener solo notificaciones no leídas
     */
    @Transactional(readOnly = true)
    public List<NotificationDTO> getUnreadNotifications(Long usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId).orElse(null);
        if (usuario == null) return List.of();
        
        return notificationRepository.findUnreadByUsuario(usuario).stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * Contar notificaciones no leídas
     */
    @Transactional(readOnly = true)
    public long countUnreadNotifications(Long usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId).orElse(null);
        if (usuario == null) return 0;
        
        return notificationRepository.countUnreadByUsuario(usuario);
    }
    
    /**
     * Crear una nueva notificación
     */
    @Transactional
    public NotificationDTO createNotification(Long usuarioId, String title, String message, 
                                             Notification.NotificationType type) {
        Usuario usuario = usuarioRepository.findById(usuarioId).orElse(null);
        if (usuario == null) return null;
        
        Notification notification = new Notification();
        notification.setUsuario(usuario);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setCreatedAt(LocalDateTime.now());
        notification.setRead(false);
        
        Notification saved = notificationRepository.save(notification);
        return convertToDTO(saved);
    }
    
    /**
     * Marcar notificación como leída
     */
    @Transactional
    public NotificationDTO markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId).orElse(null);
        if (notification == null) return null;
        
        notification.setRead(true);
        Notification saved = notificationRepository.save(notification);
        return convertToDTO(saved);
    }
    
    /**
     * Marcar todas las notificaciones como leídas
     */
    @Transactional
    public void markAllAsRead(Long usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId).orElse(null);
        if (usuario == null) return;
        
        List<Notification> unread = notificationRepository.findUnreadByUsuario(usuario);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }
    
    /**
     * Eliminar una notificación
     */
    @Transactional
    public void deleteNotification(Long notificationId) {
        notificationRepository.deleteById(notificationId);
    }
    
    /**
     * Convertir entidad a DTO
     */
    private NotificationDTO convertToDTO(Notification notification) {
        if (notification == null) return null;
        
        return new NotificationDTO(
            notification.getId(),
            notification.getTitle(),
            notification.getMessage(),
            notification.getType().name(),
            notification.getCreatedAt(),
            notification.isRead()
        );
    }
}
