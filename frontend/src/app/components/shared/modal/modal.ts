import { Component, Input, Output, EventEmitter, HostListener, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.html',
  styleUrls: ['./modal.scss']
})
export class ModalComponent implements AfterViewInit {
  @Input() isOpen = false;
  @Input() title = '';
  @Input() closable = true;
  @Output() close = new EventEmitter<void>();

  @ViewChild('modalContent') modalContent?: ElementRef<HTMLElement>;

  ngAfterViewInit() {
    if (this.isOpen && this.modalContent) {
      setTimeout(() => {
        const firstFocusable = this.modalContent?.nativeElement.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        (firstFocusable as HTMLElement)?.focus();
      }, 100);
    }
  }

  closeModal() {
    this.isOpen = false;
    this.close.emit();
  }

  // Cierra el modal al hacer click en el fondo oscuro
  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget && this.closable) {
      this.closeModal();
    }
  }

  // Cierra el modal con la tecla ESC
  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: Event) {
    if (this.isOpen && this.closable) {
      (event as KeyboardEvent).preventDefault();
      this.closeModal();
    }
  }

  // Previene que clicks dentro del modal cierren el modal
  onModalClick(event: MouseEvent) {
    event.stopPropagation();
  }
}

