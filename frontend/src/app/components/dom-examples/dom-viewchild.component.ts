import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dom-viewchild',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card">
      <h4>Uso de @ViewChild</h4>
      <input #inputEl placeholder="Escribe algo y pulsa enfocar" />
      <div class="controls">
        <button (click)="focusInput()">Enfocar</button>
        <button (click)="toggleHighlight()">Alternar resaltado</button>
      </div>
    </div>
  `,
  styles: [
    `:host { display:block; } .card{border:1px solid #ddd;padding:10px;margin:10px 0;border-radius:6px} input{padding:6px;width:100%}`
  ]
})
export class DomViewchildComponent implements AfterViewInit {
  @ViewChild('inputEl', { static: false }) inputEl!: ElementRef<HTMLInputElement>;
  highlighted = false;

  ngAfterViewInit(): void {
    // Podemos leer o medir el input aquí
  }

  focusInput(): void {
    this.inputEl?.nativeElement.focus();
  }

  toggleHighlight(): void {
    this.highlighted = !this.highlighted;
    const el = this.inputEl?.nativeElement;
    if (el) {
      el.style.border = this.highlighted ? '2px solid #5b9eff' : '';
    }
  }
}

