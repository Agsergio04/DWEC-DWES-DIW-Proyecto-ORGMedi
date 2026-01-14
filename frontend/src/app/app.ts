import { Component, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Header } from './components/layout/header/header';
import { Footer } from './components/layout/footer/footer';
import { ToastComponent } from './shared/toast.component';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Header, Footer],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  protected readonly title = signal('ORGMedi');

  constructor(private router: Router, private themeService: ThemeService) {}

  isAuthRoute(): boolean {
    const url = this.router.url || '';
    return url.startsWith('/iniciar-sesion') || url.startsWith('/registrarse');
  }
}
