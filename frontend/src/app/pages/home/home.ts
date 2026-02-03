import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HomeData } from '../../core/services/resolvers';
import { ButtonComponent } from '../../components/shared/button/button';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class HomePage implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  homeData: HomeData | null = null;

  ngOnInit(): void {
    // Leer los datos precargados por el resolver
    this.route.data
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.homeData = data['homeData'] || null;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  navigateToRegister(): void {
    this.router.navigate(['/registrarse']);
  }
}
