import { Directive, Input, ElementRef, Renderer2, HostListener } from '@angular/core';

@Directive({
  selector: '[appTooltip]',
  standalone: true
})
export class TooltipDirective {
  @Input('appTooltip') text = '';
  @Input() tooltipDelay = 300; // Delay en milisegundos
  private tooltipEl?: HTMLElement;
  private tooltipId = `tooltip-${Math.random().toString(36).substr(2, 9)}`;
  private showTimeout?: number;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  @HostListener('mouseenter') onEnter() {
    this.showTimeout = window.setTimeout(() => this.show(), this.tooltipDelay);
  }

  @HostListener('mouseleave') onLeave() {
    if (this.showTimeout) {
      clearTimeout(this.showTimeout);
      this.showTimeout = undefined;
    }
    this.hide();
  }

  @HostListener('focus') onFocus() {
    this.showTimeout = window.setTimeout(() => this.show(), this.tooltipDelay);
  }

  @HostListener('blur') onBlur() {
    if (this.showTimeout) {
      clearTimeout(this.showTimeout);
      this.showTimeout = undefined;
    }
    this.hide();
  }

  private show() {
    if (this.tooltipEl || !this.text) return;
    
    // Añadir aria-describedby al elemento host
    this.renderer.setAttribute(this.el.nativeElement, 'aria-describedby', this.tooltipId);
    
    // Crear tooltip
    this.tooltipEl = this.renderer.createElement('div');
    this.renderer.setAttribute(this.tooltipEl, 'id', this.tooltipId);
    this.renderer.setAttribute(this.tooltipEl, 'role', 'tooltip');
    this.renderer.addClass(this.tooltipEl, 'app-tooltip');
    this.renderer.setStyle(this.tooltipEl, 'position', 'absolute');
    this.renderer.setStyle(this.tooltipEl, 'background', 'rgba(0,0,0,0.8)');
    this.renderer.setStyle(this.tooltipEl, 'color', '#fff');
    this.renderer.setStyle(this.tooltipEl, 'padding', '6px 8px');
    this.renderer.setStyle(this.tooltipEl, 'border-radius', '4px');
    this.renderer.setStyle(this.tooltipEl, 'font-size', '12px');
    this.renderer.setStyle(this.tooltipEl, 'z-index', '10000');

    const hostPos = (this.el.nativeElement as HTMLElement).getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;

    this.renderer.setStyle(this.tooltipEl, 'top', (hostPos.top + scrollTop - 36) + 'px');
    this.renderer.setStyle(this.tooltipEl, 'left', (hostPos.left) + 'px');
    
    // Crear flecha visual
    const arrow = this.renderer.createElement('div');
    this.renderer.setStyle(arrow, 'position', 'absolute');
    this.renderer.setStyle(arrow, 'bottom', '-4px');
    this.renderer.setStyle(arrow, 'left', '10px');
    this.renderer.setStyle(arrow, 'width', '0');
    this.renderer.setStyle(arrow, 'height', '0');
    this.renderer.setStyle(arrow, 'border-left', '4px solid transparent');
    this.renderer.setStyle(arrow, 'border-right', '4px solid transparent');
    this.renderer.setStyle(arrow, 'border-top', '4px solid rgba(0,0,0,0.8)');
    this.renderer.appendChild(this.tooltipEl, arrow);
    
    this.renderer.appendChild(document.body, this.tooltipEl);
    if (this.tooltipEl) {
      this.tooltipEl.textContent = this.text;
    }
  }

  private hide() {
    if (this.showTimeout) {
      clearTimeout(this.showTimeout);
      this.showTimeout = undefined;
    }
    if (!this.tooltipEl) return;
    
    // Eliminar aria-describedby del elemento host
    this.renderer.removeAttribute(this.el.nativeElement, 'aria-describedby');
    
    this.renderer.removeChild(document.body, this.tooltipEl);
    this.tooltipEl = undefined;
  }
}
