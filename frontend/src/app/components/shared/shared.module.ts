import { NgModule } from '@angular/core';
import { ButtonComponent } from './button/button';
import { CardComponent } from './card/card';
import { DomDemoComponent } from './dom-demo/dom-demo.component';

@NgModule({
  imports: [ButtonComponent, CardComponent, DomDemoComponent],
  exports: [ButtonComponent, CardComponent, DomDemoComponent]
})
export class SharedModule {}
