import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dom-direct',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card">
      <h4>Acceso directo (ElementRef)</h4>
      <div #container class="example-container"></div>
      <div class="controls">
        <button (click)="create()">Crear elemento</button>
        <button (click)="clear()">Limpiar</button>
      </div>
      <p class="note">Nota: este ejemplo usa acceso directo al DOM con <code>ElementRef.nativeElement</code>. Evitar en SSR.</p>
    </div>
  `,
  styles: [
    `:host { display:block; } .card{border:1px solid #ddd;padding:10px;margin:10px 0;border-radius:6px} .example-container .item{background:#f0f8ff;padding:8px;margin:6px 0;border-radius:3px}`
  ]
})
export class DomDirectComponent implements AfterViewInit, OnDestroy {
  @ViewChild('container', { static: false }) container!: ElementRef<HTMLElement>;

  ngAfterViewInit(): void {
    // El DOM está listo aquí
  }

  create(): void {
    // Ejemplo de manipulación directa (no recomendado para SSR)
    const el = document.createElement('div');
    el.className = 'item';
    el.innerText = 'Elemento creado (direct)';
    this.container?.nativeElement.appendChild(el);
  }

  clear(): void {
    if (this.container && this.container.nativeElement) {
      this.container.nativeElement.innerHTML = '';
    }
  }

  ngOnDestroy(): void {
    // No hay listeners externos en este ejemplo, pero aquí se limpiaría
  }
}

