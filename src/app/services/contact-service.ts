import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ContactCreateModel } from '../models/contact-create-model';
import { ContactListModel } from '../models/contact-list-model';
import { ContactModifyModel } from '../models/contact-modify-model';

@Injectable({
  providedIn: 'root' // Ez biztosítja, hogy a szolgáltatás az egész alkalmazásban elérhető legyen (singletonként)
})
export class ContactService {

  // A backend API alap URL-je a contact műveletekhez
  private baseURL = 'http://localhost:8080/api/contact';

  // Az Angular HttpClient injektálása a HTTP kérésekhez
  constructor(private http: HttpClient) { }

  // Új contact (kapcsolat) létrehozása a backendben
  // A metódus visszatérési típusa Observable<number>, vagyis a backend válaszát figyelhetjük vele
  register(contactCreate: ContactCreateModel): Observable<number> {
    return this.http.post<any>(this.baseURL + '/create', contactCreate);
  }

  // A contactok (kapcsolatok) listájának lekérése a backendből
  // Visszatérési típus: Observable<ContactListModel[]>, vagyis egy ContactListModel tömb
  list(): Observable<ContactListModel[]> {
    return this.http.get<ContactListModel[]>(this.baseURL + '/list');
  }

  // Egy meglévő contact módosítása a backendben
  // Az adatok a ContactModifyModel típusú objektumból érkeznek
  modify(contactModify: ContactModifyModel): Observable<any> {
    return this.http.put<any>(this.baseURL + '/modify', contactModify);
  }

  // Egy contact törlése azonosító alapján
  // A backendben az URL végére kerül az id paraméter
  delete(id: number): Observable<any> {
    return this.http.delete<any>(this.baseURL + '/delete/' + id);
  }

}
