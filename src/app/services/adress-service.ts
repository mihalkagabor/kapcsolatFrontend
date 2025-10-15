import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AdressCreateModel } from '../models/adress-create-model';
import { AdressListModel } from '../models/adress-list-model';
import { AdressModifyModel } from '../models/adress-modify-model';

@Injectable({
  providedIn: 'root'
})
export class AdressService {

  // Backend alap URL az adress végpontokhoz
  private baseURL = 'http://localhost:8080/api/adress';

  constructor(private http: HttpClient) { }

  // Új cím létrehozása
  register(adressCreate: AdressCreateModel): Observable<any> {
    return this.http.post<any>(this.baseURL + '/create', adressCreate);
  }

  // Címek listázása
  list(): Observable<AdressListModel[]> {
    return this.http.get<AdressListModel[]>(this.baseURL + '/list');
  }

  // Cím módosítása
  modify(adressModify: AdressModifyModel): Observable<any> {
    return this.http.put<any>(this.baseURL + '/modify', adressModify);
  }

  // Cím törlése ID alapján
  delete(id: number): Observable<any> {
    return this.http.delete<any>(this.baseURL + '/delete/' + id);
  }
}
