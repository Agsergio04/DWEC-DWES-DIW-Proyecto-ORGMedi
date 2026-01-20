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

  form: FormGroup<ProfileFormModel> = this.fb.group({
    username: ['', Validators.required],
    currentPassword: ['', Validators.required],
    newPassword: ['', Validators.required]
  }) as FormGroup<ProfileFormModel>;

  isLoading = false;

  ngOnInit(): void {
    // Cargar datos del usuario actual si existe
    const currentUser = this.authService.currentUser;
    if (currentUser) {
      this.form.patchValue({
        username: currentUser.name
      });
    }
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
        const errorMsg = err.error?.message || 'Error al actualizar el nombre de usuario';
        this.toastService.error(errorMsg);
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
        const errorMsg = err.error?.message || 'Error al cambiar la contraseña';
        this.toastService.error(errorMsg);
        this.isLoading = false;
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/iniciar-sesion']);
  }
}

