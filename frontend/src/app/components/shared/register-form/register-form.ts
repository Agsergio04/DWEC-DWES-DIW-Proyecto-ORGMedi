import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DataInputComponent } from '../data-input/data-input';
import { ButtonComponent } from '../button/button';
import { passwordStrength } from '../../../validators/password-strength.validator';
import { AsyncValidatorsService } from '../../../shared/async-validators.service';

export interface RegisterFormData {
  username: string;
  password: string;
  email: string;
}

interface RegisterFormModel {
  username: FormControl<string>;
  password: FormControl<string>;
  email: FormControl<string>;
}

@Component({
  selector: 'app-register-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, DataInputComponent, ButtonComponent],
  templateUrl: './register-form.html',
  styleUrls: ['./register-form.scss'],
})
export class RegisterFormComponent {
  @Output() submitted = new EventEmitter<RegisterFormData>();
  @Input() disabled = false;

  registerForm: FormGroup<RegisterFormModel>;

  constructor(private fb: FormBuilder, private asyncValidators: AsyncValidatorsService) {
    this.registerForm = this.fb.group({
      username: ['', {
        validators: [Validators.required, Validators.minLength(2)],
        asyncValidators: [this.asyncValidators.usernameAvailable()],
        updateOn: 'blur'
      }],
      password: ['', [Validators.required, passwordStrength()]],
      email: ['', {
        validators: [Validators.required, Validators.email],
        asyncValidators: [this.asyncValidators.emailUnique()],
        updateOn: 'blur'
      }]
    });
  }

  onSubmit() {
    if (this.registerForm.invalid || this.disabled) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const { username, password, email } = this.registerForm.value;
    this.submitted.emit({ username, password, email });
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
