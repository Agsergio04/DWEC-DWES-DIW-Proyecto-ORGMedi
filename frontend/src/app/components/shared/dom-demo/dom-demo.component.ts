import { Component, ViewChild, ElementRef, Renderer2, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dom-demo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dom-demo.component.html',
  styleUrls: ['./dom-demo.component.scss']
})
export class DomDemoComponent implements AfterViewInit, OnDestroy {
  @ViewChild('contenedor', { static: false }) contenedor!: ElementRef;

  private createdNodes: HTMLElement[] = [];

  constructor(private renderer: Renderer2) {}

  ngAfterViewInit(): void {
    // Comprobación simple
    if (!this.contenedor) {
    }
  }

  changeStyle() {
    if (!this.contenedor) return;
    const el = this.contenedor.nativeElement as HTMLElement;
    this.renderer.setStyle(el, 'color', '#fff');
    this.renderer.setStyle(el, 'backgroundColor', '#99397C');
    this.renderer.setStyle(el, 'padding', '1rem');
    this.renderer.setStyle(el, 'borderRadius', '8px');
    this.renderer.setProperty(el, 'innerText', 'Contenido modificado por Renderer2');
  }

  createItem() {
    if (!this.contenedor) return;
    const nuevo = this.renderer.createElement('div') as HTMLElement;
    this.renderer.addClass(nuevo, 'demo-item');
    this.renderer.setProperty(nuevo, 'innerText', `Elemento creado ${this.createdNodes.length + 1}`);
    this.renderer.appendChild(this.contenedor.nativeElement, nuevo);
    this.createdNodes.push(nuevo);
  }

  removeItem() {
    if (!this.contenedor) return;
    const last = this.createdNodes.pop();
    if (last) {
      this.renderer.removeChild(this.contenedor.nativeElement, last);
    }
  }

  ngOnDestroy(): void {
    // Limpiar nodos creados si quedan
    if (this.contenedor && this.createdNodes.length) {
      for (const n of this.createdNodes) {
        try {
          this.renderer.removeChild(this.contenedor.nativeElement, n);
        } catch (e) {
          // ignore
        }
      }
      this.createdNodes = [];
    }
  }
}
