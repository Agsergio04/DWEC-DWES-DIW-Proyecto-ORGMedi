import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HomeData } from '../../core/services/resolvers';
import { ButtonComponent } from '../../components/shared/button/button';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class HomePage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  homeData: HomeData | null = null;

  ngOnInit(): void {
    // Leer los datos precargados por el resolver
    this.route.data.subscribe((data) => {
      this.homeData = data['homeData'] || null;
    });
  }

  navigateToRegister(): void {
    this.router.navigate(['/registrarse']);
  }
}
