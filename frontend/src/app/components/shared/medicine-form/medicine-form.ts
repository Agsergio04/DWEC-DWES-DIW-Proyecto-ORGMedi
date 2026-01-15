import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DataInputSelectorComponent, SelectorOption } from '../data-input-selector/data-input-selector';
import { ButtonComponent } from '../button/button';

export interface MedicineFormData {
  name: string;
  dosage: string;
  description: string;
  startDate: string;
  endDate: string;
  quantity: number;
  frequency: string;
  color?: string;
}

@Component({
  selector: 'app-medicine-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, DataInputSelectorComponent, ButtonComponent],
  templateUrl: './medicine-form.html',
  styleUrls: ['./medicine-form.scss']
})
export class MedicineFormComponent implements OnInit {
  private fb = inject(FormBuilder);

  @Input() isLoading = false;
  @Input() isSubmitting = false;
  @Input() initialData: MedicineFormData | null = null;
  @Input() submitButtonText = 'Guardar cambios';
  @Input() cancelButtonText = 'Cancelar';

  @Output() formSubmit = new EventEmitter<MedicineFormData>();
  @Output() formCancel = new EventEmitter<void>();

  form: FormGroup;

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

  constructor() {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      dosage: ['', Validators.required],
      description: [''],
      startDate: ['', Validators.required],
      endDate: [''],
      quantity: [0, [Validators.required, Validators.min(1)]],
      frequency: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    if (this.initialData) {
      this.form.patchValue(this.initialData);
      // Buscar la frecuencia seleccionada inicial
      const freqOption = this.frequencyOptions.find(opt => opt.label === this.initialData?.frequency);
      if (freqOption) {
        this.selectedFrequency = freqOption;
      }
      // Buscar el color seleccionado inicial
      const colorOption = this.colorOptions.find(opt => opt.id === this.initialData?.color);
      if (colorOption) {
        this.selectedColor = colorOption;
      }
    }
  }

  /**
   * Maneja la selección de frecuencia
   */
  onFrequencySelected(option: SelectorOption): void {
    this.selectedFrequency = option;
    this.form.patchValue({ frequency: option.label });
  }

  /**
   * Maneja la selección de color
   */
  onColorSelected(option: SelectorOption): void {
    this.selectedColor = option;
  }

  /**
   * Envía el formulario
   */
  onSubmit(): void {
    if (this.form.valid) {
      const formData: MedicineFormData = {
        ...this.form.value,
        color: this.selectedColor?.id.toString()
      };
      this.formSubmit.emit(formData);
    }
  }

  /**
   * Cancela el formulario
   */
  onCancel(): void {
    this.formCancel.emit();
  }
}
