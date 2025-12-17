import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService, AppTheme } from '../../../core/services/theme.service';

@Component({
  selector: 'app-theme-switcher',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './theme-switcher.html',
  styleUrls: ['./theme-switcher.scss']
})
export class ThemeSwitcher {
  @Output() themeChange = new EventEmitter<AppTheme>();

  current: AppTheme = 'light';

  constructor(private themeService: ThemeService) {
    this.current = this.themeService.getTheme();
    this.themeService.theme$.subscribe((t) => (this.current = t));
  }

  toggle() {
    this.themeService.toggleTheme();
    this.themeChange.emit(this.themeService.getTheme());
  }

  setTheme(t: AppTheme) {
    this.themeService.setTheme(t);
    this.themeChange.emit(t);
  }
}

