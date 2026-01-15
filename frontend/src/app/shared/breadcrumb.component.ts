import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BreadcrumbService, Breadcrumb } from './breadcrumb.service';

/**
 * COMPONENTE: BreadcrumbComponent
 * ===============================
 * 
 * Tarea 6: Breadcrumbs Dinámicos - Componente de Renderizado
 * 
 * Responsabilidades:
 * 1. Suscribirse al BreadcrumbService
 * 2. Recibir el array de Breadcrumbs actualizado
 * 3. Renderizar las migas de navegación en HTML
 * 4. Mostrar solo cuando hay breadcrumbs (length > 0)
 * 
 * ESTRUCTURA HTML:
 * ================
 * 
 * <nav aria-label="breadcrumb">
 *   <ol class="breadcrumb">
 *     <li class="breadcrumb-item">
 *       <a routerLink="/">Inicio</a>
 *     </li>
 *     
 *     <!-- Dinamico: Medicamentos, Editar, etc -->
 *     <li *ngFor="let crumb of breadcrumbs$ | async; let last = last"
 *         class="breadcrumb-item"
 *         [class.active]="last"
 *         [attr.aria-current]="last ? 'page' : null">
 *       
 *       <!-- Si NO es última: link clickeable -->
 *       <a *ngIf="!last" [routerLink]="crumb.url">
 *         {{ crumb.label }}
 *       </a>
 *       
 *       <!-- Si ES última: texto (página actual) -->
 *       <span *ngIf="last">
 *         {{ crumb.label }}
 *       </span>
 *     </li>
 *   </ol>
 * </nav>
 * 
 * FLUJO DE RENDERING:
 * ===================
 * 
 * 1. Usuario navega a /medicamentos
 *    → breadcrumbs$ emite [{ label: 'Medicamentos', url: '/medicamentos' }]
 *    → Template muestra: Inicio > Medicamentos
 * 
 * 2. Usuario navega a /medicamentos/123/editar
 *    → breadcrumbs$ emite [
 *        { label: 'Medicamentos', url: '/medicamentos' },
 *        { label: 'Editar Medicamento', url: '/medicamentos/123/editar' }
 *      ]
 *    → Template muestra: Inicio > Medicamentos > Editar Medicamento
 *    → Último item (Editar) es texto (no link)
 *    → Resto son links clicables para navegar atrás
 * 
 * ACCESIBILIDAD (a11y):
 * ====================
 * - aria-label="breadcrumb" en nav: describe sección para lectores de pantalla
 * - aria-current="page" en último item: marca la página actual
 * - <ol> en lugar de <div>: estructura semántica (lista ordenada de navegación)
 * - Links con routerLink: navegación sin necesidad de href
 * 
 * ESTILOS:
 * ========
 * - .breadcrumb: contenedor (no margin, sin background)
 * - .breadcrumb-item: item individual con separador ">"
 * - .breadcrumb-item.active: último item (negrita, sin link)
 * - Separador ::before con content: '>' (más legible que /)
 * 
 * USO:
 * ====
 * En app.html:
 * <app-breadcrumb></app-breadcrumb>
 * 
 * Y en app.routes.ts, asegurarse de que cada ruta tiene:
 * data: { breadcrumb: 'Etiqueta Visible' }
 * 
 * @see breadcrumb.service.ts para la lógica de construcción
 * @see app.routes.ts para ejemplos de breadcrumbs en rutas
 */
@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss']
})
export class BreadcrumbComponent {
  
  /**
   * Observable de breadcrumbs que se actualiza con cada navegación.
   * Se emite en template con async pipe para auto-desuscripción.
   */
  breadcrumbs$;

  constructor(private breadcrumbService: BreadcrumbService) {
    this.breadcrumbs$ = this.breadcrumbService.breadcrumbs$;
  }
}
