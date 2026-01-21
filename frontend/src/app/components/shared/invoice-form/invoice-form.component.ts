import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-invoice-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './invoice-form.component.html'
})
export class InvoiceFormComponent {
  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      customer: ['', Validators.required],
      phones: this.fb.array([]),
      addresses: this.fb.array([]),
      items: this.fb.array([])
    });

    this.addPhone();
    this.addAddress();
    this.addItem();
  }

  get phones(): FormArray {
    return this.form.get('phones') as FormArray;
  }

  get addresses(): FormArray {
    return this.form.get('addresses') as FormArray;
  }

  get items(): FormArray {
    return this.form.get('items') as FormArray;
  }

  // Teléfonos
  newPhone(): FormGroup {
    return this.fb.group({
      phone: ['', [Validators.required, Validators.pattern(/^(?:6|7)\d{8}$/)]]
    });
  }

  addPhone() {
    this.phones.push(this.newPhone());
  }

  removePhone(index: number) {
    this.phones.removeAt(index);
  }

  isPhoneInvalid(index: number): boolean {
    const g = this.phones.at(index);
    const c = g?.get('phone');
    return !!(c && c.invalid && (c.touched || c.dirty));
  }

  // Direcciones
  newAddress(): FormGroup {
    return this.fb.group({
      street: ['', Validators.required],
      city: ['', Validators.required],
      zip: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]]
    });
  }

  addAddress() {
    this.addresses.push(this.newAddress());
  }

  removeAddress(index: number) {
    this.addresses.removeAt(index);
  }

  isAddressInvalid(index: number): boolean {
    const g = this.addresses.at(index);
    return !!(g && g.invalid && (g.touched || g.dirty));
  }

  // Items de factura
  newItem(): FormGroup {
    return this.fb.group({
      description: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      price: [0, [Validators.required, Validators.min(0)]]
    });
  }

  addItem() {
    this.items.push(this.newItem());
  }

  removeItem(index: number) {
    this.items.removeAt(index);
  }

  isItemInvalid(index: number): boolean {
    const g = this.items.at(index);
    return !!(g && g.invalid && (g.touched || g.dirty));
  }

  getTotal(): number {
    return this.items.value
      .reduce((acc: number, item: any) => acc + (Number(item.quantity) || 0) * (Number(item.price) || 0), 0);
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    console.log(this.form.value);
  }

  /**
   * TrackBy para optimizar *ngFor de FormArray (teléfonos, direcciones, items)
   */
  trackByIndex(index: number): number {
    return index;
  }
}
