package proyecto.orgmedi.service;

import proyecto.orgmedi.dominio.Medicamento;
import proyecto.orgmedi.dominio.ConsumoRegistro;
import proyecto.orgmedi.repo.MedicamentoRepository;
import proyecto.orgmedi.repo.ConsumoRegistroRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import proyecto.orgmedi.error.NotFoundException;
import proyecto.orgmedi.error.BadRequestException;
import proyecto.orgmedi.dto.medicamento.MedicamentoDTO;
import proyecto.orgmedi.dto.medicamento.MedicamentoConHoraDTO;
import proyecto.orgmedi.dto.medicamento.MedicamentosPorHoraDTO;
import proyecto.orgmedi.dto.medicamento.MedicamentosPorFechaDTO;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@SuppressWarnings("null")
public class MedicamentoService implements IMedicamentoService {
    private final MedicamentoRepository medicamentoRepository;
    private final ConsumoRegistroRepository consumoRegistroRepository;

    @Autowired
    public MedicamentoService(MedicamentoRepository medicamentoRepository, 
                             ConsumoRegistroRepository consumoRegistroRepository) {
        this.medicamentoRepository = medicamentoRepository;
        this.consumoRegistroRepository = consumoRegistroRepository;
    }

    public List<Medicamento> findAll() {
        return medicamentoRepository.findAll();
    }

    public Optional<Medicamento> findById(Long id) {
        return medicamentoRepository.findById(id);
    }

    public Medicamento getByIdOrThrow(Long id) {
        return medicamentoRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Medicamento no encontrado"));
    }

    public Medicamento createMedicamento(Medicamento medicamento) {
        if (medicamento.getNombre() == null || medicamento.getNombre().isBlank()) {
            throw new BadRequestException("Nombre inválido");
        }
        return medicamentoRepository.save(medicamento);
    }

    // create from DTO
    public Medicamento createMedicamento(MedicamentoDTO dto) {
        if (dto.getNombre() == null || dto.getNombre().isBlank()) {
            throw new BadRequestException("Nombre inválido");
        }
        Medicamento m = fromDto(dto);
        return medicamentoRepository.save(m);
    }

    public Medicamento updateMedicamento(Long id, Medicamento medicamento) {
        if (medicamentoRepository.findById(id).isEmpty()) {
            throw new NotFoundException("Medicamento no encontrado");
        }
        medicamento.setId(id);
        return medicamentoRepository.save(medicamento);
    }

    // update from DTO
    public Medicamento updateMedicamento(Long id, MedicamentoDTO dto) {
        Optional<Medicamento> medicamentoOpt = medicamentoRepository.findById(id);
        if (medicamentoOpt.isEmpty()) {
            throw new NotFoundException("Medicamento no encontrado");
        }
        
        Medicamento medicamentoExistente = medicamentoOpt.get();
        
        // Detectar si hubo cambios en los campos de planificación
        boolean planificacionCambio = hasScheduleChanged(medicamentoExistente, dto);
        
        Medicamento m = fromDto(dto);
        m.setId(id);
        Medicamento medicamentoActualizado = medicamentoRepository.save(m);
        
        // Si cambió la planificación (frecuencia, horaInicio, fechaInicio, fechaFin),
        // eliminar todos los ConsumoRegistro asociados para que se regeneren con las nuevas horas
        if (planificacionCambio) {
            System.out.println("[updateMedicamento] Cambios de planificación detectados en medicamento: " + id);
            System.out.println("[updateMedicamento] Eliminando ConsumoRegistros asociados...");
            List<ConsumoRegistro> consumosAntiguos = consumoRegistroRepository.findByMedicamentoId(id);
            consumoRegistroRepository.deleteAll(consumosAntiguos);
            System.out.println("[updateMedicamento] " + consumosAntiguos.size() + " registros de consumo eliminados");
        }
        
        return medicamentoActualizado;
    }
    
