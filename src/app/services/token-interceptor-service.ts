import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpErrorResponse,
  HttpClient
} from '@angular/common/http';
import {inject} from '@angular/core';
import {Router} from '@angular/router';
import {catchError, switchMap, throwError} from 'rxjs';
import {jwtDecode} from 'jwt-decode';


export const tokenInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
  const http = inject(HttpClient);
  const router = inject(Router);

  // --- 1. Login és refresh-token hívások kizárása ---
  // Ezeket nem módosítjuk, hogy ne zavarjuk meg a token frissítést
  if (req.url.includes('/api/auth/login') || req.url.includes('/api/auth/refresh-token')) {
    return next(req);
  }

  // --- 2. Access token hozzáadása minden kéréshez ---
  const token = localStorage.getItem('accessToken');
  let authReq = req;
  if (token) {
    authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
  }

  // --- 3. Kérés továbbítása és hibakezelés ---
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {

      // --- 3a. 401 Unauthorized esetén token frissítés ---
      if (error.status === 401) {
        const refreshToken = localStorage.getItem('refreshToken');

        if (!refreshToken) {
          // nincs refresh token → átirányítás a kezdőoldalra
          router.navigate(['/']);
          return throwError(() => error);
        }

        // --- 3b. Refresh token használata új access tokenhez ---
        return http.post<any>('http://localhost:8080/api/auth/refresh-token', { refreshToken }).pipe(
          switchMap(response => {

            if (!response?.accessToken) {
              // ha nincs új token → redirect kezdőoldalra
              router.navigate(['/']);
              return throwError(() => error);
            }

            // --- 3c. Új token mentése és dekódolása ---
            localStorage.setItem('accessToken', response.accessToken);
            try {
              const decoded: any = jwtDecode(response.accessToken);
              localStorage.setItem('role', decoded.role || '');
              localStorage.setItem('id', decoded.id || '');
            } catch (e) {
              console.warn('JWT decode failed', e);
            }

            // --- 3d. Eredeti kérés új tokennel újraküldése ---
            const newReq = req.clone({
              headers: req.headers.set('Authorization', `Bearer ${response.accessToken}`)
            });
            return next(newReq);
          }),
          catchError(() => {
            // ha a refresh token is hibás → teljes logout
            return throwError(() => error);
          })
        );
      }

      // --- 3e. Minden más hibát továbbengedünk ---
      return throwError(() => error);
    })
  );
};
