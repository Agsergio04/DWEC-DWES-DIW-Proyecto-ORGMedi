import { Component, Input, Output, EventEmitter, HostListener, ElementRef, ViewChild, AfterViewInit, Renderer2, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.html',
  styleUrls: ['./modal.scss']
})
export class ModalComponent implements AfterViewInit, OnDestroy {
  @Input() isOpen = false;
  @Input() title = '';
  @Input() closable = true;
  @Output() close = new EventEmitter<void>();

  @ViewChild('modalContent') modalContent?: ElementRef<HTMLElement>;
  private previousActiveElement?: HTMLElement;

  constructor(private renderer: Renderer2) {}

  ngAfterViewInit() {
    if (this.isOpen && this.modalContent) {
      // Guardar el elemento que tenía el foco antes de abrir el modal
      this.previousActiveElement = document.activeElement as HTMLElement;
      
      // Bloquear scroll del body
      this.renderer.setStyle(document.body, 'overflow', 'hidden');
      
      // Enfocar el primer elemento interactivo del modal
      setTimeout(() => {
        const firstFocusable = this.modalContent?.nativeElement.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        (firstFocusable as HTMLElement)?.focus();
      }, 100);
    }
  }

  ngOnDestroy() {
    // Restaurar scroll del body
    this.renderer.removeStyle(document.body, 'overflow');
    
    // Restaurar el foco al elemento que lo tenía antes de abrir el modal
    if (this.previousActiveElement) {
      this.previousActiveElement.focus();
    }
  }

  closeModal() {
    this.isOpen = false;
    this.close.emit();
    
    // Restaurar scroll del body
    this.renderer.removeStyle(document.body, 'overflow');
    
    // Restaurar el foco al elemento anterior
    if (this.previousActiveElement) {
      this.previousActiveElement.focus();
    }
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

