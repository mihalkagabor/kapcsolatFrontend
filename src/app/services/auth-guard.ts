import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { inject } from '@angular/core';

// --- Auth Guard funkció: útvonalak védelme ---
export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const router = inject(Router); // Router injektálása a navigációhoz

  // --- 1. Ellenőrizzük, hogy van-e bejelentkezési token ---
  const token = localStorage.getItem('accessToken');
  if (!token) {
    // Ha nincs token, átirányítunk a login kezdőoldalra
    router.navigate(['']);
    return false; // nem engedjük az útvonal elérését
  }

  // --- 2. Ellenőrizzük a felhasználó szerepkörét (opcionális) ---
  const userRole = localStorage.getItem('role'); // a felhasználó szerepköre
  const expectedRole = route.data['role'];       // a védett útvonalhoz elvárt szerepkör

  if (expectedRole && userRole?.toUpperCase() !== expectedRole.toUpperCase()) {
    // Ha van elvárt szerepkör és nem egyezik a felhasználó szerepkörével
    router.navigate(['login']); // átirányítunk a főoldalra
    return false; // nem engedjük az útvonal elérését
  }

  // --- 3. Minden ellenőrzés sikeres, engedélyezzük az útvonalhoz való hozzáférést ---
  return true;
};
