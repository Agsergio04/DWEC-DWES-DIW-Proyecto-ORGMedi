import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormInputComponent } from '../form-input/form-input';

@Component({
  selector: 'app-register-form',
  standalone: true,
  imports: [CommonModule, FormsModule, FormInputComponent],
  templateUrl: './register-form.html',
  styleUrls: ['./register-form.scss'],
})
export class RegisterFormComponent {
  username: string = '';
  email: string = '';
  password: string = '';
  repeatPassword: string = '';
  usernameError?: string;
  emailError?: string;
  passwordError?: string;
  repeatPasswordError?: string;

  onSubmit() {
    this.usernameError = this.username ? undefined : 'El usuario es obligatorio';
    this.emailError = this.email ? undefined : 'El correo es obligatorio';
    this.passwordError = this.password ? undefined : 'La contraseña es obligatoria';
    this.repeatPasswordError = (this.repeatPassword && this.repeatPassword === this.password) ? undefined : 'Las contraseñas no coinciden';
    if (!this.usernameError && !this.emailError && !this.passwordError && !this.repeatPasswordError) {
      // Aquí iría la lógica de registro
      alert('Registro enviado');
    }
  }
}
