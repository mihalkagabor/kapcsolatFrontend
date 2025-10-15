import {Component, inject, OnInit} from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-main',
  imports: [],
  templateUrl: './main.html',
  styleUrl: './main.css'
})
export class Main implements OnInit{

  router = inject(Router);

  //role alapján küldi tovább a bejelentkezet felhasználókat.
  ngOnInit() {
    const role = localStorage.getItem('role');
    if (role === 'ADMIN') {
      this.router.navigate(['/user_list']);
    } else {
      this.router.navigate(['/contact_list']);
    }
  }
}

