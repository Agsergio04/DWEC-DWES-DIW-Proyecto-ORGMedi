import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button-comprobante',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button-comprobante.html',
  styleUrl: './button-comprobante.css'
})
export class ButtonComprobanteComponent implements OnInit, OnChanges {
  @Input() isChecked: boolean = false;
  
  @Output() toggle = new EventEmitter<boolean>();

  localState: boolean = false;

  ngOnInit(): void {
    this.localState = this.isChecked;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isChecked']) {
      this.localState = changes['isChecked'].currentValue;
    }
  }

  onClick(): void {
    this.localState = !this.localState;
    this.toggle.emit(this.localState);
  }
}
