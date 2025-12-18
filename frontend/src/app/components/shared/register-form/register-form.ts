import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { passwordStrength } from '../../../validators/password-strength.validator';
import { passwordMatch } from '../../../validators/cross-field.validators';
import { AsyncValidatorsService } from '../../../shared/async-validators.service';

@Component({
  selector: 'app-register-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register-form.html',
  styleUrls: ['./register-form.scss'],
})
export class RegisterFormComponent {
  registerForm: FormGroup;

  constructor(private fb: FormBuilder, private asyncValidators: AsyncValidatorsService) {
    this.registerForm = this.fb.group({
      username: ['', {
        validators: [Validators.required, Validators.minLength(2)],
        asyncValidators: [this.asyncValidators.usernameAvailable()],
        updateOn: 'blur'
      }],
      email: ['', {
        validators: [Validators.required, Validators.email],
        asyncValidators: [this.asyncValidators.emailUnique()],
        updateOn: 'blur'
      }],
      password: ['', [Validators.required, passwordStrength()]],
      repeatPassword: ['', [Validators.required]]
    }, { validators: passwordMatch('password', 'repeatPassword') });
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const { username, email } = this.registerForm.value;
    console.log('Registro válido:', { username, email });
    alert('Registro enviado para: ' + username);
  }

  getErrorMessage(controlName: string): string {
    const control = this.registerForm.get(controlName);
    if (!control || !control.errors) return '';
    if (control.errors['required']) return `${controlName} es requerido`;
    if (control.errors['email']) return 'Email inválido';
    if (control.errors['minlength']) return `Mínimo ${control.errors['minlength'].requiredLength} caracteres`;
    // El validador de coincidencia devuelve { mismatch: true }
    if (controlName === 'repeatPassword' && this.registerForm.errors?.['mismatch']) return 'Las contraseñas no coinciden';
    return '';
  }

  // Helpers para la plantilla
  get email() {
    return this.registerForm.get('email');
  }

  get username() {
    return this.registerForm.get('username');
  }

  // Getters para controles individuales (evitan el uso directo de registerForm.get(...) en la plantilla)
  get password() {
    return this.registerForm.get('password');
  }

  get repeatPassword() {
    return this.registerForm.get('repeatPassword');
  }
}
