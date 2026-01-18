import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import { DataInputComponent } from '../../components/shared/data-input/data-input';
import { ButtonComponent } from '../../components/shared/button/button';

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

  form: FormGroup<ProfileFormModel> = this.fb.group({
    username: ['', Validators.required],
    currentPassword: ['', Validators.required],
    newPassword: ['', Validators.required]
  }) as FormGroup<ProfileFormModel>;

  ngOnInit(): void {
    // Inicializar formulario
  }

  changeUsername(): void {
    if (this.form.get('username')?.invalid) {
      return;
    }

    const username = this.form.get('username')?.value;
    // Llamar a servicio para cambiar nombre de usuario
    console.log('Cambiar nombre de usuario a:', username);
    // TODO: Implementar cambio de nombre de usuario
  }

  changePassword(): void {
    if (this.form.get('currentPassword')?.invalid || this.form.get('newPassword')?.invalid) {
      return;
    }

    const currentPassword = this.form.get('currentPassword')?.value;
    const newPassword = this.form.get('newPassword')?.value;
    // Llamar a servicio para cambiar contraseña
    console.log('Cambiar contraseña');
    // TODO: Implementar cambio de contraseña
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/iniciar-sesion']);
  }
}

