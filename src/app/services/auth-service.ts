import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, finalize, Observable, of, tap } from 'rxjs';
import { Router } from '@angular/router';
import {jwtDecode} from 'jwt-decode';
import {LoginRequestModel} from '../models/login-request-model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseURL = 'http://localhost:8080/api/auth'; // Backend auth API alap URL-je

  constructor(private http: HttpClient,
              private router: Router) { }

  // --- 1. Bejelentkezés ---
  logIn(login: LoginRequestModel): Observable<any> {
    return this.http.post<any>(this.baseURL + '/login', login).pipe(
      tap(response => {
        // --- 1a. Tokenek mentése localStorage-be ---
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);

        // --- 1b. JWT dekódolása a felhasználói adatok kinyeréséhez ---
        const decodedToken: any = jwtDecode(response.accessToken);
        localStorage.setItem('role', decodedToken.role); // Felhasználó szerepköre
      })
    );
  }

  // --- 2. Kijelentkezés ---
  logout(): Observable<void> {
    const refreshToken = localStorage.getItem('refreshToken');

    return this.http.post<void>(`${this.baseURL}/logout`, { refreshToken }).pipe(
      // --- 2a. Hibakezelés: ha a logout sikertelen, akkor is folytatjuk ---
      catchError(() => of(void 0)),

      // --- 2b. LocalStorage törlése ---
      tap(() => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('role');
        localStorage.removeItem('id');
      }),

      // --- 2c. Navigáció a kezdőoldalra ---
      finalize(() => {
        this.router.navigate(['/']);
      })
    );
  }

  // --- 3. Ellenőrzi, hogy a felhasználó be van-e jelentkezve ---
  isLoggedIn(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  // --- 4. Ellenőrzi, hogy a felhasználó rendelkezik-e a megadott szerepkörrel ---
  hasRole(role: string): boolean {
    const userRole = localStorage.getItem('role');
    return userRole === role;
  }

}
