import { Component, Input, OnInit, OnDestroy, HostListener, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export interface CarouselItem {
  id: string | number;
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
}

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carousel.html',
  styleUrls: ['./carousel.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'role': 'region',
    '[attr.aria-label]': '"Carrusel de medicamentos destacados"'
  }
})
export class CarouselComponent implements OnInit, OnDestroy {
  @Input() items: CarouselItem[] = [];
  @Input() autoplay = true;
  @Input() autoplayDelay = 5000;

  currentIndex = 0;
  private destroy$ = new Subject<void>();
  private autoplayInterval: any;

  ngOnInit(): void {
    if (this.items.length === 0) {
      this.items = this.getDemoItems();
    }
    if (this.autoplay && this.items.length > 1) {
      this.startAutoplay();
    }
  }

  ngOnDestroy(): void {
    this.stopAutoplay();
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Navega al elemento anterior del carrusel
   * Accesible: Se puede usar con mouse, teclado (flechas) o lector de pantalla
   */
  previousSlide(): void {
    this.currentIndex = this.currentIndex === 0 ? this.items.length - 1 : this.currentIndex - 1;
    this.resetAutoplay();
  }

  /**
   * Navega al elemento siguiente del carrusel
   * Accesible: Se puede usar con mouse, teclado (flechas) o lector de pantalla
   */
  nextSlide(): void {
    this.currentIndex = (this.currentIndex + 1) % this.items.length;
    this.resetAutoplay();
  }

  /**
   * Navega a un elemento específico del carrusel
   * @param index Índice del elemento a mostrar
   */
  goToSlide(index: number): void {
    if (index >= 0 && index < this.items.length) {
      this.currentIndex = index;
      this.resetAutoplay();
    }
  }

  /**
   * Maneja eventos de teclado para navegación
   * - Flecha izquierda: slide anterior
   * - Flecha derecha: slide siguiente
   */
  @HostListener('keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (this.items.length <= 1) return;

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        this.previousSlide();
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.nextSlide();
        break;
    }
  }

  /**
   * Obtiene el texto de aria-live para anunciar cambios de slide
   */
  getSlideAriaLive(): string {
    const current = this.currentIndex + 1;
    const total = this.items.length;
    const item = this.items[this.currentIndex];
    return `Mostrando slide ${current} de ${total}. ${item.title}.`;
  }

  /**
   * Determina si un slide está activo
   */
  isActive(index: number): boolean {
    return index === this.currentIndex;
  }

  /**
   * Inicia la reproducción automática
   */
  private startAutoplay(): void {
    if (this.items.length > 1) {
      this.autoplayInterval = setInterval(() => {
        this.nextSlide();
      }, this.autoplayDelay);
    }
  }

  /**
   * Detiene la reproducción automática
   */
  private stopAutoplay(): void {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = null;
    }
  }

  /**
   * Reinicia el autoplay cuando el usuario interactúa
   */
  private resetAutoplay(): void {
    this.stopAutoplay();
    if (this.autoplay && this.items.length > 1) {
      this.startAutoplay();
    }
  }

  /**
   * Datos de demostración para el carrusel
   */
  private getDemoItems(): CarouselItem[] {
    return [
      {
        id: 1,
        title: 'Medicamentos comunes',
        description: 'Los medicamentos más frecuentemente utilizados por nuestros usuarios para la gestión diaria.',
        imageUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde0d?w=500&h=300&fit=crop',
        imageAlt: 'Diferentes tipos de medicinas y pastillas en una mesa de laboratorio'
      },
      {
        id: 2,
        title: 'Gestión personalizada',
        description: 'Crea tu propio calendario de medicamentos adaptado a tus necesidades específicas.',
        imageUrl: 'https://images.unsplash.com/photo-1576091160550-112267f3f472?w=500&h=300&fit=crop',
        imageAlt: 'Calendario digital mostrando horarios de medicinas programadas'
      },
      {
        id: 3,
        title: 'Recordatorios efectivos',
        description: 'Notificaciones a tiempo para no olvidar nunca tu medicación diaria.',
        imageUrl: 'https://images.unsplash.com/photo-1631217314830-f3e61b00a270?w=500&h=300&fit=crop',
        imageAlt: 'Campanilla de alerta con símbolo de notificación en color azul'
      },
      {
        id: 4,
        title: 'Seguimiento de salud',
        description: 'Monitorea tu cumplimiento de medicación y mantén un registro completo.',
        imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=500&h=300&fit=crop',
        imageAlt: 'Gráfico de barras mostrando el progreso del cumplimiento de medicación'
      },
      {
        id: 5,
        title: 'Soporte médico',
        description: 'Acceso a recomendaciones y soporte de profesionales sanitarios certificados.',
        imageUrl: 'https://images.unsplash.com/photo-1576091160645-112ba8d25d1d?w=500&h=300&fit=crop',
        imageAlt: 'Profesional médico consultando documentación de medicamentos'
      }
    ];
  }
}
