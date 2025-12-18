import { Directive, Input, ElementRef, Renderer2, HostListener } from '@angular/core';

@Directive({
  selector: '[appTooltip]',
  standalone: true
})
export class TooltipDirective {
  @Input('appTooltip') text = '';
  private tooltipEl?: HTMLElement;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  @HostListener('mouseenter') onEnter() {
    this.show();
  }

  @HostListener('mouseleave') onLeave() {
    this.hide();
  }

  @HostListener('focus') onFocus() {
    this.show();
  }

  @HostListener('blur') onBlur() {
    this.hide();
  }

  private show() {
    if (this.tooltipEl || !this.text) return;
    this.tooltipEl = this.renderer.createElement('div');
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
    this.renderer.appendChild(document.body, this.tooltipEl);
    if (this.tooltipEl) {
      this.tooltipEl.textContent = this.text;
    }
  }

  private hide() {
    if (!this.tooltipEl) return;
    this.renderer.removeChild(document.body, this.tooltipEl);
    this.tooltipEl = undefined;
  }
}