    /**
     * Detecta si hubo cambios en los campos de planificación del medicamento
     */
    private boolean hasScheduleChanged(Medicamento medicamentoExistente, MedicamentoDTO nuevoDto) {
        // Comparar frecuencia
        if (!Objects.equals(medicamentoExistente.getFrecuencia(), nuevoDto.getFrecuencia())) {
            System.out.println("[hasScheduleChanged] Cambio en frecuencia: " + medicamentoExistente.getFrecuencia() + " -> " + nuevoDto.getFrecuencia());
            return true;
        }
        
        // Comparar horaInicio
        if (!Objects.equals(medicamentoExistente.getHoraInicio(), nuevoDto.getHoraInicio())) {
            System.out.println("[hasScheduleChanged] Cambio en horaInicio: " + medicamentoExistente.getHoraInicio() + " -> " + nuevoDto.getHoraInicio());
            return true;
        }
        
        // Comparar fechaInicio
        if (!Objects.equals(medicamentoExistente.getFechaInicio(), nuevoDto.getFechaInicio())) {
            System.out.println("[hasScheduleChanged] Cambio en fechaInicio: " + medicamentoExistente.getFechaInicio() + " -> " + nuevoDto.getFechaInicio());
            return true;
        }
        
        // Comparar fechaFin
        if (!Objects.equals(medicamentoExistente.getFechaFin(), nuevoDto.getFechaFin())) {
            System.out.println("[hasScheduleChanged] Cambio en fechaFin: " + medicamentoExistente.getFechaFin() + " -> " + nuevoDto.getFechaFin());
            return true;
        }
        
        return false;
    }

    public void deleteByIdOrThrow(Long id) {
        if (medicamentoRepository.findById(id).isEmpty()) {
            throw new NotFoundException("Medicamento no encontrado");
        }
        medicamentoRepository.deleteById(id);
    }
    
    @Override
    public void deleteMedicamento(Long id) {
        deleteByIdOrThrow(id);
    }
    
