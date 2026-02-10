import { Component,ViewChild,Input, Output, EventEmitter, inject} from '@angular/core';
import { ComponenteHijo } from '../componente-hijo/componente-hijo';
import { HttpClient,HttpClientModule } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-segundo-componente-hijo',
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './segundo-componente-hijo.html',
  styleUrl: './segundo-componente-hijo.scss',
})
export class SegundoComponenteHijo {
  @ViewChild('container', { static: false }) container!: ComponenteHijo;

  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() type: string = 'text';
  @Input() disabled = false;
  @Output() valueChange = new EventEmitter<string>();

  value: string = '';
  svgIcon: SafeHtml | null = null;

  private http = inject(HttpClient);
  private sanitizer = inject(DomSanitizer);

  onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(value: string | null): void {
    this.value = value || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.value = input.value;
    this.onChange(this.value);
    this.valueChange.emit(this.value);
  }

  onBlur(): void {
    this.onTouched();
  }

  }
