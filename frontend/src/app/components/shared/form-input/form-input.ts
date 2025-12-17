import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-form-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './form-input.html',
  styleUrls: ['./form-input.scss'],
})
export class FormInputComponent {
  @Input() label: string = '';
  @Input() type: string = 'text';
  @Input() name: string = '';
  @Input() placeholder: string = '';
  @Input() required: boolean = false;
  @Input() helpText?: string;
  @Input() error?: string;
  @Input() value: any;
  @Output() valueChange = new EventEmitter<any>();

  get inputId(): string {
    return this.name ? `input-${this.name}` : 'input-generic';
  }
}
