import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {UserCreateModel} from '../models/user-create-model';
import {Observable} from 'rxjs';
import {UserListModel} from '../models/user-list-model';
import {UserModifyModel} from '../models/user-modify-model';
import {UserProfileModel} from '../models/user-profile-model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseURL ='http://localhost:8080/api/user'

  constructor(private http:HttpClient) {};

  //felhasználó létrehozása
  register(userCreateModel:UserCreateModel) : Observable<string>{
    return this.http.post(this.baseURL+'/create',userCreateModel, { responseType: 'text' })
  }

  //felhasználó listázása
  list():Observable<UserListModel[]>{
    return this.http.get<UserListModel[]>(this.baseURL+'/list')
  }

  //felhasználó módosítása
  modify(userModify: UserModifyModel) : Observable<string> {
    return this.http.put(this.baseURL + '/modify', userModify, { responseType: 'text' });
  }

  //felhasználó törlése
  delete(id: number): Observable<string> {
    // ha a backend plain text-et ad vissza, használjunk responseType: 'text'
    return this.http.delete(this.baseURL + '/delete/' + id, { responseType: 'text' });
  }

  //saját profil lekérése.
me() :Observable<UserProfileModel>{
    console.log(Observable)
    return this.http.get<UserProfileModel>(this.baseURL+'/me')
}

}
