import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

/**
 * Página 404 - Recurso no encontrado
 * Se muestra cuando la ruta no existe (wildcard)
 */
@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div class="not-found-container">
      <div class="not-found-content">
        <h1 class="error-code">404</h1>
        <h2 class="error-title">Página no encontrada</h2>
        <p class="error-description">
          La página que buscas no existe o ha sido movida.
        </p>
        <a routerLink="/" class="btn-home">
          Volver al inicio
        </a>
      </div>
    </div>
  `,
  styles: [`
    .not-found-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 60vh;
      padding: 2rem;
      background: linear-gradient(135deg, var(--bg-light), var(--bg-lighter));
    }

    .not-found-content {
      text-align: center;
      max-width: 500px;
    }

    .error-code {
      font-size: 8rem;
      font-weight: 700;
      color: var(--primary-color);
      margin: 0;
      line-height: 1;
      opacity: 0.8;
    }

    .error-title {
      font-size: 2rem;
      margin: 1rem 0;
      color: var(--text-dark);
    }

    .error-description {
      font-size: 1.1rem;
      color: var(--text-muted);
      margin: 1.5rem 0;
      line-height: 1.6;
    }

    .btn-home {
      display: inline-block;
      padding: 0.75rem 2rem;
      background-color: var(--primary-color);
      color: white;
      text-decoration: none;
      border-radius: var(--border-radius);
      font-weight: 600;
      transition: all 0.3s;
      margin-top: 1rem;
    }

    .btn-home:hover {
      background-color: var(--primary-dark);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
  `]
})
export class NotFoundPage {}
