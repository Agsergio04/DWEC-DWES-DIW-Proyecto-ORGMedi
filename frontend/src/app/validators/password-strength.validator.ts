import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function passwordStrength(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value: string = control.value;
    if (!value) return null;

    // Requisitos: mínimo 8 caracteres (coincide con backend)
    const minLength = value.length >= 8;

    const errors: ValidationErrors = {};
    if (!minLength) errors['minLength'] = { requiredLength: 8, actualLength: value.length };

    return Object.keys(errors).length ? errors : null;
  };
}
