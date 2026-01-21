import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, forwardRef, ChangeDetectorRef, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

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
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DataInputSelectorComponent),
      multi: true
    }
  ]
})
export class DataInputSelectorComponent implements ControlValueAccessor, OnInit, OnChanges {
  @Input() options: SelectorOption[] = [];
  @Input() selectedOption: SelectorOption | null = null;
  @Input() placeholder = 'Selecciona una Opción';
  @Input() type: 'text' | 'color' = 'text';
  @Input() disabled = false;

  @Output() optionSelected = new EventEmitter<SelectorOption>();

  isOpen = false;
  private onChangeFn: (value: any) => void = () => {};
  private onTouchedFn: () => void = () => {};
  private currentValue: any = null;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    console.log('[DataInputSelector] ngOnInit - options:', this.options);
    this.cdr.markForCheck();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['options'] && !changes['options'].firstChange) {
      console.log('[DataInputSelector] options changed:', this.options);
      this.cdr.markForCheck();
    }
    if (changes['selectedOption'] && !changes['selectedOption'].firstChange) {
      console.log('[DataInputSelector] selectedOption changed:', this.selectedOption);
      this.cdr.markForCheck();
    }
  }

  toggleDropdown(): void {
    if (!this.disabled) {
      this.isOpen = !this.isOpen;
      this.cdr.markForCheck();
    }
  }

  selectOption(option: SelectorOption): void {
    console.log('[DataInputSelector] selectOption called with:', option);
    this.selectedOption = option;
    this.currentValue = option.id;
    console.log('[DataInputSelector] selectedOption set to:', this.selectedOption);
    this.optionSelected.emit(option);
    console.log('[DataInputSelector] optionSelected emitted');
    this.onChangeFn(option.id);
    console.log('[DataInputSelector] onChangeFn called with:', option.id);
    this.onTouchedFn();
    this.isOpen = false;
    this.cdr.markForCheck();
    console.log('[DataInputSelector] Option selection complete');
  }

  closeDropdown(): void {
    this.isOpen = false;
    this.cdr.markForCheck();
  }

  getDisplayText(): string {
    return this.selectedOption?.label || this.placeholder;
  }

  /**
   * TrackBy para optimizar *ngFor de opciones
   */
  trackById(index: number, option: SelectorOption): string | number {
    return option.id;
  }

  // ControlValueAccessor implementation
  writeValue(value: any): void {
    console.log('[DataInputSelector] writeValue called with:', value);
    this.currentValue = value;
    if (value) {
      const found = this.options.find(opt => opt.id === value);
      console.log('[DataInputSelector] Finding option with id:', value, 'Found:', found);
      this.selectedOption = found || null;
    } else {
      this.selectedOption = null;
    }
    this.cdr.markForCheck();
    console.log('[DataInputSelector] writeValue complete. selectedOption:', this.selectedOption);
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChangeFn = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouchedFn = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.cdr.markForCheck();
  }
}
