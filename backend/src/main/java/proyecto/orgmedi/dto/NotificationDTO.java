package proyecto.orgmedi.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * NotificationDTO - DTO para notificaciones del sistema
 * 
 * PROPÓSITO: Mostrar notificaciones al usuario sobre eventos del sistema
 * 
 * TIPOS DE NOTIFICACIONES:
 * - SUCCESS: Operación realizada exitosamente (ej: "Medicamento guardado")
 * - WARNING: Alerta importante (ej: "Falta tomar medicamento hoy")
 * - ERROR: Error en operación (ej: "No se pudo guardar")
 * - INFO: Información general (ej: "Bienvenido")
 * 
 * FLUJO:
 * 1. Backend crea notificación: notificationService.crearNotificacion(...)
 * 2. Se guarda en BD con read=false
 * 3. GET /api/notificaciones retorna NotificationDTO
 * 4. Frontend las muestra en UI
 * 5. Usuario las lee (mark as read)
 * 6. PUT /api/notificaciones/{id} (read=true)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDTO {
    /**
     * ID - Identificador único de la notificación
     */
    private Long id;
    
    /**
     * TÍTULO - Resumen corto de la notificación
     * Ej: "Medicamento agregado", "Error en login"
     */
    private String title;
    
    /**
     * MENSAJE - Descripción detallada
     * Ej: "Amoxicilina 500mg fue agregada correctamente"
     */
    private String message;
    
    /**
     * TIPO - Categoría de la notificación para mostrar con color/icono
     * Valores permitidos:
     * - SUCCESS: Verde, icono de check (operación exitosa)
     * - WARNING: Amarillo/Naranja, icono de advertencia (cuidado)
     * - ERROR: Rojo, icono de X (algo salió mal)
     * - INFO: Azul, icono de info (información)
     */
    private String type; // SUCCESS, WARNING, ERROR, INFO
    
    /**
     * CREATED AT - Fecha y hora de creación
     * El frontend puede mostrar: "hace 5 minutos", "hace 1 hora"
     */
    private LocalDateTime createdAt;
    
    /**
     * READ - Ha sido leída por el usuario?
     * - true = usuario vio la notificación
     * - false = notificación nueva sin leer
     * 
     * USO: Mostrar notificaciones no leídas con destacado
     */
    private boolean read;
}
