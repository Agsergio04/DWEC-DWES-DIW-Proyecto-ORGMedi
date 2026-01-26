import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import { DataInputComponent } from '../../components/shared/data-input/data-input';
import { ButtonComponent } from '../../components/shared/button/button';
import { ToastService } from '../../shared/toast.service';

interface ProfileFormModel {
  username: FormControl<string>;
  currentPassword: FormControl<string>;
  newPassword: FormControl<string>;
}

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DataInputComponent, ButtonComponent],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss']
})
export class ProfilePage implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastService = inject(ToastService);

  form!: FormGroup<ProfileFormModel>;
  formInitialized = false;
  isLoading = false;

  constructor() {
    // El formulario se inicializa en ngOnInit, no aquí
  }

  ngOnInit(): void {
    // Inicializar el formulario PRIMERO antes de que el template se renderice
    this.form = this.fb.group({
      username: ['', { validators: [Validators.required], nonNullable: true }],
      currentPassword: ['', { validators: [Validators.required], nonNullable: true }],
      newPassword: ['', { validators: [Validators.required], nonNullable: true }]
    }) as FormGroup<ProfileFormModel>;
    
    // Marcar como inicializado para que el template se renderice
    this.formInitialized = true;

    // Cargar datos del usuario actual del backend
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        // Usar el ID real obtenido del servidor
        if (user && user.name) {
          this.form.get('username')?.setValue(user.name);
        }
      },
      error: (err) => {
        console.error('Error cargando datos del usuario:', err);
        // Notificar al usuario y usar datos del localStorage si existen
        const errorMsg =
          err?.error?.message ||
          err?.message ||
          (err?.status ? `Error ${err.status}: ${err.statusText || 'Error del servidor'}` : 'No se pudieron cargar los datos del usuario');
        this.toastService.error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
        const currentUser = this.authService.currentUser;
        if (currentUser && currentUser.name) {
          this.form.get('username')?.setValue(currentUser.name);
        }
      }
    });
  }

  changeUsername(): void {
    if (this.form.get('username')?.invalid) {
      this.toastService.error('Por favor introduce un nombre de usuario válido');
      return;
    }

    const newUsername = this.form.get('username')?.value;
    if (!newUsername) {
      return;
    }

    this.isLoading = true;

    this.authService.updateUsername(newUsername).subscribe({
      next: () => {
        this.toastService.success('Nombre de usuario actualizado exitosamente');
        this.isLoading = false;
        // Limpiar el campo después de actualizar
        this.form.patchValue({ username: newUsername });
      },
      error: (err) => {
        console.error('Error al actualizar nombre de usuario:', err);
        const errorMsg =
          err?.error?.message ||
          err?.message ||
          (err?.status ? `Error ${err.status}: ${err.statusText || 'Error del servidor'}` : 'Error al actualizar el nombre de usuario');
        this.toastService.error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
        this.isLoading = false;
      }
    });
  }

  changePassword(): void {
    if (this.form.get('currentPassword')?.invalid || this.form.get('newPassword')?.invalid) {
      this.toastService.error('Por favor introduce contraseñas válidas');
      return;
    }

    const currentPassword = this.form.get('currentPassword')?.value;
    const newPassword = this.form.get('newPassword')?.value;

    if (!currentPassword || !newPassword) {
      return;
    }

    // Validar que la nueva contraseña tenga al menos 8 caracteres
    if (newPassword.length < 8) {
      this.toastService.error('La nueva contraseña debe tener al menos 8 caracteres');
      return;
    }

    // Validar que no sean iguales
    if (currentPassword === newPassword) {
      this.toastService.error('La nueva contraseña debe ser diferente a la actual');
      return;
    }

    this.isLoading = true;

    this.authService.changePassword(currentPassword, newPassword).subscribe({
      next: () => {
        this.toastService.success('Contraseña cambiada exitosamente');
        this.isLoading = false;
        // Limpiar los campos de contraseña
        this.form.patchValue({
          currentPassword: '',
          newPassword: ''
        });
      },
      error: (err) => {
          console.error('Error al cambiar contraseña:', err);
          const errorMsg =
            err?.error?.message ||
            err?.message ||
            (err?.status ? `Error ${err.status}: ${err.statusText || 'Error del servidor'}` : 'Error al cambiar la contraseña');
          this.toastService.error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
          this.isLoading = false;
      }
    });
  }

  logout(): void {
    console.log('[ProfilePage] Usuario cerrando sesión...');
    
    // Cerrar sesión en el AuthService (borra el JWT)
    this.authService.logout();
    
    // Mostrar mensaje confirmativo
    this.toastService.success('Sesión cerrada correctamente. Por favor, vuelve a iniciar sesión.');
    
    // Navegar a login
    this.router.navigate(['/iniciar-sesion']);
  }
}

