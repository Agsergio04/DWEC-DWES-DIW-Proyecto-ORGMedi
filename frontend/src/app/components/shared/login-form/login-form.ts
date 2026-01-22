import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { DataInputComponent } from '../data-input/data-input';
import { ButtonComponent } from '../button/button';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner';

interface LoginFormModel {
  usuario: FormControl<string>;
  password: FormControl<string>;
}

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, DataInputComponent, ButtonComponent, LoadingSpinnerComponent],
  templateUrl: './login-form.html',
  styleUrls: ['./login-form.scss'],
})
export class LoginFormComponent {
  loginForm: FormGroup<LoginFormModel>;
  isLoading = false;
  errorMessage = '';
  submitted = false;  // Controla si se ha intentado enviar el formulario

  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  constructor() {
    this.loginForm = this.fb.group({
      usuario: ['', [Validators.required, Validators.minLength(2)]],
      password: ['', [Validators.required]]
    }) as FormGroup<LoginFormModel>;
  }

  /**
   * Envía el formulario si es válido
   */
  onSubmit() {
    this.submitted = true;  // Marcar formulario como enviado

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { usuario, password } = this.loginForm.value;

    // Llamar a authService.login() con usuario
    this.authService.login(usuario, password).subscribe({
      next: (success) => {
        // El spinner se cierra cuando el servidor responde
        this.isLoading = false;
        if (success) {
          // Navegar al calendario después de login exitoso
          this.router.navigate(['/calendario']);
        } else {
          this.errorMessage = 'Credenciales inválidas. Por favor intenta de nuevo.';
        }
      },
      error: (err) => {
        // El spinner se cierra cuando el servidor responde con error
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Error al iniciar sesión. Verifica tus credenciales.';
        console.error('[LoginForm] Error en login:', err);
      }
    });
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
