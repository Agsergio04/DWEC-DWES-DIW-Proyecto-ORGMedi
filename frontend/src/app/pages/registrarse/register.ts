import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RegisterFormComponent } from '../../components/shared/register-form/register-form';
import { RegisterFormData } from '../../components/shared/register-form/register-form';
import { UserService } from '../../data/user.service';
import { ToastService } from '../../shared/toast.service';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [CommonModule, RegisterFormComponent],
  templateUrl: './register.html',
  styleUrls: ['./register.scss']
})
export class RegisterPage {
  private userService = inject(UserService);
  private router = inject(Router);
  private toastService = inject(ToastService);
  isLoading = false;

  /**
   * Maneja el envío del formulario de registro
   * Envía los datos al backend para crear una nueva cuenta
   */
  onRegisterSubmit(data: RegisterFormData) {
    this.isLoading = true;

    // Transformar los datos del formulario al DTO del backend
    const createUserDto = {
      correo: data.email,
      usuario: data.username,
      contrasena: data.password
    };

    this.userService.createUser(createUserDto as any).subscribe({
      next: (user) => {
        this.toastService.success('Cuenta creada exitosamente. Por favor, inicia sesión.');
        this.router.navigate(['/iniciar-sesion']);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al crear cuenta:', err);
        const errorMsg = err.error?.message || 'Error al crear la cuenta. Intenta de nuevo.';
        this.toastService.error(errorMsg);
        this.isLoading = false;
      }
    });
  }
}

