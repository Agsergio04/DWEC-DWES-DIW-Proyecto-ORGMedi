import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../components/shared/button/button';
import { CardComponent } from '../../components/shared/card/card';
import { FormTextareaComponent } from '../../components/shared/form-textarea/form-textarea';
import { FormSelectComponent } from '../../components/shared/form-select/form-select';
import { AlertComponent } from '../../components/shared/alert/alert';
import { FormInputComponent } from '../../components/shared/form-input/form-input';

@Component({
  selector: 'app-style-guide',
  standalone: true,
  imports: [CommonModule, ButtonComponent, CardComponent, FormTextareaComponent, FormSelectComponent, AlertComponent, FormInputComponent],
  templateUrl: './style-guide.html',
  styleUrls: ['./style-guide.scss']
})
export class StyleGuidePage {
  selectOptions = [{ value: 1, label: 'Uno' }, { value: 2, label: 'Dos' }];

  onButtonClick(name: string) {
    console.log('Button clicked:', name);
  }

  // Handler para alertas en la guía
  onAlertClosed() {
    console.log('Guía: alerta cerrada');
  }
}
