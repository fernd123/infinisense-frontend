import { AbstractControl } from '@angular/forms';

export const EMAIL_REGEX = '^[a-zA-Z0-9.!#$%&’*+\\=?^_`{|}~-]+@[a-zA-Z0-9-]+\\.[\\.a-zA-Z0-9-]+$';

export function validateEmail(control: AbstractControl) {

  if(control && control.value && control.value !== '') {
    const patt = new RegExp(EMAIL_REGEX);
    if (!patt.test(control.value)) {
      return {
        validateEmail: {
          valid: false
        }
      };
    }
  }
  return null;
}

export function validateEmailByValue(value: string) {
    if(value && value && value !== '') {
      const patt = new RegExp(EMAIL_REGEX);
      if (!patt.test(value)) {
        return false;
      }
    }
    return true;
  }