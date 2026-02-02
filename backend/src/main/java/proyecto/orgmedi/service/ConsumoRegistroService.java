package proyecto.orgmedi.service;

import proyecto.orgmedi.dominio.ConsumoRegistro;
import proyecto.orgmedi.dominio.Usuario;
import proyecto.orgmedi.dominio.Medicamento;
import proyecto.orgmedi.dto.medicamento.ConsumoRegistroDTO;
import proyecto.orgmedi.repo.ConsumoRegistroRepository;
import proyecto.orgmedi.repo.UsuarioRepository;
import proyecto.orgmedi.security.SecurityUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Servicio para gestionar registros de consumo de medicamentos
 * Permite registrar y consultar el consumo de medicamentos por fecha y hora específica
 */
@Service
public class ConsumoRegistroService {
    private final ConsumoRegistroRepository consumoRegistroRepository;
    private final MedicamentoService medicamentoService;
    private final UsuarioService usuarioService;
    private final UsuarioRepository usuarioRepository;
    
    @Autowired
    public ConsumoRegistroService(
        ConsumoRegistroRepository consumoRegistroRepository,
        MedicamentoService medicamentoService,
        UsuarioService usuarioService,
        UsuarioRepository usuarioRepository
    ) {
        this.consumoRegistroRepository = consumoRegistroRepository;
        this.medicamentoService = medicamentoService;
        this.usuarioService = usuarioService;
        this.usuarioRepository = usuarioRepository;
    }
    
    /**
     * Registra o actualiza el consumo de un medicamento en una fecha y hora específica
     * @param medicamentoId ID del medicamento
     * @param fecha Fecha del consumo (yyyy-MM-dd)
     * @param hora Hora del consumo (HH:mm)
     * @param consumido Estado del consumo (true/false)
     * @return DTO del registro actualizado
     */
    public ConsumoRegistroDTO registrarConsumo(Long medicamentoId, String fecha, String hora, Boolean consumido) {
        System.out.println("[ConsumoRegistroService] Iniciando registrarConsumo - medicamentoId: " + medicamentoId + ", fecha: " + fecha + ", hora: " + hora + ", consumido: " + consumido);
        
        Usuario usuario = SecurityUtil.getCurrentUser(usuarioRepository);
        System.out.println("[ConsumoRegistroService] Usuario obtenido: " + usuario.getId() + " - " + usuario.getCorreo());
        
        Medicamento medicamento = medicamentoService.findById(medicamentoId)
            .orElseThrow(() -> new IllegalArgumentException("Medicamento no encontrado: " + medicamentoId));
        System.out.println("[ConsumoRegistroService] Medicamento obtenido: " + medicamento.getId() + " - " + medicamento.getNombre());
        
        LocalDate fechaParsed = LocalDate.parse(fecha);
        LocalTime horaParsed = LocalTime.parse(hora);
        System.out.println("[ConsumoRegistroService] Fechas parseadas - fecha: " + fechaParsed + ", hora: " + horaParsed);
        
        // Buscar registro existente
        Optional<ConsumoRegistro> existente = consumoRegistroRepository
            .findByUsuarioAndMedicamentoAndFechaAndHora(usuario, medicamento, fechaParsed, horaParsed);
        
        ConsumoRegistro registro;
        if (existente.isPresent()) {
            // Actualizar registro existente
            System.out.println("[ConsumoRegistroService] Actualizando registro existente");
            registro = existente.get();
            registro.setConsumido(consumido);
        } else {
            // Crear nuevo registro
            System.out.println("[ConsumoRegistroService] Creando nuevo registro");
            registro = ConsumoRegistro.builder()
                .usuario(usuario)
                .medicamento(medicamento)
                .fecha(fechaParsed)
                .hora(horaParsed)
                .consumido(consumido)
                .build();
        }
        
        System.out.println("[ConsumoRegistroService] Guardando registro: " + registro);
        consumoRegistroRepository.save(registro);
        System.out.println("[ConsumoRegistroService] Registro guardado con ID: " + registro.getId());
        
        return toDTO(registro);
    }
    
    /**
     * Obtiene todos los registros de consumo de un usuario para una fecha específica
     */
    public List<ConsumoRegistroDTO> obtenerConsumosDelDia(String fecha) {
        Usuario usuario = SecurityUtil.getCurrentUser(usuarioRepository);
        
        LocalDate fechaParsed = LocalDate.parse(fecha);
        
        return consumoRegistroRepository
            .findByUsuarioAndFecha(usuario, fechaParsed)
            .stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * Obtiene el estado de consumo para un medicamento en una fecha y hora específicas
     */
    public Optional<ConsumoRegistroDTO> obtenerConsumo(Long medicamentoId, String fecha, String hora) {
        Usuario usuario = SecurityUtil.getCurrentUser(usuarioRepository);
        
        Medicamento medicamento = medicamentoService.findById(medicamentoId)
            .orElseThrow(() -> new IllegalArgumentException("Medicamento no encontrado"));
        
        LocalDate fechaParsed = LocalDate.parse(fecha);
        LocalTime horaParsed = LocalTime.parse(hora);
        
        return consumoRegistroRepository
            .findByUsuarioAndMedicamentoAndFechaAndHora(usuario, medicamento, fechaParsed, horaParsed)
            .map(this::toDTO);
    }
    
    /**
     * Convierte un ConsumoRegistro a DTO
     */
    private ConsumoRegistroDTO toDTO(ConsumoRegistro registro) {
        return ConsumoRegistroDTO.builder()
            .id(registro.getId())
            .fecha(registro.getFecha())
            .hora(registro.getHora())
            .medicamentoId(registro.getMedicamento().getId())
            .medicamentoNombre(registro.getMedicamento().getNombre())
            .consumido(registro.getConsumido())
            .build();
    }
}
