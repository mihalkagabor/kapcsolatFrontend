import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { USER_ROLES } from '../../enums/user-role';
import { UserListModel } from '../../models/user-list-model';
import { UserModifyModel } from '../../models/user-modify-model';

@Component({
  selector: 'app-user-list-component',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-list-component.html',
  styleUrls: ['./user-list-component.css']
})
export class UserListComponent implements OnInit {

  // Felhasználók listája
  users: UserListModel[] = [];
  // Szerkesztett felhasználó azonosítója
  editingUserId: number | null = null;
  // Kiválasztott módosított szerep
  modifiedRole: string = '';
  // Összes elérhető szerep
  roles = Object.keys(USER_ROLES);

  constructor(private userService: UserService) {}

  ngOnInit() {
    // Felhasználók betöltése indításkor
    this.loadUsers();
  }

  // Felhasználók lekérése backendről
  loadUsers() {
    this.userService.list().subscribe(users => {
      this.users = [...users]; // új referencia (Angular change detection miatt)
    });
  }

  // Szerkesztési mód elindítása egy adott userhez
  startEdit(user: UserListModel) {
    this.editingUserId = user.id;
    this.modifiedRole = this.roles[user.role] || this.roles[0]; // alapértelmezett szerep
  }

  // Szerkesztés megszakítása
  cancelEdit() {
    this.editingUserId = null;
    this.modifiedRole = '';
  }

  // Módosított szerep mentése
  saveEdit(user: UserListModel) {
    const modifyModel: UserModifyModel = {
      userName: user.userName,
      passwordHash: '', // jelszó nem változik
      role: this.modifiedRole
    };

    this.userService.modify(modifyModel).subscribe({
      next: (msg) => {
        console.log(msg); // Felhasználó módosítva
        this.editingUserId = null;
        this.modifiedRole = '';
        this.loadUsers(); // lista frissítése
      },
      error: (err) => console.error(err)
    });
  }

  // Felhasználó törlése megerősítéssel
  deleteUser(user: UserListModel) {
    if (confirm(`Biztos törölni szeretnéd a felhasználót: ${user.userName}?`)) {
      this.userService.delete(user.id).subscribe({
        next: (msg) => {
          console.log(msg);
          this.loadUsers(); // lista frissítése
        },
        error: (err) => console.error(err)
      });
    }
  }

  // Ellenőrzi, hogy az adott user szerkesztés alatt áll-e
  isEditing(user: UserListModel): boolean {
    return this.editingUserId === user.id;
  }

  // Meghatározza, hogy a szerkesztés/törlés gombok látszanak-e
  showButtons(user: UserListModel): boolean {
    return this.editingUserId === null || this.editingUserId === user.id;
  }

  protected readonly userRoles = USER_ROLES;
}
