import { Component,Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'componente-hijo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './componente-hijo.html',
  styleUrls: ['./componente-hijo.scss']
}) export class ComponenteHijo implements Input,Output {
 
}