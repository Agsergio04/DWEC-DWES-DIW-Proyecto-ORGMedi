/**
 * Utilidad para calcular el horario de consumo de medicamentos
 * Basado en hora de inicio, frecuencia y fecha fin
 */

export interface MedicineDose {
  date: Date;
  time: string;
  medicineId: string;
  medicineName: string;
}

/**
 * Convierte una fecha de string o Date a formato yyyy-MM-dd
 */
function formatDateToString(date: string | Date | undefined): string {
  if (!date) {
    return new Date().toISOString().split('T')[0];
  }
  if (typeof date === 'string') {
    return date;
  }
  return date.toISOString().split('T')[0];
}

/**
 * Calcula todas las dosis de un medicamento dentro del rango de fechas
 * @param medicineName - Nombre del medicamento
 * @param medicineId - ID del medicamento (string o número)
 * @param startDate - Fecha de inicio (string formato yyyy-MM-dd o Date)
 * @param endDate - Fecha fin (string formato yyyy-MM-dd, Date, o undefined)
 * @param startTime - Hora de inicio (string formato HH:mm, ej: "04:33")
 * @param frequencyHours - Frecuencia en horas (ej: 6)
 * @returns Array de dosis calculadas
 */
export function calculateMedicineDoses(
  medicineName: string,
  medicineId: string | number,
  startDate: string | Date,
  endDate: string | Date | undefined,
  startTime: string,
  frequencyHours: number
): MedicineDose[] {
  const doses: MedicineDose[] = [];

  // Convertir medicineId a string si es número
  const medicineIdStr = medicineId.toString();

  // Convertir fechas a formato string
  const startDateStr = formatDateToString(startDate);
  const endDateStr = formatDateToString(endDate);

  // Parsear fechas
  const [startYear, startMonth, startDay] = startDateStr.split('-').map(Number);
  let currentDate = new Date(startYear, startMonth - 1, startDay);
  
  const endDateObj = new Date(...(endDateStr.split('-').map(Number) as [number, number, number]));
  endDateObj.setDate(endDateObj.getDate() + 365); // Por defecto, 1 año adelante

  // Parsear hora de inicio
  const [hours, minutes] = startTime.split(':').map(Number);
  let currentHour = hours;
  let currentMinutes = minutes;

  // Generar dosis
  while (currentDate <= endDateObj) {
    // Crear dosis actual
    const doseDate = new Date(currentDate);
    doseDate.setHours(currentHour, currentMinutes, 0, 0);

    doses.push({
      date: new Date(doseDate),
      time: `${String(currentHour).padStart(2, '0')}:${String(currentMinutes).padStart(2, '0')}`,
      medicineId: medicineIdStr,
      medicineName,
    });

    // Calcular siguiente dosis
    currentHour += frequencyHours;
    currentMinutes = minutes; // Mantener los minutos originales

    // Si la hora excede las 23:59, pasar al siguiente día
    if (currentHour >= 24) {
      currentHour = currentHour % 24;
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  return doses;
}

/**
 * Parsea la frecuencia de string o número a horas numéricas
 * Ej: "Cada 6 horas" -> 6, 6 -> 6
 * @param frequency - String o número de frecuencia
 * @returns Número de horas
 */
export function parseFrequencyToHours(frequency: string | number): number {
  if (typeof frequency === 'number') {
    return frequency;
  }
  const match = frequency.match(/(\d+)/);
  return match ? Number(match[1]) : 6; // Por defecto 6 horas
}
