import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../components/shared/button/button';
import { CardComponent } from '../../components/shared/card/card';
import { FormTextareaComponent } from '../../components/shared/form-textarea/form-textarea';
import { FormSelectComponent } from '../../components/shared/form-select/form-select';
import { AlertComponent } from '../../components/shared/alert/alert';

@Component({
  selector: 'app-style-guide',
  standalone: true,
  imports: [CommonModule, ButtonComponent, CardComponent, FormTextareaComponent, FormSelectComponent, AlertComponent],
  templateUrl: './style-guide.html',
  styleUrls: ['./style-guide.scss']
})
export class StyleGuidePage {
  // Referencias explícitas para evitar alertas del analizador sobre uso de componentes standalone
  private readonly _btn = ButtonComponent;
  private readonly _card = CardComponent;
  private readonly _ta = FormTextareaComponent;
  private readonly _select = FormSelectComponent;
  private readonly _alert = AlertComponent;
}
