import {Component, HostListener} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {AuthService} from '../../services/auth-service';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-navbar',
  imports: [
    NgIf,
    RouterLink
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  adminMenuPont: boolean = false;
  profilMenuPont: boolean = false;
  autokMenuPont: boolean = false;

  constructor(
    private router: Router,
    public authservie: AuthService,
  ) { }

  logout() {
    this.authservie.logout().subscribe({
      next: () => this.router.navigate(['/bejelentkezes'])
    })
  }

  // A metódusok, amik a gombra kattintva megváltoztatja a menü láthatóságát
  adminLenyiloMenu() {
    this.autokMenuPont = false; // Elrejtjük a többi menüt
    this.profilMenuPont = false; // Elrejtjük a többi menüt
    this.adminMenuPont = !this.adminMenuPont;
  }

  profilLenyiloMenu() {
    this.adminMenuPont = false; // Elrejtjük a többi menüt
    this.autokMenuPont = false; // Elrejtjük a többi menüt
    this.profilMenuPont = !this.profilMenuPont;
  }

  autokLenyiloMenu() {
    this.adminMenuPont = false; // Elrejtjük a többi menüt
    this.profilMenuPont = false; // Elrejtjük a többi menüt
    this.autokMenuPont = !this.autokMenuPont;
  }

  // Ez a metódus figyeli az összes kattintást a dokumentumon.
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    // Ellenőrizzük, hogy a kattintás a nav elemeken belül történt-e
    const isClickInside = target.closest('.navbar');

    // Ha a kattintás a nav elemen kívül történt, akkor rejtsük el az összes menüt
    if (!isClickInside) {
      this.adminMenuPont = false;
      this.profilMenuPont = false;
      this.autokMenuPont = false;
    }
  }

}
