import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

// Importar componentes del proyecto (usar nombres exportados reales)
import { SharedModule } from '../../components/shared/shared.module';
import { FormInputComponent } from '../../components/shared/form-input/form-input';
import { FormTextareaComponent } from '../../components/shared/form-textarea/form-textarea';
import { FormSelectComponent } from '../../components/shared/form-select/form-select';
import { DomDemoComponent } from '../../components/shared/dom-demo/dom-demo.component';
import { ModalComponent } from '../../components/shared/modal/modal';
import { TabsComponent } from '../../components/shared/tabs/tabs';
import { AlertComponent } from '../../components/shared/alert/alert';
import { MedicineCardComponent } from '../../components/shared/medicine-card/medicine-card';
import { ThemeSwitcher } from '../../components/shared/theme-switcher/theme-switcher';

@Component({
  selector: 'app-style-guide',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    FormInputComponent,
    FormTextareaComponent,
    FormSelectComponent,
    DomDemoComponent,
    ModalComponent,
    TabsComponent,
    AlertComponent,
    MedicineCardComponent,
    ThemeSwitcher
  ],
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
    SharedModule
  ];

  // Opciones de ejemplo para el select
  selectOptions = [
    { value: '1h', label: '1 hora' },
    { value: '2h', label: '2 horas' },
    { value: '3h', label: '3 horas' }
  ];

  // Medicamento de ejemplo para la card
  exampleMedicine = {
    id: '1',
    name: 'Amoxicilina',
    dosage: '500mg',
    frequency: 'Cada 8 horas',
    description: 'Tomar con agua',
    startDate: '2026-01-11',
    endDate: '2026-02-11',
    quantity: 21
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
    console.log('Clicked', kind);
  }

  onEditMedicine(medicine: any): void {
    console.log('Editar medicamento:', medicine);
  }

  onDeleteMedicine(medicineId: string): void {
    console.log('Eliminar medicamento:', medicineId);
  }
}
