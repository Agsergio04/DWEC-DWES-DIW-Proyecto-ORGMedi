import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy, Renderer2, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dom-observers',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card">
      <h4>Observers (Intersection & Mutation)</h4>
      <div #box class="observer-box">Observa este contenedor</div>
      <div class="controls">
        <button (click)="addNode()">Añadir nodo</button>
      </div>
      <p class="log">{{ log }}</p>
    </div>
  `,
  styles: [
    `:host { display:block; } .card{border:1px solid #ddd;padding:10px;margin:10px 0;border-radius:6px} .observer-box{min-height:60px;padding:6px;background:#f7f7f7}`
  ]
})
export class DomObserversComponent implements AfterViewInit, OnDestroy {
  @ViewChild('box', { static: false }) box!: ElementRef<HTMLElement>;
  private intersection?: IntersectionObserver;
  private mutation?: MutationObserver;
  log = '';
  private mutationCount = 0;
  private intersectionCount = 0;

  constructor(private renderer: Renderer2, private ngZone: NgZone) {}

  ngAfterViewInit(): void {
    if (typeof IntersectionObserver !== 'undefined') {
      this.intersection = new IntersectionObserver(entries => {
        // ejecutar dentro de la zona para disparar change detection
        this.ngZone.run(() => {
          entries.forEach(e => {
            this.intersectionCount++;
            this.log = `Intersection(${this.intersectionCount}) ratio: ${e.intersectionRatio}`;
          });
        });
      });
      this.intersection.observe(this.box.nativeElement);
    }

    if (typeof MutationObserver !== 'undefined') {
      this.mutation = new MutationObserver((mutations) => {
        // ejecutar dentro de la zona para que Angular detecte los cambios
        this.ngZone.run(() => {
          // acumular el número total de mutaciones observadas
          this.mutationCount += mutations.length;
          this.log = `Mutations total: ${this.mutationCount}`;
        });
      });
      this.mutation.observe(this.box.nativeElement, { childList: true });
    }
  }

  addNode(): void {
    const el = this.renderer.createElement('div');
    this.renderer.setProperty(el, 'innerText', 'Nodo añadido');
    this.renderer.appendChild(this.box.nativeElement, el);
  }

  ngOnDestroy(): void {
    this.intersection && this.intersection.disconnect();
    this.mutation && this.mutation.disconnect();
  }
}
