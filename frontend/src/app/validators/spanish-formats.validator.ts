import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function nif(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;

    const nif = String(value).toUpperCase();
    const nifRegex = /^[0-9]{8}[TRWAGMYFPDXBCSQVJHZTKB]$/;
    if (!nifRegex.test(nif)) return { invalidNif: true };

    const letters = 'TRWAGMYFPDXBCSQVJHZTKB';
    const position = parseInt(nif.substring(0, 8), 10) % 23;
    return letters[position] === nif[8] ? null : { invalidNif: true };
  };
}

export function telefono(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;
    return /^(6|7)[0-9]{8}$/.test(String(value)) ? null : { invalidTelefono: true };
  };
}

export function codigoPostal(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;
    return /^\d{5}$/.test(String(value)) ? null : { invalidCP: true };
  };
}

