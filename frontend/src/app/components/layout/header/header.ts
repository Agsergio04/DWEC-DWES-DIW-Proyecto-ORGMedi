import { Component, OnInit, OnDestroy, HostListener, ElementRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';
import { ThemeService } from '../../../core/services/ui';
import { AuthService } from '../../../core/services/auth';
import { ToastComponent } from '../../../shared/toast.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, ToastComponent],
  templateUrl: './header.html',
  styleUrls: ['./header.scss']
})
export class Header implements OnInit, OnDestroy {
  isDarkMode = false;
  isAuthRoute = false;
  isOpen = false; // Menú hamburguesa
  isLoggedIn = false; // Estado de autenticación

  @ViewChild('menuButton') menuButton?: ElementRef<HTMLButtonElement>;
  @ViewChild('navMenu') navMenu?: ElementRef<HTMLElement>;
  private routerSub?: Subscription;
  private themeSub?: Subscription;
  private authSub?: Subscription;

  private themeService = inject(ThemeService);
  private authService = inject(AuthService);

  constructor(public router: Router, private elementRef: ElementRef) {}

  ngOnInit() {
    // Delegar lógica de tema al ThemeService
    // Suscribirse al observable para reflejar el estado actual
    this.themeSub = this.themeService.theme$.subscribe(theme => {
      this.isDarkMode = theme === 'dark';
    });

    // Suscribirse al estado de autenticación
    this.authSub = this.authService.isLoggedIn$.subscribe(isLoggedIn => {
      this.isLoggedIn = isLoggedIn;
    });

    this.checkAuthRoute(this.router.url);
    this.routerSub = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.checkAuthRoute(event.urlAfterRedirects!);
        this.closeMenu();
      }
    });
  }

  ngOnDestroy() {
    this.routerSub?.unsubscribe();
    this.themeSub?.unsubscribe();
    this.authSub?.unsubscribe();
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  toggleMenu() {
    this.isOpen = !this.isOpen;
    if (this.isOpen && this.navMenu) {
      setTimeout(() => {
        const firstNavItem = this.navMenu?.nativeElement.querySelector('.app-header__pill');
        (firstNavItem as HTMLElement)?.focus();
      }, 100);
    }
  }

  closeMenu() {
    this.isOpen = false;
    if (this.menuButton) {
      this.menuButton.nativeElement.focus();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    const clickedInside = this.elementRef.nativeElement.contains(target);
    if (!clickedInside && this.isOpen) {
      this.closeMenu();
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: Event) {
    const ke = event as KeyboardEvent;
    if (this.isOpen) {
      ke.preventDefault();
      this.closeMenu();
    }
  }

  private checkAuthRoute(url: string) {
    try {
      const tree = this.router.parseUrl(url || '');
      const primary = tree.root.children['primary'];
      const first = primary?.segments.length ? primary.segments[0].path : '';
      this.isAuthRoute = first === 'iniciar-sesion' || first === 'registrarse';
    } catch (e) {
      const path = (url || '').split('?')[0].split('#')[0].split('/')[1] || '';
      this.isAuthRoute = path.startsWith('iniciar-sesion') || path.startsWith('registrarse');
    }
  }
}
