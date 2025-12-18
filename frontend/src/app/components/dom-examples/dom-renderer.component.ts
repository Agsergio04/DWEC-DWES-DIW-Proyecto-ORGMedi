import { Component, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dom-renderer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card">
      <h4>Manipulación segura (Renderer2)</h4>
      <div #container class="example-container"></div>
      <div class="controls">
        <button (click)="create()">Crear elemento</button>
        <button (click)="clear()">Limpiar</button>
      </div>
      <p class="note">Usa <code>Renderer2</code> para manipular el DOM de forma segura y testeable.</p>
    </div>
  `,
  styles: [
    `:host { display:block; } .card{border:1px solid #ddd;padding:10px;margin:10px 0;border-radius:6px} .example-container .item{background:#fff7e6;padding:8px;margin:6px 0;border-radius:3px}`
  ]
})
export class DomRendererComponent {
  @ViewChild('container', { static: false }) container!: ElementRef<HTMLElement>;

  constructor(private renderer: Renderer2) {}

  create(): void {
    const el = this.renderer.createElement('div');
    this.renderer.addClass(el, 'item');
    this.renderer.setProperty(el, 'innerText', 'Elemento creado (renderer)');
    this.renderer.setStyle(el, 'padding', '8px');
    this.renderer.setStyle(el, 'margin', '6px 0');
    this.renderer.appendChild(this.container.nativeElement, el);
  }

  clear(): void {
    const native = this.container?.nativeElement;
    while (native.firstChild) {
      this.renderer.removeChild(native, native.firstChild);
    }
  }
}

