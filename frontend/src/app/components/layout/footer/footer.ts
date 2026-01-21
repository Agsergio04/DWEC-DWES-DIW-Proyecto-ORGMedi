import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [CommonModule, RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Footer {
  private router = inject(Router);

  goHome() {
    this.router.navigate(['/']);
  }
}
