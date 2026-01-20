import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DataInputSelectorComponent, SelectorOption } from '../data-input-selector/data-input-selector';
import { ButtonComponent } from '../button/button';

export interface MedicineFormData {
  nombre: string;
  cantidadMg: number;
  horaInicio: string;
  fechaInicio: string;
  fechaFin: string;
  frecuencia: number;
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
  formInitialized = false;

  // Opciones de frecuencia
  frequencyOptions: SelectorOption[] = [
    { id: 1, label: 'Cada 1 hora' },
    { id: 2, label: 'Cada 2 horas' },
    { id: 3, label: 'Cada 3 horas' },
    { id: 4, label: 'Cada 4 horas' },
    { id: 6, label: 'Cada 6 horas' },
    { id: 12, label: 'Cada 12 horas' }
  ];

  // Mapeo de colores variantes a hex
  private colorMap: { [key: string]: string } = {
    'variante-primera': '#00BCD4',   // Azul Cian
    'variante-segunda': '#FFC107',   // Amarillo
    'variante-tercera': '#E91E63',   // Rosa Magenta
    'variante-cuarta': '#FF9800',    // Naranja
    'variante-quinta': '#9C27B0'     // Magenta
  };

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
    // Inicializar form de forma temporal para evitar null reference
    this.form = this.fb.group({
      nombre: [''],
      cantidadMg: [''],
      horaInicio: [''],
      fechaInicio: [''],
      fechaFin: [''],
      frecuencia: ['']
    });
  }

  ngOnInit(): void {
    // Reinicializar el formulario con validators en ngOnInit
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      cantidadMg: ['', [Validators.required, Validators.min(1)]],
      horaInicio: ['', Validators.required],
      fechaInicio: ['', Validators.required],
      fechaFin: ['', Validators.required],
      frecuencia: ['', Validators.required]
    });
    this.formInitialized = true;

    if (this.initialData) {
      this.form.patchValue({
        nombre: this.initialData.nombre,
        cantidadMg: this.initialData.cantidadMg,
        horaInicio: this.initialData.horaInicio,
        fechaInicio: this.initialData.fechaInicio,
        fechaFin: this.initialData.fechaFin,
        frecuencia: this.initialData.frecuencia
      });
      // Buscar la frecuencia seleccionada inicial
      const freqOption = this.frequencyOptions.find(opt => opt.id === this.initialData?.frecuencia);
      if (freqOption) {
        this.selectedFrequency = freqOption;
      }
      // Buscar el color seleccionado inicial
      const colorOption = this.colorOptions.find(opt => this.colorMap[opt.id as string] === this.initialData?.color);
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
    this.form.patchValue({ frecuencia: option.id });
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
    if (this.form.valid && this.selectedFrequency && this.selectedColor) {
      const formData: MedicineFormData = {
        ...this.form.value,
        frecuencia: this.selectedFrequency.id as number,
        color: this.colorMap[this.selectedColor.id as string]
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