    @Override
    public List<MedicamentoDTO> getMedicamentosPorUsuario(Long usuarioId) {
        List<Medicamento> medicamentos = medicamentoRepository.findByUsuarioId(usuarioId);
        return medicamentos.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
    
    @Override
    public MedicamentosPorFechaDTO getMedicamentosPorFecha(Long usuarioId, LocalDate fecha) {
        List<Medicamento> medicamentos = medicamentoRepository.findByUsuarioId(usuarioId);
        return getMedicamentosPorFecha(medicamentos, fecha);
    }

    // mapper DTO <-> entity
    public Medicamento fromDto(MedicamentoDTO dto) {
        Medicamento m = new Medicamento();
        if (dto.getId() != null) {
            m.setId(dto.getId());
        }
        m.setNombre(dto.getNombre());
        m.setCantidadMg(dto.getCantidadMg());
        m.setHoraInicio(dto.getHoraInicio());
        m.setFechaInicio(dto.getFechaInicio());
        m.setFechaFin(dto.getFechaFin());
        m.setColor(dto.getColor());
        m.setFrecuencia(dto.getFrecuencia());
        m.setConsumed(dto.getConsumed() != null ? dto.getConsumed() : false);
        return m;
    }

    public MedicamentoDTO toDto(Medicamento m) {
        MedicamentoDTO dto = new MedicamentoDTO();
        dto.setId(m.getId());
        dto.setNombre(m.getNombre());
        dto.setCantidadMg(m.getCantidadMg());
        dto.setHoraInicio(m.getHoraInicio());
        dto.setFechaInicio(m.getFechaInicio());
        dto.setFechaFin(m.getFechaFin());
        dto.setColor(m.getColor());
        dto.setFrecuencia(m.getFrecuencia());
        dto.setConsumed(m.getConsumed() != null ? m.getConsumed() : false);
        return dto;
    }

    public Medicamento save(Medicamento medicamento) {
        return medicamentoRepository.save(medicamento);
    }

    @Deprecated(since = "2.0", forRemoval = true)
    public void deleteByNombre(String nombre) {
        // Deprecated: use deleteByIdOrThrow(Long) instead
    }

    /**
     * Obtiene todos los medicamentos agrupados por hora para una fecha específica
     * 
     * Lógica:
     * 1. Filtra medicamentos válidos para la fecha (fechaInicio <= fecha <= fechaFin)
     * 2. Calcula todas las horas de toma en la fecha según frecuencia
     * 3. Agrupa medicamentos por hora
     * 4. Ordena por hora ascendente
     * 
     * @param medicamentos Lista de medicamentos a procesar
     * @param fecha Fecha para la que se agrupan los medicamentos
     * @return DTO con medicamentos agrupados por hora
     */
    public MedicamentosPorFechaDTO getMedicamentosPorFecha(List<Medicamento> medicamentos, LocalDate fecha) {
        // Filtrar medicamentos válidos para esta fecha
        List<Medicamento> medicamentosValidos = medicamentos.stream()
                .filter(m -> esMedicamentoValidoParaFecha(m, fecha))
                .collect(Collectors.toList());

        // Mapa para agrupar medicamentos por hora
        Map<String, List<MedicamentoConHoraDTO>> medicamentosPorHora = new TreeMap<>();

        // Procesar cada medicamento
        for (Medicamento medicamento : medicamentosValidos) {
            List<String> horasToma = calcularHorasToma(medicamento, fecha);
            
            for (String hora : horasToma) {
                MedicamentoConHoraDTO medicamentoConHora = toMedicamentoConHoraDTO(medicamento, hora);
                
                medicamentosPorHora.computeIfAbsent(hora, k -> new ArrayList<>())
                        .add(medicamentoConHora);
            }
        }

        // Convertir mapa a lista de DTOs ordenados
        List<MedicamentosPorHoraDTO> grupos = medicamentosPorHora.entrySet().stream()
                .map(entry -> MedicamentosPorHoraDTO.builder()
                        .hora(entry.getKey())
                        .medicamentos(entry.getValue())
                        .build())
                .collect(Collectors.toList());

        // Contar total de medicamentos (incluyendo duplicados por hora)
        int totalMedicamentos = grupos.stream()
                .mapToInt(g -> g.getMedicamentos().size())
                .sum();

        return MedicamentosPorFechaDTO.builder()
                .fecha(fecha)
                .gruposPorHora(grupos)
                .totalMedicamentos(totalMedicamentos)
                .build();
    }

    /**
     * Verifica si un medicamento es válido para una fecha específica
     * (respeta las fechas de inicio y fin)
     * 
     * @param medicamento Medicamento a validar
     * @param fecha Fecha a comprobar
     * @return true si el medicamento es válido para la fecha
     */
    private boolean esMedicamentoValidoParaFecha(Medicamento medicamento, LocalDate fecha) {
        // Verificar fecha de inicio
        if (medicamento.getFechaInicio() != null && fecha.isBefore(medicamento.getFechaInicio())) {
            return false;
        }

        // Verificar fecha de fin
        if (medicamento.getFechaFin() != null && fecha.isAfter(medicamento.getFechaFin())) {
            return false;
        }

        return true;
    }

    /**
     * Calcula todas las horas de toma de un medicamento para una fecha específica
     * basándose en su frecuencia.
     * 
     * La primera toma es a horaInicio del fechaInicio.
     * Las siguientes tomas ocurren cada 'frecuencia' horas.
     * Se calculan todas las tomas que caen dentro de la fecha especificada.
     * 
     * Ejemplo:
     * - fechaInicio: 2026-02-02, horaInicio: 19:00, frecuencia: 6h
     * - 2026-02-02: [19:00]
     * - 2026-02-03: [01:00, 07:00, 13:00, 19:00]
     * - 2026-02-04: [01:00, 07:00, 13:00, 19:00]
     * 
     * Ejemplo 2:
     * - fechaInicio: 2026-02-02, horaInicio: 18:00, frecuencia: 1h
     * - 2026-02-02: [18:00, 19:00, 20:00, 21:00, 22:00, 23:00]
     * - 2026-02-03: [18:00, 19:00, 20:00, 21:00, 22:00, 23:00]
     * - 2026-02-04: [18:00, 19:00, 20:00, 21:00, 22:00, 23:00]
     * 
     * @param medicamento Medicamento a analizar
     * @param fecha Fecha para la que se calculan las horas
     * @return Lista de horas en formato HH:mm ordenadas ascendentemente
     */
    private List<String> calcularHorasToma(Medicamento medicamento, LocalDate fecha) {
        List<String> horas = new ArrayList<>();

        // Obtener la hora de inicio y la frecuencia
        String[] partes = medicamento.getHoraInicio().split(":");
        int horaInicio = Integer.parseInt(partes[0]);
        int minutoInicio = Integer.parseInt(partes[1]);
        int frecuencia = medicamento.getFrecuencia() != null ? medicamento.getFrecuencia() : 1;

        System.out.println("[calcularHorasToma] Medicamento: " + medicamento.getNombre() + 
                         " | Fecha: " + fecha + 
                         " | horaInicio: " + horaInicio + 
                         " | minutoInicio: " + minutoInicio + 
                         " | frecuencia: " + frecuencia);

        // Primera toma: fechaInicio a horaInicio:minutoInicio
        LocalDateTime primeraToma = LocalDateTime.of(medicamento.getFechaInicio(), 
                                                      LocalTime.of(horaInicio, minutoInicio));
        
        // Límites de la fecha actual
        LocalDateTime inicioFecha = LocalDateTime.of(fecha, LocalTime.MIDNIGHT);
        LocalDateTime finFecha = inicioFecha.plusDays(1).minusSeconds(1);

        System.out.println("[calcularHorasToma] Primera toma: " + primeraToma);
        System.out.println("[calcularHorasToma] Rango de fecha: " + inicioFecha + " a " + finFecha);

        // Calcular el índice de la primera toma que cae en esta fecha
        // Si primeraToma está después de inicioFecha, empezamos desde la primera toma
        // Si no, calculamos cuántas tomas han pasado
        int primeraTomaIndex = 0;
        if (primeraToma.isBefore(inicioFecha)) {
            // Calcular horas entre la primera toma y el inicio de esta fecha
            long horasDesdePrimera = ChronoUnit.HOURS.between(primeraToma, inicioFecha);
            primeraTomaIndex = (int) Math.ceil(horasDesdePrimera / (double) frecuencia);
            System.out.println("[calcularHorasToma] Horas desde primera toma hasta inicio de fecha: " + horasDesdePrimera);
            System.out.println("[calcularHorasToma] Primera toma index para esta fecha: " + primeraTomaIndex);
        }

        // Generar todas las tomas que caen en esta fecha
        for (int tomaIndex = primeraTomaIndex; ; tomaIndex++) {
            LocalDateTime toma = primeraToma.plusHours((long) tomaIndex * frecuencia);

            // Si la toma está fuera del rango de esta fecha, detenerse
            if (toma.isAfter(finFecha)) {
                System.out.println("[calcularHorasToma] Toma " + tomaIndex + " (" + toma + ") está fuera de rango");
                break;
            }

            int hora = toma.getHour();
            int minuto = toma.getMinute();
            String horaStr = String.format("%02d:%02d", hora, minuto);
            horas.add(horaStr);
            System.out.println("[calcularHorasToma] Agregando toma " + tomaIndex + ": " + horaStr + " (" + toma + ")");
        }

        // Ordenar las horas NUMÉRICAMENTE (por hora y minuto, no alfabéticamente)
        horas.sort((h1, h2) -> {
            String[] p1 = h1.split(":");
            String[] p2 = h2.split(":");
            int hora1 = Integer.parseInt(p1[0]);
            int hora2 = Integer.parseInt(p2[0]);
            if (hora1 != hora2) {
                return Integer.compare(hora1, hora2);
            }
            int min1 = Integer.parseInt(p1[1]);
            int min2 = Integer.parseInt(p2[1]);
            return Integer.compare(min1, min2);
        });

        System.out.println("[calcularHorasToma] Horas finales para " + medicamento.getNombre() + " en " + fecha + ": " + horas);

        return horas;
    }

    /**
     * Convierte un Medicamento a MedicamentoConHoraDTO con una hora específica
     * 
     * @param medicamento Medicamento a convertir
     * @param hora Hora específica en formato HH:mm
     * @return MedicamentoConHoraDTO
     */
    private MedicamentoConHoraDTO toMedicamentoConHoraDTO(Medicamento medicamento, String hora) {
        return MedicamentoConHoraDTO.builder()
                .id(medicamento.getId())
                .nombre(medicamento.getNombre())
                .cantidadMg(medicamento.getCantidadMg())
                .horaInicio(medicamento.getHoraInicio())
                .fechaInicio(medicamento.getFechaInicio())
                .fechaFin(medicamento.getFechaFin())
                .color(medicamento.getColor())
                .frecuencia(medicamento.getFrecuencia())
                .consumed(medicamento.getConsumed())
                .displayTime(hora)
                .build();
    }

    @Override
    public MedicamentosPorHoraDTO getMedicamentosPorHora(Long usuarioId, LocalDate fecha, String hora) {
        List<MedicamentoConHoraDTO> medicamentos = getMedicamentosPorFecha(usuarioId, fecha)
                .getGruposPorHora()
                .stream()
                .filter(grupo -> grupo.getHora().equals(hora))
                .flatMap(grupo -> grupo.getMedicamentos().stream())
                .collect(Collectors.toList());

        return MedicamentosPorHoraDTO.builder()
                .hora(hora)
                .medicamentos(medicamentos)
                .build();
    }
}
