package proyecto.orgmedi.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import proyecto.orgmedi.dominio.Medicamento;
import proyecto.orgmedi.dominio.ConsumoRegistro;
import proyecto.orgmedi.dominio.Notification;
import proyecto.orgmedi.dto.medicamento.MedicamentoDTO;
import proyecto.orgmedi.dto.medicamento.MedicamentosPorFechaDTO;
import proyecto.orgmedi.error.NotFoundException;

import java.time.LocalDate;
import java.util.List;

/**
 * Façade para operaciones de organización
 * Reduce el acoplamiento entre controladores y múltiples servicios
 * Cumple con Interface Segregation Principle e implementa Façade Pattern
 */
@Service
public class OrganizationFacade {
    
    private final IMedicamentoService medicamentoService;
    private final IUsuarioService usuarioService;
    private final IConsumoRegistroService consumoRegistroService;
    private final NotificationService notificationService;
    
    @Autowired
    public OrganizationFacade(
            IMedicamentoService medicamentoService,
            IUsuarioService usuarioService,
            IConsumoRegistroService consumoRegistroService,
            NotificationService notificationService) {
        this.medicamentoService = medicamentoService;
        this.usuarioService = usuarioService;
        this.consumoRegistroService = consumoRegistroService;
        this.notificationService = notificationService;
    }
    
    // ==================== MEDICAMENTOS ====================
    
    /**
     * Obtiene todos los medicamentos del usuario con validación
     */
    public List<MedicamentoDTO> obtenerMedicamentosUsuario(Long usuarioId) {
        validarUsuarioExiste(usuarioId);
        return medicamentoService.getMedicamentosPorUsuario(usuarioId);
    }
    
    /**
     * Obtiene medicamentos por fecha del usuario
     */
    public MedicamentosPorFechaDTO obtenerMedicamentosPorFecha(Long usuarioId, LocalDate fecha) {
        validarUsuarioExiste(usuarioId);
        return medicamentoService.getMedicamentosPorFecha(usuarioId, fecha);
    }
    
    /**
     * Crea un medicamento y notifica al usuario
     */
    public Medicamento crearMedicamento(Medicamento medicamento, Long usuarioId) {
        validarUsuarioExiste(usuarioId);
        Medicamento created = medicamentoService.createMedicamento(medicamento);
        notificationService.createNotification(
            usuarioId,
            "Medicamento creado",
            "Se creó exitosamente: " + medicamento.getNombre(),
            Notification.NotificationType.INFO
        );
        return created;
    }
    
    /**
     * Actualiza un medicamento
     */
    public Medicamento actualizarMedicamento(Long medicamentoId, Medicamento medicamento, Long usuarioId) {
        validarUsuarioExiste(usuarioId);
        Medicamento existing = medicamentoService.getByIdOrThrow(medicamentoId);
        validarPermiso(existing, usuarioId);
        return medicamentoService.updateMedicamento(medicamentoId, medicamento);
    }
    
    /**
     * Elimina un medicamento
     */
    public void eliminarMedicamento(Long medicamentoId, Long usuarioId) {
        validarUsuarioExiste(usuarioId);
        Medicamento medicamento = medicamentoService.getByIdOrThrow(medicamentoId);
        validarPermiso(medicamento, usuarioId);
        medicamentoService.deleteMedicamento(medicamentoId);
    }
    
    // ==================== CONSUMOS ====================
    
    /**
     * Obtiene consumos del día del usuario
     */
    public List<ConsumoRegistro> obtenerConsumosDelDia(Long usuarioId, LocalDate fecha) {
        validarUsuarioExiste(usuarioId);
        return consumoRegistroService.getConsumosDelDia(usuarioId, fecha);
    }
    
    /**
     * Marca un consumo como realizado
     */
    public void marcarConsumido(Long consumoId, Long usuarioId) {
        validarUsuarioExiste(usuarioId);
        ConsumoRegistro consumo = consumoRegistroService.getByIdOrThrow(consumoId);
        validarPermiso(consumo, usuarioId);
        consumoRegistroService.marcarConsumido(consumoId);
        notificationService.createNotification(
            usuarioId,
            "Medicamento consumido",
            "Se registró el consumo correctamente",
            Notification.NotificationType.SUCCESS
        );
    }
    
    /**
     * Desmarca un consumo
     */
    public void desmarcarConsumido(Long consumoId, Long usuarioId) {
        validarUsuarioExiste(usuarioId);
        ConsumoRegistro consumo = consumoRegistroService.getByIdOrThrow(consumoId);
        validarPermiso(consumo, usuarioId);
        consumoRegistroService.desmarcarConsumido(consumoId);
    }
    
    // ==================== VALIDACIONES ====================
    
    /**
     * Valida que el usuario existe
     */
    private void validarUsuarioExiste(Long usuarioId) {
        if (!usuarioService.findById(usuarioId).isPresent()) {
            throw new NotFoundException("Usuario no encontrado");
        }
    }
    
    /**
     * Valida que el usuario tiene permiso sobre el medicamento
     */
    private void validarPermiso(Medicamento medicamento, Long usuarioId) {
        if (!medicamento.getUsuario().getId().equals(usuarioId)) {
            throw new IllegalArgumentException("Acceso denegado: No tienes permiso sobre este medicamento");
        }
    }
    
    /**
     * Valida que el usuario tiene permiso sobre el consumo
     */
    private void validarPermiso(ConsumoRegistro consumo, Long usuarioId) {
        if (!consumo.getMedicamento().getUsuario().getId().equals(usuarioId)) {
            throw new IllegalArgumentException("Acceso denegado: No tienes permiso sobre este consumo");
        }
    }
}
