import { Component, OnInit, OnDestroy, inject, ChangeDetectionStrategy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CalendarComponent } from '../../components/shared/calendar/calendar';
import { MedicineCardCalendarComponent } from '../../components/shared/medicine-card-calendar/medicine-card-calendar';
import { MedicineStoreSignals } from '../../data/stores/medicine-signals.store';
import { MedicineViewModel, MedicineTimeGroupDTO } from '../../data/models/medicine.model';
import { MedicineService } from '../../data/medicine.service';

export interface MedicineWithTime extends MedicineViewModel {
  displayTime: string; // HH:mm
  instanceId?: string; // ID único para esta instancia: id_HH:mm (para medicamentos con múltiples tomas al día)
}

export interface MedicineTimeGroup {
  time: string;
  medicines: MedicineWithTime[];
}

@Component({
  selector: 'app-calendar-page',
  standalone: true,
  imports: [CommonModule, CalendarComponent, MedicineCardCalendarComponent],
  templateUrl: './calendar.html',
  styleUrls: ['./calendar.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CalendarPage implements OnInit, OnDestroy {
  private medicineStore = inject(MedicineStoreSignals);
  private medicineService = inject(MedicineService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  // Signals del store (readonly)
  loading = this.medicineStore.loading;
  error = this.medicineStore.error;
  stats = this.medicineStore.stats;

  currentDate = new Date();
  selectedDay: number | null = null;
  medicinesToShow: MedicineWithTime[] = []; // Medicamentos expandidos con horas
  medicineGroups: MedicineTimeGroup[] = []; // Grupos de medicamentos por hora
  
  // Estado de carga del nuevo endpoint
  isLoadingByDate = false;
  
  // Mapa de estado de consumo por instancia (medicamentoId_hora -> consumed)
  // Permite que cada instancia tenga su propio estado independiente
  instanceConsumptionState = new Map<string, boolean>();

  constructor() {
    // Effect: Reaccionar a cambios en el store de medicamentos
    // IMPORTANTE: El effect debe crearse en el constructor para estar en el contexto de inyección correcto
    effect(() => {
      const medicines = this.medicineStore.medicines();
      console.log('[CalendarPage Effect] Medicamentos actualizados en el store:', medicines.length);
      // Actualizar vista cuando cambia el store
      this.updateMedicinesToShow();
    });
  }

  ngOnInit(): void {
    // Verificar si hay token de autenticación
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.warn('[CalendarPage] No token found, redirecting to login');
      this.router.navigate(['/iniciar-sesion']);
      return;
    }

    // Verificar si hay cambios pendientes desde la edición de una medicina
    const medicinesUpdated = sessionStorage.getItem('medicinesUpdated');
    if (medicinesUpdated === 'true') {
      console.log('[CalendarPage] Cambios pendientes detectados, refrescando medicamentos');
      sessionStorage.removeItem('medicinesUpdated');
      // Recargar los medicamentos para la fecha seleccionada
      if (this.selectedDay) {
        this.updateMedicinesToShow();
      }
    }

    // Suscribirse a cambios de medicamentos (frecuencia, horaInicio, fechaInicio, fechaFin)
    this.medicineService.medicineUpdated$
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ id, changedFields }) => {
        console.log(`[CalendarPage] Medicamento ${id} actualizado con campos: ${changedFields.join(', ')}`);
        console.log('[CalendarPage] Recargando medicamentos del calendario debido a cambios en horario');
        
        // Recargar la lista de medicamentos para la fecha actual
        // Esto forzará a recalcular las horas basadas en la nueva frecuencia/horaInicio
        if (this.selectedDay) {
          this.updateMedicinesToShow();
        }
      });

    // Actualizar vista cuando cambian los medicamentos en el store
    // Usar effect para reactividad con signals
    this.updateMedicinesToShowInitial();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateMedicinesToShowInitial(): void {
    // Seleccionar el día actual por defecto
    const today = new Date();
    this.selectedDay = today.getDate();
    this.updateMedicinesToShow();
  }

  /**
   * TrackBy para optimizar *ngFor de grupos de medicamentos
   */
  trackByTime(index: number, group: MedicineTimeGroup): string {
    return group.time;
  }

  /**
   * TrackBy para optimizar *ngFor de medicamentos individuales
   */
  trackById(index: number, medicine: MedicineWithTime): string | number {
    return medicine.id + medicine.displayTime; // Única combinación de id + hora
  }

  /**
   * Actualiza la lista de medicamentos a mostrar basándose en el día seleccionado
   * Utiliza el nuevo endpoint GET /medicamentos/por-fecha para obtener medicamentos
   * agrupados por hora desde el backend
   */
  private updateMedicinesToShow(): void {
    const displayDate = this.selectedDay 
      ? new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), this.selectedDay)
      : new Date();

    console.log('[updateMedicinesToShow] Display date:', displayDate);

    // Convertir fecha a formato yyyy-MM-dd para el endpoint
    const year = displayDate.getFullYear();
    const month = String(displayDate.getMonth() + 1).padStart(2, '0');
    const day = String(displayDate.getDate()).padStart(2, '0');
    const fechaStr = `${year}-${month}-${day}`;

    // Mostrar estado de carga
    this.isLoadingByDate = true;

    // Llamar al nuevo endpoint del backend
    this.medicineService.getMedicinesByDate(fechaStr).subscribe({
      next: (response) => {
        console.log('[updateMedicinesToShow] Response from backend:', response);

        // Limpiar estado de consumo anterior
        this.instanceConsumptionState.clear();

        // Convertir la respuesta del backend a estructura local
        // Crear IDs únicos para cada instancia (medicamentoId_hora)
        this.medicineGroups = response.gruposPorHora.map(grupo => ({
          time: grupo.hora,
          medicines: grupo.medicamentos.map(med => {
            const instanceId = `${med.id}_${med.displayTime}`; // ID único para esta instancia
            // Inicializar estado de consumo independiente para cada instancia
            this.instanceConsumptionState.set(instanceId, med.consumed || false);
            return {
              ...med,
              displayTime: med.displayTime,
              instanceId: instanceId
            };
          })
        }));

        // Aplanar medicamentos para medicinesToShow
        this.medicinesToShow = [];
        for (const grupo of this.medicineGroups) {
          this.medicinesToShow.push(...grupo.medicines);
        }

        // Ordenar medicamentos por hora
        this.medicinesToShow.sort((a, b) => a.displayTime.localeCompare(b.displayTime));

        // Actualizar el estado de consumo de las medicinas desde el mapa
        this.medicinesToShow = this.medicinesToShow.map(med => ({
          ...med,
          consumed: this.instanceConsumptionState.get(med.instanceId || `${med.id}_${med.displayTime}`) || false
        }));

        this.medicineGroups = this.medicineGroups.map(group => ({
          ...group,
          medicines: group.medicines.map(med => ({
            ...med,
            consumed: this.instanceConsumptionState.get(med.instanceId || `${med.id}_${med.displayTime}`) || false
          }))
        }));

        console.log('[updateMedicinesToShow] Final medicines to show:', this.medicinesToShow.length);
        console.log('[updateMedicinesToShow] Medicine groups:', this.medicineGroups.length);
        console.log('[updateMedicinesToShow] Instance consumption state before loading consumos:', this.instanceConsumptionState);
        
        // Ahora cargar el estado de consumo persistido en el servidor
        this.loadConsumptionStateFromServer(fechaStr);
      },
      error: (err) => {
        console.error('[updateMedicinesToShow] Error fetching medicines by date:', err);
        this.isLoadingByDate = false;
        
        // En caso de error, mostrar lista vacía
        this.medicinesToShow = [];
        this.medicineGroups = [];
      }
    });
  }

  /**
   * Carga el estado de consumo persistido en el servidor para la fecha especificada
   * y actualiza el estado local (instanceConsumptionState)
   * 
   * @param fechaStr - Fecha en formato yyyy-MM-dd
   */
  private loadConsumptionStateFromServer(fechaStr: string): void {
    this.medicineService.obtenerConsumosDelDia(fechaStr).subscribe({
      next: (consumos: Array<{ id: number; hora: string; medicamentoId: number; consumido: boolean }>) => {
        console.log('[loadConsumptionStateFromServer] Consumos obtenidos del servidor:', consumos);
        
        // Actualizar instanceConsumptionState con los datos del servidor
        // Cada consumo tiene: {id, fecha, hora, medicamentoId, medicamentoNombre, consumido}
        // donde hora viene en formato "HH:mm" del servidor (gracias a @JsonFormat)
        if (Array.isArray(consumos)) {
          consumos.forEach(consumo => {
            // Normalizar la hora: asegurar formato HH:mm
            let horaStr = consumo.hora;
            if (typeof horaStr === 'string') {
              // Si viene como "14:00:00", extraer solo "14:00"
              horaStr = horaStr.split(':').slice(0, 2).join(':');
            }
            
            const instanceId = `${consumo.medicamentoId}_${horaStr}`;
            this.instanceConsumptionState.set(instanceId, consumo.consumido || false);
            console.log(`[loadConsumptionStateFromServer] Instancia ${instanceId}: consumido=${consumo.consumido}, hora original=${consumo.hora}, hora normalizada=${horaStr}`);
          });
        }

        // Actualizar medicinesToShow con el estado del servidor
        this.medicinesToShow = this.medicinesToShow.map(med => {
          const instanceId = med.instanceId || `${med.id}_${med.displayTime}`;
          return {
            ...med,
            consumed: this.instanceConsumptionState.get(instanceId) || false
          };
        });

        // Actualizar medicineGroups con el estado del servidor
        this.medicineGroups = this.medicineGroups.map(group => ({
          ...group,
          medicines: group.medicines.map(med => {
            const instanceId = med.instanceId || `${med.id}_${med.displayTime}`;
            return {
              ...med,
              consumed: this.instanceConsumptionState.get(instanceId) || false
            };
          })
        }));

        console.log('[loadConsumptionStateFromServer] Estado de consumo cargado desde servidor');
        console.log('[loadConsumptionStateFromServer] medicinesToShow después de cargar consumos:');
        this.medicinesToShow.forEach(med => {
          console.log(`  - ${med.id} (${med.displayTime}): consumed=${med.consumed}`);
        });
        console.log('[loadConsumptionStateFromServer] Instance consumption state final:', this.instanceConsumptionState);
        
        this.isLoadingByDate = false;
      },
      error: (err) => {
        console.error('[loadConsumptionStateFromServer] Error al cargar estado de consumo:', err);
        // No es crítico si falla, continuamos con los valores por defecto
        this.isLoadingByDate = false;
      }
    });
  }


  /**
   * Verifica si un medicamento ha expirado
   */
  isExpired(medicine: MedicineViewModel): boolean {
    if (!medicine.fechaFin) return false;
    const endDate = new Date(medicine.fechaFin);
    const today = new Date();
    return endDate < today;
  }

  /**
   * Verifica si un medicamento está por vencer (dentro de 7 días)
   */
  isExpiring(medicine: MedicineViewModel): boolean {
    if (!medicine.fechaFin) return false;
    const endDate = new Date(medicine.fechaFin);
    const today = new Date();
    const daysUntilExpiry = (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  }

  /**
   * Maneja el toggle de consumo de una instancia específica de medicamento
   * Cada instancia (medicamento + hora) tiene su propio estado de consumo independiente
   * 
   * @param id - ID del medicamento
   * @param instanceId - ID único de la instancia (medicamentoId_hora)
   */
  onMedicineSelected(id: number, instanceId?: string): void {
    if (!this.selectedDay) {
      console.warn('[CalendarPage] No hay día seleccionado');
      return;
    }

    // Construir instanceId si no se proporciona
    const actualInstanceId = instanceId || this.medicinesToShow
      .find(m => m.id === id)
      ?.instanceId 
      || `${id}_unknown`;

    console.log('[CalendarPage] Toggle consumo para instancia:', actualInstanceId);

    // Obtener la hora de esta instancia específica
    const medicineInstance = this.medicinesToShow.find(m => m.instanceId === actualInstanceId);
    if (!medicineInstance) {
      console.warn('[CalendarPage] Instancia no encontrada:', actualInstanceId);
      return;
    }

    // Obtener estado actual de esta instancia específica
    const currentConsumed = medicineInstance.consumed || false;
    const newValue = !currentConsumed;

    console.log(`[CalendarPage] Cambiando consumo de instancia ${actualInstanceId}: ${currentConsumed} → ${newValue}`);
    
    // Actualizar SOLO esta instancia en la UI
    this.medicinesToShow = this.medicinesToShow.map(med =>
      med.instanceId === actualInstanceId ? { ...med, consumed: newValue } : med
    );

    // Actualizar medicineGroups para esta instancia específica
    this.medicineGroups = this.medicineGroups.map(group => ({
      ...group,
      medicines: group.medicines.map(med =>
        med.instanceId === actualInstanceId ? { ...med, consumed: newValue } : med
      )
    }));

    console.log(`[CalendarPage] Instancia ${actualInstanceId} marcada como consumida: ${newValue}`);

    // Construir fecha en formato yyyy-MM-dd
    const displayDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), this.selectedDay);
    const year = displayDate.getFullYear();
    const month = String(displayDate.getMonth() + 1).padStart(2, '0');
    const day = String(displayDate.getDate()).padStart(2, '0');
    const fechaStr = `${year}-${month}-${day}`;

    console.log(`[CalendarPage] medicineInstance.displayTime = "${medicineInstance.displayTime}" (tipo: ${typeof medicineInstance.displayTime})`);
    console.log(`[CalendarPage] Enviando: id=${id}, fecha=${fechaStr}, hora="${medicineInstance.displayTime}", consumido=${newValue}`);

    // Persistir en backend con fecha y hora específica
    this.medicineService.registrarConsumo(id, fechaStr, medicineInstance.displayTime, newValue).subscribe({
      next: (response) => {
        console.log('[CalendarPage] Consumo registrado en servidor para instancia:', actualInstanceId, response);
        // El servidor ha guardado el consumo de forma independiente por fecha/hora
      },
      error: (err) => {
        console.error('[CalendarPage] Error al registrar consumo:', err);
        // Revertir cambio local
        this.medicinesToShow = this.medicinesToShow.map(med =>
          med.instanceId === actualInstanceId ? { ...med, consumed: currentConsumed } : med
        );
        this.medicineGroups = this.medicineGroups.map(group => ({
          ...group,
          medicines: group.medicines.map(med =>
            med.instanceId === actualInstanceId ? { ...med, consumed: currentConsumed } : med
          )
        }));
      }
    });
  }

  /**
   * Edita un medicamento
   */
  editMedicine(id: number): void {
    this.router.navigate(['/medicamento', id, 'editar-medicamento']);
  }

  /**
   * Elimina un medicamento
   */
  deleteMedicine(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar este medicamento?')) {
      this.medicineStore.remove(id);
      this.updateMedicinesToShow();
    }
  }

  get currentMonth(): string {
    return this.currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  }

  get daysInMonth(): number[] {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: number[] = [];

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(i);
    }
    return days;
  }

  get firstDayOfWeek(): number {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    return firstDay.getDay();
  }

  previousMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1);
    this.updateMedicinesToShow();
  }

  nextMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1);
    this.updateMedicinesToShow();
  }

  isToday(day: number): boolean {
    const today = new Date();
    return day === today.getDate() &&
           this.currentDate.getMonth() === today.getMonth() &&
           this.currentDate.getFullYear() === today.getFullYear();
  }

  /**
   * Manejador para cuando se selecciona un día desde el calendario
   * Verifica medicamentos que cumplan con la fecha seleccionada
   */
  onCalendarDaySelected(selectedDate: Date): void {
    console.log('[onCalendarDaySelected] Date selected:', selectedDate.toLocaleDateString('es-ES'));
    
    // Actualizar la fecha actual y el día seleccionado
    this.currentDate = new Date(selectedDate);
    this.selectedDay = selectedDate.getDate();
    
    // Actualizar medicamentos a mostrar basándose en la nueva fecha
    this.updateMedicinesToShow();
  }

  onDaySelected(day: number): void {
    this.selectedDay = day;
    this.updateMedicinesToShow(); // Actualizar lista al cambiar día
  }

  getWeekDays(): number[] {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    const dayOfWeek = firstDay.getDay();
    const daysFromPreviousMonth = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startDate.setDate(startDate.getDate() - daysFromPreviousMonth);

    const weekDays: number[] = [];
    for (let i = 0; i < 7; i++) {
      weekDays.push(startDate.getDate());
      startDate.setDate(startDate.getDate() + 1);
    }
    return weekDays;
  }
}


