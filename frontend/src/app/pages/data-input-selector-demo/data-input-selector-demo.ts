import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataInputSelectorComponent, SelectorOption } from '../../components/shared/data-input-selector/data-input-selector';

@Component({
  selector: 'app-data-input-selector-demo',
  standalone: true,
  imports: [CommonModule, DataInputSelectorComponent],
  templateUrl: './data-input-selector-demo.html',
  styleUrls: ['./data-input-selector-demo.scss']
})
export class DataInputSelectorDemoPage {
  
  // Opciones de frecuencia
  frequencyOptions: SelectorOption[] = [
    { id: 1, label: 'Cada 1 hora' },
    { id: 2, label: 'Cada 2 horas' },
    { id: 3, label: 'Cada 3 horas' },
    { id: 4, label: 'Cada 4 horas' },
    { id: 6, label: 'Cada 6 horas' },
    { id: 12, label: 'Cada 12 horas' }
  ];

  // Opciones de color
  colorOptions: SelectorOption[] = [
    { id: 'variante-primera', label: 'Azul Cian', color: 'var(--color-variante-primera)' },
    { id: 'variante-segunda', label: 'Amarillo', color: 'var(--color-variante-segunda)' },
    { id: 'variante-tercera', label: 'Rosa Magenta', color: 'var(--color-variante-tercera)' },
    { id: 'variante-cuarta', label: 'Naranja', color: 'var(--color-variante-cuarta)' },
    { id: 'variante-quinta', label: 'Magenta', color: 'var(--color-variante-quinta)' }
  ];

  selectedFrequency: SelectorOption | null = null;
  selectedColor: SelectorOption | null = null;

  onFrequencySelected(option: SelectorOption): void {
    this.selectedFrequency = option;
  }

  onColorSelected(option: SelectorOption): void {
    this.selectedColor = option;
  }
}
