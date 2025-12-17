import { Component, OnInit, OnDestroy, HostListener, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrls: ['./header.scss']
})
export class Header implements OnInit, OnDestroy {
  isDarkMode = false;
  isAuthRoute = false;
  isOpen = false; // Menú hamburguesa

  @ViewChild('menuButton') menuButton?: ElementRef<HTMLButtonElement>;
  @ViewChild('navMenu') navMenu?: ElementRef<HTMLElement>;
  private routerSub?: Subscription;

  constructor(public router: Router, private elementRef: ElementRef) {}

  ngOnInit() {
    const stored = localStorage.getItem('orgmedi-theme');
    if (stored === 'dark') {
      this.setDark(true);
    } else if (stored === 'light') {
      this.setDark(false);
    } else {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.setDark(prefersDark);
    }

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
  }

  toggleTheme() {
    this.setDark(!this.isDarkMode);
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

  private setDark(dark: boolean) {
    this.isDarkMode = dark;
    const root = document.documentElement;
    if (dark) {
      root.setAttribute('data-theme', 'dark');
      localStorage.setItem('orgmedi-theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
      localStorage.setItem('orgmedi-theme', 'light');
    }
  }

  private checkAuthRoute(url: string) {
    try {
      const tree = this.router.parseUrl(url || '');
      const primary = tree.root.children['primary'];
      const first = primary?.segments.length ? primary.segments[0].path : '';
      this.isAuthRoute = first === 'login' || first === 'register';
    } catch (e) {
      const path = (url || '').split('?')[0].split('#')[0].split('/')[1] || '';
      this.isAuthRoute = path.startsWith('login') || path.startsWith('register');
    }
  }
}
