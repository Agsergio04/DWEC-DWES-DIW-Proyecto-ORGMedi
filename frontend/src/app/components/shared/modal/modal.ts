import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.html',
  styleUrls: ['./modal.scss'],
  standalone: true
})
export class Modal {
  @Input() isOpen = false;
  @Input() title?: string;
  @Output() close = new EventEmitter<void>();

  constructor() {}

  onOverlayClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('app-modal__overlay')) {
      this.close.emit();
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscape(event: Event) {
    // HostListener may provide a generic Event; castear a KeyboardEvent para usar propiedades específicas
    const ke = event as KeyboardEvent;
    if (this.isOpen) {
      ke.preventDefault();
      this.close.emit();
    }
  }
}
