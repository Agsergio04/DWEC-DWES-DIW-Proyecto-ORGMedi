import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MedicineService } from '../../data/medicine.service';
import { ToastService } from '../../shared/toast.service';
import { MedicineViewModel } from '../../data/models/medicine.model';

/**
 * Ejemplos de uso de Interceptores HTTP (Tarea 6)
 */

// Ejemplo 1: Interceptor de Auth Automático
@Component({
  selector: 'app-medicines-auth-example',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="example">
      <h3>Ejemplo 1: Autenticación Automática</h3>
      <p class="info">Al hacer clic, el authInterceptor añadirá automáticamente el header Authorization</p>
      <button (click)="loadMedicines()" [disabled]="loading()">
        {{ loading() ? 'Cargando...' : 'Cargar Medicamentos' }}
      </button>
      <div *ngIf="medicines()" class="result">
        <p>✓ Petición enviada con token JWT automáticamente</p>
        <p>Medicamentos: {{ medicines()?.length }} encontrados</p>
      </div>
    </div>
  `,
  styles: [`
    .example { padding: 20px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 20px; }
    .info { background: #e3f2fd; padding: 10px; border-radius: 4px; color: #1565c0; }
    .result { margin-top: 15px; padding: 10px; background: #c8e6c9; border-radius: 4px; }
    button { padding: 8px 12px; background: #2196f3; color: white; border: none; border-radius: 4px; cursor: pointer; }
    button:disabled { background: #ccc; cursor: not-allowed; }
  `]
})
export class MedicinesAuthExampleComponent implements OnInit {
  private medicineService = inject(MedicineService);
  medicines = signal<MedicineViewModel[] | null>(null);
  loading = signal(false);

  ngOnInit() {
    const token = localStorage.getItem('authToken');
    console.log('[AUTH] Token presente:', !!token);
  }

  loadMedicines() {
    this.loading.set(true);
    this.medicineService.getAll().subscribe({
      next: (medicines) => {
        this.medicines.set(medicines);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}

// Ejemplo 2: Manejo de Errores Automático
@Component({
  selector: 'app-medicines-error-example',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="example">
      <h3>Ejemplo 2: Manejo de Errores Global</h3>
      <p class="info">El errorInterceptor captura automáticamente todos los errores HTTP</p>
      <div class="error-codes">
        <button (click)="trigger404()" class="btn-error">Trigger 404</button>
        <button (click)="trigger401()" class="btn-error">Trigger 401</button>
        <button (click)="trigger500()" class="btn-error">Trigger 500</button>
      </div>
      <table class="error-table">
        <tr><th>Código</th><th>Mensaje</th></tr>
        <tr><td>401</td><td>Sesión no válida</td></tr>
        <tr><td>403</td><td>No tienes permisos</td></tr>
        <tr><td>404</td><td>Recurso no existe</td></tr>
        <tr><td>5xx</td><td>Error interno servidor</td></tr>
      </table>
    </div>
  `,
  styles: [`
    .example { padding: 20px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 20px; }
    .info { background: #fff3e0; padding: 10px; border-radius: 4px; color: #e65100; }
    .error-codes { display: flex; gap: 10px; margin: 15px 0; flex-wrap: wrap; }
    .btn-error { padding: 8px 12px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer; }
    .btn-error:hover { background: #d32f2f; }
    .error-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    .error-table th, .error-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    .error-table th { background: #e0e0e0; font-weight: bold; }
  `]
})
export class MedicinesErrorExampleComponent {
  private medicineService = inject(MedicineService);
  private toastService = inject(ToastService);

  trigger404() {
    this.medicineService.getById('999999').subscribe({
      error: (err) => console.log('Error 404:', err)
    });
  }

  trigger401() {
    localStorage.removeItem('authToken');
    this.toastService.error('Sesión no válida o expirada');
  }

  trigger500() {
    this.toastService.error('Error interno del servidor');
  }
}

// Ejemplo 3: Logging en Consola
@Component({
  selector: 'app-medicines-logging-example',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="example">
      <h3>Ejemplo 3: Logging Automático</h3>
      <p class="info">El loggingInterceptor registra en consola. Abre DevTools (F12)</p>
      <button (click)="makeRequest()" [disabled]="loading()">
        {{ loading() ? 'Cargando...' : 'Hacer Petición' }}
      </button>
      <p class="note">Abre Console en DevTools para ver: [HTTP] → GET /api/medicines</p>
    </div>
  `,
  styles: [`
    .example { padding: 20px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 20px; }
    .info { background: #e0e7ff; padding: 10px; border-radius: 4px; color: #3949ab; }
    button { padding: 8px 12px; background: #2196f3; color: white; border: none; border-radius: 4px; cursor: pointer; }
    button:disabled { background: #ccc; cursor: not-allowed; }
    .note { margin-top: 10px; padding: 10px; background: #f5f5f5; border-radius: 4px; font-size: 12px; }
  `]
})
export class MedicinesLoggingExampleComponent {
  private medicineService = inject(MedicineService);
  loading = signal(false);

  makeRequest() {
    this.loading.set(true);
    console.log('[DEMO] Iniciando petición GET /api/medicines...');
    this.medicineService.getAll().subscribe({
      next: (medicines) => {
        console.log('[DEMO] Respuesta:', medicines);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('[DEMO] Error:', err);
        this.loading.set(false);
      }
    });
  }
}

// Ejemplo 4: Flujo Completo
@Component({
  selector: 'app-medicines-interceptor-flow',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="example">
      <h3>Ejemplo 4: Flujo Completo de Interceptores</h3>
      <p class="info">Los tres interceptores trabajan juntos en cada petición HTTP</p>
      <div class="flow">
        <div class="step">1. Servicio → medicineService.getAll()</div>
        <div class="step auth">2. authInterceptor → Añade Bearer token</div>
        <div class="step error">3. errorInterceptor → Prepara catchError</div>
        <div class="step logging">4. loggingInterceptor → Registra en consola</div>
        <div class="step">5. Backend → Procesa y retorna respuesta</div>
      </div>
      <button (click)="runFlow()" class="btn-flow">Ejecutar Flujo</button>
    </div>
  `,
  styles: [`
    .example { padding: 20px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 20px; }
    .info { background: #f3e5f5; padding: 10px; border-radius: 4px; color: #6a1b9a; }
    .flow { margin: 20px 0; }
    .step { padding: 10px; margin: 5px 0; background: #f5f5f5; border-radius: 4px; border-left: 4px solid #999; }
    .step.auth { border-left-color: #66bb6a; background: #f1f8e9; }
    .step.error { border-left-color: #ef5350; background: #ffebee; }
    .step.logging { border-left-color: #42a5f5; background: #e3f2fd; }
    .btn-flow { padding: 10px 20px; background: #7b1fa2; color: white; border: none; border-radius: 4px; cursor: pointer; }
    .btn-flow:hover { background: #6a1b9a; }
  `]
})
export class MedicinesInterceptorFlowComponent {
  private medicineService = inject(MedicineService);

  runFlow() {
    console.log('═══════════════════════════════════════');
    console.log('   FLUJO COMPLETO DE INTERCEPTORES    ');
    console.log('═══════════════════════════════════════');
    this.medicineService.getAll().subscribe({
      next: (medicines) => {
        console.log('[FINAL] Datos recibidos:', medicines);
        console.log('═══════════════════════════════════════');
      },
      error: (err) => console.error('[FINAL] Error:', err)
    });
  }
}
