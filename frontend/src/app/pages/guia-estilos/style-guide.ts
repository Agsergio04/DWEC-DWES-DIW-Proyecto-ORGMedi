import { Component, OnInit, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

// Importar componentes del proyecto
import { FormInputComponent } from '../../components/shared/form-input/form-input';
import { FormTextareaComponent } from '../../components/shared/form-textarea/form-textarea';
import { FormSelectComponent } from '../../components/shared/form-select/form-select';
import { DomDemoComponent } from '../../components/shared/dom-demo/dom-demo.component';
import { ModalComponent } from '../../components/shared/modal/modal';
import { TabsComponent } from '../../components/shared/tabs/tabs';
import { AlertComponent } from '../../components/shared/alert/alert';
import { MedicineCardComponent } from '../../components/shared/medicine-card/medicine-card';
import { ThemeSwitcher } from '../../components/shared/theme-switcher/theme-switcher';
import { MedicineFormComponent, MedicineFormData } from '../../components/shared/medicine-form/medicine-form';
import { MedicineViewModel } from '../../data/models/medicine.model';
import { ButtonComponent } from '../../components/shared/button/button';

@Component({
  selector: 'app-style-guide',
  standalone: true,
  imports: [
    CommonModule,
    FormInputComponent,
    FormTextareaComponent,
    FormSelectComponent,
    DomDemoComponent,
    ModalComponent,
    TabsComponent,
    AlertComponent,
    MedicineCardComponent,
    ThemeSwitcher,
    MedicineFormComponent,
    ButtonComponent
  ],
  schemas: [NO_ERRORS_SCHEMA],
  templateUrl: './style-guide.html',
  styleUrls: ['./style-guide.scss']
})
export class StyleGuidePage implements OnInit {
  // Referencia a componentes para evitar advertencias "never used"
  private readonly _usedComponents = [
    // ButtonComponent,
    // CardComponent,
    FormInputComponent,
    FormTextareaComponent,
    FormSelectComponent,
    DomDemoComponent,
    ModalComponent,
    TabsComponent,
    AlertComponent,
    MedicineCardComponent,
    MedicineFormComponent
  ];

  // Opciones de ejemplo para el select
  selectOptions = [
    { value: '1h', label: '1 hora' },
    { value: '2h', label: '2 horas' },
    { value: '3h', label: '3 horas' }
  ];

  // Medicamento de ejemplo para la card - Paracetamol del admin
  exampleMedicine: MedicineViewModel = {
    id: 1,
    nombre: 'Paracetamol',
    cantidadMg: 500,
    frecuencia: 6,
    horaInicio: '08:00',
    fechaInicio: new Date('2026-01-15'),
    fechaFin: new Date('2026-02-15'),
    color: '#FF6B6B',
    consumed: false,
    isActive: true,
    isExpired: false,
    expirationStatus: 'active',
    displayName: 'Paracetamol 500mg'
  };

  // Datos iniciales para el formulario de ejemplo
  medicineFormData: MedicineFormData = {
    nombre: 'Amoxicilina',
    cantidadMg: 500,
    frecuencia: 4,
    horaInicio: '08:00',
    fechaInicio: '2026-01-15',
    fechaFin: '2026-02-15',
    color: '#FF6B6B'
  };

  // Estado demo modal
  isModalOpen = false;

  // Alert visibility controls for examples
  showAlertSuccess = true;
  showAlertError = true;
  showAlertWarning = true;
  showAlertInfo = true;

  ngOnInit() {
    // Tocar propiedades/métodos para que el analizador de TypeScript las considere usadas
    void this._usedComponents;
    void this.selectOptions?.length;
    // No ejecutar los métodos, sólo informarlos como referenciados
    void this.openModal;
    void this.closeModal;
  }

  openModal() { this.isModalOpen = true; }
  closeModal() { this.isModalOpen = false; }

  closeAlert(kind: 'success'|'error'|'warning'|'info') {
    if (kind === 'success') this.showAlertSuccess = false;
    if (kind === 'error') this.showAlertError = false;
    if (kind === 'warning') this.showAlertWarning = false;
    if (kind === 'info') this.showAlertInfo = false;
  }

  resetAlerts() {
    this.showAlertSuccess = this.showAlertError = this.showAlertWarning = this.showAlertInfo = true;
  }

  onButtonClick(kind: string) {
  }

  onEditMedicine(medicine: MedicineFormData): void {
  }

  onDeleteMedicine(medicineId: number): void {
  }

  /**
   * Maneja el envío del formulario de medicina
   */
  onMedicineFormSubmit(formData: MedicineFormData): void {
    alert(`Medicamento: ${formData.nombre}\nCantidad: ${formData.cantidadMg}mg\nFecha de inicio: ${formData.fechaInicio}`);
  }

  /**
   * Maneja la cancelación del formulario de medicina
   */
  onMedicineFormCancel(): void {
  }
}
