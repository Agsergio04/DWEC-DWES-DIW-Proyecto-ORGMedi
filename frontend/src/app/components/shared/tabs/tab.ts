import { Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-tab',
  template: `<div *ngIf="active" class="app-tab__panel" role="tabpanel"><ng-content></ng-content></div>`,
  standalone: true,
  imports: [NgIf]
})
export class Tab {
  @Input() title = '';
  active = false;
}

