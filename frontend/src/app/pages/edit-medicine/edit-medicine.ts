import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Medicine } from '../../core/services/medicines.resolver';

@Component({
  selector: 'app-edit-medicine-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './edit-medicine.html',
  styleUrls: ['./edit-medicine.scss']
})
export class EditMedicinePage implements OnInit {
  medicineId: string | null = null;
  form: FormGroup;
  isDirty = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      dosage: ['', Validators.required],
      frequency: ['', Validators.required],
      description: [''],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      quantity: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    // Obtener el medicamento del resolver
    this.route.data.subscribe((data) => {
      if (data && data['medicine']) {
        const medicine: Medicine = data['medicine'];
        this.medicineId = medicine.id;
        
        // Llenar el formulario con los datos del medicamento resuelto
        this.form.patchValue({
          name: medicine.name,
          dosage: medicine.dosage,
          frequency: medicine.frequency,
          description: medicine.description || '',
          startDate: medicine.startDate,
          endDate: medicine.endDate,
          quantity: medicine.quantity
        });

        // Marcar como no modificado después de cargar los datos
        this.form.markAsPristine();
      }
    });

    // Escuchar cambios en el formulario
    this.form.valueChanges.subscribe(() => {
      this.isDirty = this.form.dirty;
    });
  }

  frequencies = [
    'Una vez al día',
    '2 veces al día',
    '3 veces al día',
    'Cada 4-6 horas',
    'Cada 6-8 horas',
    'Cada 8 horas',
    'Cada 12 horas',
    'Según sea necesario'
  ];

  saveMedicine(): void {
    if (this.form.valid) {
      // Aquí iría la lógica para actualizar el medicamento
      console.log('Medicamento actualizado:', this.form.value);
      this.form.markAsPristine();
      // Navegar a la página de medicamentos
      this.router.navigate(['/medicamentos']);
    }
  }

  cancelEdit(): void {
    // Navegar hacia atrás a la página de medicamentos
    this.router.navigate(['/medicamentos']);
  }

  deleteMedicine(): void {
    if (confirm('¿Estás seguro de que deseas eliminar este medicamento?')) {
      // Aquí iría la lógica para eliminar el medicamento
      console.log('Medicamento eliminado');
      // Navegar a la página de medicamentos
      this.router.navigate(['/medicamentos']);
    }
  }
}

