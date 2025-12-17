import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login-form.html',
  styleUrls: ['./login-form.scss'],
})
export class LoginFormComponent {
  username: string = '';
  password: string = '';
  usernameError?: string;
  passwordError?: string;

  /**
   * Valida y envía el formulario de login
   */
  onSubmit() {
    // Validar campos vacíos
    this.usernameError = this.username.trim()
      ? undefined
      : 'El usuario es obligatorio';

    this.passwordError = this.password.trim()
      ? undefined
      : 'La contraseña es obligatoria';

    // Si no hay errores, proceder
    if (!this.usernameError && !this.passwordError) {
      console.log('Login válido:', {
        username: this.username,
        password: this.password,
      });

      // Aquí iría la lógica de login
      // this.authService.login(this.username, this.password).subscribe(...)
      alert(`Login enviado para: ${this.username}`);
    }
  }

  /**
   * Limpia los errores al escribir
   */
  onUsernameChange() {
    if (this.usernameError) {
      this.usernameError = undefined;
    }
  }

  onPasswordChange() {
    if (this.passwordError) {
      this.passwordError = undefined;
    }
  }
}
