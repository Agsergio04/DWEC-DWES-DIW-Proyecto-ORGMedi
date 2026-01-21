import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-form-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './form-select.html',
  styleUrls: ['./form-select.scss']
})
export class FormSelectComponent {
  @Input() label = '';
  @Input() options: { value: any, label: string }[] = [];
  value: any;

  /**
   * TrackBy para optimizar *ngFor de opciones
   */
  trackByValue(index: number, option: { value: any, label: string }): any {
    return option.value;
  }
}

