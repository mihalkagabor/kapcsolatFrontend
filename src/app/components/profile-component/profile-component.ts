import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../services/user-service';
import { passwordStrengthValidator } from '../../validators/password-validators';
import { CommonModule } from '@angular/common';
import { UserProfileModel } from '../../models/user-profile-model';
import { UserModifyModel } from '../../models/user-modify-model';

@Component({
  selector: 'app-profile-component',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './profile-component.html',
  styleUrls: ['./profile-component.css']
})
export class ProfileComponent implements OnInit {

  // Form a profil adatokhoz
  profileForm!: FormGroup;
  // Betöltés, hiba és siker üzenet állapotai
  loading = true;
  error: string | null = null;
  successMessage: string | null = null;

  // Szerkesztési mód jelző
  editing = false;

  // Jelszó mezők láthatósága
  showPassword = false;
  showPassword2 = false;

  // Jelszó inputokra hivatkozás
  @ViewChild('passwordInput') passwordInput!: ElementRef;
  @ViewChild('password2Input') password2Input!: ElementRef;

  // Aktuális felhasználói profil
  private currentProfile!: UserProfileModel;

  constructor(private fb: FormBuilder, private userService: UserService) {}

  ngOnInit(): void {
    // Form inicializálása és validátorok beállítása
    this.profileForm = this.fb.group({
      userName: [{ value: '', disabled: true }],
      passwordHash: ['', [passwordStrengthValidator]],
      passwordHash2: ['']
    }, { validators: this.passwordsMatch });

    // Profil betöltése backendről
    this.loadProfile();
  }

  // Profil adatok lekérése
  loadProfile() {
    this.loading = true;
    this.userService.me().subscribe({
      next: (user: UserProfileModel) => {
        this.currentProfile = user;
        this.profileForm.patchValue({ userName: user.userName });
        this.loading = false;
      },
      error: () => {
        this.error = 'Hiba a profil betöltésekor';
        this.loading = false;
      }
    });
  }

  // Két jelszó mező egyezésének ellenőrzése
  passwordsMatch(group: FormGroup) {
    const pass1 = group.get('passwordHash')?.value;
    const pass2 = group.get('passwordHash2')?.value;
    if (pass1 && pass2 && pass1 !== pass2) {
      return { passwordsMismatch: true };
    }
    return null;
  }

  // Első jelszómező megjelenítése/elrejtése
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
    this.passwordInput.nativeElement.type = this.showPassword ? 'text' : 'password';
  }

  // Második jelszómező megjelenítése/elrejtése
  togglePassword2Visibility() {
    this.showPassword2 = !this.showPassword2;
    this.password2Input.nativeElement.type = this.showPassword2 ? 'text' : 'password';
  }

  // Szerkesztési mód engedélyezése
  enableEdit() {
    this.editing = true;
    this.profileForm.get('passwordHash')?.setValue('');
    this.profileForm.get('passwordHash2')?.setValue('');
  }

  // Szerkesztés megszakítása
  cancelEdit() {
    this.editing = false;
    this.profileForm.reset({ userName: this.currentProfile.userName });
  }

  // Jelszó mentése backendre
  onSubmit() {
    if (this.profileForm.invalid) return;

    const formValue = this.profileForm.getRawValue();
    const modifyModel: UserModifyModel = {
      userName: this.currentProfile.userName,
      passwordHash: formValue.passwordHash,
      role: this.currentProfile.role // a role nem változik
    };

    this.userService.modify(modifyModel).subscribe({
      next: () => {
        this.successMessage = 'Jelszó sikeresen módosítva';
        this.editing = false;
        this.profileForm.patchValue({ passwordHash: '', passwordHash2: '' });
      },
      error: () => {
        this.error = 'Hiba történt a mentés közben';
      }
    });
  }
}
