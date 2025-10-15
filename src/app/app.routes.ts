import { Routes } from '@angular/router';
import {Login} from './components/login/login';
import {Register} from './components/register/register';
import {UserListComponent} from './components/user-list-component/user-list-component';
import {Main} from './components/main/main';
import {ContactCreateComponent} from './components/contact-create-component/contact-create-component';
import {ContactListComponent} from './components/contact-list-component/contact-list-component';
import {ProfileComponent} from './components/profile-component/profile-component';
import {authGuard} from './services/auth-guard';

export const routes: Routes = [
  {path:'login', component:Login},
  {path:'register', component:Register,canActivate: [authGuard],data:{role:'ADMIN'}},
  {path:'user_list', component:UserListComponent,canActivate: [authGuard],data:{role:'ADMIN'}},
  {path:'main', component:Main,canActivate: [authGuard]},
  {path:'contact_create', component:ContactCreateComponent,canActivate: [authGuard]},
  {path:'contact_list', component:ContactListComponent,canActivate: [authGuard]},
  {path:'profile', component:ProfileComponent,canActivate: [authGuard]},
  {path:'', component:Login},
  { path: '**', redirectTo: '' },

];
