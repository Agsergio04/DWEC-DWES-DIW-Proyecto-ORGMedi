import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function passwordMatch(controlName: string, matchControlName: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const control = group.get(controlName);
    const matchControl = group.get(matchControlName);

    if (!control || !matchControl) return null;
    // if matchControl has other errors, keep them
    if (matchControl.errors && !matchControl.errors['mismatch']) return null;

    return control.value === matchControl.value ? null : { mismatch: true };
  };
}

export function totalMinimo(min: number): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const price = group.get('price')?.value;
    const quantity = group.get('quantity')?.value;

    const total = (Number(price) || 0) * (Number(quantity) || 0);
    return total >= min ? null : { totalMinimo: { min, actual: total } };
  };
}

export function edadMayor(controlName: string, minAgeControl: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const control = group.get(controlName);
    const ageControl = group.get(minAgeControl);

    if (!control?.value || !ageControl?.value) return null;
    return parseInt(control.value, 10) > parseInt(ageControl.value, 10) ? null : { edadMenor: true };
  };
}

export function atLeastOneRequired(...fields: string[]): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const hasOne = fields.some(field => !!group.get(field)?.value);
    return hasOne ? null : { atLeastOneRequired: { fields } };
  };
}

