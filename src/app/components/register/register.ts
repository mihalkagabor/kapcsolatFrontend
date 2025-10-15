import {Component, ElementRef, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {passwordStrengthValidator} from '../../validators/password-validators';
import {Router} from '@angular/router';
import {USER_ROLES} from '../../enums/user-role';
import {UserService} from '../../services/user-service';
import {KeyValuePipe, NgForOf, NgIf, UpperCasePipe} from '@angular/common';

@Component({
  selector: 'app-register',
  imports: [
    ReactiveFormsModule,
    UpperCasePipe,
    KeyValuePipe,
    NgIf,
    NgForOf
  ],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {

  // Regisztrációs űrlap
  registerForm: FormGroup;

  // Jelszó láthatóság állapot
  showPassword = false;
  showPassword2 = false;

  // USER_ROLES konstans elérhetővé tétele a template-ben
  userRoles = USER_ROLES;

  // Referenciák az input mezőkre a jelszó láthatóság váltáshoz
  @ViewChild('passwordInput') passwordInput!: ElementRef;
  @ViewChild('password2Input') password2Input!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router
  ) {
    // Űrlap inicializálása validátorokkal
    this.registerForm = this.fb.group({
      userName: ['', Validators.required],
      passwordHash: ['', [Validators.required, passwordStrengthValidator]], // Erős jelszó ellenőrzés
      passwordHash2: ['', Validators.required], // Jelszó megerősítés
      role: ['', Validators.required]
    }, { validators: this.passwordsMatch }); // Saját validator: jelszavak egyeznek-e
  }

  // Egyéni validátor: ellenőrzi, hogy a két jelszómező egyezik-e
  passwordsMatch(group: FormGroup) {
    const pass1 = group.get('passwordHash')?.value;
    const pass2 = group.get('passwordHash2')?.value;

    if (pass1 && pass2 && pass1 !== pass2) {
      return { passwordsMismatch: true }; // Hibajelzés, ha nem egyezik
    }
    return null;
  }

  // Jelszó láthatóság váltása az első mezőn
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
    this.passwordInput.nativeElement.type = this.showPassword ? 'text' : 'password';
  }

  // Jelszó láthatóság váltása a második mezőn
  togglePassword2Visibility() {
    this.showPassword2 = !this.showPassword2;
    this.password2Input.nativeElement.type = this.showPassword2 ? 'text' : 'password';
  }

  // Űrlap elküldése
  onSubmit() {
    if (this.registerForm.valid) {
      const formValue = this.registerForm.value;
      // A felhasználó típusát nagybetűre alakítjuk a backend számára
      formValue.role = formValue.role.toUpperCase();
      // Backend felé küldjük az új felhasználó adatait
      this.userService.register(formValue).subscribe({
        next: (msg) =>{
          console.log(msg)
          this.router.navigate(['/user_list'])
        } // Sikeres regisztráció után listázó oldalra navigálunk
      });
    }
  }
}
