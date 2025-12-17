import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alert.html',
  styleUrls: ['./alert.scss']
})
export class AlertComponent {
  @Input() type: 'success'|'error'|'warning'|'info' = 'info';
  @Input() closable = true;
  @Output() closed = new EventEmitter<void>();

  isOpen = true;

  close() {
    this.isOpen = false;
    this.closed.emit();
  }
}

