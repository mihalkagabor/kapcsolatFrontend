import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

// --- Password strength validator ---
// Ellenőrzi, hogy a jelszó megfelel-e az előírt erősségi követelményeknek
export const passwordStrengthValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = control.value || '';
  const errors: ValidationErrors = {};

  // --- 1. Alapvető jelszó követelmények ---
  const hasMinLength = value.length >= 8; // legalább 8 karakter
  const hasUpperCase = /[A-Z]+/.test(value); // legalább egy nagybetű
  const hasLowerCase = /[a-z]+/.test(value); // legalább egy kisbetű
  const hasNumber = /[0-9]+/.test(value);   // legalább egy szám
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(value); // legalább egy speciális karakter

  // --- 2. Hibák összegyűjtése ---
  if (!hasMinLength) { errors['minlength'] = true; }
  if (!hasUpperCase) { errors['uppercase'] = true; }
  if (!hasLowerCase) { errors['lowercase'] = true; }
  if (!hasNumber) { errors['number'] = true; }
  if (!hasSpecialChar) { errors['specialChar'] = true; }

  // --- 3. Visszaadjuk a hibákat, ha vannak ---
  // Ha nincs hiba, null-t ad vissza → érvényes jelszó
  return Object.keys(errors).length ? errors : null;
};
