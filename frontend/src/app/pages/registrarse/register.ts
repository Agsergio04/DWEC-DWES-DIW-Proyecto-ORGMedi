import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RegisterFormComponent } from '../../components/shared/register-form/register-form';
import { RegisterFormData } from '../../components/shared/register-form/register-form';
import { AuthService } from '../../core/services/auth';
import { ToastService } from '../../shared/toast.service';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [CommonModule, RegisterFormComponent],
  templateUrl: './register.html',
  styleUrls: ['./register.scss']
})
export class RegisterPage {
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastService = inject(ToastService);
  isLoading = false;

  /**
   * Maneja el envío del formulario de registro
   * Envía los datos al backend para crear una nueva cuenta
   */
  onRegisterSubmit(data: RegisterFormData) {
    this.isLoading = true;

    this.authService.register(data.email, data.username, data.password).subscribe({
      next: (success) => {
        // El spinner se cierra cuando el servidor responde
        this.isLoading = false;
        if (success) {
          this.toastService.success('Cuenta creada exitosamente. Redirigiendo...');
          this.router.navigate(['/calendario']);
        } else {
          this.toastService.error('Error al crear la cuenta. Intenta de nuevo.');
        }
      },
      error: (err) => {
        // El spinner se cierra cuando el servidor responde con error
        this.isLoading = false;
        console.error('Error al crear cuenta:', err);
        const errorMsg = err.error?.message || 'Error al crear la cuenta. Intenta de nuevo.';
        this.toastService.error(errorMsg);
      }
    });
  }
}

