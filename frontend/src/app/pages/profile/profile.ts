import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  bloodType: string;
  address: string;
}

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss']
})
export class ProfilePage {
  userProfile: UserProfile = {
    name: 'Juan García',
    email: 'juan.garcia@example.com',
    phone: '+34 666 123 456',
    birthDate: '1990-05-15',
    bloodType: 'O+',
    address: 'Calle Principal 123, 28001 Madrid'
  };

  isEditing = false;

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
  }

  saveProfile(): void {
    // Aquí iría la lógica para guardar el perfil
    this.isEditing = false;
  }

  cancelEdit(): void {
    this.isEditing = false;
  }
}

