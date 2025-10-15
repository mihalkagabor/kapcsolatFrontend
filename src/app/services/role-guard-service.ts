
import {CanActivateFn, Router} from '@angular/router';
import {inject} from '@angular/core';
import {AuthService} from './auth-service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Az útvonal adatainál definiált szerepkör lekérése
  const expectedRole = route.data['role'];

  // 1. lépés: Ellenőrizzük, hogy be van-e jelentkezve a felhasználó
  if (!authService.isLoggedIn()) {
    router.navigate(['/bejelentkezes']);
    return false;
  }

  // 2. lépés: Ellenőrizzük, hogy a felhasználó szerepköre a megfelelő-e
  if (authService.hasRole(expectedRole)) {
    return true;
  } else {
    // Ha nem megfelelő a szerepkör, átirányítjuk egy hibára vagy a kezdőlapra
    router.navigate(['/']);
    return false;
  }
};
