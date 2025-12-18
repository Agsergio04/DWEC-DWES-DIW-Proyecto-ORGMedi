import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-tab',
  template: `<div *ngIf="active" class="app-tab__panel" role="tabpanel"><ng-content></ng-content></div>`,
  standalone: true
})
export class Tab {
  @Input() title = '';
  active = false;
}

