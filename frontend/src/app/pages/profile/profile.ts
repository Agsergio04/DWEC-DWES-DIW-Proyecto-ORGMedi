import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { FormComponent } from '../../core/services/pending-changes.guard';
import { UserProfile } from '../../core/services/profile.resolver';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss']
})
export class ProfilePage implements FormComponent, OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);

  // Implementa la interfaz FormComponent
  form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    dateOfBirth: [''],
    medicalConditions: [''],
    allergies: [''],
    doctorName: [''],
    doctorContact: ['']
  });

  userProfile: UserProfile | null = null;
  isEditing = false;

  ngOnInit(): void {
    // Obtener el perfil del resolver
    this.route.data.subscribe((data) => {
      if (data && data['profile']) {
        this.userProfile = data['profile'];
        
        if (this.userProfile) {
          // Cargar los datos en el formulario
          this.form.patchValue({
            name: this.userProfile.name,
            email: this.userProfile.email,
            phone: this.userProfile.phone || '',
            dateOfBirth: this.userProfile.dateOfBirth || '',
            medicalConditions: (this.userProfile.medicalConditions || []).join(', '),
            allergies: (this.userProfile.allergies || []).join(', '),
            doctorName: this.userProfile.doctorName || '',
            doctorContact: this.userProfile.doctorContact || ''
          });
          
          this.form.markAsPristine(); // El formulario comienza sin cambios
        }
      }
    });
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      // Si cancela la edición, restaurar los datos originales
      if (this.userProfile) {
        this.form.patchValue({
          name: this.userProfile.name,
          email: this.userProfile.email,
          phone: this.userProfile.phone || '',
          dateOfBirth: this.userProfile.dateOfBirth || '',
          medicalConditions: (this.userProfile.medicalConditions || []).join(', '),
          allergies: (this.userProfile.allergies || []).join(', '),
          doctorName: this.userProfile.doctorName || '',
          doctorContact: this.userProfile.doctorContact || ''
        });
        this.form.markAsPristine();
      }
    }
  }

  saveProfile(): void {
    if (this.form.valid) {
      // Actualizar el perfil con los nuevos datos
      if (this.userProfile) {
        this.userProfile = {
          ...this.userProfile,
          name: this.form.value.name,
          email: this.form.value.email,
          phone: this.form.value.phone,
          dateOfBirth: this.form.value.dateOfBirth,
          medicalConditions: this.form.value.medicalConditions?.split(',').map((c: string) => c.trim()) || [],
          allergies: this.form.value.allergies?.split(',').map((a: string) => a.trim()) || [],
          doctorName: this.form.value.doctorName,
          doctorContact: this.form.value.doctorContact
        };
      }
      
      this.isEditing = false;
      this.form.markAsPristine(); // Marcar como guardado (no sucio)
      alert('Perfil actualizado correctamente');
    }
  }

  cancelEdit(): void {
    this.isEditing = false;
    // Restaurar los datos originales
    if (this.userProfile) {
      this.form.patchValue({
        name: this.userProfile.name,
        email: this.userProfile.email,
        phone: this.userProfile.phone || '',
        dateOfBirth: this.userProfile.dateOfBirth || '',
        medicalConditions: (this.userProfile.medicalConditions || []).join(', '),
        allergies: (this.userProfile.allergies || []).join(', '),
        doctorName: this.userProfile.doctorName || '',
        doctorContact: this.userProfile.doctorContact || ''
      });
      this.form.markAsPristine();
    }
  }
}

