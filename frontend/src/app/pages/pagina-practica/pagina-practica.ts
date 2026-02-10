import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SegundoComponenteHijo } from "../../components/shared/segundo-componente-hijo/segundo-componente-hijo";
import { ComponenteHijo } from "../../components/shared/componente-hijo/componente-hijo";

@Component({
  selector: 'pagina-practica',
  standalone: true,
  imports: [CommonModule, SegundoComponenteHijo, ComponenteHijo],
  templateUrl: './pagina-practica.html',
  styleUrls: ['./pagina-practica.scss']
})
export class PaginaPracticaComponent {}