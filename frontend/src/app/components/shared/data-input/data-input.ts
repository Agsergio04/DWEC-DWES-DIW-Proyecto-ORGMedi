import { Component, Input, Output, EventEmitter, forwardRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-data-input',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './data-input.html',
  styleUrls: ['./data-input.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DataInputComponent),
      multi: true,
    },
  ],
})
export class DataInputComponent implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() placeholder: string = '';
  private _icon: string | undefined;
  @Input()
  set icon(value: string | undefined) {
    this._icon = value;
    this.loadIcon();
  }
  get icon() {
    return this._icon;
  }
  @Input() type: string = 'text';
  @Input() disabled = false;
  @Output() valueChange = new EventEmitter<string>();

  value: string = '';
  svgIcon: SafeHtml | null = null;

  private http = inject(HttpClient);
  private sanitizer = inject(DomSanitizer);

  onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(value: any): void {
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

  private loadIcon(): void {
    this.svgIcon = null;
    const icon = this._icon;
    if (!icon) return;

    // Try to load SVG files and inline them so they inherit currentColor
    if (icon.trim().toLowerCase().endsWith('.svg')) {
      this.http.get(icon, { responseType: 'text' }).subscribe({
        next: (text) => {
          try {
            // Replace hard-coded fill/stroke hex colors with currentColor
            let svg = text.replace(/(stroke|fill)=["']#([0-9A-Fa-f]{3,6})["']/g, '$1="currentColor"');
            // Ensure the svg root can inherit color
            svg = svg.replace(/<svg(.*?)>/, (m, g1) => {
              // add style="color: currentColor;" if not present
              if (/style=/.test(g1)) return `<svg${g1}>`;
              return `<svg${g1} style="color: currentColor;">`;
            });
            this.svgIcon = this.sanitizer.bypassSecurityTrustHtml(svg);
          } catch (e) {
            this.svgIcon = null;
          }
        },
        error: () => {
          this.svgIcon = null;
        }
      });
    }
  }
}
