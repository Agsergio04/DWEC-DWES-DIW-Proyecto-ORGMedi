import { Component,ViewChild,Input} from '@angular/core';
import { ComponenteHijo } from '../componente-hijo/componente-hijo';

@Component({
  selector: 'app-segundo-componente-hijo',
  imports: [],
  templateUrl: './segundo-componente-hijo.html',
  styleUrl: './segundo-componente-hijo.css',
})
export class SegundoComponenteHijo {
  @ViewChild('container', { static: false }) container!: ComponenteHijo;

  }
