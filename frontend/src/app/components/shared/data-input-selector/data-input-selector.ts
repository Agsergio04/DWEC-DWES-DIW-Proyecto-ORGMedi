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
    this.cdr.markForCheck();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['options'] && !changes['options'].firstChange) {
      this.cdr.markForCheck();
    }
    if (changes['selectedOption'] && !changes['selectedOption'].firstChange) {
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
    this.selectedOption = option;
    this.currentValue = option.id;
    this.optionSelected.emit(option);
    this.onChangeFn(option.id);
    this.onTouchedFn();
    this.isOpen = false;
    this.cdr.markForCheck();
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
    this.currentValue = value;
    if (value) {
      const found = this.options.find(opt => opt.id === value);
      this.selectedOption = found || null;
    } else {
      this.selectedOption = null;
    }
    this.cdr.markForCheck();
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
