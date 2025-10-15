import { Component, signal } from '@angular/core';
import {Router, RouterOutlet} from '@angular/router';
import {Navbar} from './components/navbar/navbar';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, NgIf],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('kapcsolatFrontend');

  constructor(private router: Router) {}

  // a kijelölt oldalak felett nem jelenik meg a navbar (kezdőlap, bejelentkezés, regisztráció)
  get showNavbar(): boolean {
    const url = this.router.url;
    const noNavbarRoutes = ['/','/login'];
    // return !noNavbarRoutes.some(route => url.startsWith(route));
    return !noNavbarRoutes.includes(url);

  }

}
