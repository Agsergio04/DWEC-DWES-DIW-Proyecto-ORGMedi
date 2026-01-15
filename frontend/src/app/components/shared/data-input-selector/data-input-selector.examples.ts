// Ejemplo de uso del componente DataInputSelectorComponent

import { Component } from '@angular/core';
import { DataInputSelectorComponent, SelectorOption } from './data-input-selector';

/**
 * EJEMPLO 1: Selector de frecuencia
 * ================================
 */
export const FREQUENCY_OPTIONS: SelectorOption[] = [
  { id: 1, label: 'Cada 1 hora' },
  { id: 2, label: 'Cada 2 horas' },
  { id: 3, label: 'Cada 3 horas' },
  { id: 4, label: 'Cada 4 horas' },
  { id: 6, label: 'Cada 6 horas' },
  { id: 12, label: 'Cada 12 horas' }
];

/**
 * EJEMPLO 2: Selector de colores
 * ===============================
 * 
 * Utiliza las variables de color del proyecto definidas en:
 * frontend/src/styles/00-settings/_variables.scss
 */
export const COLOR_OPTIONS: SelectorOption[] = [
  { id: 'variante-primera', label: 'Azul Cian', color: 'var(--color-variante-primera)' },
  { id: 'variante-segunda', label: 'Amarillo', color: 'var(--color-variante-segunda)' },
  { id: 'variante-tercera', label: 'Rosa Magenta', color: 'var(--color-variante-tercera)' },
  { id: 'variante-cuarta', label: 'Naranja', color: 'var(--color-variante-cuarta)' },
  { id: 'variante-quinta', label: 'Magenta', color: 'var(--color-variante-quinta)' }
];

/**
 * CÓMO USAR EN TUS COMPONENTES
 * ============================
 * 
 * 1. Importa el componente:
 * 
 * import { DataInputSelectorComponent, SelectorOption } from '../../components/shared/data-input-selector/data-input-selector';
 * import { FREQUENCY_OPTIONS, COLOR_OPTIONS } from './data-input-selector.examples';
 * 
 * 2. Añádelo al imports:
 * 
 * imports: [DataInputSelectorComponent]
 * 
 * 3. En tu template (HTML):
 * 
 * <!-- Selector de frecuencia -->
 * <app-data-input-selector
 *   [options]="frequencyOptions"
 *   [selectedOption]="selectedFrequency"
 *   [type]="'text'"
 *   placeholder="Selecciona una frecuencia"
 *   (optionSelected)="onFrequencySelected($event)">
 * </app-data-input-selector>
 * 
 * <!-- Selector de color -->
 * <app-data-input-selector
 *   [options]="colorOptions"
 *   [selectedOption]="selectedColor"
 *   [type]="'color'"
 *   placeholder="Selecciona un color"
 *   (optionSelected)="onColorSelected($event)">
 * </app-data-input-selector>
 * 
 * 4. En tu componente TypeScript:
 * 
 * export class MiComponente {
 *   frequencyOptions = FREQUENCY_OPTIONS;
 *   colorOptions = COLOR_OPTIONS;
 *   selectedFrequency: SelectorOption | null = null;
 *   selectedColor: SelectorOption | null = null;
 * 
 *   onFrequencySelected(option: SelectorOption): void {
 *     console.log('Frecuencia seleccionada:', option);
 *     this.selectedFrequency = option;
 *   }
 * 
 *   onColorSelected(option: SelectorOption): void {
 *     console.log('Color seleccionado:', option);
 *     this.selectedColor = option;
 *   }
 * }
 */
