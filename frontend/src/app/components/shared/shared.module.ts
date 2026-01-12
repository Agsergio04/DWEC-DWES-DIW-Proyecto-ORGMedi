import { NgModule } from '@angular/core';
import { ButtonComponent } from './button/button';
import { CardComponent } from './card/card';
import { DomDemoComponent } from './dom-demo/dom-demo.component';
import { MedicineCardComponent } from './medicine-card/medicine-card';

@NgModule({
  imports: [ButtonComponent, CardComponent, DomDemoComponent, MedicineCardComponent],
  exports: [ButtonComponent, CardComponent, DomDemoComponent, MedicineCardComponent]
})
export class SharedModule {}
