import { Component, Input, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tooltip',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tooltip.html',
  styleUrls: ['./tooltip.scss']
})
export class TooltipComponent {
  @Input() text = '';
  @Input() position: 'top' | 'bottom' | 'left' | 'right' = 'top';

  showTooltip = false;

  @HostListener('mouseenter')
  onMouseEnter() {
    this.showTooltip = true;
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    this.showTooltip = false;
  }

  @HostListener('focus')
  onFocus() {
    this.showTooltip = true;
  }

  @HostListener('blur')
  onBlur() {
    this.showTooltip = false;
  }
}

