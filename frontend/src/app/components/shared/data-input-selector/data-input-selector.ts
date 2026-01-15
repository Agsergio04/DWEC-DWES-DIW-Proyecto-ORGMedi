import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface SelectorOption {
  id: string | number;
  label: string;
  color?: string;
}

@Component({
  selector: 'app-data-input-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './data-input-selector.html',
  styleUrls: ['./data-input-selector.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataInputSelectorComponent {
  @Input() options: SelectorOption[] = [];
  @Input() selectedOption: SelectorOption | null = null;
  @Input() placeholder = 'Selecciona una Opción';
  @Input() type: 'text' | 'color' = 'text';
  @Input() disabled = false;

  @Output() optionSelected = new EventEmitter<SelectorOption>();

  isOpen = false;

  toggleDropdown(): void {
    if (!this.disabled) {
      this.isOpen = !this.isOpen;
    }
  }

  selectOption(option: SelectorOption): void {
    this.selectedOption = option;
    this.optionSelected.emit(option);
    this.isOpen = false;
  }

  closeDropdown(): void {
    this.isOpen = false;
  }

  getDisplayText(): string {
    return this.selectedOption?.label || this.placeholder;
  }
}
