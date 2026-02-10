import { Component,ViewChild, ElementRef, AfterViewInit, OnDestroy} from '@angular/core';

@Component({
  selector: 'app-segundo-componente-hijo',
  imports: [],
  templateUrl: './segundo-componente-hijo.html',
  styleUrl: './segundo-componente-hijo.css',
})
export class SegundoComponenteHijo {
  @ViewChild('container', { static: false }) container!: ElementRef<HTMLElement>;

  }
