import {Component, ElementRef, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {AuthService} from '../../services/auth-service';
import {Router} from '@angular/router';
import {HttpErrorResponse} from '@angular/common/http';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  loginForm:FormGroup;
  showPassword =false;
  errorMessage:string = '';

  @ViewChild('passwordInput') passwordInput!:ElementRef;

  constructor(
    private fb:FormBuilder,
    private authService:AuthService,
    private router:Router) {
    this.loginForm=this.fb.group({
      userName:['', Validators.required],
      password: ['', Validators.required]
    })
  }

  tooglePasswordVisibility() {
    this.showPassword=!this.showPassword;
    this.passwordInput.nativeElement.type=this.showPassword ? 'text' : 'password'
  }

  onSubmit() {
    this.errorMessage='';

    if(this.loginForm.valid) {
      this.authService.logIn(this.loginForm.value).subscribe({
        next: () => {
          const role = localStorage.getItem('role');
          this.router.navigate(['/main'])
        },
        error: (error: HttpErrorResponse) => {
          // Hibakezelés backend válasz alapján
          if (error.status === 401 && error.error && error.error.error) {
            this.errorMessage = error.error.error;
          } else {
            this.errorMessage = 'Sikertelen bejelentkezés. Kérjük, próbálja újra később.';
            console.error('Bejelentkezési hiba:', error);
          }
        }
      })
    }

  }

}
