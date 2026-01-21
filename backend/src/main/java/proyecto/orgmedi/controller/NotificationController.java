package proyecto.orgmedi.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import proyecto.orgmedi.dominio.Usuario;
import proyecto.orgmedi.dto.NotificationDTO;
import proyecto.orgmedi.repo.UsuarioRepository;
import proyecto.orgmedi.service.NotificationService;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    
    @Autowired
    private NotificationService notificationService;
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    /**
     * GET /api/notifications - Obtener todas las notificaciones del usuario
     */
    @GetMapping
    public ResponseEntity<List<NotificationDTO>> getNotifications(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(List.of());
        }
        
        Usuario usuario = usuarioRepository.findByCorreo(authentication.getName()).orElse(null);
        if (usuario == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(List.of());
        }
        
        List<NotificationDTO> notifications = notificationService.getNotificationsByUser(usuario.getId());
        return ResponseEntity.ok(notifications);
    }
    
    /**
     * GET /api/notifications/unread - Obtener solo notificaciones no leídas
     */
    @GetMapping("/unread")
    public ResponseEntity<List<NotificationDTO>> getUnreadNotifications(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(List.of());
        }
        
        Usuario usuario = usuarioRepository.findByCorreo(authentication.getName()).orElse(null);
        if (usuario == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(List.of());
        }
        
        List<NotificationDTO> notifications = notificationService.getUnreadNotifications(usuario.getId());
        return ResponseEntity.ok(notifications);
    }
    
    /**
     * GET /api/notifications/count/unread - Contar notificaciones no leídas
     */
    @GetMapping("/count/unread")
    public ResponseEntity<Long> countUnreadNotifications(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(0L);
        }
        
        Usuario usuario = usuarioRepository.findByCorreo(authentication.getName()).orElse(null);
        if (usuario == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(0L);
        }
        
        long count = notificationService.countUnreadNotifications(usuario.getId());
        return ResponseEntity.ok(count);
    }
    
    /**
     * PUT /api/notifications/{id}/read - Marcar notificación como leída
     */
    @PutMapping("/{id}/read")
    public ResponseEntity<NotificationDTO> markAsRead(@PathVariable Long id, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        NotificationDTO notification = notificationService.markAsRead(id);
        if (notification == null) {
            return ResponseEntity.notFound().build();
        }
        
        return ResponseEntity.ok(notification);
    }
    
    /**
     * PUT /api/notifications/read-all - Marcar todas como leídas
     */
    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        Usuario usuario = usuarioRepository.findByCorreo(authentication.getName()).orElse(null);
        if (usuario == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        notificationService.markAllAsRead(usuario.getId());
        return ResponseEntity.ok().build();
    }
    
    /**
     * DELETE /api/notifications/{id} - Eliminar notificación
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        notificationService.deleteNotification(id);
        return ResponseEntity.ok().build();
    }
}
