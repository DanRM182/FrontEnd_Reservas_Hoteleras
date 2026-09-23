import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function textoRequerido(min: number, max: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valor = String(control.value ?? '').trim();
    return valor.length >= min && valor.length <= max ? null : { texto: true };
  };
}
