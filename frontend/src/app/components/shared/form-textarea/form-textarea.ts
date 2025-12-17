import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-form-textarea',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './form-textarea.html',
  styleUrls: ['./form-textarea.scss']
})
export class FormTextareaComponent {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() required = false;
  value = '';
}

