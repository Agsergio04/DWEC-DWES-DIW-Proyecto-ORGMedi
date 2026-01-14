import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.html',
  styleUrls: ['./button.scss']
})
export class ButtonComponent {
  @Input() variant: 'primary'|'secondary'|'ghost'|'danger' = 'primary';
  @Input() padding: string = '12px 24px';
  @Input() fontSize: string = '1rem';
  @Input() disabled = false;
  @Input() width: string | undefined;
  @Input() height: string | undefined;

  // Nuevo API
  @Input() type: 'button'|'submit'|'reset' = 'button';
  @Input() fullWidth = false;
  @Output() clicked = new EventEmitter<Event>();

  // Maneja clicks nativos: evita la emisión si está deshabilitado
  onClick(event: MouseEvent) {
    if (this.disabled) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    this.clicked.emit(event);
  }

  // Soporta activación por teclado (Enter / Space) como respaldo
  onKeydown(event: KeyboardEvent) {
    if (this.disabled) return;
    const key = event.key;
    if (key === 'Enter' || key === ' ' || key === 'Spacebar') {
      event.preventDefault();
      // Emitimos el evento de teclado para que el consumidor reaccione igualmente
      this.clicked.emit(event);
    }
  }
}
