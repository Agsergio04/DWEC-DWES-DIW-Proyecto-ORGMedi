import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DataInputComponent } from '../data-input/data-input';
import { ButtonComponent } from '../button/button';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, DataInputComponent, ButtonComponent],
  templateUrl: './login-form.html',
  styleUrls: ['./login-form.scss'],
})
export class LoginFormComponent {
  loginForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(2)]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  /**
   * Envía el formulario si es válido
   */
  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { username, password } = this.loginForm.value;
    console.log('Login válido:', { username, password });
    // TODO: llamar a authService.login(username, password)
    alert(`Login enviado para: ${username}`);
  }

  /** Helpers para mostrar mensajes de error */
  getErrorMessage(controlName: string): string {
    const control = this.loginForm.get(controlName);
    if (!control || !control.errors) return '';
    if (control.errors['required']) return `${controlName} es requerido`;
    if (control.errors['minlength']) return `Mínimo ${control.errors['minlength'].requiredLength} caracteres`;
    return '';
  }
}
