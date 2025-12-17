import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card.html',
  styleUrls: ['./card.scss']
})
export class CardComponent {
  @Input() title = '';
  @Input() description = '';
  @Input() image?: string;
  // Nueva API: variant en lugar de solo boolean horizontal
  @Input() variant: 'basic'|'horizontal' = 'basic';

  // Mantener compatibilidad si alguien usa `horizontal` input
  private _horizontal = false;
  @Input()
  set horizontal(v: boolean) { this._horizontal = v; if (v) this.variant = 'horizontal'; }
  get horizontal() { return this.variant === 'horizontal' || this._horizontal; }
}
