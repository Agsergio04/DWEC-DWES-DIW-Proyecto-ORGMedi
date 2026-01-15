import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../components/shared/button/button';

/**
 * Página 404 - Recurso no encontrado
 * Se muestra cuando la ruta no existe (wildcard)
 */
@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './not-found.html',
  styleUrls: ['./not-found.scss']
})
export class NotFoundPage {
  private router = inject(Router);

  navigateToHome(): void {
    this.router.navigate(['/']);
  }
}
