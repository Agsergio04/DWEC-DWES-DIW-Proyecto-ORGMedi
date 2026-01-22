import { Component, OnInit, OnDestroy, HostListener, ElementRef, ViewChild, inject, ChangeDetectionStrategy, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';
import { ThemeService } from '../../../core/services/ui';
import { AuthService } from '../../../core/services/auth';
import { NotificationsService } from '../../../core/services/ui/notifications.service';
import { ToastComponent } from '../../../shared/toast.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, ToastComponent],
  templateUrl: './header.html',
  styleUrls: ['./header.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Header implements OnInit, OnDestroy {
  isDarkMode = false;
  isAuthRoute = false;
  isOpen = false; // Menú hamburguesa
  isLoggedIn = false; // Estado de autenticación
  showNotificationsPanel = signal(false); // Panel de notificaciones

  @ViewChild('menuButton') menuButton?: ElementRef<HTMLButtonElement>;
  @ViewChild('navMenu') navMenu?: ElementRef<HTMLElement>;
  private routerSub?: Subscription;
  private themeSub?: Subscription;
  private authSub?: Subscription;
  private notificationsSub?: Subscription;

  private themeService = inject(ThemeService);
  private authService = inject(AuthService);
  private notificationsService = inject(NotificationsService);
  private cdr = inject(ChangeDetectorRef);

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
      this.cdr.markForCheck();
      // Auto-start polling cuando el usuario inicia sesión
      if (isLoggedIn) {
        this.notificationsService.startPolling();
        this.notificationsSub = this.notificationsService.pollNotifications(30000).subscribe();
      } else {
        // Auto-stop polling cuando el usuario cierra sesión
        this.notificationsService.stopPolling();
        this.notificationsSub?.unsubscribe();
      }
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
    this.notificationsSub?.unsubscribe();
    this.notificationsService.stopPolling();
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

  toggleNotificationsPanel() {
    this.showNotificationsPanel.set(!this.showNotificationsPanel());
  }

  closeNotificationsPanel() {
    this.showNotificationsPanel.set(false);
  }

  markNotificationAsRead(id: number, event: Event) {
    event.stopPropagation();
    this.notificationsService.markAsRead(id).subscribe();
  }

  deleteNotification(id: number, event: Event) {
    event.stopPropagation();
    this.notificationsService.deleteNotification(id).subscribe();
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

  // Getters para acceder a los signals del NotificationsService
  get unreadCount() {
    return this.notificationsService.unreadCount;
  }

  get notificationsList() {
    return this.notificationsService.notifications;
  }
}
