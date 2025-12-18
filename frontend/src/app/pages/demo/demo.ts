import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomDirectComponent } from '../../components/dom-examples/dom-direct.component';
import { DomRendererComponent } from '../../components/dom-examples/dom-renderer.component';
import { DomViewchildComponent } from '../../components/dom-examples/dom-viewchild.component';
import { DomObserversComponent } from '../../components/dom-examples/dom-observers.component';
import { DomEventsComponent } from '../../components/dom-examples/dom-events.component';
import { Modal } from '../../components/shared/modal/modal';
import { TooltipDirective } from '../../directives/tooltip.directive';
import { Tabs } from '../../components/shared/tabs/tabs';
import { Tab } from '../../components/shared/tabs/tab';
import { ButtonComponent } from '../../components/shared/button/button';
import { ThemeService } from '../../core/services/theme.service';
import { CommunicationService } from '../../core/services/communication.service';
import { AlertComponent } from '../../components/shared/alert/alert';
import { UserService, User } from '../../data/user.service';
import { signal } from '@angular/core';

@Component({
  selector: 'app-demo',
  standalone: true,
  imports: [CommonModule, DomDirectComponent, DomRendererComponent, DomViewchildComponent, DomObserversComponent, DomEventsComponent, Modal, TooltipDirective, Tabs, Tab, ButtonComponent, AlertComponent],
  templateUrl: './demo.html',
  styleUrls: ['./demo.scss']
})
export class DemoPage {
  // Modal demo state
  modalOpen = false;
  openModal() { this.modalOpen = true; }
  closeModal() { this.modalOpen = false; }

  // Ejemplo SRP: inyectamos UserService para delegar lógica de negocio/HTTP
  // `users$` como getter para evitar usar `this.userService` antes de la inicialización
  get users$() {
    return this.userService.getUsers();
  }
  selectedUser = signal<User | null>(null);

  // Exponer la observable del servicio para que la plantilla la consuma (evita warning "unused")
  get selectedUserId$() {
    return this.userService.selectedUserId$;
  }

  constructor(private themeService: ThemeService, public comm: CommunicationService, private userService: UserService) {}

  toggleTheme() { this.themeService.toggleTheme(); }

  get currentTheme() { return this.themeService.getTheme(); }

  // Métodos para demo de comunicación entre componentes
  sendSampleNotification() {
    this.comm.sendNotification('Petición de ejemplo enviada desde Demo');
  }

  clearNotification() {
    this.comm.sendNotification('');
  }

  // Cerrado del alert: limpiar la notificación
  onAlertClosed() {
    this.clearNotification();
  }

  // Métodos relacionados con users delegando a UserService
  onSelectUser(user: User) {
    this.selectedUser.set(user);
    this.userService.selectUser(user.id);
  }
}
