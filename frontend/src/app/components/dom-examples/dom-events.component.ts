import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dom-events',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card">
      <h4>Event Binding - Ejemplos</h4>

      <div class="example">
        <button (click)="onClick($event)">Haz clic</button>
        <button (click)="onClickStop($event)">Haz clic (stopPropagation)</button>
      </div>

      <div class="example">
        <input placeholder="Teclea y pulsa Enter" (keyup)="onKeyUp($event)" (keyup.enter)="onEnter()" />
        <p>Última tecla: {{ lastKey }}</p>
      </div>

      <div class="example" (click)="parentClick()">
        <div class="inner" (click)="innerClick($event)">Click interno (detiene burbuja)</div>
      </div>

      <div class="example">
        <form (submit)="onSubmit($event)">
          <button type="submit">Enviar (sin recarga)</button>
        </form>
      </div>

      <div class="example">
        <input placeholder="Focus/Blur" (focus)="onFocus()" (blur)="onBlur()" />
        <p>Estado foco: {{ focused ? 'con foco' : 'sin foco' }}</p>
      </div>

      <div class="log">{{ log }}</div>
    </div>
  `,
  styles: [
    `:host{display:block} .card{border:1px solid #ddd;padding:10px;margin:10px 0;border-radius:6px} .example{margin:8px 0} .inner{padding:6px;background:#eef;border-radius:4px;cursor:pointer}`
  ]
})
export class DomEventsComponent {
  lastKey = '';
  focused = false;
  log = '';

  onClick(event: MouseEvent) {
    this.log = 'Botón clickeado';
  }

  onClickStop(event: MouseEvent) {
    event.stopPropagation();
    this.log = 'Click manejado sin burbuja';
  }

  onKeyUp(event: KeyboardEvent) {
    this.lastKey = event.key;
    this.log = `KeyUp: ${event.key}`;
  }

  onEnter() {
    this.log = 'Enter presionado (keyup.enter)';
  }

  parentClick() {
    this.log = 'Click en contenedor padre (burbuja)';
  }

  innerClick(event: MouseEvent) {
    event.stopPropagation();
    this.log = 'Click interno y detenido';
  }

  onSubmit(event: Event) {
    event.preventDefault();
    this.log = 'Formulario enviado sin recarga (preventDefault)';
  }

  onFocus() {
    this.focused = true;
    this.log = 'Input con foco';
  }

  onBlur() {
    this.focused = false;
    this.log = 'Input perdió foco';
  }
}
